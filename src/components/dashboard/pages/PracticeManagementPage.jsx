import React, { useEffect, useMemo, useState } from "react";

const initialPracticeRows = [
  {
    id: 1,
    title: "Morning Breath Awareness",
    goal: "Focus",
    duration: "5-20 mins",
    sessions: 5,
    category: "Breathwork",
    status: "Published",
  },
  {
    id: 2,
    title: "Deep Diaphragm Reset",
    goal: "Clean mind",
    duration: "10-20 mins",
    sessions: 3,
    category: "Meditation",
    status: "Published",
  },
  {
    id: 3,
    title: "Evening Wind-Down Breath",
    goal: "Sleep",
    duration: "15-30 mins",
    sessions: 2,
    category: "Sleep",
    status: "Drafted",
  },
  {
    id: 4,
    title: "Mindful Moments",
    goal: "Mindfulness",
    duration: "5-20 mins",
    sessions: 5,
    category: "Focus",
    status: "Published",
  },
];

const initialCategories = [
  "Breathwork", "Cardiac Coherence", "Mindfulness", "Focus", "Grounding", "Sleep", "Nervous System Reset", "Energy / Vitality"
];

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
  thumbnailName: "",
  sessionTitle: "",
  sessionType: "Guided Audio",
  sessionDuration: "",
  sessionDescription: "",
};

