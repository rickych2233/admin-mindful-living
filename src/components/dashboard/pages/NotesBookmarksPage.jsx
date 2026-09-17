import React, { useState, useEffect, useMemo } from "react";
import "./notesBookmarks.css";

// SVG Icons (Reusing standard styles)
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
    <path d="M7 15l5 5 5-5" />
    <path d="M7 9l5-5 5 5" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

// Mock Data
const mockNotes = [
  {
    id: 1,
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Marie Laura",
    date: "21 Feb 2026",
    chapter: "Chapter 1",
    section: "Section 2",
    note: "\"This idea resonates with my current work situation. I often resist change because I fear losing stability, but this section helped me see adaptability differently.\"",
    highlightedPassage: "Embracing Change: The Need for Adaptability and Innovation in Today's World",
    categories: [
      { name: "Personal Reflection", color: "green" },
      { name: "Awareness", color: "orange" }
    ]
  },
  {
    id: 2,
    avatar: "https://i.pravatar.cc/150?img=11",
    name: "Marcus Chen",
    date: "21 Feb 2026",
    chapter: "Chapter 5",
    section: "Section 2",
    note: "\"I'm not sure I fully understand the distinction here between active observing and merely observing reality...\"",
    highlightedPassage: "The Power of Mindfulness: Embracing the Present Moment",
    categories: [
      { name: "Question", color: "orange" },
      { name: "Key Concept", color: "purple" }
    ]
  },
  {
    id: 3,
    avatar: "https://i.pravatar.cc/150?img=5",
    name: "Elena Rodriguez",
    date: "21 Feb 2026",
    chapter: "Chapter 3",
    section: "Section 1",
    note: "\"This concept reminds me of a recurring pattern where unconscious decisions emerge from unexamined habits.\"",
    highlightedPassage: "The Power of Mindful Eating: A 10-Minute Transformation",
    categories: [
      { name: "Awareness", color: "orange" },
      { name: "Scientific Evidence", color: "purple" }
    ]
  },
  {
    id: 4,
    avatar: "https://i.pravatar.cc/150?img=8",
    name: "David Kim",
    date: "21 Feb 2026",
    chapter: "Chapter 7",
    section: "Section 1",
    note: "\"The scientific evidence mentioned here aligns with recent neurobiology papers on reflective practices.\"",
    highlightedPassage: "Finding Calm: The Power of Mindful Breathwork Amidst Deadlines",
    categories: [
      { name: "Scientific Evidence", color: "purple" }
    ]
  },
  {
    id: 5,
    avatar: "https://i.pravatar.cc/150?img=9",
    name: "Sophie Turner",
    date: "21 Feb 2026",
    chapter: "Chapter 1",
    section: "Section 4",
    note: "\"I disagree with part of this section. Personal sovereignty begins when external validation ceases to dictate internal worth.\"",
    highlightedPassage: "Maximize Your Breathwork Technique: A Quick Tip",
    categories: [
      { name: "Key Concept", color: "purple" },
      { name: "Scientific Evidence", color: "purple" }
    ]
  }
];

const mockBookmarks = [
  {
    id: 1,
    sentence: "In a world that constantly evolves, cultivating a mindset of adaptability and innovation is essential for personal growth and harmony.",
    chapter: "Chapter 1",
    section: "Section 2",
    date: "21 Feb 2026",
    amount: 125
  },
  {
    id: 2,
    sentence: "Finding peace within chaos is the true essence of mindfulness.",
    chapter: "Chapter 1",
    section: "Section 1",
    date: "21 Feb 2026",
    amount: 524
  },
  {
    id: 3,
    sentence: "Finding tranquility in the chaos of life can be achieved through simple moments of reflection.",
    chapter: "Chapter 2",
    section: "Section 3",
    date: "21 Feb 2026",
    amount: 47
  },
  {
    id: 4,
    sentence: "Finding peace in the chaos of everyday life can transform your perspective.",
    chapter: "Chapter 2",
    section: "Section 2",
    date: "21 Feb 2026",
    amount: 375
  },
  {
    id: 5,
    sentence: "Embracing the present moment can lead to profound insights and a deeper connection with ourselves.",
    chapter: "Chapter 4",
    section: "Section 6",
    date: "21 Feb 2026",
    amount: 65
  }
];

