import React, { useEffect, useMemo, useState } from "react";


const practiceStepItems = [
  { id: 1, label: "Practice Info" },
  { id: 2, label: "Add Session" },
  { id: 3, label: "Review & Publish" },
];

const initialPracticeForm = {
  name: "",
  caption: "",
  category: "",
  durationRange: "",
  goalType: "",
  relatedChapters: [],
  thumbnailName: "",
  sessionTitle: "",
  sessionType: "Video",
  sessionContentFileName: "",
  sessionContentFileObj: null,
  thumbnailPreview: "",
};

export function PracticeManagementPage() {
  const [activeTab, setActiveTab] = useState("practice");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [practiceRows, setPracticeRows] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSessionSuccessToast, setShowSessionSuccessToast] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategorySuccessToast, setShowCategorySuccessToast] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [addedCategories, setAddedCategories] = useState([]);
  const [expandedPracticeId, setExpandedPracticeId] = useState(null);
  const [practiceStep, setPracticeStep] = useState(1);
  const [practiceForm, setPracticeForm] = useState(initialPracticeForm);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isSessionDeleteModalOpen, setIsSessionDeleteModalOpen] = useState(false);
  const [deletingSessionData, setDeletingSessionData] = useState(null);
  const [isPracticeDeleteModalOpen, setIsPracticeDeleteModalOpen] = useState(false);
  const [deletingPracticeId, setDeletingPracticeId] = useState(null);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [draggedPracticeIndex, setDraggedPracticeIndex] = useState(null);
  const [dragOverPracticeIndex, setDragOverPracticeIndex] = useState(null);
  const [draggedSessionData, setDraggedSessionData] = useState(null);
  const [dragOverSessionData, setDragOverSessionData] = useState(null);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState(null);
  const [dragOverCategoryIndex, setDragOverCategoryIndex] = useState(null);
  const [editingPractice, setEditingPractice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [isRelatedChapterOpen, setIsRelatedChapterOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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

  useEffect(() => {
    fetchPractices();
    fetchChapters();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/practices/categories");
      if (response.ok) {
        const data = await response.json();
        setAddedCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch("/api/chapters");
      const data = await response.json();
      setChapters(Array.isArray(data) ? data : (data.chapters || data.data || []));
    } catch (error) {
      console.error("Failed to fetch chapters:", error);
      setChapters([]);
    }
  };

  const fetchPractices = async () => {
    try {
      const response = await fetch("/api/practices");
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((item) => {
          let sessionsData = [];
          if (item.sessions_data) {
            sessionsData = typeof item.sessions_data === 'string' ? JSON.parse(item.sessions_data) : item.sessions_data;
          }
          return {
            id: item.id,
            title: item.title,
            category: item.category,
            goal: item.goal,
            duration: item.duration,
            caption: item.caption,
            thumbnail: item.thumbnail,
            sessionsCount: item.sessions || sessionsData.length || 1,
            sessions: sessionsData,
            relatedChapters: item.related_chapters || item.relatedChapters || [],
            status: item.status,
            date: item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-",
          };
        });
        setPracticeRows(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch practices:", error);
    }
  };


  const categoryOptions = useMemo(
    () => ["All Category", ...new Set([
      ...addedCategories.map(c => c.name),
      ...practiceRows.map((practice) => practice.category)
    ])],
    [practiceRows, addedCategories]
  );

  const filteredPracticeRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return practiceRows.filter((practice) => {
      const matchesQuery =
        normalizedQuery === "" ||
        practice.title.toLowerCase().includes(normalizedQuery) ||
        practice.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "All Category" || practice.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || practice.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [practiceRows, searchQuery, categoryFilter, statusFilter]);

  const categoryRows = useMemo(() => {
    const buckets = new Map();

    addedCategories.forEach((cat) => {
      buckets.set(cat.name, {
        id: cat.id,
        name: cat.name,
        totalPractices: 0,
        status: "Published",
      });
    });

    practiceRows.forEach((practice) => {
      const current = buckets.get(practice.category) || {
        id: practice.category,
        name: practice.category,
        totalPractices: 0,
        status: "Published",
      };
      current.totalPractices += 1;
      buckets.set(practice.category, current);
    });

    return [...buckets.values()];
  }, [practiceRows, addedCategories]);

  const filteredCategoryRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categoryRows.filter((category) => {
      const matchesQuery = normalizedQuery === "" || category.name.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "All Status" || category.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [categoryRows, searchQuery, statusFilter]);

  const closePracticeDrawer = () => {
    setIsDrawerOpen(false);
    setPracticeStep(1);
    setPracticeForm(initialPracticeForm);
    setEditingPractice(null);
    setEditingSessionIndex(null);
    setIsAddingSession(false);
  };

  const handleEditPractice = (practice) => {
    setEditingPractice(practice);
    const session = practice.sessions && practice.sessions.length > 0 ? practice.sessions[0] : {};
    
    setPracticeForm({
      name: practice.title || "",
      caption: practice.caption || "",
      category: practice.category || "",
      durationRange: practice.duration || "",
      goalType: practice.goal || "",
      relatedChapters: practice.relatedChapters || [],
      thumbnailName: practice.thumbnail ? "existing-thumbnail.jpg" : "",
      thumbnailPreview: practice.thumbnail || "",
      sessionTitle: session.title || "",
      sessionType: session.type || "Video",
      sessionContentFileName: session.contentFileName || "",
      sessionContentFileObj: null,
    });
    setPracticeStep(1);
    setEditingSessionIndex(null);
    setIsAddingSession(false);
    setIsDrawerOpen(true);
  };

  const handleTogglePracticeStatus = async (practiceId) => {
    const practice = practiceRows.find((p) => p.id === practiceId);
    if (!practice) return;

    const previousStatus = practice.status;
    const nextStatus = previousStatus === "Published" ? "Drafted" : "Published";

    setPracticeRows((current) =>
      current.map((p) =>
        p.id === practiceId
          ? {
            ...p,
            status: nextStatus,
          }
          : p
      )
    );

    try {
      const response = await fetch(`/api/practices/${practiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...practice, status: nextStatus, sessions_data: practice.sessions, sessions: practice.sessionsCount, related_chapters: practice.relatedChapters }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update practice status:", error);
      // Revert on error
      setPracticeRows((current) =>
        current.map((p) =>
          p.id === practiceId
            ? {
              ...p,
              status: previousStatus,
            }
            : p
        )
      );
    }
  };

  const handleToggleSessionStatus = async (practiceId, sessionIndex) => {
    const practice = practiceRows.find(p => p.id === practiceId);
    if (!practice) return;

    const currentSessions = Array.isArray(practice.sessions) ? [...practice.sessions] : [];
    const session = currentSessions[sessionIndex];
    if (!session) return;

    const previousStatus = session.status || "Drafted";
    const nextStatus = previousStatus === "Published" ? "Drafted" : "Published";
    currentSessions[sessionIndex] = { ...session, status: nextStatus };

    setPracticeRows(current =>
      current.map(p =>
        p.id === practiceId
          ? { ...p, sessions: currentSessions }
          : p
      )
    );

    try {
      const response = await fetch(`/api/practices/${practiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...practice, sessions_data: currentSessions, sessions: practice.sessionsCount, related_chapters: practice.relatedChapters }),
      });
      if (!response.ok) throw new Error("Failed to update session status");
    } catch (error) {
      console.error("Failed to update session status:", error);
      fetchPractices(); // revert on error
    }
  };

  const handleEditSession = (practice, sessionIndex) => {
    const session = Array.isArray(practice.sessions) ? practice.sessions[sessionIndex] : {};
    setEditingPractice(practice);
    setPracticeForm({
      ...initialPracticeForm,
      name: practice.title || "",
      caption: practice.caption || "",
      category: practice.category || "",
      durationRange: practice.duration || "",
      relatedChapters: practice.relatedChapters || [],
      thumbnailName: practice.thumbnail ? "existing-thumbnail.jpg" : "",
      thumbnailPreview: practice.thumbnail || "",
      sessionTitle: session.title || "",
      sessionType: session.type || "Video",
      sessionContentFileName: session.contentFileName || "",
      sessionContentFileObj: null,
    });
    setPracticeStep(2); // Go straight to session edit
    setEditingSessionIndex(sessionIndex);
    setIsAddingSession(false);
    setIsDrawerOpen(true);
  };

  const handleAddSession = (practice) => {
    setEditingPractice(practice);
    setPracticeForm({
      ...initialPracticeForm,
      name: practice.title || "",
      caption: practice.caption || "",
      category: practice.category || "",
      durationRange: practice.duration || "",
      relatedChapters: practice.relatedChapters || [],
      thumbnailName: practice.thumbnail ? "existing-thumbnail.jpg" : "",
      thumbnailPreview: practice.thumbnail || "",
      sessionTitle: "",
      sessionType: "Video",
      sessionContentFileName: "",
      sessionContentFileObj: null,
    });
    setPracticeStep(2);
    setEditingSessionIndex(null);
    setIsAddingSession(true);
    setIsDrawerOpen(true);
  };

  const handleAddPractice = () => {
    setEditingPractice(null);
    setPracticeForm(initialPracticeForm);
    setPracticeStep(1);
    setEditingSessionIndex(null);
    setIsAddingSession(false);
    setIsDrawerOpen(true);
  };

  const handleDeleteSessionPrompt = (practice, sessionIndex) => {
    setDeletingSessionData({ practice, sessionIndex });
    setIsSessionDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (!deletingSessionData) return;
    const { practice, sessionIndex } = deletingSessionData;
    
    try {
      const currentSessions = Array.isArray(practice.sessions) ? [...practice.sessions] : [];
      currentSessions.splice(sessionIndex, 1);
      
      await fetch(`/api/practices/${practice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...practice, sessions_data: currentSessions, sessions: currentSessions.length, related_chapters: practice.relatedChapters }),
      });
      await fetchPractices();
      setIsSessionDeleteModalOpen(false);
      setDeletingSessionData(null);
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handlePracticeDragStart = (e, index) => {
    setDraggedPracticeIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePracticeDragOver = (e, index) => {
    e.preventDefault();
    if (draggedPracticeIndex !== null && draggedPracticeIndex !== index) {
      setDragOverPracticeIndex(index);
    }
    e.dataTransfer.dropEffect = "move";
  };

  const handlePracticeDragLeave = (e, index) => {
    if (dragOverPracticeIndex === index) {
      setDragOverPracticeIndex(null);
    }
  };

  const handlePracticeDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedPracticeIndex === null || draggedPracticeIndex === targetIndex) return;

    const newRows = [...practiceRows];
    const draggedItem = newRows.splice(draggedPracticeIndex, 1)[0];
    newRows.splice(targetIndex, 0, draggedItem);
    
    setPracticeRows(newRows);
    setDraggedPracticeIndex(null);
    setDragOverPracticeIndex(null);

    try {
      const practiceIds = newRows.map(p => p.id);
      const response = await fetch("/api/practices/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceIds }),
      });
      if (!response.ok) throw new Error("Failed to reorder practices");
    } catch (err) {
      console.error("Failed to save practice order:", err);
      fetchPractices(); // revert
    }
  };

  const handleCategoryDragStart = (e, index) => {
    setDraggedCategoryIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e, index) => {
    e.preventDefault();
    if (draggedCategoryIndex !== null && draggedCategoryIndex !== index) {
      setDragOverCategoryIndex(index);
    }
    e.dataTransfer.dropEffect = "move";
  };

  const handleCategoryDragLeave = (e, index) => {
    if (dragOverCategoryIndex === index) {
      setDragOverCategoryIndex(null);
    }
  };

  const handleCategoryDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedCategoryIndex === null || draggedCategoryIndex === targetIndex) return;

    const newRows = [...categoryRows];
    const draggedItem = newRows.splice(draggedCategoryIndex, 1)[0];
    newRows.splice(targetIndex, 0, draggedItem);
    
    // Optimistic UI update
    setAddedCategories(newRows);
    setDraggedCategoryIndex(null);
    setDragOverCategoryIndex(null);

    try {
      const categoryIds = newRows.map(c => c.id).filter(id => typeof id === 'number');
      const response = await fetch("/api/practices/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds }),
      });
      if (!response.ok) throw new Error("Failed to reorder categories");
    } catch (err) {
      console.error("Failed to save category order:", err);
      fetchCategories(); // revert
    }
  };

  const handleSessionDragStart = (e, practiceId, sessionIndex) => {
    e.stopPropagation();
    setDraggedSessionData({ practiceId, sessionIndex });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSessionDragOver = (e, practiceId, sessionIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedSessionData?.practiceId === practiceId) {
      if (draggedSessionData.sessionIndex !== sessionIndex) {
        setDragOverSessionData({ practiceId, sessionIndex });
      }
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleSessionDragLeave = (e, practiceId, sessionIndex) => {
    e.stopPropagation();
    if (dragOverSessionData?.practiceId === practiceId && dragOverSessionData?.sessionIndex === sessionIndex) {
      setDragOverSessionData(null);
    }
  };

  const handleSessionDrop = async (e, practiceId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedSessionData || draggedSessionData.practiceId !== practiceId || draggedSessionData.sessionIndex === targetIndex) {
      return;
    }

    const practice = practiceRows.find(p => p.id === practiceId);
    if (!practice) return;

    const newSessions = [...(practice.sessions || [])];
    const draggedItem = newSessions.splice(draggedSessionData.sessionIndex, 1)[0];
    newSessions.splice(targetIndex, 0, draggedItem);

    setPracticeRows(current => 
      current.map(p => p.id === practiceId ? { ...p, sessions: newSessions } : p)
    );
    setDraggedSessionData(null);
    setDragOverSessionData(null);

    try {
      await fetch(`/api/practices/${practiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...practice, sessions_data: newSessions, sessions: newSessions.length, related_chapters: practice.relatedChapters }),
      });
    } catch (error) {
      console.error("Failed to reorder sessions:", error);
    }
  };

  const handleDeletePractice = (practiceId) => {
    setDeletingPracticeId(practiceId);
    setIsPracticeDeleteModalOpen(true);
  };

  const confirmDeletePractice = async () => {
    if (!deletingPracticeId) return;

    try {
      const response = await fetch(`/api/practices/${deletingPracticeId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete practice");
      }

      await fetchPractices();
      setIsPracticeDeleteModalOpen(false);
      setDeletingPracticeId(null);
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus practice: ${err.message}`);
    }
  };

  const handlePracticeFieldChange = (field) => (event) => {
    setPracticeForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    if (formErrors[field]) {
      setFormErrors((current) => {
        const newErrors = { ...current };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePracticeThumbnailChange = (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      setPracticeForm((current) => ({
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
        // Create canvas to resize image
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Max dimensions
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
        
        // Convert back to base64, with 0.8 quality (JPEG) to save more space
        const resizedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        
        setPracticeForm((current) => ({
          ...current,
          thumbnailName: nextFile.name,
          thumbnailPreview: resizedBase64,
        }));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(nextFile);
  };

  const isEditMode = editingPractice !== null;

  const handlePracticeContinue = async (submitStatus = null) => {
    let errors = {};
    if (practiceStep === 1) {
      ["name", "caption", "category", "durationRange"].forEach(field => {
        if (!practiceForm[field] || practiceForm[field].trim() === "") {
          errors[field] = "This field is required";
        }
      });
    } else if (practiceStep === 2) {
      ["sessionTitle", "sessionType"].forEach(field => {
        if (!practiceForm[field] || practiceForm[field].trim() === "") {
          errors[field] = "This field is required";
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    } else {
      setFormErrors({});
    }

    if (practiceStep < 3 && editingSessionIndex === null && !isAddingSession) {
      setPracticeStep((current) => current + 1);
      return;
    }

    const finalStatus = submitStatus || (isEditMode ? editingPractice.status : "Published");

    setIsSubmitting(true);
    try {
      let finalContentFileName = practiceForm.sessionContentFileName;
      
      // Upload file jika ada file baru yang dipilih
      if (practiceForm.sessionContentFileObj) {
        const formData = new FormData();
        formData.append("file", practiceForm.sessionContentFileObj);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalContentFileName = uploadData.filename;
        } else {
          console.error("Upload failed");
          setIsSubmitting(false);
          alert("Gagal mengunggah file. Pastikan Nginx mengizinkan ukuran file besar.");
          return;
        }
      }

      const existingSession = (isEditMode && editingSessionIndex !== null) 
        ? editingPractice.sessions[editingSessionIndex] 
        : null;

      const sessionPayload = {
        ...(existingSession || {}),
        title: practiceForm.sessionTitle.trim(),
        type: practiceForm.sessionType.trim(),
        contentFileName: finalContentFileName,
        status: finalStatus
      };
      
      let finalSessionsData = [sessionPayload];
      let sessionsCount = 1;

      if (isEditMode && Array.isArray(editingPractice.sessions)) {
        finalSessionsData = [...editingPractice.sessions];
        if (editingSessionIndex !== null) {
          finalSessionsData[editingSessionIndex] = sessionPayload;
        } else if (isAddingSession) {
          finalSessionsData.push(sessionPayload);
        } else {
          // Modifying the first session as fallback if editing whole practice
          if (finalSessionsData.length > 0) {
            finalSessionsData[0] = sessionPayload;
          } else {
            finalSessionsData = [sessionPayload];
          }
        }
        sessionsCount = finalSessionsData.length;
      }

      const newPractice = {
        title: practiceForm.name.trim(),
        goal: "-",
        duration: practiceForm.durationRange.trim(),
        sessions: sessionsCount,
        category: practiceForm.category.trim(),
        caption: practiceForm.caption.trim(),
        thumbnail: practiceForm.thumbnailPreview || practiceForm.thumbnailName || null,
        related_chapters: practiceForm.relatedChapters,
        sessions_data: finalSessionsData,
        status: finalStatus,
      };

      if (isEditMode) {
        await fetch(`/api/practices/${editingPractice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPractice),
        });
      } else {
        await fetch("/api/practices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPractice),
        });
      }
      await fetchPractices();
      const wasAddingSession = isAddingSession;
      closePracticeDrawer();
      if (wasAddingSession) {
        setShowSessionSuccessToast(true);
        setTimeout(() => setShowSessionSuccessToast(false), 5000);
      }
    } catch (error) {
      console.error("Failed to save practice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      if (editingCategoryId) {
        const res = await fetch(`/api/practices/categories/${editingCategoryId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategoryName.trim() })
        });
        if (res.ok) await fetchCategories();
      } else {
        const res = await fetch("/api/practices/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCategoryName.trim() })
        });
        if (res.ok) await fetchCategories();
      }
      setIsAddCategoryModalOpen(false);
      setNewCategoryName("");
      setEditingCategoryId(null);
      setShowCategorySuccessToast(true);
      setTimeout(() => setShowCategorySuccessToast(false), 5000);
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleEditCategory = (category) => {
    if (typeof category.id !== 'number') {
      alert("This category was created automatically and cannot be edited. Please create it manually first.");
      return;
    }
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setIsAddCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    if (typeof category.id !== 'number') {
      alert("This category was created automatically and cannot be deleted.");
      return;
    }
    if (category.totalPractices > 0) {
      alert("Cannot delete a category that is still tagged to practices.");
      return;
    }
    
    setDeletingCategory(category);
    setIsCategoryDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await fetch(`/api/practices/categories/${deletingCategory.id}`, { method: "DELETE" });
      await fetchCategories();
      setIsCategoryDeleteModalOpen(false);
      setDeletingCategory(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const footerLabel =
    activeTab === "practice"
      ? `from ${filteredPracticeRows.length} results`
      : `from ${filteredCategoryRows.length} results`;

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Practice Management</h1>
        <p>Organize the practices and categories in one place</p>
      </header>

      <section className="chapter-page practice-management-page mt-5">
        <div className="practice-tabs">
          <button
            type="button"
            className={`practice-tab${activeTab === "practice" ? " is-active" : ""}`}
            onClick={() => setActiveTab("practice")}
          >
            Practice List
          </button>
          <button
            type="button"
            className={`practice-tab${activeTab === "category" ? " is-active" : ""}`}
            onClick={() => setActiveTab("category")}
          >
            Category List
          </button>
        </div>

        <div className="chapter-toolbar practice-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="chapter-filters practice-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap', flex: 1 }}>
            <label className="chapter-search practice-search" aria-label={activeTab === "practice" ? "Search practice name" : "Search category name"} style={{ width: 'min(100%, 246px)' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder={activeTab === "practice" ? "Search practice name..." : "Search category name..."}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            {activeTab === "practice" && (
              <label className="chapter-select chapter-select-shell practice-select">
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  {categoryOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </label>
            )}

            {activeTab === "practice" && (
              <label className="chapter-select chapter-select-shell practice-select">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Drafted</option>
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </label>
            )}
          </div>

          {activeTab === "practice" ? (
            <button type="button" className="master-add-btn" onClick={handleAddPractice}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Practice
            </button>
          ) : (
            <button type="button" className="master-add-btn" onClick={() => { setEditingCategoryId(null); setNewCategoryName(""); setIsAddCategoryModalOpen(true); }}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Category
            </button>
          )}
        </div>

        {activeTab === "practice" ? (
          <div className="chapter-table-card practice-table-card">
            <div className="practice-table-head">
              <span>No.</span>
              <span className="chapter-sortable">Practice Name <i aria-hidden="true"></i></span>
              <span className="chapter-sortable">Category <i aria-hidden="true"></i></span>
              <span className="chapter-sortable">Status <i aria-hidden="true"></i></span>
              <span style={{ textAlign: "right", paddingRight: "8px" }}>Action</span>
            </div>

            {filteredPracticeRows.map((practice, index) => {
              const isDragAndDropEnabled = searchQuery === "" && categoryFilter === "All Category" && statusFilter === "All Status";
              const actualIndex = isDragAndDropEnabled ? index : null;
              
              return (
              <React.Fragment key={practice.id}>
                <article 
                  className={`practice-row ${draggedPracticeIndex === actualIndex ? 'dragging' : ''}`}
                  draggable={isDragAndDropEnabled}
                  onDragStart={(e) => isDragAndDropEnabled && handlePracticeDragStart(e, actualIndex)}
                  onDragOver={(e) => isDragAndDropEnabled && handlePracticeDragOver(e, actualIndex)}
                  onDragLeave={(e) => isDragAndDropEnabled && handlePracticeDragLeave(e, actualIndex)}
                  onDrop={(e) => isDragAndDropEnabled && handlePracticeDrop(e, actualIndex)}
                  style={{ 
                    opacity: draggedPracticeIndex === actualIndex ? 0.5 : 1,
                    borderTop: dragOverPracticeIndex === actualIndex && actualIndex < draggedPracticeIndex ? '3px solid #795289' : undefined,
                    borderBottom: dragOverPracticeIndex === actualIndex && actualIndex > draggedPracticeIndex ? '3px solid #795289' : undefined,
                    transition: 'border 0.2s ease-in-out'
                  }}
                >
                  <div className="chapter-order-cell">
                    <button type="button" className="chapter-drag-btn" aria-label={`Move ${practice.title}`} style={{ cursor: isDragAndDropEnabled ? 'grab' : 'not-allowed', pointerEvents: isDragAndDropEnabled ? 'auto' : 'none' }}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="7" r="1.5" />
                        <circle cx="16" cy="7" r="1.5" />
                        <circle cx="8" cy="12" r="1.5" />
                        <circle cx="16" cy="12" r="1.5" />
                        <circle cx="8" cy="17" r="1.5" />
                        <circle cx="16" cy="17" r="1.5" />
                      </svg>
                    </button>
                    <span className="chapter-order-number">{practice.id}</span>
                  </div>

                  <div className="practice-main-cell" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img
                      src={(practice.thumbnail && (practice.thumbnail.startsWith('http') || practice.thumbnail.startsWith('data:'))) ? practice.thumbnail : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80"}
                      alt={practice.title}
                      className="chapter-thumb"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80";
                      }}
                    />
                    <div className="chapter-copy">
                      <h3>{practice.title}</h3>
                      <p>
                        {practice.duration} {"\u2022"} {practice.sessionsCount} {practice.sessionsCount === 1 ? 'session' : 'sessions'}
                      </p>
                    </div>
                  </div>

                  <span className="practice-category-text">{practice.category}</span>

                  <div 
                    className={`chapter-status-pill chapter-status-${practice.status.toLowerCase()}`}
                    onClick={() => handleTogglePracticeStatus(practice.id)}
                    style={{ cursor: "pointer" }}
                    title="Click to toggle status"
                  >
                    <i aria-hidden="true" />
                    <span>{practice.status}</span>
                  </div>

                  <div className="chapter-actions">
                    <button
                      type="button"
                      className={`chapter-view-btn${expandedPracticeId === practice.id ? " is-expanded" : ""}`}
                      onClick={() => setExpandedPracticeId(expandedPracticeId === practice.id ? null : practice.id)}
                      style={{ 
                        display: "inline-flex", alignItems: "center", gap: "6px", 
                        padding: "6px 12px", border: "1px solid #E9DFEF", borderRadius: "999px",
                        background: expandedPracticeId === practice.id ? "#FAF5FF" : "transparent",
                        color: "#795289", fontSize: "12px", fontWeight: "500", cursor: "pointer"
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                      View Sessions
                    </button>

                    <button type="button" className="chapter-icon-btn" aria-label={`Edit ${practice.title}`} onClick={() => handleEditPractice(practice)}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>

                    <button type="button" className="chapter-icon-btn" aria-label={`Delete ${practice.title}`} onClick={() => handleDeletePractice(practice.id)}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                      </svg>
                    </button>
                  </div>
                </article>

                {expandedPracticeId === practice.id && (
                  <div className="section-panel">
                    <div className="section-panel-header">
                      <span>Sessions in {practice.title} Practice</span>
                      <button type="button" className="section-add-btn" onClick={() => handleAddSession(practice)}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Session
                      </button>
                    </div>

                    {Array.isArray(practice.sessions) && practice.sessions.map((session, idx) => (
                      <div 
                        key={idx} 
                        className="section-container"
                        draggable={true}
                        onDragStart={(e) => handleSessionDragStart(e, practice.id, idx)}
                        onDragOver={(e) => handleSessionDragOver(e, practice.id, idx)}
                        onDragLeave={(e) => handleSessionDragLeave(e, practice.id, idx)}
                        onDrop={(e) => handleSessionDrop(e, practice.id, idx)}
                        style={{ 
                          marginBottom: "12px", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "12px 16px", 
                          opacity: draggedSessionData?.practiceId === practice.id && draggedSessionData?.sessionIndex === idx ? 0.5 : 1,
                          borderTop: dragOverSessionData?.practiceId === practice.id && dragOverSessionData?.sessionIndex === idx && idx < draggedSessionData?.sessionIndex ? '3px solid #795289' : '1px solid #E5E7EB',
                          borderBottom: dragOverSessionData?.practiceId === practice.id && dragOverSessionData?.sessionIndex === idx && idx > draggedSessionData?.sessionIndex ? '3px solid #795289' : '1px solid #E5E7EB',
                          transition: 'border 0.2s ease-in-out'
                        }}
                      >
                        <div className="section-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", alignItems: "center", gap: "16px" }}>
                          <div className="section-drag" style={{ color: "#A0AEC0", cursor: "grab" }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
                              <circle cx="8" cy="7" r="1.5" />
                              <circle cx="16" cy="7" r="1.5" />
                              <circle cx="8" cy="12" r="1.5" />
                              <circle cx="16" cy="12" r="1.5" />
                              <circle cx="8" cy="17" r="1.5" />
                              <circle cx="16" cy="17" r="1.5" />
                            </svg>
                          </div>
                          
                          <span className="section-title" style={{ fontSize: "14px", fontWeight: "500", color: "#171e2b", textTransform: "none" }}>
                            {session.title}
                          </span>

                          <span 
                            className="section-type-pill" 
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", 
                              borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                              background: session.type === "Video" ? "#FAE8FF" : "#EFF6FF",
                              color: session.type === "Video" ? "#C026D3" : "#3B82F6"
                            }}
                          >
                            {session.type === "Video" ? (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                                <polygon points="10 9 15 12 10 15 10 9" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                              </svg>
                            )}
                            {session.type}
                          </span>

                          <span 
                            className="section-status-pill"
                            onClick={() => handleToggleSessionStatus(practice.id, idx)}
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", 
                              borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                              background: (session.status || "Drafted") === "Published" ? "#E6F9F0" : "#F3F4F6",
                              color: (session.status || "Drafted") === "Published" ? "#2B9367" : "#6B7280",
                              cursor: "pointer"
                            }}
                            title="Click to toggle status"
                          >
                            {(session.status || "Drafted") === "Published" ? (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                              </svg>
                            )}
                            {session.status || "Drafted"}
                          </span>

                          <div className="section-actions" style={{ display: "flex", gap: "8px" }}>
                            <button type="button" className="chapter-icon-btn" aria-label="Edit session" onClick={() => handleEditSession(practice, idx)}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                              </svg>
                            </button>
                            <button type="button" className="chapter-icon-btn" aria-label="Delete session" onClick={() => handleDeleteSessionPrompt(practice, idx)}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
              );
            })}

            {filteredPracticeRows.length === 0 && (
              <div className="chapter-empty-state">
                <p>No practices match the current filter.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="chapter-table-card practice-table-card">
            <div className="practice-category-head">
              <span>No.</span>
              <span className="chapter-sortable">Category Name <i aria-hidden="true"></i></span>
              <span className="chapter-sortable">Amount of tagged <i aria-hidden="true"></i></span>
              <span style={{ textAlign: "right", paddingRight: "8px" }}>Action</span>
            </div>

            {filteredCategoryRows.map((category, index) => (
              <article 
                key={category.id} 
                className="practice-category-row"
                draggable
                onDragStart={(e) => handleCategoryDragStart(e, index)}
                onDragOver={(e) => handleCategoryDragOver(e, index)}
                onDragLeave={(e) => handleCategoryDragLeave(e, index)}
                onDrop={(e) => handleCategoryDrop(e, index)}
                style={{ 
                  opacity: draggedCategoryIndex === index ? 0.5 : 1,
                  borderTop: dragOverCategoryIndex === index && index < draggedCategoryIndex ? '3px solid #795289' : undefined,
                  borderBottom: dragOverCategoryIndex === index && index > draggedCategoryIndex ? '3px solid #795289' : undefined,
                  transition: 'border 0.2s ease-in-out'
                }}
              >
                <div className="chapter-order-cell">
                  <button type="button" className="chapter-drag-btn" aria-label={`Move ${category.name}`} style={{ cursor: 'grab' }}>
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

                <span className="practice-category-name">{category.name}</span>
                <span className="practice-category-total">{category.totalPractices} Practice</span>

                <div className="chapter-actions">
                  <button type="button" className="chapter-icon-btn" aria-label={`Edit ${category.name}`} onClick={() => handleEditCategory(category)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                    </svg>
                  </button>
                  <button type="button" className="chapter-icon-btn" aria-label={`Delete ${category.name}`} onClick={() => handleDeleteCategory(category)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}

            {filteredCategoryRows.length === 0 && (
              <div className="chapter-empty-state">
                <p>No categories match the current filter.</p>
              </div>
            )}
          </div>
        )}

        <div className="practice-footer">
          <div className="practice-footer-left">
            <span>Showing</span>
            <button type="button" className="practice-page-size">
              10
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
            <span>{footerLabel}</span>
          </div>

          <div className="practice-pagination">
            <span className="practice-page-indicator">1 of 1 pages</span>
            <button type="button" className="practice-page-btn" aria-label="Previous page">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button type="button" className="practice-page-btn" aria-label="Next page">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {isDrawerOpen && (
        <div className="chapter-drawer-overlay" onClick={closePracticeDrawer}>
          <aside className="chapter-drawer practice-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="chapter-drawer-header">
              <div>
                <h2>{isAddingSession ? "Add Session" : isEditMode ? "Edit Practice" : "Add Practice"}</h2>
                <p>{isAddingSession ? `Practice - ${editingPractice?.title}` : isEditMode ? "Update practice and section details" : "Step through to set up practice and first session"}</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close add practice form" onClick={closePracticeDrawer}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {(!isAddingSession && editingSessionIndex === null && practiceStep === 1) && (
              <div className="chapter-stepper">
                {practiceStepItems.map((step) => {
                  const isActive = practiceStep === step.id;
                  const isComplete = practiceStep > step.id;

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
            )}

            <div className="chapter-drawer-body">
              {practiceStep === 1 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Practice name *</span>
                    <input
                      type="text"
                      placeholder="Enter practice name"
                      value={practiceForm.name}
                      onChange={handlePracticeFieldChange("name")}
                      style={formErrors.name ? { borderColor: '#E53E3E' } : {}}
                    />
                    {formErrors.name && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{formErrors.name}</span>}
                  </div>

                  <div className="chapter-field">
                    <span>Practice Caption *</span>
                    <input
                      type="text"
                      placeholder="Enter practice caption or short explanation"
                      value={practiceForm.caption}
                      onChange={handlePracticeFieldChange("caption")}
                      style={formErrors.caption ? { borderColor: '#E53E3E' } : {}}
                    />
                    {formErrors.caption && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{formErrors.caption}</span>}
                  </div>

                  <div className="chapter-field">
                    <span>Category *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select" style={formErrors.category ? { borderColor: '#E53E3E' } : {}}>
                      <select value={practiceForm.category} onChange={handlePracticeFieldChange("category")}>
                        <option value="">Select category</option>
                        {categoryOptions
                          .filter((option) => option !== "All Category")
                          .map((option) => (
                            <option key={option}>{option}</option>
                          ))}
                        <option>Grounding</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                    {formErrors.category && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.category}</span>}
                  </div>

                  <div className="chapter-field">
                    <span>Duration Range *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select" style={formErrors.durationRange ? { borderColor: '#E53E3E' } : {}}>
                      <select value={practiceForm.durationRange} onChange={handlePracticeFieldChange("durationRange")}>
                        <option value="">Select duration range</option>
                        <option>5-10 mins</option>
                        <option>5-20 mins</option>
                        <option>10-20 mins</option>
                        <option>15-30 mins</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                    {formErrors.durationRange && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.durationRange}</span>}
                  </div>

                  <div className="chapter-field" style={{ position: 'relative' }}>
                    <span>Related Chapters</span>
                    <div 
                      className="chapter-select chapter-select-shell chapter-step-select"
                      onClick={() => setIsRelatedChapterOpen(!isRelatedChapterOpen)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <span style={{ color: practiceForm.relatedChapters.length > 0 ? '#151c29' : '#8d95a4' }}>
                        {practiceForm.relatedChapters.length === 0 ? "Select related chapters" : 
                         practiceForm.relatedChapters.length === 1 ? chapters.find(c => c.id === practiceForm.relatedChapters[0])?.title || "1 Chapter Selected" : 
                         `${practiceForm.relatedChapters.length} Chapters Selected`}
                      </span>
                      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: isRelatedChapterOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </div>

                    {isRelatedChapterOpen && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', zIndex: 50, padding: '8px 0',
                        maxHeight: '200px', overflowY: 'auto'
                      }}>
                        {chapters.map(ch => (
                          <label key={ch.id} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                            cursor: 'pointer', transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F7FAFC'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <input 
                              type="checkbox" 
                              checked={practiceForm.relatedChapters.includes(ch.id)}
                              onChange={(e) => {
                                const currentRelated = practiceForm.relatedChapters;
                                if (e.target.checked) {
                                  setPracticeForm({...practiceForm, relatedChapters: [...currentRelated, ch.id]});
                                } else {
                                  setPracticeForm({...practiceForm, relatedChapters: currentRelated.filter(id => id !== ch.id)});
                                }
                              }}
                              style={{ width: '16px', height: '16px', accentColor: '#795289', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', color: '#4A5568' }}>{ch.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="chapter-field">
                    <span>Practice Thumbnail *</span>
                    {practiceForm.thumbnailName ? (
                      <div className="chapter-thumbnail-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F7FAFC' }}>
                        <div className="chapter-thumbnail-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="thumb-img-placeholder" style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#CBD5E0', overflow: 'hidden' }}>
                            <img src={(practiceForm.thumbnailPreview && (practiceForm.thumbnailPreview.startsWith('http') || practiceForm.thumbnailPreview.startsWith('data:'))) ? practiceForm.thumbnailPreview : "/placeholder-thumb.jpg"} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                          </div>
                          <div className="thumb-details" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="file-name" style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{practiceForm.thumbnailName}</span>
                            <span className="file-size" style={{ fontSize: '12px', color: '#718096' }}>59.7 KB</span>
                          </div>
                        </div>
                        <button type="button" className="thumb-delete-btn" onClick={() => setPracticeForm(f => ({ ...f, thumbnailName: "" }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <label className="chapter-upload-box">
                        <input type="file" accept=".png,.jpg,.jpeg" onChange={handlePracticeThumbnailChange} />
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

              {practiceStep === 2 && (
                <div className="chapter-form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="chapter-field">
                    <span>Session Name <span style={{ color: '#E53E3E' }}>*</span></span>
                    <input
                      type="text"
                      placeholder="Enter session name"
                      value={practiceForm.sessionTitle}
                      onChange={handlePracticeFieldChange("sessionTitle")}
                      style={formErrors.sessionTitle ? { borderColor: '#E53E3E' } : {}}
                    />
                    {formErrors.sessionTitle && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{formErrors.sessionTitle}</span>}
                  </div>

                  <div className="chapter-field">
                    <span>Content Type <span style={{ color: '#E53E3E' }}>*</span></span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeForm(f => ({ ...f, sessionType: "Video" }));
                          if (formErrors.sessionType) {
                            setFormErrors(current => {
                              const newErrors = { ...current };
                              delete newErrors.sessionType;
                              return newErrors;
                            });
                          }
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '12px', padding: '24px', borderRadius: '12px', cursor: 'pointer',
                          border: practiceForm.sessionType === "Video" ? '2px solid #795289' : (formErrors.sessionType ? '1px solid #E53E3E' : '1px solid #E2E8F0'),
                          background: practiceForm.sessionType === "Video" ? '#FAF5FF' : '#FFF',
                          color: practiceForm.sessionType === "Video" ? '#795289' : '#4A5568',
                          transition: 'all 0.2s'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <polygon points="10 9 10 15 15 12" />
                        </svg>
                        <span style={{ fontWeight: '500', fontSize: '15px' }}>Video</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeForm(f => ({ ...f, sessionType: "Audio" }));
                          if (formErrors.sessionType) {
                            setFormErrors(current => {
                              const newErrors = { ...current };
                              delete newErrors.sessionType;
                              return newErrors;
                            });
                          }
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '12px', padding: '24px', borderRadius: '12px', cursor: 'pointer',
                          border: practiceForm.sessionType === "Audio" ? '2px solid #795289' : (formErrors.sessionType ? '1px solid #E53E3E' : '1px solid #E2E8F0'),
                          background: practiceForm.sessionType === "Audio" ? '#FAF5FF' : '#FFF',
                          color: practiceForm.sessionType === "Audio" ? '#795289' : '#4A5568',
                          transition: 'all 0.2s'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v20M8 8v8M16 8v8M4 11v2M20 11v2" />
                        </svg>
                        <span style={{ fontWeight: '500', fontSize: '15px' }}>Audio</span>
                      </button>
                    </div>
                    {formErrors.sessionType && <span style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px', display: 'block' }}>{formErrors.sessionType}</span>}
                  </div>

                  <div className="chapter-field">
                    <span>Upload File <span style={{ color: '#E53E3E' }}>*</span></span>
                    {practiceForm.sessionContentFileName ? (
                      <div className="chapter-thumbnail-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#F7FAFC' }}>
                        <div className="chapter-thumbnail-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="thumb-img-placeholder" style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#CBD5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                          </div>
                          <div className="thumb-details" style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="file-name" style={{ fontSize: '14px', fontWeight: '500', color: '#2D3748' }}>{practiceForm.sessionContentFileName}</span>
                            <span className="file-size" style={{ fontSize: '12px', color: '#718096' }}>
                              {practiceForm.sessionContentFileObj ? (practiceForm.sessionContentFileObj.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Uploaded File'}
                            </span>
                          </div>
                        </div>
                        <button type="button" className="thumb-delete-btn" onClick={() => setPracticeForm(f => ({ ...f, sessionContentFileName: "" }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E53E3E' }}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                        </button>
                      </div>
                    ) : (
                      <label className="chapter-upload-box" style={{ borderStyle: 'dashed' }}>
                        <input type="file" accept={practiceForm.sessionType === "Video" ? "video/mp4,video/quicktime,video/*,.mp4,.mov" : "audio/mpeg,audio/wav,audio/*,.mp3,.wav"} onClick={(e) => (e.target.value = null)} onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPracticeForm(f => ({ 
                              ...f, 
                              sessionContentFileName: e.target.files[0].name,
                              sessionContentFileObj: e.target.files[0]
                            }));
                          }
                        }} />
                        <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: '32px', height: '32px', marginBottom: '8px' }}>
                          <path d="M15 10l-3-3m0 0l-3 3m3-3v8M3 16v2a2 2 0 002 2h14a2 2 0 002-2v-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <strong>Drag & Drop or <span style={{ color: '#3182CE' }}>Choose File</span> to Upload</strong>
                        <span style={{ color: '#718096' }}>
                          Supported file: {practiceForm.sessionType === "Video" ? "MP4, MOV" : "MP3, WAV"} &nbsp;&nbsp;&nbsp;&nbsp; Max. size: 500 MB
                        </span>
                      </label>
                    )}
                  </div>
                  
                  {(!isAddingSession && editingSessionIndex === null) && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
                      background: '#FEFCBF', borderRadius: '8px', border: '1px solid #F6E05E'
                    }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#D69E2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      <span style={{ fontSize: '14px', color: '#B7791F' }}>
                        You can add more sessions once you finish adding the chapter.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {practiceStep === 3 && (
                <div className="chapter-review-card">
                  <div className="chapter-review-block">
                    <span>Practice Name</span>
                    <strong>{practiceForm.name || "-"}</strong>
                  </div>
                  <div className="chapter-review-block">
                    <span>Caption</span>
                    <p>{practiceForm.caption || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>Category &amp; Goal</span>
                    <strong>
                      {practiceForm.category || "-"} {"\u2022"} {practiceForm.goalType || "-"}
                    </strong>
                    <p>{practiceForm.durationRange || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>First Session</span>
                    <strong>{practiceForm.sessionTitle || "-"}</strong>
                    <p style={{ marginBottom: "12px" }}>{practiceForm.sessionType} - {practiceForm.sessionContentFileName || "No file uploaded"}</p>
                    {(() => {
                      const mediaSrc = practiceForm.sessionContentFileObj
                        ? URL.createObjectURL(practiceForm.sessionContentFileObj)
                        : practiceForm.sessionContentFileName?.startsWith('http')
                          ? practiceForm.sessionContentFileName
                          : practiceForm.sessionContentFileName
                            ? `/uploads/${practiceForm.sessionContentFileName}`
                            : null;

                      if (!mediaSrc) return null;

                      return practiceForm.sessionType === "Video" ? (
                        <video 
                          controls 
                          src={mediaSrc} 
                          style={{ width: '100%', maxHeight: '240px', borderRadius: '8px', background: '#000', marginTop: '8px' }} 
                        />
                      ) : practiceForm.sessionType === "Audio" ? (
                        <audio 
                          controls 
                          src={mediaSrc} 
                          style={{ width: '100%', marginTop: '8px' }} 
                        />
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>

            <div className="chapter-drawer-footer">
              <button
                type="button"
                className="chapter-secondary-btn"
                onClick={() => {
                  if (practiceStep === 1 || ((isAddingSession || editingSessionIndex !== null) && practiceStep === 2)) {
                    closePracticeDrawer();
                    return;
                  }

                  setPracticeStep((current) => current - 1);
                }}
              >
                {practiceStep === 1 || ((isAddingSession || editingSessionIndex !== null) && practiceStep === 2) ? "Cancel" : "Back"}
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                {(practiceStep === 3 || editingSessionIndex !== null || isAddingSession) && (
                  <button type="button" onClick={() => handlePracticeContinue("Drafted")} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF', border: '1px solid #EAE6F0', color: '#795289', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                    Save as Draft
                  </button>
                )}

                <button type="button" onClick={() => handlePracticeContinue("Published")} disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#795289', border: 'none', color: '#FFF', padding: '10px 24px', borderRadius: '100px', fontWeight: '500', cursor: 'pointer' }}>
                  {(practiceStep === 3 || editingSessionIndex !== null || isAddingSession) ? "Publish Now" : "Continue"}
                  {!(practiceStep === 3 || editingSessionIndex !== null || isAddingSession) && (
                    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14m-5-5 5 5-5 5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {isAddCategoryModalOpen && (
        <div className="chapter-drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddCategoryModalOpen(false)}>
          <div style={{ background: '#FFF', borderRadius: '12px', padding: '24px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1A202C' }}>{editingCategoryId ? 'Edit Category' : 'Add Category'}</h3>
              <button type="button" onClick={() => setIsAddCategoryModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0AEC0', padding: 0 }}>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#4A5568', fontWeight: '500' }}>Category Name <span style={{ color: '#E53E3E' }}>*</span></label>
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none', fontSize: '14px', color: '#1A202C' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(false)}
                style={{ flex: 1, padding: '10px 0', border: '1px solid #E2E8F0', background: '#FFF', borderRadius: '100px', color: '#4A5568', fontWeight: '500', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                disabled={!newCategoryName.trim()}
                style={{ flex: 1, padding: '10px 0', border: 'none', background: newCategoryName.trim() ? '#795289' : '#E2E8F0', borderRadius: '100px', color: newCategoryName.trim() ? '#FFF' : '#A0AEC0', fontWeight: '500', cursor: newCategoryName.trim() ? 'pointer' : 'not-allowed' }}
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategorySuccessToast && (
        <div style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          width: '340px',
          background: '#161d29',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          gap: '12px',
          border: '1px solid #222a40',
          animation: 'slideInDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#10B981">
              <circle cx="12" cy="12" r="12" />
              <path d="M17 8l-7 8-3-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <strong style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>New Category Added</strong>
              <button type="button" onClick={() => setShowCategorySuccessToast(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }} aria-label="Close">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0', lineHeight: '1.4' }}>You have successfully added a new Category</p>
          </div>
          <style>{`
            @keyframes slideInDown {
              from { transform: translateY(-100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {showSessionSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '32px',
          right: '32px',
          width: '340px',
          background: '#161d29',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex',
          gap: '12px',
          border: '1px solid #222a40',
          animation: 'slideInDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ flexShrink: 0, marginTop: '2px' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="#10B981">
              <circle cx="12" cy="12" r="12" />
              <path d="M17 8l-7 8-3-3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <strong style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>New Session Added</strong>
              <button type="button" onClick={() => setShowSessionSuccessToast(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }} aria-label="Close">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0', lineHeight: '1.4' }}>You have successfully added a new Session</p>
          </div>
        </div>
      )}

      {isSessionDeleteModalOpen && (
        <div className="chapter-delete-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsSessionDeleteModalOpen(false)}>
          <div className="chapter-delete-modal-content" style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#DC2626" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Are you sure you want to delete this session?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              You are about to permanently delete this item.<br />All associated content and data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setIsSessionDeleteModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#FFF', color: '#4B5563', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                No, Keep It
              </button>
              <button type="button" onClick={confirmDeleteSession} style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#DC2626', color: '#FFF', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isPracticeDeleteModalOpen && (
        <div className="chapter-delete-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsPracticeDeleteModalOpen(false)}>
          <div className="chapter-delete-modal-content" style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#DC2626" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Are you sure you want to delete this practice?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              You are about to permanently delete this item.<br />All associated content and data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setIsPracticeDeleteModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#FFF', color: '#4B5563', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                No, Keep It
              </button>
              <button type="button" onClick={confirmDeletePractice} style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#DC2626', color: '#FFF', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isCategoryDeleteModalOpen && (
        <div className="chapter-delete-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsCategoryDeleteModalOpen(false)}>
          <div className="chapter-delete-modal-content" style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#DC2626" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Are you sure you want to delete {deletingCategory?.name}?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              You are about to permanently delete this category.<br />This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setIsCategoryDeleteModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#FFF', color: '#4B5563', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteCategory} style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#DC2626', color: '#FFF', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PracticeManagementPage;