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
  sectionTitle: "",
  sectionDescription: "",
  sectionType: "Text",
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
      const sections = await fetchSectionsByChapter(cId);
      setSectionsMap((p) => ({ ...p, [cId]: sections }));
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
      sectionTitle: "",
      sectionDescription: "",
      sectionType: "Text",
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

    setChapterForm((current) => ({
      ...current,
      thumbnailName: nextFile ? nextFile.name : "",
    }));
  };

  const isEditMode = editingChapter !== null;

  const canContinue =
    chapterStep === 1
      ? chapterForm.title.trim() !== "" && chapterForm.description.trim() !== ""
      : chapterStep === 2
      ? chapterForm.sectionTitle.trim() !== "" && chapterForm.sectionDescription.trim() !== ""
      : true;

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }

    if (isEditMode) {
      // Edit mode: update chapter immediately from step 1
      setIsSubmitting(true);
      setSubmitError("");

      try {
        const apiId = editingChapter.apiId ?? editingChapter.id;
        const chapterData = {
          title: chapterForm.title.trim(),
          description: chapterForm.description.trim(),
          status: editingChapter.status || "Drafted",
        };

        const result = await updateChapter(apiId, chapterData);

        setChapterRows((current) =>
          current.map((c) =>
            c.id === editingChapter.id
              ? {
                  ...c,
                  title: result.chapter?.title || result.title || chapterData.title,
                  summary: result.chapter?.description || result.description || chapterData.description,
                }
              : c
          )
        );
        closeChapterDrawer();
        refetch();
      } catch (err) {
        setSubmitError(err.message || "Gagal mengupdate chapter. Silakan coba lagi.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (chapterStep < 3) {
      setChapterStep((current) => current + 1);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const normalizedTitle = chapterForm.title.trim();
      const chapterData = {
        title: normalizedTitle,
        description: chapterForm.description.trim(),
        status: "Drafted",
        sections: [
          {
            title: chapterForm.sectionTitle.trim(),
            description: chapterForm.sectionDescription.trim(),
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
        status: "Drafted",
      };

      setChapterRows((current) => [...current, newChapter]);
      closeChapterDrawer();
      refetch();
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
    <>
      <header className="dashboard-header chapter-header">
        <h1>Chapter Management</h1>
        <p>Organize the chapters and sections of your book</p>
      </header>

      <section className="chapter-page chapter-management-page">
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

          <button type="button" className="chapter-add-btn" onClick={() => { setEditingChapter(null); setIsDrawerOpen(true); }}>
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
                className={`chapter-status chapter-status-pill chapter-status-${chapter.status.toLowerCase()}`}
                onClick={() => handleToggleStatus(chapter.id)}
                style={{ cursor: "pointer" }}
                title="Click to toggle status"
              >
                <i aria-hidden="true" />
                <span>{chapter.status}</span>
              </div>

              <div className="chapter-actions">
                <button type="button" className={`chapter-view-btn${expandedChapterId === chapter.id ? " is-expanded" : ""}`} onClick={() => handleToggleExpand(chapter)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                  View Sections
                </button>

                <button type="button" className="chapter-icon-btn" aria-label={`Edit ${chapter.title}`} onClick={() => handleEditChapter(chapter)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Delete ${chapter.title}`}
                  onClick={() => handleDeleteChapter(chapter.id)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            </article>

            {expandedChapterId === chapter.id && (() => {
              const cId = chapter.apiId ?? chapter.id;
              const sections = sectionsMap[cId] || [];
              const loading = sectionsLoading[cId];
              return (
                <div className="section-panel">
                  <div className="section-panel-header">
                    <span>Sections in {chapter.title}</span>
                    <button type="button" className="section-add-btn" onClick={() => { setAddSectionFor(cId); setSectionForm({ title: "", description: "", type: "Text" }); }}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                      Add Section
                    </button>
                  </div>

                  {loading && <div className="section-loading">Loading sections...</div>}

                  {!loading && sections.map((sec) => (
                    <div key={sec.id} className="section-row">
                      <div className="section-drag">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="7" r="1.5" /><circle cx="16" cy="7" r="1.5" /><circle cx="8" cy="12" r="1.5" /><circle cx="16" cy="12" r="1.5" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></svg>
                      </div>
                      <span className="section-title">{sec.title}</span>
                      <span className={`section-type-pill section-type-${sec.type.toLowerCase()}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          {sec.type === "Video" ? <path d="M15 10l5-3v10l-5-3M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" /> : <path d="M4 4h16v16H4ZM8 8h8M8 12h6M8 16h4" />}
                        </svg>
                        {sec.type}
                      </span>
                      <span className={`section-status-pill section-status-${sec.status.toLowerCase()}`} onClick={() => handleToggleSectionStatus(chapter, sec.id)} style={{ cursor: "pointer" }} title="Click to toggle status">
                        <i aria-hidden="true" />
                        {sec.status}
                      </span>
                      <div className="section-actions">
                        <button type="button" className="chapter-icon-btn" aria-label="Edit section">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" /></svg>
                        </button>
                        <button type="button" className="chapter-icon-btn" aria-label="Delete section" onClick={() => handleDeleteSection(chapter, sec.id)}>
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" /></svg>
                        </button>
                      </div>
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
                <p>{isEditMode ? "Update chapter title and description" : "Step through to set up chapter and first section"}</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close add chapter form" onClick={closeChapterDrawer}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {!isEditMode && (
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
            )}

            <div className="chapter-drawer-body">
              {chapterStep === 1 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Chapter Title *</span>
                    <input
                      type="text"
                      placeholder="Enter section name"
                      value={chapterForm.title}
                      onChange={handleChapterFieldChange("title")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Short Description *</span>
                    <input
                      type="text"
                      placeholder="Enter chapters brief description or short explanation"
                      value={chapterForm.description}
                      onChange={handleChapterFieldChange("description")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Chapter Thumbnail *</span>
                    <label className="chapter-upload-box">
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handleThumbnailChange} />
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="8" r="2" />
                        <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                      </svg>
                      <strong>{chapterForm.thumbnailName || "Drag & Drop or Choose File to Upload"}</strong>
                      <span>
                        {chapterForm.thumbnailName
                          ? "Supported file: PNG, JPG"
                          : "Supported file: PNG, JPG      Max. size: 2 MB"}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {chapterStep === 2 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Section Title *</span>
                    <input
                      type="text"
                      placeholder="Enter first section title"
                      value={chapterForm.sectionTitle}
                      onChange={handleChapterFieldChange("sectionTitle")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Section Type *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
                      <select value={chapterForm.sectionType} onChange={handleChapterFieldChange("sectionType")}>
                        <option>Text</option>
                        <option>Audio</option>
                        <option>Video</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                  </div>

                  <div className="chapter-field chapter-field-wide">
                    <span>Section Description *</span>
                    <textarea
                      rows="6"
                      placeholder="Describe the first section for this chapter"
                      value={chapterForm.sectionDescription}
                      onChange={handleChapterFieldChange("sectionDescription")}
                    />
                  </div>
                </div>
              )}

              {chapterStep === 3 && (
                <div className="chapter-review-card">
                  <div className="chapter-review-block">
                    <span>Chapter Title</span>
                    <strong>{chapterForm.title || "-"}</strong>
                  </div>
                  <div className="chapter-review-block">
                    <span>Short Description</span>
                    <p>{chapterForm.description || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>First Section</span>
                    <strong>{chapterForm.sectionTitle || "-"}</strong>
                    <p>{chapterForm.sectionDescription || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>Thumbnail</span>
                    <strong>{chapterForm.thumbnailName || "No file selected"}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="chapter-drawer-footer">
              <button
                type="button"
                className="chapter-secondary-btn"
                onClick={() => {
                  if (isEditMode || chapterStep === 1) {
                    closeChapterDrawer();
                    return;
                  }

                  setChapterStep((current) => current - 1);
                }}
              >
                {isEditMode || chapterStep === 1 ? "Cancel" : "Back"}
              </button>

              <button type="button" className="chapter-primary-btn" onClick={handleContinue} disabled={!canContinue || isSubmitting}>
                {isSubmitting ? "Publishing..." : footerButtonLabel}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </button>
            </div>

            {submitError && (
              <p style={{ margin: "10px 20px", color: "#b42318", fontSize: "0.875rem" }}>
                {submitError}
              </p>
            )}
          </aside>
        </div>
      )}
    </>
  );
}