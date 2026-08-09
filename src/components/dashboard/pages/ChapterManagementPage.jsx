import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useChaptersCollection, createChapter, updateChapter, deleteChapter, toggleChapterStatus } from "../utils/chapterUtils";
import { fetchSectionsByChapter, createSection, deleteSection, toggleSectionStatus, normalizeSection } from "../utils/sectionUtils";

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
  sectionContent: "",
  exerciseTitle: "",
  exerciseDuration: "2 Minutes",
  exerciseInstructions: "",
  exerciseRequired: false,
  sectionType: "Text",
  mediaList: [],
  thumbnailPreview: "",
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
  const [showPublishedModal, setShowPublishedModal] = useState(false);

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

  const handleDeleteSection = async (chapter, sectionId) => {
    const cId = chapter.apiId ?? chapter.id;
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await deleteSection(cId, sectionId);
      setSectionsMap((p) => ({ ...p, [cId]: (p[cId] || []).filter((s) => s.id !== sectionId) }));
      refetch();
    } catch (err) {
      alert(`Gagal menghapus section: ${err.message}`);
    }
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
        chapter.title.toLowerCase().includes(normalizedQuery) ||
        chapter.summary.toLowerCase().includes(normalizedQuery);
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

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      title: chapter.title || "",
      description: chapter.summary || "",
      thumbnailName: "",
      sectionName: "",
      sectionCaption: "",
      sectionContent: "",
      exerciseTitle: "",
      exerciseDuration: "2 Minutes",
      exerciseInstructions: "",
      exerciseRequired: false,
      sectionType: "Text",
      mediaList: [],
      thumbnailPreview: "",
    });
    setChapterStep(1);
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

    if (chapterForm.thumbnailPreview) {
      URL.revokeObjectURL(chapterForm.thumbnailPreview);
    }

    setChapterForm((current) => ({
      ...current,
      thumbnailName: nextFile ? nextFile.name : "",
      thumbnailPreview: nextFile ? URL.createObjectURL(nextFile) : "",
    }));
  };

  const isEditMode = editingChapter !== null;

  const canContinue =
    chapterStep === 1
      ? chapterForm.title.trim() !== "" && chapterForm.description.trim() !== ""
      : chapterStep === 2
        ? chapterForm.sectionName.trim() !== "" && chapterForm.sectionCaption.trim() !== ""
        : true;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setChapterForm(f => ({
        ...f,
        mediaList: [...f.mediaList, { id: Date.now(), type, name: file.name, url, file }]
      }));
    }
    e.target.value = null; // Reset
  };

  const removeMedia = (id) => {
    setChapterForm(f => {
      const updatedMedia = f.mediaList.filter(m => m.id !== id);
      // Clean up object URLs
      const removed = f.mediaList.find(m => m.id === id);
      if (removed && removed.url) URL.revokeObjectURL(removed.url);
      return { ...f, mediaList: updatedMedia };
    });
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleContinue = async (submitStatus = "Drafted") => {
    const isEvent = submitStatus && typeof submitStatus === "object" && submitStatus.target;
    const finalStatus = isEvent ? "Drafted" : submitStatus;

    if (!canContinue) {
      return;
    }

    if (chapterStep < 3) {
      setChapterStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    if (isEditMode) {
      try {
        const apiId = editingChapter.apiId ?? editingChapter.id;
        const chapterData = {
          title: chapterForm.title.trim(),
          description: chapterForm.description.trim(),
          status: finalStatus !== "Drafted" ? finalStatus : (editingChapter.status || "Drafted"),
        };

        const result = await updateChapter(apiId, chapterData);

        setChapterRows((current) =>
          current.map((c) =>
            c.id === editingChapter.id
              ? {
                ...c,
                title: result.chapter?.title || result.title || chapterData.title,
                summary: result.chapter?.description || result.description || chapterData.description,
                status: finalStatus !== "Drafted" ? finalStatus : (editingChapter.status || "Drafted"),
              }
              : c
          )
        );
        closeChapterDrawer();
        refetch();
        
        if (finalStatus === "Published") {
          setShowPublishedModal(true);
          setTimeout(() => setShowPublishedModal(false), 5000);
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
        title: normalizedTitle,
        description: chapterForm.description.trim(),
        status: finalStatus,
        sections: [
          {
            title: chapterForm.sectionName.trim(),
            description: chapterForm.sectionCaption.trim(),
            type: chapterForm.sectionType,
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

      if (finalStatus === "Published") {
        setShowPublishedModal(true);
        setTimeout(() => setShowPublishedModal(false), 5000); // auto-hide after 5 seconds
      }
    } catch (err) {
      setSubmitError(err.message || "Gagal membuat chapter. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm("Are you sure you want to delete this chapter?")) {
      return;
    }

    const chapter = chapterRows.find((c) => c.id === chapterId);
    const apiId = chapter?.apiId ?? chapterId;

    try {
      await deleteChapter(apiId);
      setChapterRows((current) => current.filter((c) => c.id !== chapterId));
      refetch();
    } catch (err) {
      alert(`Gagal menghapus chapter: ${err.message}`);
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
        <h1>Chapter Management</h1>
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

            {filteredChapterRows.map((chapter) => (
              <React.Fragment key={chapter.id}>
                <article className="chapter-row chapter-row-redesign">
                  <div className="chapter-order-cell">
                    <button type="button" className="chapter-drag-btn" aria-label={`Move ${chapter.title}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="7" r="1.5" />
                        <circle cx="16" cy="7" r="1.5" />
                        <circle cx="8" cy="12" r="1.5" />
                        <circle cx="16" cy="12" r="1.5" />
                        <circle cx="8" cy="17" r="1.5" />
                        <circle cx="16" cy="17" r="1.5" />
                      </svg>
                    </button>
                    <span className="chapter-order-number">{chapter.id}</span>
                  </div>

                  <div className="chapter-main-cell chapter-main-cell-redesign">
                    <div className="chapter-thumb" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <circle cx="8" cy="8" r="2" />
                        <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                      </svg>
                    </div>
                    <div className="chapter-copy">
                      <h3>{chapter.title}</h3>
                      <p>
                        {chapter.summary} {"\u2022"} {chapter.sections} sections
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

                    <button type="button" className="chapter-icon-btn" aria-label={`Edit ${chapter.title}`} onClick={() => handleEditChapter(chapter)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      className="chapter-icon-btn"
                      aria-label={`Delete ${chapter.title}`}
                      onClick={() => handleDeleteChapter(chapter.id)}
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
                        <span style={{ fontSize: '14px', color: '#718096', fontWeight: '500' }}>Sections in {chapter.title}</span>
                        <button type="button" onClick={() => { setAddSectionFor(cId); setSectionForm({ title: "", description: "", type: "Text" }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#795289', color: '#FFF', border: 'none', padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                          Add Section
                        </button>
                      </div>

                      {loading && <div className="section-loading" style={{ color: '#718096', fontSize: '14px' }}>Loading sections...</div>}

                      {!loading && sections.map((sec) => (
                        <div key={sec.id} className="section-container" style={{ background: '#FFF', border: '1px solid #EAE6F0', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                          <div className="section-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="section-drag" style={{ color: '#CBD5E0', cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="8" cy="7" r="1.5" /><circle cx="16" cy="7" r="1.5" /><circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></svg>
                            </div>
                            <span className="section-title" style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{sec.title}</span>
                            
                            <span className="section-status-pill" onClick={() => handleToggleSectionStatus(chapter, sec.id)} style={{ cursor: "pointer", marginLeft: "auto", marginRight: "12px", display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '500', background: sec.status === 'Published' ? '#E6F4EA' : '#F1F3F5', color: sec.status === 'Published' ? '#1E7E34' : '#495057' }} title="Click to toggle status">
                              {sec.status === "Published" ? (
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                              ) : (
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                              )}
                              {sec.status || 'Drafted'}
                            </span>

                            <div className="section-actions" style={{ display: 'flex', gap: '8px' }}>
                              <button type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid #E2E8F0', borderRadius: '50%', background: '#FFF', color: '#718096', cursor: 'pointer' }} aria-label="Edit section">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              </button>
                              <button type="button" onClick={() => handleDeleteSection(chapter, sec.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', border: '1px solid #E2E8F0', borderRadius: '50%', background: '#FFF', color: '#E53E3E', cursor: 'pointer' }} aria-label="Delete section">
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
                                      {content.title} {content.is_required && <span style={{ color: '#E53E3E', marginLeft: '2px' }}>*</span>}
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
            ))}

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
                    <div className="chapter-step-circle">{step.id}</div>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="chapter-drawer-body">
              {chapterStep === 1 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Chapter Title <span style={{ color: '#E53E3E' }}>*</span></span>
                    <input
                      type="text"
                      placeholder="Chapter 8 - The Inner Still"
                      value={chapterForm.title}
                      onChange={handleChapterFieldChange("title")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Short Description <span style={{ color: '#E53E3E' }}>*</span></span>
                    <input
                      type="text"
                      placeholder="Learning about inner still to achieve inner peace"
                      value={chapterForm.description}
                      onChange={handleChapterFieldChange("description")}
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
                  <div className="language-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '8px' }}>
                    {['English 🇬🇧', 'France 🇫🇷', 'Indonesian 🇮🇩', 'Russian 🇷🇺', 'Spanish 🇪🇸'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLanguageTab(lang)}
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

                  <div className="chapter-field">
                    <span>Section Name <span style={{ color: '#E53E3E' }}>*</span></span>
                    <input
                      type="text"
                      placeholder="Enter section name"
                      value={chapterForm.sectionName}
                      onChange={handleChapterFieldChange("sectionName")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Section Caption <span style={{ color: '#E53E3E' }}>*</span></span>
                    <input
                      type="text"
                      placeholder="Enter section caption"
                      value={chapterForm.sectionCaption}
                      onChange={handleChapterFieldChange("sectionCaption")}
                    />
                  </div>

                  <div className="section-info-warning" style={{ background: '#FFFFAF', color: '#B7791F', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <span>You can add more sections once you finish adding the chapter.</span>
                  </div>

                  <div className="chapter-field chapter-field-wide">
                    <span>Content (English - Primary) <span style={{ color: '#E53E3E' }}>*</span></span>
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
                        </div>
                      </div>

                      {/* Functional Rich Text Area */}
                      <div
                        className="custom-rte-content"
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => setChapterForm(f => ({ ...f, sectionContent: e.target.innerHTML }))}
                        style={{ width: '100%', minHeight: '160px', border: 'none', padding: '16px', outline: 'none' }}
                        dangerouslySetInnerHTML={{ __html: chapterForm.sectionContent || '<p><br></p>' }}
                      />

                      {/* Media Preview Block */}
                      {chapterForm.mediaList.length > 0 && (
                        <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {chapterForm.mediaList.map((media) => (
                            <div key={media.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', background: '#FFF' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F7FAFC', padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#2D3748', textTransform: 'capitalize' }}>
                                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2">
                                    {media.type === 'video' ? <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></>
                                    : media.type === 'audio' ? <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>
                                    : <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
                                  </svg>
                                  {media.type} Block
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMedia(media.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E', fontSize: '13px', fontWeight: '500' }}
                                >
                                  Remove
                                </button>
                              </div>

                              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="chapter-field" style={{ margin: 0 }}>
                                  <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Content Title <span style={{ color: '#E53E3E' }}>*</span></span>
                                  <input 
                                    type="text" 
                                    placeholder={`Enter ${media.type} title`} 
                                    value={media.title || ''} 
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setChapterForm(f => ({ ...f, mediaList: f.mediaList.map(m => m.id === media.id ? { ...m, title: val } : m) }));
                                    }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} 
                                  />
                                </div>

                                {media.type === 'image' && (
                                  <img src={media.url} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block', background: '#EDF2F7', borderRadius: '8px' }} />
                                )}
                                {media.type === 'video' && (
                                  <video src={media.url} controls style={{ width: '100%', maxHeight: '300px', display: 'block', background: '#1A202C', borderRadius: '8px' }} />
                                )}
                                {media.type === 'audio' && (
                                  <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', background: '#F7FAFC', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{media.name}</span>
                                    <audio src={media.url} controls style={{ width: '100%', maxWidth: '400px' }} />
                                  </div>
                                )}
                                {media.type === 'document' && (
                                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#F7FAFC', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{media.name}</span>
                                  </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#718096', cursor: 'pointer' }}>
                                    <div style={{ width: '36px', height: '20px', background: media.isRequired ? '#5A4B81' : '#CBD5E0', borderRadius: '20px', position: 'relative', transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                      <div style={{ width: '16px', height: '16px', background: '#FFF', borderRadius: '50%', transform: media.isRequired ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }}></div>
                                    </div>
                                    <input 
                                      type="checkbox" 
                                      checked={media.isRequired || false} 
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setChapterForm(f => ({ ...f, mediaList: f.mediaList.map(m => m.id === media.id ? { ...m, isRequired: checked } : m) }));
                                      }}
                                      style={{ display: 'none' }} 
                                    />
                                    Require to Continue
                                  </label>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* <div className="guided-exercise-block" style={{ margin: '16px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#2D3748' }}>Guided Exercise 1</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div className="chapter-field" style={{ margin: 0 }}>
                            <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Exercise Title <span style={{ color: '#E53E3E' }}>*</span></span>
                            <input type="text" value={chapterForm.exerciseTitle} onChange={handleChapterFieldChange("exerciseTitle")} placeholder="Pause and Observe" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                          </div>
                          <div className="chapter-field" style={{ margin: 0 }}>
                            <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Duration <span style={{ color: '#E53E3E' }}>*</span></span>
                            <select value={chapterForm.exerciseDuration} onChange={handleChapterFieldChange("exerciseDuration")} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'transparent' }}>
                              <option>2 Minutes</option>
                              <option>5 Minutes</option>
                              <option>10 Minutes</option>
                            </select>
                          </div>
                        </div>
                        <div className="chapter-field" style={{ margin: 0 }}>
                          <span style={{ marginBottom: '8px', display: 'block', fontSize: '13px' }}>Instructions <span style={{ color: '#E53E3E' }}>*</span></span>
                          <textarea rows="6" value={chapterForm.exerciseInstructions} onChange={handleChapterFieldChange("exerciseInstructions")} placeholder="1. Sit comfortably.&#10;2. Close your eyes if comfortable." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#718096', cursor: 'pointer' }}>
                            <div style={{ width: '36px', height: '20px', background: chapterForm.exerciseRequired ? '#5A4B81' : '#CBD5E0', borderRadius: '20px', position: 'relative', transition: 'background 0.2s', display: 'flex', alignItems: 'center', padding: '2px' }}>
                              <div style={{ width: '16px', height: '16px', background: '#FFF', borderRadius: '50%', transform: chapterForm.exerciseRequired ? 'translateX(16px)' : 'translateX(0)', transition: 'transform 0.2s' }}></div>
                            </div>
                            <input type="checkbox" checked={chapterForm.exerciseRequired} onChange={(e) => setChapterForm(f => ({ ...f, exerciseRequired: e.target.checked }))} style={{ display: 'none' }} />
                            Require Completion
                          </label>
                          <button type="button" style={{ background: 'none', border: 'none', color: '#E53E3E', cursor: 'pointer' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                          </button>
                        </div>
                      </div> */}
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
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{chapterForm.title || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Short Description</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{chapterForm.description || "-"}</strong>
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
                      <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: '1px solid #E2E8F0', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#4A5568', cursor: 'pointer' }}>
                        Open Preview
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
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
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{chapterForm.sectionName || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '4px' }}>Section Caption</span>
                      <strong style={{ fontSize: '15px', color: '#2D3748', fontWeight: '500' }}>{chapterForm.sectionCaption || "-"}</strong>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ display: 'block', fontSize: '13px', color: '#718096', marginBottom: '8px' }}>Section Content</span>
                      <div style={{ padding: '16px', background: '#F7FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', color: '#4A5568', lineHeight: '1.6', overflow: 'hidden' }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{chapterForm.sectionContent || "-"}</p>
                      </div>
                    </div>
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

              {chapterStep === 3 && !isEditMode ? (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => handleContinue("Drafted")} disabled={!canContinue || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF', border: '1px solid #EAE6F0', color: '#795289', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    Save as Draft
                  </button>
                  <button type="button" onClick={() => handleContinue("Published")} disabled={!canContinue || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#795289', border: 'none', color: '#FFF', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                    {isSubmitting ? "Publishing..." : (
                      <>
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        Publish Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={handleContinue} disabled={!canContinue || isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#795289', border: 'none', color: '#FFF', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
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

      {showPublishedModal && (
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
             <svg viewBox="0 0 24 24" width="24" height="24" fill="#10B981">
                <circle cx="12" cy="12" r="12" />
                <path d="M17 8l-7 8-3-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
             </svg>
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <strong style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>New Chapter Published</strong>
              <button onClick={() => setShowPublishedModal(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }} aria-label="Close">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.4' }}>You have successfully published a new chapter</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPublishedModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '14px', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontWeight: '500' }}>
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

    </div>
  );
}