export function PracticeManagementPage() {
  const [activeTab, setActiveTab] = useState("practice");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [practiceRows, setPracticeRows] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showCategorySuccessToast, setShowCategorySuccessToast] = useState(false);
  const [addedCategories, setAddedCategories] = useState(initialCategories);
  const [expandedPracticeId, setExpandedPracticeId] = useState(null);
  const [practiceStep, setPracticeStep] = useState(1);
  const [practiceForm, setPracticeForm] = useState(initialPracticeForm);

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
  }, []);

  const fetchPractices = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/practices");
      if (response.ok) {
        const data = await response.json();
        setPracticeRows(data);
      }
    } catch (error) {
      console.error("Failed to fetch practices:", error);
    }
  };


  const categoryOptions = useMemo(
    () => ["All Category", ...new Set(practiceRows.map((practice) => practice.category))],
    [practiceRows]
  );

  const filteredPracticeRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return practiceRows.filter((practice) => {
      const matchesQuery =
        normalizedQuery === "" ||
        practice.title.toLowerCase().includes(normalizedQuery) ||
        practice.goal.toLowerCase().includes(normalizedQuery) ||
        practice.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "All Category" || practice.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || practice.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [practiceRows, searchQuery, categoryFilter, statusFilter]);

  const categoryRows = useMemo(() => {
    const buckets = new Map();

    practiceRows.forEach((practice) => {
      const current = buckets.get(practice.category) || {
        id: practice.category,
        name: practice.category,
        totalPractices: 0,
        status: "Drafted",
      };

      current.totalPractices += 1;
      if (practice.status === "Published") {
        current.status = "Published";
      }
      buckets.set(practice.category, current);
    });

    addedCategories.forEach((cat) => {
      if (!buckets.has(cat)) {
        buckets.set(cat, {
          id: cat,
          name: cat,
          totalPractices: 0,
          status: "Drafted",
        });
      }
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
  };

  const handlePracticeFieldChange = (field) => (event) => {
    setPracticeForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handlePracticeThumbnailChange = (event) => {
    const nextFile = event.target.files?.[0];

    setPracticeForm((current) => ({
      ...current,
      thumbnailName: nextFile ? nextFile.name : "",
    }));
  };

  const canContinue =
    practiceStep === 1
      ? ["name", "caption", "category", "durationRange", "goalType"].every(
        (field) => practiceForm[field].trim() !== ""
      )
      : practiceStep === 2
        ? ["sessionTitle", "sessionType", "sessionDuration", "sessionDescription"].every(
          (field) => practiceForm[field].trim() !== ""
        )
        : true;

  const handlePracticeContinue = async () => {
    if (!canContinue) {
      return;
    }

    if (practiceStep < 3) {
      setPracticeStep((current) => current + 1);
      return;
    }

    const newPractice = {
      title: practiceForm.name.trim(),
      goal: practiceForm.goalType.trim(),
      duration: practiceForm.durationRange.trim(),
      sessions: 1,
      category: practiceForm.category.trim(),
      status: "Drafted",
    };

    try {
      await fetch("http://localhost:3001/api/practices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPractice),
      });
      await fetchPractices();
      closePracticeDrawer();
    } catch (error) {
      console.error("Failed to add practice:", error);
    }
  };

  const handleSaveCategory = () => {
    if (!newCategoryName.trim()) return;
    setAddedCategories((prev) => [...prev, newCategoryName.trim()]);
    setIsAddCategoryModalOpen(false);
    setNewCategoryName("");
    setShowCategorySuccessToast(true);
    setTimeout(() => setShowCategorySuccessToast(false), 5000);
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
            <button type="button" className="master-add-btn" onClick={() => setIsDrawerOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Practice
            </button>
          ) : (
            <button type="button" className="master-add-btn" onClick={() => setIsAddCategoryModalOpen(true)}>
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

            {filteredPracticeRows.map((practice) => (
              <React.Fragment key={practice.id}>
                <article className="practice-row">
                  <div className="chapter-order-cell">
                    <button type="button" className="chapter-drag-btn" aria-label={`Move ${practice.title}`}>
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
                      src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80"
                      alt={practice.title}
                      className="chapter-thumb"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div className="chapter-copy">
                      <h3>{practice.title}</h3>
                      <p>
                        {practice.duration} {"\u2022"} {practice.sessions} {practice.sessions === 1 ? 'session' : 'sessions'}
                      </p>
                    </div>
                  </div>

                  <span className="practice-category-text">{practice.category}</span>

                  <div className={`chapter-status-pill chapter-status-${practice.status.toLowerCase()}`}>
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

                    <button type="button" className="chapter-icon-btn color-gray" aria-label={`Edit ${practice.title}`} style={{ padding: "6px", border: "1px solid #E3E7ED", borderRadius: "50%", background: "#FFF", color: "#A0AEC0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>

                    <button type="button" className="chapter-icon-btn color-gray" aria-label={`Delete ${practice.title}`} style={{ padding: "6px", border: "1px solid #E3E7ED", borderRadius: "50%", background: "#FFF", color: "#A0AEC0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                      <button type="button" className="section-add-btn">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Session
                      </button>
                    </div>

                    {(practice.id === 1 ? [
                      { title: "Session 1 - Introduction to Breath", type: "Video", status: "Published" },
                      { title: "Session 2 - 4-7-8 Technique", type: "Video", status: "Published" },
                      { title: "Session 3 - Box Breathwork", type: "Audio", status: "Published" },
                      { title: "Session 4 - Alternate Nostril Video", type: "Video", status: "Drafted" },
                    ] : Array.from({ length: practice.sessions }).map((_, idx) => ({
                      title: `Session ${idx + 1} - ${idx === 0 ? 'Introduction' : 'Deep Dive'}`,
                      type: "Video",
                      status: idx === 0 ? "Published" : "Drafted"
                    }))).map((session, idx) => (
                      <div key={idx} className="section-container" style={{ marginBottom: "12px", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "12px 16px" }}>
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
                          
                          <span className="section-title" style={{ fontSize: "14px", fontWeight: "500", color: "#171e2b" }}>
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
                            style={{ 
                              display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", 
                              borderRadius: "999px", fontSize: "12px", fontWeight: "500",
                              background: session.status === "Published" ? "#E6F9F0" : "#F3F4F6",
                              color: session.status === "Published" ? "#2B9367" : "#6B7280"
                            }}
                          >
                            {session.status === "Published" ? (
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
                            {session.status}
                          </span>

                          <div className="section-actions" style={{ display: "flex", gap: "8px" }}>
                            <button type="button" className="chapter-icon-btn color-gray" aria-label="Edit session" style={{ padding: "6px", border: "1px solid #E3E7ED", borderRadius: "50%", background: "#FFF", color: "#A0AEC0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                              </svg>
                            </button>
                            <button type="button" className="chapter-icon-btn color-gray" aria-label="Delete session" style={{ padding: "6px", border: "1px solid #E3E7ED", borderRadius: "50%", background: "#FFF", color: "#A0AEC0", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            ))}

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
              <article key={category.id} className="practice-category-row">
                <div className="chapter-order-cell">
                  <button type="button" className="chapter-drag-btn" aria-label={`Move ${category.name}`}>
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
                  <button type="button" className="chapter-icon-btn" aria-label={`Edit ${category.name}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                    </svg>
                  </button>
                  <button type="button" className="chapter-icon-btn" aria-label={`Delete ${category.name}`}>
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
                <h2>Add Practice</h2>
                <p>Step through to set up practice and first session</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close add practice form" onClick={closePracticeDrawer}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

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
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Practice Caption *</span>
                    <input
                      type="text"
                      placeholder="Enter practice caption or short explanation"
                      value={practiceForm.caption}
                      onChange={handlePracticeFieldChange("caption")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Category *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
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
                  </div>

                  <div className="chapter-field">
                    <span>Duration Range *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
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
                  </div>

                  <div className="chapter-field">
                    <span>Goal Type *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
                      <select value={practiceForm.goalType} onChange={handlePracticeFieldChange("goalType")}>
                        <option value="">Select goal type</option>
                        <option>Focus</option>
                        <option>Clean mind</option>
                        <option>Sleep</option>
                        <option>Relaxation</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                  </div>

                  <div className="chapter-field">
                    <span>Practice Thumbnail *</span>
                    <label className="chapter-upload-box">
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handlePracticeThumbnailChange} />
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="8" r="2" />
                        <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                      </svg>
                      <strong>{practiceForm.thumbnailName || "Drag & Drop or Choose File to Upload"}</strong>
                      <span>
                        {practiceForm.thumbnailName
                          ? "Supported file: PNG, JPG"
                          : "Supported file: PNG, JPG      Max. size: 2 MB"}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {practiceStep === 2 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Session Title *</span>
                    <input
                      type="text"
                      placeholder="Enter first session title"
                      value={practiceForm.sessionTitle}
                      onChange={handlePracticeFieldChange("sessionTitle")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Session Type *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
                      <select value={practiceForm.sessionType} onChange={handlePracticeFieldChange("sessionType")}>
                        <option>Guided Audio</option>
                        <option>Text</option>
                        <option>Video</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                  </div>

                  <div className="chapter-field">
                    <span>Session Duration *</span>
                    <input
                      type="text"
                      placeholder="e.g. 8 mins"
                      value={practiceForm.sessionDuration}
                      onChange={handlePracticeFieldChange("sessionDuration")}
                    />
                  </div>

                  <div className="chapter-field chapter-field-wide">
                    <span>Session Description *</span>
                    <textarea
                      rows="6"
                      placeholder="Describe the first practice session"
                      value={practiceForm.sessionDescription}
                      onChange={handlePracticeFieldChange("sessionDescription")}
                    />
                  </div>
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
                    <p>{practiceForm.sessionDescription || "-"}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="chapter-drawer-footer">
              <button
                type="button"
                className="chapter-secondary-btn"
                onClick={() => {
                  if (practiceStep === 1) {
                    closePracticeDrawer();
                    return;
                  }

                  setPracticeStep((current) => current - 1);
                }}
              >
                {practiceStep === 1 ? "Cancel" : "Back"}
              </button>

              <button type="button" className="chapter-primary-btn" onClick={handlePracticeContinue} disabled={!canContinue}>
                {practiceStep === 3 ? "Publish" : "Continue"}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </button>
            </div>
          </aside>
        </div>
      )}

      {isAddCategoryModalOpen && (
        <div className="chapter-drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddCategoryModalOpen(false)}>
          <div style={{ background: '#FFF', borderRadius: '12px', padding: '24px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1A202C' }}>Add Category</h3>
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
    </>
  );
}

export default PracticeManagementPage;