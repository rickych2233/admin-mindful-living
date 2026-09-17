import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useChaptersCollection, createChapter, updateChapter, deleteChapter, toggleChapterStatus, reorderChapters } from "../utils/chapterUtils";
import { fetchSectionsByChapter, createSection, deleteSection, toggleSectionStatus, normalizeSection, reorderSections } from "../utils/sectionUtils";
import { useTranslations, LANG_CODES } from "../utils/translateUtils";
import { renderTranslated } from "../utils/renderTranslated";

const chapterStepItems = [
  { id: 1, label: "Chapter Info" },
  { id: 2, label: "Add Section" },
  { id: 3, label: "Review & Publish" },
];

const initialChapterForm = {
  title: "",
  description: "",
  thumbnailName: "",
  sectionName: "",
  sectionCaption: "",
  editorBlocks: [{ id: 'init', type: 'text', content: '<p><br></p>' }],
  exerciseTitle: "",
  exerciseDuration: "2 Minutes",
  exerciseInstructions: "",
  exerciseRequired: false,
  sectionType: "Text",
  thumbnailPreview: "",
};

const parseBlocks = (contentObjOrStr, mediaArr, initialTranslations = {}) => {
  let contentObj = {};
  if (typeof contentObjOrStr === 'string') {
    try {
      if (contentObjOrStr.startsWith('{') && contentObjOrStr.endsWith('}')) {
        contentObj = JSON.parse(contentObjOrStr);
      } else {
        contentObj = { en: contentObjOrStr };
      }
    } catch (e) {
      contentObj = { en: contentObjOrStr };
    }
  } else if (contentObjOrStr && typeof contentObjOrStr === 'object') {
    contentObj = contentObjOrStr;
  } else {
    contentObj = { en: "" };
  }

  const englishHtml = contentObj.en || contentObj['English 🇬🇧'] || "";
  
  const parsedBlocks = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(englishHtml, 'text/html');
  
  const langDocs = {};
  Object.keys(contentObj).forEach(lang => {
     if (lang !== 'en') langDocs[lang] = parser.parseFromString(contentObj[lang] || "", 'text/html');
  });

  const extractNthTextChunk = (docNode, targetIndex) => {
     if (!docNode) return "";
     let chunkIdx = 0;
     let html = "";
     for (let node of Array.from(docNode.body.childNodes)) {
        if (node.nodeType === 1 && node.classList.contains('media-embed')) {
           if (html || chunkIdx >= 0) {
              if (chunkIdx === targetIndex) return html;
              chunkIdx++;
              html = "";
           }
        } else {
           if (node.nodeType === 1) html += node.outerHTML;
           else if (node.nodeType === 3) html += node.textContent;
        }
     }
     if (chunkIdx === targetIndex) return html;
     return "";
  };

  let currentHtml = "";
  let textBlockIndex = 0;

  const flushText = () => {
      const id = 'text_' + Math.random();
      parsedBlocks.push({ id, type: 'text', content: currentHtml });
      
      initialTranslations[`content_${id}`] = {};
      Object.keys(contentObj).forEach(lang => {
         if (lang !== 'en') {
            initialTranslations[`content_${id}`][lang] = extractNthTextChunk(langDocs[lang], textBlockIndex) || currentHtml;
         }
      });
      
      textBlockIndex++;
      currentHtml = "";
  };

  Array.from(doc.body.childNodes).forEach(node => {
    if (node.nodeType === 1 && node.classList.contains('media-embed')) {
      if (currentHtml) flushText();
      const idx = parseInt(node.getAttribute('data-index'), 10);
      const m = mediaArr[idx];
      if (m) {
        parsedBlocks.push({
          id: m.id || 'media_' + Math.random(),
          originalId: m.id,
          type: (m.type || "image").toLowerCase(),
          title: m.title || "",
          url: m.url || "",
          isRequired: m.is_required !== undefined ? m.is_required : true,
          duration: m.duration || "2 Minutes",
          instructions: m.instructions || "",
        });
      }
    } else {
      if (node.nodeType === 1) currentHtml += node.outerHTML;
      else if (node.nodeType === 3) currentHtml += node.textContent;
    }
  });
  
  if (currentHtml) flushText();
  
  if (parsedBlocks.length === 0 && mediaArr && mediaArr.length > 0) {
     currentHtml = englishHtml;
     flushText();
     mediaArr.forEach(m => parsedBlocks.push({
          id: m.id || 'media_' + Math.random(),
          originalId: m.id,
          type: (m.type || "image").toLowerCase(),
          title: m.title || "",
          url: m.url || "",
          isRequired: m.is_required !== undefined ? m.is_required : true,
     }));
  } else if (parsedBlocks.length === 0) {
     currentHtml = englishHtml || '<p><br></p>';
     flushText();
  }
  return parsedBlocks;
};

