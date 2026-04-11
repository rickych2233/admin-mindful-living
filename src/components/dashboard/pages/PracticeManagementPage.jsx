import React, { useEffect, useMemo, useState } from "react";

const initialPracticeRows = [
  {
    id: 1,
    title: "Morning Breath Awareness",
    goal: "Focus",
    duration: "5-20 mins",
    sessions: 5,
    category: "Breathing",
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
  const [practiceRows, setPracticeRows] = useState(initialPracticeRows);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

    return [...buckets.values()];
  }, [practiceRows]);

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

  const handlePracticeContinue = () => {
    if (!canContinue) {
      return;
    }

    if (practiceStep < 3) {
      setPracticeStep((current) => current + 1);
      return;
    }

    setPracticeRows((current) => [
      ...current,
      {
        id: current.length + 1,
        title: practiceForm.name.trim(),
        goal: practiceForm.goalType.trim(),
        duration: practiceForm.durationRange.trim(),
        sessions: 1,
        category: practiceForm.category.trim(),
        status: "Drafted",
      },
    ]);

    closePracticeDrawer();
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

      <section className="chapter-page practice-management-page">
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

        <div className="chapter-toolbar practice-toolbar">
          <div className="chapter-filters practice-filters">
            <label className="chapter-search practice-search" aria-label="Search practice name">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Search practice name..."
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
          </div>

          {activeTab === "practice" && (
            <button type="button" className="chapter-add-btn practice-add-btn" onClick={() => setIsDrawerOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Practice
            </button>
          )}
        </div>

        {activeTab === "practice" ? (
          <div className="chapter-table-card practice-table-card">
            <div className="practice-table-head">
              <span>No</span>
              <span className="sortable-head">
                Practice Name
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Category
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

            {filteredPracticeRows.map((practice) => (
              <article key={practice.id} className="practice-row">
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

                <div className="chapter-main-cell chapter-main-cell-redesign practice-main-cell">
                  <div className="chapter-thumb" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="8" cy="8" r="2" />
                      <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                    </svg>
                  </div>
                  <div className="chapter-copy">
                    <h3>{practice.title}</h3>
                    <p>
                      Goal: {practice.goal} {"\u2022"} {practice.duration} {"\u2022"} {practice.sessions} sessions
                    </p>
                  </div>
                </div>

                <span className="practice-category-text">{practice.category}</span>

                <div className={`chapter-status chapter-status-pill chapter-status-${practice.status.toLowerCase()}`}>
                  <i aria-hidden="true" />
                  <span>{practice.status}</span>
                </div>

                <div className="chapter-actions">
                  <button type="button" className="chapter-view-btn">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    View Sessions
                  </button>

                  <button type="button" className="chapter-icon-btn" aria-label={`Edit ${practice.title}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                    </svg>
                  </button>

                  <button type="button" className="chapter-icon-btn" aria-label={`Delete ${practice.title}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
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
              <span>Category Name</span>
              <span>Total Practice</span>
              <span>Status</span>
            </div>

            {filteredCategoryRows.map((category) => (
              <article key={category.id} className="practice-category-row">
                <span className="practice-category-name">{category.name}</span>
                <span className="practice-category-total">{category.totalPractices}</span>
                <div className={`chapter-status chapter-status-pill chapter-status-${category.status.toLowerCase()}`}>
                  <i aria-hidden="true" />
                  <span>{category.status}</span>
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
    </>
  );
}