const initialCategories = [
  { id: 1, name: "Awareness", color: "orange", amount: "2 discussions" },
  { id: 2, name: "Key Concept", color: "purple", amount: "1 discussion" },
  { id: 3, name: "Personal Reflection", color: "green", amount: "2 discussions" },
  { id: 4, name: "Scientific Evidence", color: "purple", amount: "2 discussions" },
  { id: 5, name: "Question", color: "orange", amount: "2 discussions" }
];

const colorPalette = [
  "#EF4444", "#F97316", "#EAB308", "#84CC16", "#22C55E", "#10B981", 
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#D946EF", "#EC4899"
];


export default function NotesBookmarksPage() {
  const [activeTab, setActiveTab] = useState("Notes List");
  const [isChapterFilterOpen, setIsChapterFilterOpen] = useState(false);
  const [isCategoryFilterOpen, setIsCategoryFilterOpen] = useState(false);
  const [chapterFilter, setChapterFilter] = useState("All Chapter");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  
  const [viewingNote, setViewingNote] = useState(null);
  const [viewingBookmark, setViewingBookmark] = useState(null);

  const [notesData, setNotesData] = useState([]);
  const [bookmarksData, setBookmarksData] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    return notesData.filter((note) => {
      const matchChapter = chapterFilter === "All Chapter" || note.chapter === chapterFilter;
      const matchCategory = categoryFilter === "All Category" || note.categories?.some((c) => c.name === categoryFilter);
      const matchSearch =
        note.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.highlightedPassage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChapter && matchCategory && matchSearch;
    });
  }, [notesData, chapterFilter, categoryFilter, searchQuery]);

  const filteredBookmarks = useMemo(() => {
    return bookmarksData.filter((bookmark) => {
      const matchChapter = chapterFilter === "All Chapter" || bookmark.chapter === chapterFilter;
      const matchSearch =
        bookmark.sentence?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.chapter?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchChapter && matchSearch;
    });
  }, [bookmarksData, chapterFilter, searchQuery]);

  const filteredCategories = useMemo(() => {
    return categoriesList.filter((cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoriesList, searchQuery]);

  const fetchNotesData = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        // Parse categories JSON string if needed
        const parsed = data.map(d => ({
          ...d,
          categories: typeof d.categories === 'string' ? JSON.parse(d.categories) : d.categories,
          highlightedPassage: d.highlighted_passage
        }));
        setNotesData(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBookmarksData = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        setBookmarksData(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/note-categories");
      if (response.ok) {
        setCategoriesList(await response.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotesData();
    fetchBookmarksData();
    fetchCategories();
  }, []);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);
  const [toastMessage, setToastMessage] = useState("");
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const chapters = ["All Chapter", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5", "Chapter 6", "Chapter 7"];
  const categories = ["All Category", "Personal Reflection", "Awareness", "Key Concept", "Scientific Evidence"];

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Notes & Bookmark</h1>
        <p>Keep track of users' notes & bookmark within the platform.</p>
      </header>

      <section className="chapter-page notes-bookmarks-page mt-5">

        <div className="community-kpis">
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Total Notes (All Time)</h3>
            <div className="kpi-value">
              <strong>1204</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-green">+ 34 notes</span>
              <span className="kpi-vs">vs last week</span>
            </div>
          </div>
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Total Bookmarks (All Time)</h3>
            <div className="kpi-value">
              <strong>1204</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-green">+ 14 bookmarks</span>
              <span className="kpi-vs">vs last week</span>
            </div>
          </div>
          <div className="community-kpi-card kpi-glow-purple">
            <h3>Most Tagged Category (All Time)</h3>
            <div className="kpi-value">
              <strong>Awareness</strong>
            </div>
            <div className="kpi-subtext">
              <span className="kpi-badge kpi-badge-green">52 times</span>
              <span className="kpi-vs">total tagged</span>
            </div>
          </div>
        </div>

        <div className="resources-tabs community-tabs">
          {["Notes List", "Bookmarks List", "Category List"].map(tab => (
            <button 
              key={tab} 
              type="button"
              className={`resources-tab${activeTab === tab ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

      <div className="chapter-content-area">
        {activeTab !== "Category List" ? (
          <div className="resources-toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-start' }}>
            <label className="chapter-search resources-search" aria-label={`Search ${activeTab.toLowerCase()}`} style={{ width: 'min(100%, 300px)', margin: 0 }}>
              <SearchIcon />
              <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%' }} />
            </label>

            <div className="chapter-filters" style={{ display: 'flex', gap: 12 }}>
              <div className="chapter-select chapter-select-shell community-custom-select">
                <button 
                  type="button" 
                  className="community-select-btn" 
                  onClick={() => setIsChapterFilterOpen(!isChapterFilterOpen)}
                >
                  {chapterFilter} <ChevronDownIcon />
                </button>
                
                {isChapterFilterOpen && (
                  <div className="community-select-dropdown">
                    {chapters.map(option => (
                      <button 
                        key={option}
                        type="button"
                        className="community-select-option"
                        onClick={() => {
                          setChapterFilter(option);
                          setIsChapterFilterOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {activeTab === "Notes List" && (
                <div className="chapter-select chapter-select-shell community-custom-select">
                  <button 
                    type="button" 
                    className="community-select-btn" 
                    onClick={() => setIsCategoryFilterOpen(!isCategoryFilterOpen)}
                  >
                    {categoryFilter} <ChevronDownIcon />
                  </button>
                  
                  {isCategoryFilterOpen && (
                    <div className="community-select-dropdown">
                      {categories.map(option => (
                        <button 
                          key={option}
                          type="button"
                          className="community-select-option"
                          onClick={() => {
                            setCategoryFilter(option);
                            setIsCategoryFilterOpen(false);
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
          </div>
        ) : (
          <div className="resources-toolbar">
            <label className="chapter-search resources-search" aria-label="Search category">
              <SearchIcon />
              <input type="text" placeholder="Search category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </label>
            <button className="chapter-primary-btn" onClick={() => {
              setEditingCategory(null);
              setNewCategoryName("");
              setSelectedColor(colorPalette[0]);
              setIsAddCategoryOpen(true);
            }}>
              + Add Category
            </button>
          </div>
        )}

        {activeTab === "Notes List" && (
          <div className="notes-table-card">
            <div className="notes-table-head notes-list-head">
              <span className="sortable-head">User Note <SortIcon /></span>
              <span className="sortable-head">Highlighted Passage <SortIcon /></span>
              <span className="sortable-head">Category <SortIcon /></span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>

            {filteredNotes.map((note) => (
              <article key={note.id} className="notes-row notes-list-row">
                <div className="notes-user-cell">
                  <img src={note.avatar} alt={note.name} className="notes-avatar" />
                  <div className="notes-user-copy">
                    <h3>"{note.note}"</h3>
                    <p>{note.name} &bull; {note.date}</p>
                  </div>
                </div>

                <div className="notes-user-copy">
                  <h3>{note.highlightedPassage}</h3>
                  <p>{note.chapter}, {note.section}</p>
                </div>

                <div className="notes-category-cell">
                  {note.categories.map((cat, idx) => (
                    <span key={idx} className={`community-category-pill color-${cat.color}`}>
                      {cat.name}
                    </span>
                  ))}
                </div>

                <div className="notes-actions">
                  <button 
                    type="button" 
                    className="notes-action-btn"
                    onClick={() => setViewingNote(note)}
                  >
                    <EyeIcon /> View
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "Bookmarks List" && (
          <div className="notes-table-card">
            <div className="notes-table-head bookmarks-list-head">
              <span className="sortable-head">Bookmarked <SortIcon /></span>
              <span className="sortable-head">Bookmarks Amount <SortIcon /></span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>

            {filteredBookmarks.map((bookmark) => (
              <article key={bookmark.id} className="notes-row bookmarks-list-row">
                <div className="notes-bookmark-cell">
                  <h3>{bookmark.sentence}</h3>
                  <p>{bookmark.chapter} &bull; {bookmark.section}</p>
                </div>

                <div className="notes-amount-cell">
                  {bookmark.amount} user
                </div>

                <div className="notes-actions">
                  <button 
                    type="button" 
                    className="notes-action-btn"
                    onClick={() => setViewingBookmark(bookmark)}
                  >
                    <EyeIcon /> View
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "Category List" && (
          <div className="notes-table-card">
            <div className="notes-table-head category-list-head">
              <span className="sortable-head">Category Name <SortIcon /></span>
              <span className="sortable-head">Amount of tagged <SortIcon /></span>
              <span style={{ textAlign: 'right' }}>Action</span>
            </div>

            {filteredCategories.map((cat) => (
              <article key={cat.id} className="notes-row category-list-row">
                <div>
                  <span className={`community-category-pill color-${cat.color}`} style={{ color: cat.customColor }}>
                    {cat.name}
                  </span>
                </div>
                <div style={{ color: '#151c29', fontSize: 13, fontWeight: 500 }}>{cat.amount}</div>
                <div className="notes-actions" style={{ gap: 8 }}>
                  <button type="button" className="notes-action-icon-btn" onClick={() => {
                    setEditingCategory(cat);
                    setNewCategoryName(cat.name);
                    setSelectedColor(cat.color.startsWith('#') ? cat.color : colorPalette[0]); // mock data has "orange" etc, so this is just fallback. In real app, all colors would be hex.
                    setIsAddCategoryOpen(true);
                  }}>
                    <EditIcon />
                  </button>
                  <button type="button" className="notes-action-icon-btn" onClick={() => {
                    setCategoryToDelete(cat);
                    setIsDeleteCategoryModalOpen(true);
                  }}>
                    <TrashIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab !== "Category List" && (
          <div className="practice-footer resources-footer">
            <div className="practice-footer-left">
              <span>Show</span>
              <button type="button" className="practice-page-size">
                10
                <ChevronDownIcon />
              </button>
              <span>from {activeTab === "Notes List" ? notesData.length : activeTab === "Bookmarks List" ? bookmarksData.length : categoriesList.length} data</span>
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
        )}
      </div>

      {/* Note Detail Modal */}
      {viewingNote && (
        <div className="community-drawer-overlay" onClick={() => setViewingNote(null)}>
          <aside className="community-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="community-drawer-header">
              <h2>Detail Notes</h2>
              <button type="button" className="drawer-close-btn" onClick={() => setViewingNote(null)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="community-drawer-body detail-notes-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Highlighted Passage</span>
                <span className="detail-notes-value">{viewingNote.highlightedPassage}</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Chapters &amp; Section</span>
                <span className="detail-notes-value">{viewingNote.chapter}, {viewingNote.section}</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Date Created</span>
                <span className="detail-notes-value">{viewingNote.date}</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Notes by</span>
                <span className="detail-notes-value bold">{viewingNote.name}</span>
              </div>
              <div className="detail-notes-item" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <span className="detail-notes-label" style={{ width: 'auto' }}>Category</span>
                <div className="notes-category-cell">
                  {viewingNote.categories.map((cat, idx) => (
                    <span key={idx} className={`community-category-pill color-${cat.color}`}>
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Notes</span>
                <span className="detail-notes-value bold">{viewingNote.note}</span>
              </div>
            </div>

            <div className="community-drawer-footer">
              <button type="button" className="community-drawer-close-solid" onClick={() => setViewingNote(null)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Bookmark Detail Modal */}
      {viewingBookmark && (
        <div className="community-drawer-overlay" onClick={() => setViewingBookmark(null)}>
          <aside className="community-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="community-drawer-header">
              <h2>Detail Bookmarks</h2>
              <button type="button" className="drawer-close-btn" onClick={() => setViewingBookmark(null)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="community-drawer-body detail-notes-body" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Date Bookmarked</span>
                <span className="detail-notes-value">{viewingBookmark.date}</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Chapters &amp; Section</span>
                <span className="detail-notes-value">{viewingBookmark.chapter}, {viewingBookmark.section}</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Bookmarks Amount</span>
                <span className="detail-notes-value">{viewingBookmark.amount} user</span>
              </div>
              <div className="detail-notes-item">
                <span className="detail-notes-label">Sentence Bookmarked</span>
                <span className="detail-notes-value">{viewingBookmark.sentence}</span>
              </div>
            </div>

            <div className="community-drawer-footer">
              <button type="button" className="community-drawer-close-solid" onClick={() => setViewingBookmark(null)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <div className="community-modal-overlay" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="community-category-modal" onClick={e => e.stopPropagation()}>
            <div className="community-modal-header">
              <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
              <button type="button" className="drawer-close-btn" onClick={() => setIsAddCategoryOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="community-modal-body">
              <div className="community-field" style={{ marginBottom: 24 }}>
                <label>Select color</label>
                <div className="category-color-picker">
                  {colorPalette.map(color => (
                    <button 
                      key={color} 
                      type="button" 
                      className={`color-circle ${selectedColor === color ? "is-selected" : ""}`} 
                      style={{ 
                        background: color,
                        ...(selectedColor === color ? { boxShadow: `0 0 0 2px #ffffff, 0 0 0 4px ${color}` } : {})
                      }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && <CheckIcon />}
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
                  onChange={e => setNewCategoryName(e.target.value)}
                />
              </div>
            </div>

            <div className="community-modal-footer">
              <button type="button" className="community-modal-cancel" onClick={() => setIsAddCategoryOpen(false)}>
                Cancel
              </button>
              <button 
                type="button" 
                className="community-modal-save" 
                disabled={!newCategoryName.trim()}
                onClick={async () => {
                  if (newCategoryName.trim()) {
                    try {
                      if (editingCategory) {
                        const res = await fetch(`/api/note-categories/${editingCategory.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: newCategoryName, color: selectedColor })
                        });
                        if (res.ok) {
                          setCategoriesList(categoriesList.map(c => 
                            c.id === editingCategory.id ? { ...c, name: newCategoryName, color: selectedColor } : c
                          ));
                          setToastMessage("You have successfully updated a category");
                        }
                      } else {
                        const res = await fetch(`/api/note-categories`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: newCategoryName, color: selectedColor })
                        });
                        if (res.ok) {
                          const newCat = await res.json();
                          setCategoriesList([...categoriesList, newCat]);
                          setToastMessage("You have successfully added a new category");
                        }
                      }
                      setIsAddCategoryOpen(false);
                      setNewCategoryName("");
                      setEditingCategory(null);
                      setTimeout(() => setToastMessage(""), 3000);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }}
              >
                {editingCategory ? "Save Changes" : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {isDeleteCategoryModalOpen && (
        <div className="chapter-delete-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsDeleteCategoryModalOpen(false)}>
          <div className="chapter-delete-modal-content" style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#DC2626" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Are you sure you want to delete this category?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              You are about to permanently delete this item.<br />All associated content and data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setIsDeleteCategoryModalOpen(false)} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#FFF', color: '#4B5563', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                No, Keep It
              </button>
              <button type="button" style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#DC2626', color: '#FFF', fontWeight: '500', cursor: 'pointer', flex: 1 }} onClick={async () => {
                if (categoryToDelete) {
                  try {
                    const res = await fetch(`/api/note-categories/${categoryToDelete.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      setCategoriesList(categoriesList.filter(c => c.id !== categoryToDelete.id));
                      setToastMessage("You have successfully deleted a category");
                      setTimeout(() => setToastMessage(""), 3000);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
                setIsDeleteCategoryModalOpen(false);
                setCategoryToDelete(null);
              }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="community-dark-toast">
          <div className="dark-toast-icon">
            <CheckIcon />
          </div>
          <div className="dark-toast-content">
            <div className="dark-toast-header">
              <strong>{toastMessage.includes('added') ? 'New Category Added' : toastMessage.includes('deleted') ? 'Category Deleted' : 'Category Updated'}</strong>
              <button type="button" className="dark-toast-close" onClick={() => setToastMessage("")}>
                <CloseIcon />
              </button>
            </div>
            <p>{toastMessage}</p>
            <button type="button" className="dark-toast-dismiss" onClick={() => setToastMessage("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </section>
    </>
  );
}