export function ChapterManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const { rows: apiChapterRows, isLoading, error, refetch } = useChaptersCollection();
  const [chapterRows, setChapterRows] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chapterStep, setChapterStep] = useState(1);
  const [chapterForm, setChapterForm] = useState(initialChapterForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [sectionsMap, setSectionsMap] = useState({});
  const [sectionsLoading, setSectionsLoading] = useState({});
  const [addSectionFor, setAddSectionFor] = useState(null);
  const [sectionForm, setSectionForm] = useState({ title: "", description: "", type: "Text" });
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");
  const { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating } = useTranslations();
  const [showPublishedModal, setShowPublishedModal] = useState({ show: false, status: null });
  const [draggedChapterIndex, setDraggedChapterIndex] = useState(null);
  const [dragOverChapterIndex, setDragOverChapterIndex] = useState(null);
  const [draggedSectionData, setDraggedSectionData] = useState(null);
  const [dragOverSectionData, setDragOverSectionData] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, targetId: null, chapterId: null });

  const handleDragStart = (e, index) => {
    setDraggedChapterIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedChapterIndex !== null && draggedChapterIndex !== index) {
      setDragOverChapterIndex(index);
    }
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = (e, index) => {
    if (dragOverChapterIndex === index) {
      setDragOverChapterIndex(null);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedChapterIndex === null || draggedChapterIndex === targetIndex) return;

    const newRows = [...chapterRows];
    const draggedItem = newRows.splice(draggedChapterIndex, 1)[0];
    newRows.splice(targetIndex, 0, draggedItem);
    
    // Optimistic UI update
    setChapterRows(newRows);
    setDraggedChapterIndex(null);
    setDragOverChapterIndex(null);

    try {
      const chapterIds = newRows.map(c => c.apiId || c.id);
      await reorderChapters(chapterIds);
    } catch (err) {
      console.error("Failed to save reorder", err);
      alert("Failed to save new chapter order.");
      refetch();
    }
  };

  const handleSectionDragStart = (e, chapterId, sectionIndex) => {
    e.stopPropagation();
    setDraggedSectionData({ chapterId, sectionIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSectionDragOver = (e, chapterId, sectionIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSectionData?.chapterId === chapterId) {
      if (draggedSectionData.sectionIndex !== sectionIndex) {
        setDragOverSectionData({ chapterId, sectionIndex });
      }
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleSectionDragLeave = (e, chapterId, sectionIndex) => {
    e.stopPropagation();
    if (dragOverSectionData?.chapterId === chapterId && dragOverSectionData?.sectionIndex === sectionIndex) {
      setDragOverSectionData(null);
    }
  };

  const handleSectionDrop = async (e, chapterId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSectionData || draggedSectionData.chapterId !== chapterId || draggedSectionData.sectionIndex === targetIndex) {
      return;
    }

    const sections = sectionsMap[chapterId] || [];
    const newSections = [...sections];
    const draggedItem = newSections.splice(draggedSectionData.sectionIndex, 1)[0];
    newSections.splice(targetIndex, 0, draggedItem);

    setSectionsMap(current => ({
      ...current,
      [chapterId]: newSections
    }));
    setDraggedSectionData(null);
    setDragOverSectionData(null);

    try {
      const sectionIds = newSections.map(s => s.id);
      await reorderSections(chapterId, sectionIds);
    } catch (error) {
      console.error("Failed to reorder sections:", error);
      alert("Gagal menyimpan urutan: " + error.message);
    }
  };

  const handleToggleExpand = useCallback(async (chapter) => {
    const cId = chapter.apiId ?? chapter.id;
    if (expandedChapterId === chapter.id) {
      setExpandedChapterId(null);
      return;
    }
    setExpandedChapterId(chapter.id);
    if (sectionsMap[cId]) return;
    setSectionsLoading((p) => ({ ...p, [cId]: true }));
    try {
      const data = await fetchSectionsByChapter(cId);
      setSectionsMap((p) => ({ ...p, [cId]: data || [] }));
    } catch (err) {
      console.error("Failed to fetch sections:", err);
      setSectionsMap((p) => ({ ...p, [cId]: [] }));
    } finally {
      setSectionsLoading((p) => ({ ...p, [cId]: false }));
    }
  }, [expandedChapterId, sectionsMap]);

  const openDeleteSectionModal = (chapter, sectionId) => {
    const cId = chapter.apiId ?? chapter.id;
    setDeleteModal({ show: true, type: 'section', targetId: sectionId, chapterId: cId });
  };

  const handleToggleSectionStatus = async (chapter, sectionId) => {
    const cId = chapter.apiId ?? chapter.id;
    const sections = sectionsMap[cId] || [];
    const sec = sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const prev = sec.status;
    const next = prev === "Published" ? "Drafted" : "Published";
    setSectionsMap((p) => ({ ...p, [cId]: p[cId].map((s) => s.id === sectionId ? { ...s, status: next } : s) }));
    try {
      const result = await toggleSectionStatus(cId, sectionId);
      const apiStatus = result?.section?.status || result?.status;
      if (apiStatus) {
        setSectionsMap((p) => ({ ...p, [cId]: p[cId].map((s) => s.id === sectionId ? { ...s, status: apiStatus } : s) }));
      }
    } catch (err) {
      setSectionsMap((p) => ({ ...p, [cId]: p[cId].map((s) => s.id === sectionId ? { ...s, status: prev } : s) }));
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleAddSection = async (chapter) => {
    const cId = chapter.apiId ?? chapter.id;
    if (!sectionForm.title.trim()) return;
    setSectionSubmitting(true);
    try {
      const result = await createSection(cId, { title: sectionForm.title.trim(), description: sectionForm.description.trim(), type: sectionForm.type });
      const newSec = normalizeSection(result.section || result);
      setSectionsMap((p) => ({ ...p, [cId]: [...(p[cId] || []), newSec] }));
      setAddSectionFor(null);
      setSectionForm({ title: "", description: "", type: "Text" });
      refetch();
    } catch (err) {
      alert(`Gagal membuat section: ${err.message}`);
    } finally {
      setSectionSubmitting(false);
    }
  };

  useEffect(() => {
    setChapterRows(apiChapterRows);
  }, [apiChapterRows]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen]);

  const filteredChapterRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return chapterRows.filter((chapter) => {
      const matchesQuery =
        normalizedQuery === "" ||
        (renderTranslated(chapter.title, "en") || "").toLowerCase().includes(normalizedQuery) ||
        (renderTranslated(chapter.summary, "en") || "").toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "All Status" || chapter.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [chapterRows, searchQuery, statusFilter]);

  const closeChapterDrawer = () => {
    setIsDrawerOpen(false);
    setChapterStep(1);
    setChapterForm(initialChapterForm);
    setEditingChapter(null);
  };

  const handleEditChapter = async (chapter) => {
    setEditingChapter(chapter);
    
    // Default empty section
    let firstSection = null;
    try {
      const cId = chapter.apiId ?? chapter.id;
      const fetchedSections = await fetchSectionsByChapter(cId);
      if (fetchedSections && fetchedSections.length > 0) {
        firstSection = fetchedSections[0];
      }
    } catch (err) {
      console.error("Error fetching sections for edit chapter:", err);
    }
    
    const initialTrans = {
      title: chapter.title || {},
      description: chapter.summary || {},
      sectionName: firstSection?.title || {},
      sectionCaption: firstSection?.description || {},
    };
    
    const editorBlocks = parseBlocks(firstSection?.content, firstSection?.contents || [], initialTrans);
    setTranslations(initialTrans);
    
    setChapterForm({
      title: renderTranslated(chapter.title, "en") || "",
      description: renderTranslated(chapter.summary, "en") || "",
      thumbnailName: chapter.thumbnail ? "existing-thumbnail.jpg" : "",
      sectionId: firstSection?.id || null,
      sectionName: renderTranslated(firstSection?.title, "en") || "",
      sectionCaption: renderTranslated(firstSection?.description, "en") || "",
      editorBlocks,
      exerciseTitle: "",
      exerciseDuration: "2 Minutes",
      exerciseInstructions: "",
      exerciseRequired: false,
      sectionType: firstSection?.type || "Text",
      thumbnailPreview: chapter.thumbnail || "",
    });
    setChapterStep(1);
    setIsDrawerOpen(true);
  };

  const handleEditSection = (chapter, section) => {
    setEditingChapter(chapter);
    const initialTrans = {
      title: chapter.title || {},
      description: chapter.summary || {},
      sectionName: section.title || {},
      sectionCaption: section.description || {},
    };

    const editorBlocks = parseBlocks(section.content, section.contents || [], initialTrans);
    setTranslations(initialTrans);
    
    setChapterForm({
      title: renderTranslated(chapter.title, "en") || "",
      description: renderTranslated(chapter.summary, "en") || "",
      thumbnailName: chapter.thumbnail ? "existing-thumbnail.jpg" : "",
      sectionId: section.id || null,
      sectionName: renderTranslated(section.title, "en") || "",
      sectionCaption: renderTranslated(section.description, "en") || "",
      editorBlocks,
      exerciseTitle: "",
      exerciseDuration: "2 Minutes",
      exerciseInstructions: "",
      exerciseRequired: false,
      sectionType: section.type || "Text",
      thumbnailPreview: chapter.thumbnail || "",
    });
    setChapterStep(2);
    setIsDrawerOpen(true);
  };

  const handleChapterFieldChange = (field) => (event) => {
    setChapterForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleThumbnailChange = (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setChapterForm((current) => ({
        ...current,
        thumbnailName: "",
        thumbnailPreview: "",
      }));
      return;
    }

    if (nextFile.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB. Please upload a smaller file.");
      event.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width *= MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        
        setChapterForm((current) => ({
          ...current,
          thumbnailName: nextFile.name,
          thumbnailPreview: resizedBase64,
        }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(nextFile);
  };

  const isEditMode = editingChapter !== null;

  const canContinue =
    chapterStep === 1
      ? chapterForm.title.trim() !== "" && chapterForm.description.trim() !== ""
      : chapterStep === 2
        ? (isEditMode ? true : chapterForm.sectionName.trim() !== "" && chapterForm.sectionCaption.trim() !== "")
        : true;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB. Please upload a smaller file.");
        e.target.value = null;
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        setChapterForm(f => {
          const newMediaBlock = {
            id: 'media_' + Date.now(),
            type,
            name: file.name,
            url: base64Url,
            file,
            isRequired: true,
            title: "",
            duration: "2 Minutes",
            instructions: ""
          };
          const newTextBlock = { id: 'text_' + Date.now() + Math.random(), type: 'text', content: '<p><br></p>' };
          return {
            ...f,
            editorBlocks: [...f.editorBlocks, newMediaBlock, newTextBlock]
          };
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null; // Reset
  };

  const handleInsertGuidedExercise = () => {
    setChapterForm(f => {
      const newExerciseBlock = {
        id: 'media_' + Date.now(),
        type: 'exercise',
        isRequired: true,
        title: "",
        duration: "2 Minutes",
        instructions: ""
      };
      const newTextBlock = { id: 'text_' + Date.now() + Math.random(), type: 'text', content: '<p><br></p>' };
      return {
        ...f,
        editorBlocks: [...f.editorBlocks, newExerciseBlock, newTextBlock]
      };
    });
  };

  const removeBlock = (id) => {
    setChapterForm(f => ({
      ...f,
      editorBlocks: f.editorBlocks.filter(b => b.id !== id)
    }));
  };

  const handleBlockChange = (id, newProps) => {
    setChapterForm(f => ({
      ...f,
      editorBlocks: f.editorBlocks.map(b => b.id === id ? { ...b, ...newProps } : b)
    }));
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleContinue = async (submitStatus) => {
    let finalStatus = "Drafted";
    if (typeof submitStatus === "string") {
      finalStatus = submitStatus;
    }

    if (!canContinue) {
      return;
    }

    if (chapterStep < 3) {
      setChapterStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const serializeBlocks = (blocks) => {
      const contentHtml = { en: "" };
      Object.values(LANG_CODES).forEach(lang => {
        if (lang !== 'en') contentHtml[lang] = "";
      });
      
      const mediaList = [];
      
      blocks.forEach((b) => {
        if (b.type === 'text') {
           const domNode = document.getElementById(b.id);
           
           let enContent = b.content;
           if (activeLanguageTab === 'English 🇬🇧' && domNode) {
               enContent = domNode.innerHTML;
           }
           contentHtml.en += enContent;
           
           Object.keys(LANG_CODES).forEach(tab => {
               const lang = LANG_CODES[tab];
               if (lang === 'en') return;
               
               let langContent = translations[`content_${b.id}`]?.[lang] || "";
               if (activeLanguageTab === tab && domNode) {
                   langContent = domNode.innerHTML;
               }
               contentHtml[lang] += (langContent || enContent);
           });
        } else {
           mediaList.push(b);
           const placeholder = `<div class="media-embed" data-type="${b.type}" data-index="${mediaList.length - 1}"></div>`;
           contentHtml.en += placeholder;
           Object.keys(LANG_CODES).forEach(tab => {
               const lang = LANG_CODES[tab];
               if (lang !== 'en') contentHtml[lang] += placeholder;
           });
        }
      });
      
      return { contentHtml: JSON.stringify(contentHtml), mediaList };
    };

    const { contentHtml, mediaList } = serializeBlocks(chapterForm.editorBlocks);

    if (isEditMode) {
      try {
        const apiId = editingChapter.apiId ?? editingChapter.id;
        const chapterData = {
          title: merge(chapterForm.title, 'title'),
          description: merge(chapterForm.description, 'description'),
          status: finalStatus !== "Drafted" ? finalStatus : (editingChapter.status || "Drafted"),
          thumbnail: chapterForm.thumbnailPreview || null,
        };

        if (chapterForm.sectionName && chapterForm.sectionName.trim()) {
          chapterData.sections = [
            {
              id: chapterForm.sectionId,
              title: merge(chapterForm.sectionName, 'sectionName'),
              description: merge(chapterForm.sectionCaption, 'sectionCaption'),
              content: contentHtml,
              type: chapterForm.sectionType,
              contents: mediaList.map((m) => ({
                id: m.originalId || null,
                title: m.title || "",
                type: m.type,
                url: m.url || "",
                is_required: m.isRequired,
                duration: m.duration || "2 Minutes",
                instructions: m.instructions || ""
              })),
            },
          ];
        }

        const result = await updateChapter(apiId, chapterData);

        setChapterRows((current) =>
          current.map((c) =>
            c.id === editingChapter.id
              ? {
                ...c,
                title: result.chapter?.title || result.title || chapterData.title,
                summary: result.chapter?.description || result.description || chapterData.description,
                status: finalStatus !== "Drafted" ? finalStatus : (editingChapter.status || "Drafted"),
                thumbnail: chapterData.thumbnail || c.thumbnail,
              }
              : c
          )
        );
        closeChapterDrawer();
        refetch();

        if (expandedChapterId === apiId) {
          const freshSections = await fetchSectionsByChapter(apiId);
          setSectionsMap(p => ({ ...p, [apiId]: freshSections || [] }));
        } else {
          setSectionsMap(p => {
            const newMap = { ...p };
            delete newMap[apiId];
            return newMap;
          });
        }
        
        if (finalStatus === "Published") {
          setShowPublishedModal({ show: true, status: finalStatus });
          setTimeout(() => setShowPublishedModal({ show: false, status: null }), 5000);
        }
      } catch (err) {
        setSubmitError(err.message || "Gagal mengupdate chapter. Silakan coba lagi.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const normalizedTitle = chapterForm.title.trim();
      
      const chapterData = {
        title: merge(chapterForm.title, 'title'),
        description: merge(chapterForm.description, 'description'),
        status: finalStatus,
        thumbnail: chapterForm.thumbnailPreview || null,
        sections: [
          {
            title: merge(chapterForm.sectionName, 'sectionName'),
            description: merge(chapterForm.sectionCaption, 'sectionCaption'),
            content: contentHtml,
            type: chapterForm.sectionType,
            contents: mediaList.map(m => ({
              title: m.title || "",
              type: m.type,
              url: m.url || "",
              is_required: m.isRequired,
              duration: m.duration || "2 Minutes",
              instructions: m.instructions || ""
            })),
          },
        ],
      };

      const result = await createChapter(chapterData);

      const newChapter = {
        id: result.chapter?.id || result.id || Date.now(),
        apiId: result.chapter?.id || result.id || null,
        title: result.chapter?.title || result.title || normalizedTitle,
        summary: result.chapter?.description || result.description || chapterForm.description.trim(),
        sections: result.chapter?.sections?.length || result.sections?.length || 1,
        status: finalStatus,
      };

      setChapterRows((current) => [...current, newChapter]);
      closeChapterDrawer();
      refetch();

      if (finalStatus === "Published" || finalStatus === "Drafted") {
        setShowPublishedModal({ show: true, status: finalStatus });
        setTimeout(() => setShowPublishedModal({ show: false, status: null }), 5000); // auto-hide after 5 seconds
      }
    } catch (err) {
      setSubmitError(err.message || "Gagal membuat chapter. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteChapterModal = (chapterId) => {
    setDeleteModal({ show: true, type: 'chapter', targetId: chapterId, chapterId: null });
  };

  const confirmDeleteAction = async () => {
    const { type, targetId, chapterId } = deleteModal;
    setDeleteModal({ show: false, type: null, targetId: null, chapterId: null });

    if (type === 'chapter') {
      const chapter = chapterRows.find((c) => c.id === targetId);
      const apiId = chapter?.apiId ?? targetId;

      try {
        await deleteChapter(apiId);
        setChapterRows((current) => current.filter((c) => c.id !== targetId));
        refetch();
      } catch (err) {
        alert(`Gagal menghapus chapter: ${err.message}`);
      }
    } else if (type === 'section') {
      try {
        await deleteSection(chapterId, targetId);
        setSectionsMap((p) => ({ ...p, [chapterId]: (p[chapterId] || []).filter((s) => s.id !== targetId) }));
        refetch();
      } catch (err) {
        alert(`Gagal menghapus section: ${err.message}`);
      }
    }
  };

  const handleToggleStatus = async (chapterId) => {
    const chapter = chapterRows.find((c) => c.id === chapterId);
    if (!chapter) return;

    const apiId = chapter?.apiId ?? chapterId;
    const previousStatus = chapter.status;
    const nextStatus = previousStatus === "Published" ? "Drafted" : "Published";

    setChapterRows((current) =>
      current.map((c) =>
        c.id === chapterId
          ? {
            ...c,
            status: nextStatus,
          }
          : c
      )
    );

    try {
      const result = await toggleChapterStatus(apiId);
      const statusFromApi = result?.chapter?.status || result?.status;
      if (statusFromApi) {
        setChapterRows((current) =>
          current.map((c) =>
            c.id === chapterId
              ? {
                ...c,
                status: statusFromApi === "Published" ? "Published" : "Drafted",
              }
              : c
          )
        );
      }
    } catch (err) {
      setChapterRows((current) =>
        current.map((c) =>
          c.id === chapterId
            ? {
              ...c,
              status: previousStatus,
            }
            : c
        )
      );
      alert(`Gagal mengubah status chapter: ${err.message}`);
    }
  };

  const footerButtonLabel = isEditMode ? "Save Changes" : chapterStep === 3 ? "Publish" : "Continue";

  return (
    <div className="dashboard-content-wrapper">
      <header className="dashboard-header-satyatech">
        <h1>Chapter Management <span style={{ fontSize: '12px', color: '#718096', fontWeight: 'normal', backgroundColor: '#EDF2F7', padding: '2px 8px', borderRadius: '12px' }}>v1.1 (Reorder Fix)</span></h1>
        <p>Organize the chapters and sections of your book</p>
      </header>

      <section className="satyatech-dashboard-grid chapter-management-page">
        <div className="chapter-toolbar">
          <div className="chapter-filters">
            <label className="chapter-search" aria-label="Search chapters">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="chapter-select chapter-select-shell">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All Status</option>
                <option>Published</option>
                <option>Drafted</option>
              </select>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </label>
          </div>

          <button type="button" className="master-add-btn" onClick={() => { setEditingChapter(null); setIsDrawerOpen(true); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Chapter
          </button>
        </div>

        {isLoading && (
          <div className="chapter-empty-state">
            <p>Loading chapters...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="chapter-empty-state">
            <p style={{ color: "#b42318" }}>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="chapter-table-card">
            <div className="chapter-table-head chapter-table-head-redesign">
              <span>No</span>
              <span className="sortable-head">
                Chapter Name
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Status
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span>Action</span>
            </div>

            {filteredChapterRows.map((chapter, index) => {
              const isDragAndDropEnabled = searchQuery === "" && statusFilter === "All Status";
              const actualIndex = isDragAndDropEnabled ? index : null;
              
              return (
              <React.Fragment key={chapter.id}>
                <article 
                  className={`chapter-row chapter-row-redesign ${draggedChapterIndex === actualIndex ? 'dragging' : ''}`}
                  draggable={isDragAndDropEnabled}
                  onDragStart={(e) => isDragAndDropEnabled && handleDragStart(e, actualIndex)}
                  onDragOver={(e) => isDragAndDropEnabled && handleDragOver(e, actualIndex)}
                  onDragLeave={(e) => isDragAndDropEnabled && handleDragLeave(e, actualIndex)}
                  onDrop={(e) => isDragAndDropEnabled && handleDrop(e, actualIndex)}
                  style={{ 
                    opacity: draggedChapterIndex !== null && draggedChapterIndex === actualIndex ? 0.5 : 1,
                    borderTop: dragOverChapterIndex !== null && dragOverChapterIndex === actualIndex && actualIndex < draggedChapterIndex ? '3px solid #795289' : undefined,
                    borderBottom: dragOverChapterIndex !== null && dragOverChapterIndex === actualIndex && actualIndex > draggedChapterIndex ? '3px solid #795289' : undefined,
                    transition: 'border 0.2s ease-in-out'
                  }}
                >
                  <div className="chapter-order-cell">
                    <button type="button" className="chapter-drag-btn" aria-label={`Move ${renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}`} style={{ cursor: isDragAndDropEnabled ? 'grab' : 'not-allowed', pointerEvents: isDragAndDropEnabled ? 'auto' : 'none' }}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="7" r="1.5" />
                        <circle cx="16" cy="7" r="1.5" />
                        <circle cx="8" cy="12" r="1.5" />
                        <circle cx="16" cy="12" r="1.5" />
                        <circle cx="8" cy="17" r="1.5" />
                        <circle cx="16" cy="17" r="1.5" />
                      </svg>
                    </button>
                    <span className="chapter-order-number">{index + 1}</span>
                  </div>

                  <div className="chapter-main-cell chapter-main-cell-redesign">
                    <div className="chapter-thumb" aria-hidden="true" style={{ display: 'flex', overflow: 'hidden' }}>
                      {chapter.thumbnail ? (
                        <img 
                          src={chapter.thumbnail} 
                          alt={renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <svg viewBox="0 0 24 24">
                          <circle cx="8" cy="8" r="2" />
                          <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                        </svg>
                      )}
                    </div>
                    <div className="chapter-copy">
                      <h3>{renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}</h3>
                      <p>
                        {renderTranslated(chapter.summary, LANG_CODES[activeLanguageTab])} {"\u2022"} {chapter.sections} sections
                      </p>
                    </div>
                  </div>

                  <div
                    className={`chapter-status-pill chapter-status-${chapter.status.toLowerCase()}`}
                    onClick={() => handleToggleStatus(chapter.id)}
                    style={{ cursor: "pointer" }}
                    title="Click to toggle status"
                  >
                    {chapter.status === "Published" ? (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    )}
                    <span>{chapter.status}</span>
                  </div>

                  <div className="chapter-actions">
                    <button type="button" className={`chapter-view-btn${expandedChapterId === chapter.id ? " is-expanded" : ""}`} onClick={() => handleToggleExpand(chapter)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      View Sections
                    </button>

                    <button type="button" className="chapter-icon-btn" aria-label={`Edit ${renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}`} onClick={() => handleEditChapter(chapter)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="chapter-icon-btn"
                      aria-label={`Delete ${renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}`}
                      onClick={() => openDeleteChapterModal(chapter.id)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </article>

                {expandedChapterId === chapter.id && (() => {
                  const cId = chapter.apiId ?? chapter.id;
                  const sections = sectionsMap[cId] || [];
                  const loading = sectionsLoading[cId];
                  return (
                    <div className="section-panel" style={{ padding: '24px', background: '#FAFAFC', borderTop: '1px solid #F1F3F5' }}>
                      <div className="section-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>Sections in {renderTranslated(chapter.title, LANG_CODES[activeLanguageTab])}</span>
                        <button type="button" onClick={() => { setAddSectionFor(cId); setSectionForm({ title: "", description: "", type: "Text" }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#795289', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                          Add Section
                        </button>
                      </div>

                      {loading && <div className="section-loading" style={{ color: '#718096', fontSize: '14px' }}>Loading sections...</div>}

                      {!loading && sections.map((sec, idx) => (
                        <div 
                          key={sec.id} 
                          className="section-container" 
                          draggable={true}
                          onDragStart={(e) => handleSectionDragStart(e, cId, idx)}
                          onDragOver={(e) => handleSectionDragOver(e, cId, idx)}
                          onDragLeave={(e) => handleSectionDragLeave(e, cId, idx)}
                          onDrop={(e) => handleSectionDrop(e, cId, idx)}
                          style={{ 
                            background: '#FFF', border: '1px solid #EAE6F0', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            opacity: draggedSectionData?.chapterId === cId && draggedSectionData?.sectionIndex === idx ? 0.5 : 1,
                            borderTop: dragOverSectionData?.chapterId === cId && dragOverSectionData?.sectionIndex === idx && idx < draggedSectionData?.sectionIndex ? '3px solid #795289' : '1px solid #EAE6F0',
                            borderBottom: dragOverSectionData?.chapterId === cId && dragOverSectionData?.sectionIndex === idx && idx > draggedSectionData?.sectionIndex ? '3px solid #795289' : '1px solid #EAE6F0',
                            transition: 'border 0.2s ease-in-out'
                          }}
                        >
                          <div className="section-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="section-drag" style={{ color: '#CBD5E0', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="8" cy="7" r="1.5" /><circle cx="16" cy="7" r="1.5" /><circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></svg>
                            </div>
                            <span className="section-title" style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textTransform: 'none' }}>{renderTranslated(sec.title, LANG_CODES[activeLanguageTab])}</span>
                            
                            <span className="section-status-pill" onClick={() => handleToggleSectionStatus(chapter, sec.id)} style={{ cursor: "pointer", marginLeft: "auto", marginRight: "12px", display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', background: sec.status === 'Published' ? '#E6F4EA' : '#F1F3F5', color: sec.status === 'Published' ? '#1E7E34' : '#495057' }} title="Click to toggle status">
                              {sec.status === "Published" ? (
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                              ) : (
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                              )}
                              {sec.status || 'Drafted'}
                            </span>

                            <div className="section-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" onClick={() => handleEditSection(chapter, sec)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid #E2E8F0', borderRadius: '50%', background: '#FFF', color: '#718096', cursor: 'pointer' }} aria-label="Edit section">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button type="button" onClick={() => openDeleteSectionModal(chapter, sec.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid #E2E8F0', borderRadius: '50%', background: '#FFF', color: '#E53E3E', cursor: 'pointer' }} aria-label="Delete section">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                              </button>
                            </div>
                          </div>

                          {/* Attached Content Box */}
                          {(sec.contents && sec.contents.length > 0) && (
                            <div className="section-contents-wrapper" style={{ marginTop: '12px', paddingLeft: '32px' }}>
                              <div className="section-contents-header" style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                                Attached Content ({sec.contents.length})
                              </div>
                              <div className="section-contents-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid #E2E8F0', paddingLeft: '16px', marginLeft: '4px' }}>
                                {sec.contents.map((content) => (
                                  <div key={content.id} className="content-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="content-icon" style={{ color: '#4A5568', display: 'flex', alignItems: 'center' }}>
                                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" fill="none">
                                        {content.type === "Video" ? (
                                          <><rect x="2" y="6" width="20" height="12" rx="2" ry="2" /><polygon points="10 9 15 12 10 15 10 9" /></>
                                        ) : content.type === "Audio" ? (
                                          <path d="M12 2v20M8 8v8M16 8v8M4 11v2M20 11v2" />
                                        ) : (
                                          <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>
                                        )}
                                      </svg>
                                    </span>
                                    <span className="content-title" style={{ fontSize: '13px', color: '#2D3748' }}>
                                      {renderTranslated(content.title, LANG_CODES[activeLanguageTab])} {content.is_required && <span style={{ color: '#E53E3E', marginLeft: '2px' }}>*</span>}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {!loading && sections.length === 0 && <div className="section-loading">No sections yet.</div>}

                      {addSectionFor === cId && (
                        <div className="section-add-form">
                          <div className="section-add-form-row">
                            <input type="text" placeholder="Section title *" value={sectionForm.title} onChange={(e) => setSectionForm((f) => ({ ...f, title: e.target.value }))} />
                            <select value={sectionForm.type} onChange={(e) => setSectionForm((f) => ({ ...f, type: e.target.value }))}>
                              <option>Text</option><option>Video</option><option>Audio</option>
                            </select>
                          </div>
                          <input type="text" placeholder="Description (optional)" value={sectionForm.description} onChange={(e) => setSectionForm((f) => ({ ...f, description: e.target.value }))} />
                          <div className="section-add-form-actions">
                            <button type="button" className="chapter-secondary-btn" onClick={() => setAddSectionFor(null)}>Cancel</button>
                            <button type="button" className="section-add-btn" onClick={() => handleAddSection(chapter)} disabled={!sectionForm.title.trim() || sectionSubmitting}>
                              {sectionSubmitting ? "Creating..." : "Create Section"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </React.Fragment>
            )})}

            {filteredChapterRows.length === 0 && (
              <div className="chapter-empty-state">
                <p>No chapters match the current filter.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {isDrawerOpen && (
        <div className="chapter-drawer-overlay" onClick={closeChapterDrawer}>
          <aside className="chapter-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="chapter-drawer-header">
              <div>
                <h2>{isEditMode ? "Edit Chapter" : "Add Chapter"}</h2>
                <p>{isEditMode ? "Update chapter and section details" : "Step through to set up chapter and first section"}</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close add chapter form" onClick={closeChapterDrawer}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="chapter-stepper">
              {chapterStepItems.map((step) => {
                const isActive = chapterStep === step.id;
                const isComplete = chapterStep > step.id;

                return (
                  <div
                    key={step.id}
                    className={`chapter-step${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                  >
                    <div className="chapter-step-circle">
                      {isComplete ? (
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : step.id}
                    </div>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="chapter-drawer-body">
              <div className="language-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '24px' }}>
                {['English 🇬🇧', 'France 🇫🇷', 'Indonesian 🇮🇩', 'Russian 🇷🇺', 'Spanish 🇪🇸'].map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setActiveLanguageTab(lang);
                      if (lang !== 'English 🇬🇧') {
                        const targetLang = LANG_CODES[lang];
                        if (chapterForm.title && !translations.title?.[targetLang] && !isTranslating['title']) handleTranslate(chapterForm.title, 'title');
                        if (chapterForm.description && !translations.description?.[targetLang] && !isTranslating['description']) handleTranslate(chapterForm.description, 'description');
                        if (chapterForm.sectionName && !translations.sectionName?.[targetLang] && !isTranslating['sectionName']) handleTranslate(chapterForm.sectionName, 'sectionName');
                        if (chapterForm.sectionCaption && !translations.sectionCaption?.[targetLang] && !isTranslating['sectionCaption']) handleTranslate(chapterForm.sectionCaption, 'sectionCaption');
                        if (chapterForm.editorBlocks) {
                           chapterForm.editorBlocks.forEach(b => {
                             if (b.type === 'text') {
                               const field = `content_${b.id}`;
                               if (b.content && !translations[field]?.[targetLang] && !isTranslating[field]) {
                                 handleTranslate(b.content, field);
                               }
                             }
                           });
                        }
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: activeLanguageTab === lang ? '2px solid #5A4B81' : '2px solid transparent',
                      color: activeLanguageTab === lang ? '#2D3748' : '#718096',
                      fontWeight: activeLanguageTab === lang ? '600' : '400',
                      paddingBottom: '12px',
                      marginBottom: '-13px',
                      cursor: 'pointer'
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              {chapterStep === 1 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Chapter Title <span style={{ color: '#E53E3E' }}>*</span> {activeLanguageTab !== 'English 🇬🇧' && isTranslating['title'] && <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>}</span>
                    <input
                      type="text"
                      placeholder="Chapter 8 - The Inner Still"
                      value={activeLanguageTab === 'English 🇬🇧' ? chapterForm.title : getVal(chapterForm.title, 'title', activeLanguageTab)}
                      onChange={(e) => {
                        if (activeLanguageTab === 'English 🇬🇧') {
                          setChapterForm((f) => ({ ...f, title: e.target.value }));
                        } else {
                          setVal('title', activeLanguageTab, e.target.value);
                        }
                      }}
                      onBlur={() => {
                         if (activeLanguageTab === 'English 🇬🇧') handleTranslate(chapterForm.title, 'title');
                      }}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Short Description <span style={{ color: '#E53E3E' }}>*</span> {activeLanguageTab !== 'English 🇬🇧' && isTranslating['description'] && <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>}</span>
                    <input
                      type="text"
                      placeholder="Learning about inner still to achieve inner peace"
                      value={activeLanguageTab === 'English 🇬🇧' ? chapterForm.description : getVal(chapterForm.description, 'description', activeLanguageTab)}
                      onChange={(e) => {
                        if (activeLanguageTab === 'English 🇬🇧') {
                          setChapterForm((f) => ({ ...f, description: e.target.value }));
                        } else {
                          setVal('description', activeLanguageTab, e.target.value);
                        }
                      }}
                      onBlur={() => {
                         if (activeLanguageTab === 'English 🇬🇧') handleTranslate(chapterForm.description, 'description');
                      }}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Chapter Thumbnail <span style={{ color: '#E53E3E' }}>*</span></span>
                    {chapterForm.thumbnailName ? (
                      <div className="chapter-thumbnail-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F7FAFC' }}>
                        <div className="chapter-thumbnail-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="thumb-img-placeholder" style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#CBD5E0', overflow: 'hidden' }}>
                            <img src={chapterForm.thumbnailPreview || "/placeholder-thumb.jpg"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                          </div>
                          <div className="thumb-details" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="file-name" style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{chapterForm.thumbnailName}</span>
                            <span className="file-size" style={{ fontSize: '12px', color: '#718096' }}>59.7 KB</span>
                          </div>
                        </div>
                        <button type="button" className="thumb-delete-btn" onClick={() => setChapterForm(f => ({ ...f, thumbnailName: "" }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <label className="chapter-upload-box">
                        <input type="file" accept=".png,.jpg,.jpeg" onChange={handleThumbnailChange} />
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="8" cy="8" r="2" />
                          <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                        </svg>
                        <strong>Drag & Drop or Choose File to Upload</strong>
                        <span>Supported file: PNG, JPG &nbsp;&nbsp;&nbsp;&nbsp; Max. size: 2 MB</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {chapterStep === 2 && (
                <div className="chapter-form-grid" style={{ gap: '20px' }}>
                  <div className="chapter-field">
                    <span>Section Name <span style={{ color: '#E53E3E' }}>*</span> {activeLanguageTab !== 'English 🇬🇧' && isTranslating['sectionName'] && <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>}</span>
                    <input
                      type="text"
                      placeholder="Enter section name"
                      value={activeLanguageTab === 'English 🇬🇧' ? chapterForm.sectionName : getVal(chapterForm.sectionName, 'sectionName', activeLanguageTab)}
                      onChange={(e) => {
                        if (activeLanguageTab === 'English 🇬🇧') {
                          setChapterForm((f) => ({ ...f, sectionName: e.target.value }));
                        } else {
                          setVal('sectionName', activeLanguageTab, e.target.value);
                        }
                      }}
                      onBlur={() => {
                         if (activeLanguageTab === 'English 🇬🇧') handleTranslate(chapterForm.sectionName, 'sectionName');
                      }}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Section Caption <span style={{ color: '#E53E3E' }}>*</span> {activeLanguageTab !== 'English 🇬🇧' && isTranslating['sectionCaption'] && <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>}</span>
                    <input
                      type="text"
                      placeholder="Enter section caption"
                      value={activeLanguageTab === 'English 🇬🇧' ? chapterForm.sectionCaption : getVal(chapterForm.sectionCaption, 'sectionCaption', activeLanguageTab)}
                      onChange={(e) => {
                        if (activeLanguageTab === 'English 🇬🇧') {
                          setChapterForm((f) => ({ ...f, sectionCaption: e.target.value }));
                        } else {
                          setVal('sectionCaption', activeLanguageTab, e.target.value);
                        }
                      }}
                      onBlur={() => {
                         if (activeLanguageTab === 'English 🇬🇧') handleTranslate(chapterForm.sectionCaption, 'sectionCaption');
                      }}
                    />
                  </div>

                  <div className="section-info-warning" style={{ background: '#FFFFAF', color: '#B7791F', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>You can add more sections once you finish adding the chapter.</span>
                  </div>

                  <div className="chapter-field chapter-field-wide">
                    <span>
                      Content ({activeLanguageTab === 'English 🇬🇧' ? 'English - Primary' : activeLanguageTab.split(' ')[0]}) <span style={{ color: '#E53E3E' }}>*</span>
                      {activeLanguageTab !== 'English 🇬🇧' && chapterForm.editorBlocks.some(b => b.type === 'text' && isTranslating[`content_${b.id}`]) && (
                        <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>
                      )}
                    </span>
                    <div className="rich-text-editor" style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                      <div className="rte-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', borderBottom: '1px solid #E2E8F0', background: '#F7FAFC', alignItems: 'center' }}>
                        {/* Text Formatting */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', color: '#4A5568', padding: '6px' }}>B</button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }} style={{ background: 'none', border: 'none', fontStyle: 'italic', cursor: 'pointer', color: '#4A5568', padding: '6px' }}>i</button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#4A5568', padding: '6px' }}>U</button>
                        </div>
                        <span style={{ width: '1px', height: '20px', background: '#CBD5E0' }}></span>
                        {/* Alignment & Lists */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyLeft'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Align Left"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h10M4 18h16" /></svg></button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyCenter'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Align Center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M4 18h16" /></svg></button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyRight'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Align Right"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M10 12h10M4 18h16" /></svg></button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('justifyFull'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Justify"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                        </div>
                        <span style={{ width: '1px', height: '20px', background: '#CBD5E0' }}></span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Bulleted List"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg></button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Numbered List"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M4 14h2l-2 2h2" /><path d="M4 22h2" /></svg></button>
                          <button type="button" onMouseDown={(e) => { e.preventDefault(); handleFormat('formatBlock', 'BLOCKQUOTE'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Quote"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg></button>
                        </div>
                        <span style={{ width: '1px', height: '20px', background: '#CBD5E0' }}></span>
                        {/* Media Uploads */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <label style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Link" onMouseDown={(e) => { e.preventDefault(); const url = prompt('Enter URL:'); if (url) handleFormat('createLink', url); }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                          </label>
                          <label style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Image">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'image')} />
                          </label>
                          <label style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Video">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
                            <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'video')} />
                          </label>
                          <label style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Audio/Song">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                            <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'audio')} />
                          </label>
                          <label style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Document">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                            <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'document')} />
                          </label>
                          <button type="button" onClick={handleInsertGuidedExercise} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4A5568', padding: '6px' }} title="Insert Guided Exercise">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          </button>
                        </div>
                      </div>

                      {/* Blocks Rendering */}
                      {chapterForm.editorBlocks.map((block) => {
                        if (block.type === 'text') {
                          const isEnglish = activeLanguageTab === 'English 🇬🇧';
                          const textContent = isEnglish ? block.content : getVal(block.content, `content_${block.id}`, activeLanguageTab);
                          
                          return (
                            <div
                              key={`${block.id}-${activeLanguageTab}`}
                              id={block.id}
                              className="custom-rte-content"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newHtml = e.target.innerHTML;
                                if (isEnglish) {
                                  handleBlockChange(block.id, { content: newHtml });
                                  handleTranslate(newHtml, `content_${block.id}`);
                                } else {
                                  setVal(`content_${block.id}`, activeLanguageTab, newHtml);
                                }
                              }}
                              style={{ width: '100%', minHeight: '80px', border: 'none', padding: '16px', outline: 'none' }}
                              dangerouslySetInnerHTML={{ __html: textContent || '<p><br></p>' }}
                            />
                          );
                        }

                        // Media Blocks
                        return (
                          <div key={block.id} style={{ margin: '0', padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {block.type === 'image' && (
                              <div style={{ width: '100%', height: '400px', background: '#F7FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                <img src={block.url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                              </div>
                            )}
                            {block.type === 'video' && (
                              <div style={{ width: '100%', height: '400px', background: '#1A202C', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <video src={block.url} controls style={{ maxWidth: '100%', maxHeight: '100%', outline: 'none' }} />
                              </div>
                            )}
                            {block.type === 'audio' && (
                              <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', background: '#F7FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{block.name || block.title || 'Audio Block'}</span>
                                <audio src={block.url} controls style={{ width: '100%', maxWidth: '400px' }} />
                              </div>
                            )}
                            {block.type === 'document' && (
                              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#F7FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{block.name || block.title || 'Document Block'}</span>
                              </div>
                            )}
                            {block.type === 'exercise' && (
                              <div className="guided-exercise-block" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#FFF' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#2D3748' }}>Guided Exercise</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                  <div className="chapter-field" style={{ margin: 0 }}>
                                    <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Exercise Title <span style={{ color: '#E53E3E' }}>*</span></span>
                                    <input type="text" value={block.title} onChange={(e) => handleBlockChange(block.id, { title: e.target.value })} placeholder="Pause and Observe" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                                  </div>
                                  <div className="chapter-field" style={{ margin: 0 }}>
                                    <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Duration <span style={{ color: '#E53E3E' }}>*</span></span>
                                    <select value={block.duration} onChange={(e) => handleBlockChange(block.id, { duration: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'transparent' }}>
                                      <option>2 Minutes</option>
                                      <option>5 Minutes</option>
                                      <option>10 Minutes</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="chapter-field" style={{ margin: 0 }}>
                                  <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Instructions <span style={{ color: '#E53E3E' }}>*</span></span>
                                  <textarea rows="4" value={block.instructions} onChange={(e) => handleBlockChange(block.id, { instructions: e.target.value })} placeholder="1. Sit comfortably.&#10;2. Close your eyes if comfortable." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', resize: 'vertical' }} />
                                </div>
                              </div>
                            )}

                            {/* Toggle and Trash for Media Blocks */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#718096', cursor: 'pointer' }}>
                                <div style={{ width: '36px', height: '20px', background: block.isRequired ? '#5A4B81' : '#CBD5E0', borderRadius: '20px', position: 'relative', transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                  <div style={{ width: '16px', height: '16px', background: '#FFF', borderRadius: '50%', transform: block.isRequired ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }}></div>
                                </div>
                                <input 
                                  type="checkbox" 
                                  checked={block.isRequired || false} 
                                  onChange={(e) => handleBlockChange(block.id, { isRequired: e.target.checked })}
                                  style={{ display: 'none' }} 
                                />
                                Require Completion
                              </label>
                              <button
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}
                                title="Remove Block"
                              >
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {chapterStep === 3 && (
                <div className="chapter-review-card-modern" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div className="review-section">
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D3748', margin: '0 0 20px 0' }}>Chapter Summary</h3>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Chapter Title</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{renderTranslated(merge(chapterForm.title, 'title'), LANG_CODES[activeLanguageTab]) || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Short Description</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{renderTranslated(merge(chapterForm.description, 'description'), LANG_CODES[activeLanguageTab]) || "-"}</strong>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Chapter Thumbnail</span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#CBD5E0', overflow: 'hidden' }}>
                          <img src={chapterForm.thumbnailPreview || "/placeholder-thumb.jpg"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                        </div>
                        <span style={{ fontSize: '14px', color: '#2D3748', fontWeight: '500' }}>{chapterForm.thumbnailName || "No file selected"}</span>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: 0 }} />

                  <div className="review-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#2D3748', margin: 0 }}>Initial Section Summary</h3>
                      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4A5568', background: '#FFF', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '100px', cursor: 'pointer' }}>
                        Open Preview
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </button>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Content Type</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>Text</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Languages</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>EN, FR, ID, RU, ES</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Section Name</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{renderTranslated(merge(chapterForm.sectionName, 'sectionName'), LANG_CODES[activeLanguageTab]) || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Section Caption</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{renderTranslated(merge(chapterForm.sectionCaption, 'sectionCaption'), LANG_CODES[activeLanguageTab]) || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Section Content</span>
                      <div style={{ padding: '16px', background: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chapterForm.editorBlocks && chapterForm.editorBlocks.filter(b => b.type === 'text').map((block) => {
                          const isEnglish = activeLanguageTab === 'English 🇬🇧';
                          const textContent = isEnglish ? block.content : getVal(block.content, `content_${block.id}`, activeLanguageTab);
                          return (
                            <div 
                              key={block.id}
                              style={{ fontSize: '14px', color: '#4A5568', lineHeight: '1.6' }}
                              dangerouslySetInnerHTML={{ __html: textContent || "-" }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {chapterForm.editorBlocks && chapterForm.editorBlocks.filter(b => b.type !== 'text').length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '600' }}>Attached Media ({chapterForm.editorBlocks.filter(b => b.type !== 'text').length})</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {chapterForm.editorBlocks.filter(b => b.type !== 'text').map((block, idx) => (
                            <div key={block.id} style={{ padding: '12px', background: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {block.type === 'image' && block.url ? (
                                <img src={block.url} alt={block.title || 'Preview'} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <div style={{ width: '60px', height: '60px', background: '#EDF2F7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AEC0' }}>
                                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect></svg>
                                </div>
                              )}
                              <div>
                                <strong style={{ display: 'block', fontSize: '14px', color: '#2D3748' }}>{block.title || `Media Block ${idx + 1}`}</strong>
                                <span style={{ fontSize: '12px', color: '#718096', textTransform: 'capitalize' }}>{block.type} Block {block.isRequired ? '(Required)' : ''}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="chapter-drawer-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8F6FA', border: '1px solid #EAE6F0', padding: '10px 24px', borderRadius: '100px', color: '#795289', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => {
                  if (isEditMode || chapterStep === 1) {
                    closeChapterDrawer();
                    return;
                  }
                  setChapterStep((current) => current - 1);
                }}
              >
                {isEditMode || chapterStep === 1 ? (
                  "Cancel"
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Previous
                  </>
                )}
              </button>

              {chapterStep === 3 ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => handleContinue("Drafted")} disabled={!canContinue || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF', border: '1px solid #EAE6F0', color: '#795289', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    Save as Draft
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleContinue(isEditMode ? (editingChapter?.status || "Drafted") : "Published")} 
                    disabled={!canContinue || isSubmitting} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: '#795289', 
                      border: 'none', 
                      color: '#FFF', 
                      padding: '10px 24px', 
                      borderRadius: '100px', 
                      fontWeight: '500', 
                      cursor: 'pointer' 
                    }}
                  >
                    {isSubmitting ? (isEditMode ? "Saving..." : "Publishing...") : (
                      isEditMode ? (
                        <>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                          Save Changes
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          Publish Now
                        </>
                      )
                    )}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => handleContinue()} disabled={!canContinue || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#795289', border: 'none', color: '#FFF', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                  {isSubmitting ? "Saving..." : "Continue \u2192"}
                </button>
              )}
            </div>

            {submitError && (
              <p style={{ margin: "10px 20px", color: "#b42318", fontSize: "0.875rem" }}>
                {submitError}
              </p>
            )}
          </aside>
        </div>
      )}

      {showPublishedModal.show && (
        <div style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '320px',
          background: '#161d29',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          gap: '12px',
          border: '1px solid #222a40',
          animation: 'slideInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
             <svg viewBox="0 0 24 24" width="24" height="24" fill={showPublishedModal.status === "Published" ? "#10B981" : "#6366f1"}>
                <circle cx="12" cy="12" r="12" />
                <path d="M17 8l-7 8-3-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
             </svg>
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <strong style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>
                {showPublishedModal.status === "Published" ? "New Chapter Published" : "Draft Saved Successfully"}
              </strong>
              <button onClick={() => setShowPublishedModal({ show: false, status: null })} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }} aria-label="Close">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
              {showPublishedModal.status === "Published" 
                ? "You have successfully published a new chapter" 
                : "Your chapter has been saved as a draft"}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPublishedModal({ show: false, status: null })} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: '500' }}>
                Dismiss
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideInUp {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {deleteModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            width: '400px',
            maxWidth: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 16px 0', color: '#1A202C', fontSize: '20px', fontWeight: '600' }}>
              Are you sure you want to delete this {deleteModal.type}?
            </h3>
            <p style={{ margin: '0 0 32px 0', color: '#718096', fontSize: '14px', lineHeight: '1.5' }}>
              You are about to permanently delete this item.<br/>
              All associated content and data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                onClick={() => setDeleteModal({ show: false, type: null, targetId: null, chapterId: null })}
                style={{
                  padding: '12px 24px',
                  borderRadius: '100px',
                  border: '1px solid #E2E8F0',
                  background: 'white',
                  color: '#4A5568',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                No, Keep It
              </button>
              <button 
                onClick={confirmDeleteAction}
                style={{
                  padding: '12px 24px',
                  borderRadius: '100px',
                  border: 'none',
                  background: '#E53E3E',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}