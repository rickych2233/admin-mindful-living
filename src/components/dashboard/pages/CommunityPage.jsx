import React, { useState } from "react";
import "./community.css";

const MOCK_DISCUSSIONS = [
  {
    id: 1,
    name: "Marie Laura",
    date: "21 Feb 2026",
    avatar: "https://i.pravatar.cc/150?u=marie",
    message: "How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I kee...",
    resonated: "83.571",
    category: "Personal Reflection",
    categoryColor: "green",
  },
  {
    id: 2,
    name: "Marcus Chen",
    date: "21 Feb 2026",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    message: "Has anyone tried the 4-7-8 breathing technique before bed? I've been struggling wit...",
    resonated: "283.571",
    category: "Question",
    categoryColor: "yellow",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    date: "21 Feb 2026",
    avatar: "https://i.pravatar.cc/150?u=elena",
    message: "I realized today how often I eat while looking at my phone. Taking 10 minutes to just...",
    resonated: "328.733",
    category: "Awareness",
    categoryColor: "yellow",
  },
  {
    id: 4,
    name: "David Kim",
    date: "21 Feb 2026",
    avatar: "https://i.pravatar.cc/150?u=david",
    message: "Feeling a bit overwhelmed with deadlines. Taking a 5-minute 'micro-break' to focus o...",
    resonated: "121.024",
    category: "Scientific Evidence",
    categoryColor: "pink",
  },
  {
    id: 5,
    name: "Sophie Turner",
    date: "21 Feb 2026",
    avatar: "https://i.pravatar.cc/150?u=sophie",
    message: "It definitely helps! Pro tip: make sure your tongue is resting against the ridge of tissu...",
    resonated: "35.093",
    category: "Key Concept",
    categoryColor: "red",
  }
];

const MOCK_REPLIES = [
  {
    id: 101,
    name: "Andi Kurniawan",
    avatar: "https://i.pravatar.cc/150?u=andi",
    message: "How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I keep getting pulled back into reactive thinking. Has anyone found a practical method that works alongside the audio sessions?",
    date: "21 Feb 2026 • 09:05",
    reported: null
  },
  {
    id: 102,
    name: "Ronald Richards",
    avatar: "https://i.pravatar.cc/150?u=ronald",
    message: 'You clearly haven\'t understood anything if you believe that. People like you don\'t belong here."',
    date: "21 Feb 2026 • 09:14",
    reported: "Harassment"
  },
  {
    id: 103,
    name: "Sofia Bauer",
    avatar: "https://i.pravatar.cc/150?u=sofia",
    message: "Section B of Chapter 3 really helped me — listening in audio mode during my commute made it feel more embodied. The voice pacing in German was perfect.",
    date: "21 Feb 2026 • 09:05",
    reported: null
  }
];

const MOCK_REPORTED = [
  {
    id: 1,
    discussion: "You clearly haven't understood anything if you beli...",
    date: "21 Feb 2026 • 09:14",
    reason: "Harassment & Harmful Behavior",
    reportedUser: { name: "Marie Laura", avatar: "https://i.pravatar.cc/150?u=marie" },
    reportedBy: { name: "Arlene McCoy", avatar: "https://i.pravatar.cc/150?u=arlene" }
  },
  {
    id: 2,
    discussion: "Check out my meditation app - link in bio! 100% f...",
    date: "21 Feb 2026 • 09:14",
    reason: "Irrelevant to topic",
    reportedUser: { name: "Andi Kim", avatar: "https://i.pravatar.cc/150?u=andi" },
    reportedBy: { name: "David Lade", avatar: "https://i.pravatar.cc/150?u=david" }
  },
  {
    id: 3,
    discussion: "If you think that's true, you need to re-evaluate you...",
    date: "21 Feb 2026 • 09:14",
    reason: "Other : The way this person write the o...",
    reportedUser: { name: "Andi Kim", avatar: "https://i.pravatar.cc/150?u=andi" },
    reportedBy: { name: "Floyd Miles", avatar: "https://i.pravatar.cc/150?u=floyd" }
  }
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Awareness", color: "yellow", count: 2 },
  { id: 2, name: "Key Concept", color: "purple", count: 1 },
  { id: 3, name: "Personal Reflection", color: "green", count: 2 },
  { id: 4, name: "Scientific Evidence", color: "pink", count: 2 },
  { id: 5, name: "Question", color: "yellow", count: 2 },
  { id: 6, name: "Mindful Eating", color: "red", count: 0 }
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );
}

function BanIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
  );
}

function CheckSmallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function ResonateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12a10 10 0 1 0 19 0 10 10 0 1 0-19 0z"/>
      <path d="M12 8l3 4-3 4-3-4 3-4z"/>
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m8 10 4-4 4 4" />
      <path d="m16 14-4 4-4-4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function CheckCircleFilledIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="#10B981" stroke="#10B981">
      <circle cx="12" cy="12" r="10" fill="#10B981"></circle>
      <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState("Discussion List");
  const [searchQuery, setSearchQuery] = useState("");
  const [discussions, setDiscussions] = useState([]);

  React.useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/community/discussions");
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map(d => ({
          ...d,
          categoryColor: d.category_color
        }));
        setDiscussions(normalized);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const [reportReasonFilter, setReportReasonFilter] = useState("All Reason");
  const [isReportReasonOpen, setIsReportReasonOpen] = useState(false);

  const [viewingDiscussion, setViewingDiscussion] = useState(null);
  const [toast, setToast] = useState(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("");

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Community</h1>
        <p>Moderation &amp; Discussion Management</p>
      </header>

      <section className="chapter-page community-page">
        
        <div className="community-kpis">
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Pending Reports</h3>
            <div className="kpi-value">
              <strong>7 pending</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-red">+ 5 reports</span>
              <span className="kpi-vs">vs last week</span>
            </div>
          </div>
          
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Total Discussions</h3>
            <div className="kpi-value">
              <strong>1204</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-green">+ 5 discussion</span>
              <span className="kpi-vs">vs last week</span>
            </div>
          </div>
          
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Hidden Message</h3>
            <div className="kpi-value">
              <strong>23</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-green">+ 2</span>
              <span className="kpi-vs">vs last month</span>
            </div>
          </div>
        </div>

        <div className="resources-tabs community-tabs">
          <button 
            type="button" 
            className={`resources-tab${activeTab === "Discussion List" ? " is-active" : ""}`}
            onClick={() => setActiveTab("Discussion List")}
          >
            Discussion List
          </button>
          <button 
            type="button" 
            className={`resources-tab${activeTab === "Reported List" ? " is-active" : ""}`}
            onClick={() => setActiveTab("Reported List")}
          >
            Reported List
          </button>
          <button 
            type="button" 
            className={`resources-tab${activeTab === "Category List" ? " is-active" : ""}`}
            onClick={() => setActiveTab("Category List")}
          >
            Category List
          </button>
        </div>

        <div className="resources-toolbar">
          {activeTab !== "Category List" && (
            <div className="chapter-filters resources-filters">
              <label className="chapter-search resources-search" aria-label="Search discussion">
                <SearchIcon />
                <input
                  type="search"
                  placeholder="Search discussion..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>

              {activeTab === "Discussion List" ? (
                <div className="chapter-select chapter-select-shell resources-filter-select community-custom-select">
                  <button 
                    type="button" 
                    className="community-select-btn" 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {categoryFilter} <ChevronDownIcon />
                  </button>
                  
                  {isCategoryOpen && (
                    <div className="community-select-dropdown">
                      {["All Category", "Personal Reflection", "Awareness", "Key Concept", "Scientific Evidence", "Questions"].map(option => (
                        <button 
                          key={option}
                          type="button"
                          className="community-select-option"
                          onClick={() => {
                            setCategoryFilter(option);
                            setIsCategoryOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="chapter-select chapter-select-shell resources-filter-select community-custom-select">
                  <button 
                    type="button" 
                    className="community-select-btn" 
                    onClick={() => setIsReportReasonOpen(!isReportReasonOpen)}
                  >
                    {reportReasonFilter} <ChevronDownIcon />
                  </button>
                  
                  {isReportReasonOpen && (
                    <div className="community-select-dropdown">
                      {["All Reason", "Spam or Misleading", "Inappropriate Content", "Harassment or Harmful Behavior", "Irrelevant to topic", "Other"].map(option => (
                        <button 
                          key={option}
                          type="button"
                          className="community-select-option"
                          onClick={() => {
                            setReportReasonFilter(option);
                            setIsReportReasonOpen(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "Category List" && (
            <div className="community-category-toolbar">
              <label className="chapter-search resources-search" aria-label="Search discussion">
                <SearchIcon />
                <input
                  type="search"
                  placeholder="Search discussion..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              
              <button 
                type="button" 
                className="community-add-category-btn" 
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategoryName("");
                  setNewCategoryColor("");
                  setIsCategoryModalOpen(true);
                }}
              >
                + Add Category
              </button>
            </div>
          )}
        </div>

        {activeTab === "Discussion List" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head">
              <span className="sortable-head">
                Discussion
                <SortIcon />
              </span>
              <span className="sortable-head">
                Resonated Amount
                <SortIcon />
              </span>
              <span className="sortable-head">
                Category
                <SortIcon />
              </span>
              <span>Action</span>
            </div>

            {discussions.map((discussion) => (
              <article key={discussion.id} className="community-row">
                <div className="community-discussion-cell">
                  <img src={discussion.avatar} alt={discussion.name} className="community-avatar" />
                  <div className="community-discussion-copy">
                    <h3>{discussion.message}</h3>
                    <p>{discussion.name} &bull; {discussion.date}</p>
                  </div>
                </div>

                <div className="community-resonated">
                  <ResonateIcon />
                  <span>{discussion.resonated}</span>
                </div>

                <span className={`community-category-pill color-${discussion.categoryColor}`}>
                  {discussion.category}
                </span>

                <div className="community-actions">
                  <button 
                    type="button" 
                    className="community-action-btn"
                    onClick={() => setViewingDiscussion(discussion)}
                  >
                    <EyeIcon /> View
                  </button>
                  <button 
                    type="button" 
                    className="community-action-btn"
                    onClick={() => showToast("Discussion Hidden", "You have successfully hidden a discussion")}
                  >
                    <EyeOffIcon /> Hide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "Reported List" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head community-reported-list-head">
              <span className="sortable-head">Reported Discussion <SortIcon /></span>
              <span className="sortable-head">Reason <SortIcon /></span>
              <span className="sortable-head">Reported User <SortIcon /></span>
              <span className="sortable-head">Reported By <SortIcon /></span>
              <span>Action</span>
            </div>

            {MOCK_REPORTED.map((report) => (
              <article key={report.id} className="community-row community-reported-list-row">
                <div className="community-discussion-copy">
                  <h3>{report.discussion}</h3>
                  <p>{report.date}</p>
                </div>
                
                <span className="reported-reason">{report.reason}</span>
                
                <div className="reported-user-cell">
                  <img src={report.reportedUser.avatar} alt="" />
                  <span>{report.reportedUser.name}</span>
                </div>
                
                <div className="reported-user-cell">
                  <img src={report.reportedBy.avatar} alt="" />
                  <span>{report.reportedBy.name}</span>
                </div>

                <div className="community-actions">
                  <button 
                    type="button" 
                    className="community-action-btn color-gray"
                    onClick={() => showToast("Report Ignored", "The report has been declined without hiding the discussion")}
                  >
                    <EyeIcon /> Ignore
                  </button>
                  <button 
                    type="button" 
                    className="community-action-btn"
                    onClick={() => showToast("Discussion Hidden", "You have successfully hidden a discussion")}
                  >
                    <BanIcon /> Hide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "Category List" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head community-category-list-head">
              <span className="sortable-head">Category Name <SortIcon /></span>
              <span className="sortable-head">Amount of tagged <SortIcon /></span>
              <span>Action</span>
            </div>

            {MOCK_CATEGORIES.map((category) => (
              <article key={category.id} className="community-row community-category-list-row">
                <span className={`community-category-pill color-${category.color}`}>
                  {category.name}
                </span>
                
                <span className="category-amount">{category.count} discussion{category.count !== 1 && 's'}</span>

                <div className="community-actions">
                  <button
                    type="button"
                    className="resources-action-btn"
                    onClick={() => {
                      setEditingCategory(category);
                      setNewCategoryName(category.name);
                      setNewCategoryColor(""); // Usually would map to hex
                      setIsCategoryModalOpen(true);
                    }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="resources-action-btn"
                    onClick={() => setIsDeleteCategoryModalOpen(true)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="practice-footer resources-footer">
          <div className="practice-footer-left">
            <span>Show</span>
            <button type="button" className="practice-page-size">
              10
              <ChevronDownIcon />
            </button>
            <span>from 5 data</span>
          </div>

          <div className="practice-pagination">
            <button type="button" className="practice-page-btn" aria-label="Previous page">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button type="button" className="practice-page-btn is-active">1</button>
            <button type="button" className="practice-page-btn" aria-label="Next page">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {viewingDiscussion && (
          <div className="community-drawer-overlay" onClick={() => setViewingDiscussion(null)}>
            <aside className="community-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="community-drawer-header">
                <h2>Detail Discussion</h2>
                <button type="button" className="drawer-close-btn" onClick={() => setViewingDiscussion(null)}>
                  <XIcon />
                </button>
              </div>
              
              <div className="community-drawer-body">
                <div className="community-post-thread original-thread">
                  <div className="thread-avatar">
                    <img src={viewingDiscussion.avatar} alt={viewingDiscussion.name} />
                  </div>
                  <div className="thread-content">
                    <div className="thread-meta">
                      <strong>{viewingDiscussion.name}</strong>
                      <span className="thread-role">&bull; Original Post</span>
                    </div>
                    <p className="thread-text">
                      How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I keep getting pulled back into reactive thinking. Has anyone found a practical method that works alongside the audio sessions?
                    </p>
                    <div className="thread-footer">
                      <div className="thread-resonated">
                        <ResonateIcon />
                        <span>{viewingDiscussion.resonated} &bull; 21 Feb 2026 &bull; 08:52</span>
                      </div>
                      <div className="thread-actions">
                        <button type="button" className="community-action-btn" onClick={() => showToast("Discussion Hidden", "You have successfully hidden a discussion")}>
                          <EyeOffIcon /> Hide
                        </button>
                        <button type="button" className="community-action-btn" onClick={() => showToast("Discussion Deleted", "You have successfully delete a discussion")}>
                          <TrashIcon /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="community-replies">
                  {MOCK_REPLIES.map((reply) => (
                    <div key={reply.id} className="community-post-thread reply-thread">
                      <div className="thread-avatar">
                        <img src={reply.avatar} alt={reply.name} />
                      </div>
                      <div className="thread-content">
                        <div className="thread-meta">
                          <strong>{reply.name}</strong>
                          {reply.reported && (
                            <span className="thread-reported-pill">
                              <WarningIcon /> Reported: {reply.reported}
                            </span>
                          )}
                        </div>
                        <p className="thread-text">{reply.message}</p>
                        <div className="thread-footer">
                          <div className="thread-date">
                            {reply.date}
                          </div>
                          <div className="thread-actions">
                            <button type="button" className="community-action-btn" onClick={() => showToast("Discussion Hidden", "You have successfully hidden a discussion")}>
                              <EyeOffIcon /> Hide
                            </button>
                            <button type="button" className="community-action-btn" onClick={() => showToast("Discussion Deleted", "You have successfully delete a discussion")}>
                              <TrashIcon /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="community-drawer-footer">
                <button type="button" className="community-drawer-close-solid" onClick={() => setViewingDiscussion(null)}>
                  Close
                </button>
              </div>
            </aside>
          </div>
        )}

        {isCategoryModalOpen && (
          <div className="community-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="community-category-modal" onClick={e => e.stopPropagation()}>
              <div className="community-modal-header">
                <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
                <button type="button" className="drawer-close-btn" onClick={() => setIsCategoryModalOpen(false)}>
                  <XIcon />
                </button>
              </div>
              <div className="community-modal-body">
                <div className="community-field" style={{ marginBottom: 24 }}>
                  <label>Select color</label>
                  <div className="category-color-picker">
                    {["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E", "#10B981", "#0EA5E9", "#3B82F6", "#8B5CF6", "#A855F7", "#D946EF"].map(c => (
                      <button 
                        key={c} 
                        type="button" 
                        className={`color-circle ${newCategoryColor === c ? "is-selected" : ""}`} 
                        style={{ 
                          background: c,
                          ...(newCategoryColor === c ? { boxShadow: `0 0 0 2px #ffffff, 0 0 0 4px ${c}` } : {})
                        }}
                        onClick={() => setNewCategoryColor(c)}
                      >
                        {newCategoryColor === c && <CheckSmallIcon />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="community-field">
                  <label>Category Name <span style={{ color: "#DC2626" }}>*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter category name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <div className="community-modal-footer">
                <button type="button" className="community-modal-cancel" onClick={() => setIsCategoryModalOpen(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="community-modal-save" 
                  disabled={!newCategoryName.trim()}
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    showToast(
                      editingCategory ? "Category Updated" : "New Category Added", 
                      `You have successfully ${editingCategory ? 'updated a' : 'added a new'} category`
                    );
                  }}
                >
                  {editingCategory ? "Save Changes" : "Save Category"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteCategoryModalOpen && (
          <div className="community-modal-overlay" onClick={() => setIsDeleteCategoryModalOpen(false)}>
            <div className="practice-delete-modal" onClick={e => e.stopPropagation()}>
              <div className="practice-delete-icon">
                <WarningIcon />
              </div>
              <h3>Are you sure you want to delete this practice?</h3>
              <p>All content inside this practice will be deleted.</p>
              <div className="practice-delete-actions">
                <button type="button" className="practice-cancel-btn" onClick={() => setIsDeleteCategoryModalOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="practice-confirm-btn" onClick={() => {
                  setIsDeleteCategoryModalOpen(false);
                  showToast("Category Deleted", "You have successfully deleted a category");
                }}>
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="community-dark-toast">
            <div className="dark-toast-icon">
              <CheckCircleFilledIcon />
            </div>
            <div className="dark-toast-content">
              <div className="dark-toast-header">
                <strong>{toast.title}</strong>
                <button type="button" className="dark-toast-close" onClick={() => setToast(null)}>
                  <XIcon />
                </button>
              </div>
              <p>{toast.message}</p>
              <button type="button" className="dark-toast-dismiss" onClick={() => setToast(null)}>
                Dismiss
              </button>
            </div>
          </div>
        )}

      </section>
    </>
  );
}

export default CommunityPage;
