import React, { useEffect, useMemo, useState, useRef } from "react";
import { renderTranslated } from "./utils/renderTranslated";
import { useTranslations, LANG_CODES } from "./utils/translateUtils";
import "./media.css";
import "./media-add.css";

const mediaTypeOptions = ["All Media", "Image", "Video"];



function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m8 10 4-4 4 4" />
      <path d="m16 14-4 4-4-4" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v9" />
      <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
      <path d="M5 16.5v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.1" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

function PublishedStatusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    </svg>
  );
}

function DraftedStatusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9 7h4l4 4v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
    </svg>
  );
}

function InternalStatusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M5 12s3-6 7-6 7 6 7 6-3 6-7 6-7-6-7-6z" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
      <circle cx="12" cy="12" r="2.5" stroke="#ffffff" strokeWidth="1.5" fill="none"></circle>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  );
}

function MediaVisualIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="2" />
      <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#ffffff"></circle>
      <path d="M10 8l6 4-6 4z" fill="#151c29"></path>
    </svg>
  );
}

function triggerDownload(media) {
  const blob = new Blob([`Placeholder file for ${media.name}.${media.format.toLowerCase()}`], {
    type: "application/octet-stream",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = `${media.name}.${media.format.toLowerCase()}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  );
}

function TextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="10 9 10 15 15 12" />
    </svg>
  );
}

function ImageIcon2() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function DocumentIcon({ style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function CheckIcon({ style }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const MOCK_USER_SUGGESTIONS = [
  { id: 1, name: "Marie Laura", title: "Stillness Speaks — E. Tolle", date: "11 Nov 2025", category: "Book", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Kenny Roberts", title: "Inner Worlds Outer Worlds", date: "12 Nov 2025", category: "Movie", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Sophia Turner", title: "The Art of Happiness — D. Lama", date: "13 Nov 2025", category: "Book", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Liam Johnson", title: "Planet Earth II", date: "14 Nov 2025", category: "Audio", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Ava Martinez", title: "Inception", date: "15 Nov 2025", category: "Movie", avatar: "https://i.pravatar.cc/150?u=5" },
];

function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState("Content List");
  const [activeLanguageTab, setActiveLanguageTab] = useState("English 🇬🇧");
  const { translations, setTranslations, getVal, setVal, handleTranslate, merge, isTranslating } = useTranslations();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const thumbnailInputRef = useRef(null);
  const mediaInputRef = useRef(null);
  const [isRelatedChapterOpen, setIsRelatedChapterOpen] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [mediaForm, setMediaForm] = useState({
    name: "",
    author: "",
    format: "Video",
    category: "Book",
    status: "Published",
    relatedChapters: [],
    textContent: ""
  });


  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (title, message) => setToast({ title, message });

  const selectedMedia = useMemo(() => {
    return mediaFiles.find(media => media.id === selectedMediaId);
  }, [selectedMediaId, mediaFiles]);

  const isContent = useMemo(() => {
    if (!selectedMedia) return false;
    return selectedMedia.status === "Published";
  }, [selectedMedia]);

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch("/api/media");
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map((m) => {
          let thumb = m.thumbnail;
          if (thumb && typeof thumb === 'object') {
             thumb = thumb.preview || null;
          } else if (typeof thumb === 'string' && thumb.startsWith('"') && thumb.endsWith('"')) {
             thumb = thumb.slice(1, -1);
          }
          let finalDate = m.date_added;
          if (!finalDate && m.created_at) {
            const d = new Date(m.created_at);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            finalDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
          }
          return {
            ...m,
            thumbnail: thumb,
            dateAdded: finalDate,
          };
        });
        setMediaFiles(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch media files:", error);
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

  useEffect(() => {
    fetchMediaFiles();
    fetchChapters();
  }, []);

  useEffect(() => {
    if (!selectedMediaId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedMediaId]);

  const visibleMediaFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mediaFiles.filter((media) => {
      const matchesQuery =
        normalizedQuery === "" ||
        media.name.toLowerCase().includes(normalizedQuery) ||
        media.format.toLowerCase().includes(normalizedQuery);
      
      const matchesCategory = categoryFilter === "All Category" || media.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || media.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [mediaFiles, categoryFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedMediaId && !mediaFiles.some((media) => media.id === selectedMediaId)) {
      setSelectedMediaId(null);
    }
  }, [mediaFiles, selectedMediaId]);

  const [editingMediaId, setEditingMediaId] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState(null);

  const confirmDeleteMedia = async () => {
    if (!mediaToDelete) return;
    try {
      await fetch(`/api/media/${mediaToDelete}`, { method: "DELETE" });
      setMediaFiles((current) => current.filter((media) => media.id !== mediaToDelete));
      if (selectedMediaId === mediaToDelete) {
        setSelectedMediaId(null);
      }
      setMediaToDelete(null);
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  const openEditModal = (media) => {
    setEditingMediaId(media.id);
    setTranslations({
      shortQuote: media.short_quote || media.shortQuote || {},
      whyItMatters: media.why_it_matters || media.whyItMatters || {},
      corpusConnection: media.corpus_connection || media.corpusConnection || {},
      criticalNote: media.critical_note || media.criticalNote || {},
      integrationQuestion: media.integration_question || media.integrationQuestion || {},
    });
    setMediaForm({
      name: media.name || "",
      author: media.author || "",
      format: media.format || "Video",
      category: media.category || "Book",
      status: media.status || "Published",
      relatedChapters: media.related_chapters || media.relatedChapters || [],
      shortQuote: renderTranslated(media.short_quote || media.shortQuote, "en") || "",
      whyItMatters: renderTranslated(media.why_it_matters || media.whyItMatters, "en") || "",
      corpusConnection: renderTranslated(media.corpus_connection || media.corpusConnection, "en") || "",
      criticalNote: renderTranslated(media.critical_note || media.criticalNote, "en") || "",
      integrationQuestion: renderTranslated(media.integration_question || media.integrationQuestion, "en") || ""
    });
    setSelectedThumbnail(media.thumbnail || null);
    setSelectedMediaFile(media.content_file || media.contentFile || null);
    setAddStep(1);
    setIsAddModalOpen(true);
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Media Library</h1>
        <p>Oversee all uploaded library files.</p>
      </header>

      <section className="chapter-page media-page">
        <div className="community-tabs" style={{ marginBottom: 24 }}>
          {["Content List", "User Suggestion List"].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "is-active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Content List" ? (
          <>
            <div className="media-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="chapter-filters media-filters" style={{ display: 'flex', gap: '12px', flexWrap: 'nowrap', flex: 1 }}>
                <label className="chapter-search media-search" aria-label="Search practice or content name..." style={{ width: 'min(100%, 246px)' }}>
              <SearchIcon />
              <input
                type="search"
                placeholder="Search practice or content name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <div className="community-custom-select" style={{ minWidth: 160 }}>
              <button 
                type="button" 
                className="community-select-btn"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setIsStatusDropdownOpen(false);
                }}
              >
                {categoryFilter} <ChevronDownIcon />
              </button>
              {isCategoryDropdownOpen && (
                <div className="community-select-dropdown">
                  {["All Category", "Book", "Audio", "Music", "Movie", "Internal Asset"].map(opt => (
                    <button 
                      key={opt} 
                      type="button" 
                      className="community-select-option"
                      onClick={() => {
                        setCategoryFilter(opt);
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="community-custom-select" style={{ minWidth: 160 }}>
              <button 
                type="button" 
                className="community-select-btn"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                }}
              >
                {statusFilter} <ChevronDownIcon />
              </button>
              {isStatusDropdownOpen && (
                <div className="community-select-dropdown">
                  {["All Status", "Published", "Draft", "Internal Only"].map(opt => (
                    <button 
                      key={opt} 
                      type="button" 
                      className="community-select-option"
                      onClick={() => {
                        setStatusFilter(opt);
                        setIsStatusDropdownOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button type="button" className="master-add-btn" onClick={() => { 
            setEditingMediaId(null);
            setMediaForm({ name: "", author: "", format: "Video", category: "Book", status: "Published", relatedChapters: [] });
            setIsAddModalOpen(true); 
            setAddStep(1); 
          }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Content
          </button>
        </div>

        <div className="chapter-table-card media-table-card">
          <div className="media-table-head">
            <span className="sortable-head">
              Content <SortIcon />
            </span>
            <span className="sortable-head">
              Format <SortIcon />
            </span>
            <span className="sortable-head">
              Category <SortIcon />
            </span>
            <span className="sortable-head">
              Date Added <SortIcon />
            </span>
            <span className="sortable-head">
              Status <SortIcon />
            </span>
            <span>Action</span>
          </div>

          {visibleMediaFiles.map((media) => (
            <article key={media.id} className="media-row" onClick={() => setSelectedMediaId(media.id)}>
              <div className="media-file-cell">
                <div 
                  className="media-thumb" 
                  aria-hidden="true"
                  style={{
                    background: media.color === "red" ? "#FEE2E2" : media.color === "cyan" ? "#CFFAFE" : "",
                    color: media.color === "red" ? "#EF4444" : media.color === "cyan" ? "#06B6D4" : "",
                    border: "none",
                    backgroundImage: (media.thumbnail && typeof media.thumbnail === 'string' && (media.thumbnail.startsWith('data:') || media.thumbnail.startsWith('http'))) ? `url('${media.thumbnail}')` : (!media.color && media.id < 5 ? "url('https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&q=80')" : (media.id >= 5 && !media.color ? "url('https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&q=80')" : "none")),
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {media.color === "red" ? <FileIcon /> : media.color === "cyan" ? <MusicIcon /> : !media.color ? "" : <MediaVisualIcon />}
                </div>

                <div className="media-file-copy">
                  <h3 style={{ fontSize: "13px" }}>{media.name}</h3>
                  {media.author && <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#8d95a4" }}>{media.author}</p>}
                </div>
              </div>

              <span className="media-cell-text">{media.format}</span>
              <span className="media-cell-text">{media.category}</span>
              <span className="media-cell-text">{media.dateAdded}</span>
              
              <div>
                <span className={`media-status-pill ${media.status.toLowerCase().replace(" ", "-")}`}>
                  {media.status === "Published" && <PublishedStatusIcon />}
                  {media.status === "Drafted" && <DraftedStatusIcon />}
                  {media.status === "Internal Only" && <InternalStatusIcon />}
                  {media.status}
                </span>
              </div>

              <div className="media-actions">
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Edit ${media.name}`}
                  onClick={(e) => { e.stopPropagation(); openEditModal(media); }}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Delete ${media.name}`}
                  onClick={(e) => { e.stopPropagation(); setMediaToDelete(media.id); }}
                >
                  <TrashIcon />
                </button>
              </div>
            </article>
          ))}

          {visibleMediaFiles.length === 0 && (
            <div className="chapter-empty-state">
              <p>No media files match the current filters.</p>
              </div>
            )}
          </div>
  
          <div className="practice-footer media-footer">
            <div className="practice-footer-left">
              <span>Showing</span>
              <button type="button" className="practice-page-size">
                10
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </button>
              <span>from {visibleMediaFiles.length} data</span>
            </div>
  
            <div className="practice-pagination">
              <button type="button" className="practice-page-btn" aria-label="Previous page">
                <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button type="button" className="practice-page-btn" style={{ background: '#f6effa', color: '#795289', borderColor: '#f6effa' }}>1</button>
              <button type="button" className="practice-page-btn" aria-label="Next page">
                <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </>
        ) : (
        <>
          <div className="chapter-table-card media-table-card">
            <div className="suggestion-table-head">
              <span className="sortable-head">Suggested by <SortIcon /></span>
              <span className="sortable-head">Title <SortIcon /></span>
              <span className="sortable-head">Date <SortIcon /></span>
              <span className="sortable-head">Category <SortIcon /></span>
            </div>

            {MOCK_USER_SUGGESTIONS.map((suggestion) => (
              <article key={suggestion.id} className="suggestion-row">
                <div className="suggestion-user-cell">
                  <img src={suggestion.avatar} alt={suggestion.name} />
                  <strong>{suggestion.name}</strong>
                </div>
                <span className="suggestion-cell-text">{suggestion.title}</span>
                <span className="suggestion-cell-text">{suggestion.date}</span>
                <span className="suggestion-cell-text">{suggestion.category}</span>
              </article>
            ))}
          </div>

          <div className="practice-footer media-footer">
            <div className="practice-footer-left">
              <span>Show</span>
              <button type="button" className="practice-page-size">
                10
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </button>
              <span>from 5 data</span>
            </div>

            <div className="practice-pagination">
              <button type="button" className="practice-page-btn" aria-label="Previous page" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button type="button" className="practice-page-btn" style={{ background: '#f6effa', color: '#795289', borderColor: '#f6effa' }}>1</button>
              <button type="button" className="practice-page-btn" aria-label="Next page">
                <svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </>
        )}
      </section>

      {selectedMedia && (
        <div className="media-drawer-overlay" onClick={() => setSelectedMediaId(null)}>
          <aside className="media-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="media-drawer-header">
              <h2>{isContent ? "Detail Content" : "Detail Media"}</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close detail" onClick={() => setSelectedMediaId(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="media-drawer-body">
              {isContent ? (
                <div className="content-detail-layout">
                   <div className="content-thumbnail-block">
                     <span className="content-label">Content Thumbnail</span>
                     <div className="content-file-card">
                       <img src={(selectedMedia.thumbnail && typeof selectedMedia.thumbnail === 'string' && (selectedMedia.thumbnail.startsWith('data:') || selectedMedia.thumbnail.startsWith('http'))) ? selectedMedia.thumbnail : "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&q=80"} alt="Thumb" style={{ objectFit: 'cover' }} />
                       <div>
                         <strong>{selectedMedia.thumbnail ? "thumbnail.jpg" : "no-thumbnail.jpg"}</strong>
                         <span>-</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="media-detail-item">
                     <span>Content Title</span>
                     <strong>{selectedMedia.name}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Author</span>
                     <strong>{selectedMedia.author || "-"}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Category</span>
                     <strong>{selectedMedia.category}</strong>
                   </div>
                   
                   <div className="media-detail-item">
                     <span>Short Quote</span>
                     <strong style={{ fontWeight: 400 }}>{renderTranslated(selectedMedia.short_quote || selectedMedia.shortQuote, "en") || "-"}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Why It Matters</span>
                     <strong style={{ fontWeight: 400, lineHeight: 1.5 }}>{renderTranslated(selectedMedia.why_it_matters || selectedMedia.whyItMatters, "en") || "-"}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Corpus Connection</span>
                     <strong style={{ fontWeight: 400, lineHeight: 1.5 }}>{renderTranslated(selectedMedia.corpus_connection || selectedMedia.corpusConnection, "en") || "-"}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Related Chapter</span>
                     <div style={{ color: "#151c29", lineHeight: 1.5 }}>
                       {(selectedMedia.related_chapters || selectedMedia.relatedChapters || []).length > 0 ? (
                         (selectedMedia.related_chapters || selectedMedia.relatedChapters).map(chId => {
                           const ch = chapters.find(c => c.id === chId);
                           return <div key={chId}>• {ch ? renderTranslated(ch.title, LANG_CODES[activeLanguageTab]) : `Chapter ID: ${chId}`}</div>;
                         })
                       ) : "-"}
                     </div>
                   </div>
                   <div className="media-detail-item">
                     <span>Critical Note</span>
                     <strong style={{ fontWeight: 400, lineHeight: 1.5 }}>{renderTranslated(selectedMedia.critical_note || selectedMedia.criticalNote, "en") || "-"}</strong>
                   </div>
                   <div className="media-detail-item">
                     <span>Integration Question</span>
                     <strong style={{ fontWeight: 400, lineHeight: 1.5 }}>{renderTranslated(selectedMedia.integration_question || selectedMedia.integrationQuestion, "en") || "-"}</strong>
                   </div>
                </div>
              ) : (
                <>
                  {selectedMedia.format === "MP4" || selectedMedia.format === "MOV" || selectedMedia.format === "Video" ? (
                    <div className="media-video-preview" style={{ backgroundImage: (selectedMedia.thumbnail && typeof selectedMedia.thumbnail === 'string' && (selectedMedia.thumbnail.startsWith('data:') || selectedMedia.thumbnail.startsWith('http'))) ? `url('${selectedMedia.thumbnail}')` : "url('https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=600&q=80')" }}>
                       <div className="play-icon-circle">
                         <PlayCircleIcon />
                       </div>
                    </div>
                  ) : (
                    <div className="media-audio-preview">
                       <div className="audio-icon-box">
                         <MusicIcon />
                       </div>
                    </div>
                  )}

                  <div className="media-detail-grid">
                    <div className="media-detail-item">
                      <span>File Name</span>
                      <strong>{selectedMedia.name}</strong>
                    </div>
                    <div className="media-detail-item">
                      <span>File Format</span>
                      <strong>{selectedMedia.format}</strong>
                    </div>
                    <div className="media-detail-item">
                      <span>File Size</span>
                      <strong>{selectedMedia.fileSize || (selectedMedia.format === "MP4" ? "120 MB" : "5.2 KB")}</strong>
                    </div>
                    <div className="media-detail-item">
                      <span>Date Added</span>
                      <strong>{selectedMedia.dateAddedDetail || `${selectedMedia.dateAdded || "12 Nov 2025"} at 08:35`}</strong>
                    </div>
                    <div className="media-detail-item">
                      <span>Uploaded by</span>
                      <div className="media-uploader">
                        <div className="media-uploader-avatar">
                          <img src="https://i.pravatar.cc/150?u=adrian" alt="Adrian" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                        </div>
                        <strong>{selectedMedia.uploadedBy || "Adrian Halim"}</strong>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="media-drawer-footer">
              <button type="button" className="chapter-secondary-btn" onClick={() => setSelectedMediaId(null)}>
                Close
              </button>
              {!isContent && (
                <button type="button" className="chapter-primary-btn media-download-btn" onClick={() => triggerDownload(selectedMedia)}>
                  <DownloadIcon /> Download File
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
      {isAddModalOpen && (
        <div className="media-drawer-overlay" onClick={() => { setIsAddModalOpen(false); setAddStep(1); }}>
          <aside className="media-drawer" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="media-drawer-header">
              <h2>{editingMediaId ? "Edit Content" : "Add Content"}</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close" onClick={() => { setIsAddModalOpen(false); setAddStep(1); }}>
                <CloseIcon />
              </button>
            </div>

            <div className="media-drawer-body">
              <div className="add-content-stepper" style={{ marginBottom: '24px' }}>
                <div className="add-content-stepper-line"></div>
                <div className={`add-content-step ${addStep >= 1 ? "active" : ""}`}>
                  <div className="add-content-step-circle">
                    {addStep > 1 ? <CheckIcon style={{ width: 18, height: 18 }} /> : "1"}
                  </div>
                  <span className="add-content-step-label">Content Info</span>
                </div>
                <div className={`add-content-step ${addStep >= 2 ? "active" : ""}`}>
                  <div className="add-content-step-circle">2</div>
                  <span className="add-content-step-label">Add Content</span>
                </div>
              </div>



              {addStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="chapter-form-field">
                  <label style={{ display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Publication Type <span style={{color: '#EF4444'}}>*</span></label>
                  <div className="publication-type-options">
                    <div className={`publication-type-card ${mediaForm.status === "Published" ? "active" : ""}`} onClick={() => setMediaForm({...mediaForm, status: "Published"})}>
                      <EyeIcon />
                      <span>Published Resource</span>
                    </div>
                    <div className={`publication-type-card ${mediaForm.status === "Internal Only" ? "active" : ""}`} onClick={() => setMediaForm({...mediaForm, status: "Internal Only"})}>
                      <BookmarkIcon />
                      <span>Internal Asset</span>
                    </div>
                  </div>
                </div>

                <div className="chapter-form-field">
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Content Title <span style={{color: '#EF4444'}}>*</span></label>
                  <input type="text" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8 }} value={mediaForm.name} onChange={(e) => setMediaForm({...mediaForm, name: e.target.value})} placeholder={mediaForm.status === "Published" ? "Descartes' Error" : "Enter content title"} />
                </div>

                {mediaForm.status === "Published" && (
                  <>
                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Author <span style={{color: '#EF4444'}}>*</span></label>
                      <input type="text" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8 }} value={mediaForm.author} onChange={(e) => setMediaForm({...mediaForm, author: e.target.value})} placeholder="e.g. Antonio Damasio" />
                    </div>
                    
                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Category <span style={{color: '#EF4444'}}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <select style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, appearance: 'none' }} value={mediaForm.category} onChange={(e) => setMediaForm({...mediaForm, category: e.target.value})}>
                          <option>Select content category</option><option>Book</option><option>Audio</option><option>Music</option><option>Movie</option>
                        </select>
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <ChevronDownIcon />
                        </div>
                      </div>
                    </div>
                    
                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Short Quote <span style={{color: '#EF4444'}}>*</span></label>
                      <input type="text" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8 }} placeholder="e.g. The body is the foundation of the conscious mind." value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.shortQuote || "") : getVal(mediaForm.shortQuote, 'shortQuote', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, shortQuote: e.target.value});
    } else {
      setVal('shortQuote', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.shortQuote, 'shortQuote');
  }} />
                    </div>

                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Why It Matters <span style={{color: '#EF4444'}}>*</span></label>
                      <textarea rows="3" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }} placeholder="Describe the key insight or benefit of this resource..." value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.whyItMatters || "") : getVal(mediaForm.whyItMatters, 'whyItMatters', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, whyItMatters: e.target.value});
    } else {
      setVal('whyItMatters', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.whyItMatters, 'whyItMatters');
  }}></textarea>
                    </div>

                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Corpus Connection <span style={{color: '#EF4444'}}>*</span></label>
                      <textarea rows="3" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }} placeholder="Describe the relationship between this resource and the Corpus..." value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.corpusConnection || "") : getVal(mediaForm.corpusConnection, 'corpusConnection', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, corpusConnection: e.target.value});
    } else {
      setVal('corpusConnection', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.corpusConnection, 'corpusConnection');
  }}></textarea>
                    </div>

                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Related Chapter</label>
                      <div style={{ position: 'relative' }}>
                        <button 
                          type="button"
                          style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          onClick={() => setIsRelatedChapterOpen(!isRelatedChapterOpen)}
                        >
                          <span style={{ color: (mediaForm.relatedChapters || []).length > 0 ? '#151c29' : '#8d95a4' }}>
                            {(mediaForm.relatedChapters || []).length === 0 ? "Select related chapters" : 
                             (mediaForm.relatedChapters || []).length === 1 ? renderTranslated(chapters.find(c => c.id === mediaForm.relatedChapters[0])?.title, LANG_CODES[activeLanguageTab]) || "1 Chapter Selected" : 
                             `${(mediaForm.relatedChapters || []).length} Chapters Selected`}
                          </span>
                          <ChevronDownIcon style={{ width: 16, height: 16, color: '#8d95a4' }} />
                        </button>
                        {isRelatedChapterOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #edf1f5', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 200, overflowY: 'auto', padding: 8 }}>
                            {(Array.isArray(chapters) ? chapters : []).map(ch => (
                              <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', borderRadius: 6, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <input 
                                  type="checkbox" 
                                  style={{ width: 16, height: 16, accentColor: '#795289' }}
                                  checked={(mediaForm.relatedChapters || []).includes(ch.id)}
                                  onChange={(e) => {
                                    const currentRelated = mediaForm.relatedChapters || [];
                                    if (e.target.checked) {
                                      setMediaForm({...mediaForm, relatedChapters: [...currentRelated, ch.id]});
                                    } else {
                                      setMediaForm({...mediaForm, relatedChapters: currentRelated.filter(id => id !== ch.id)});
                                    }
                                  }}
                                />
                                <span style={{ fontSize: 13, color: '#151c29' }}>{renderTranslated(ch.title, LANG_CODES[activeLanguageTab])}</span>
                              </label>
                            ))}
                            {(!Array.isArray(chapters) || chapters.length === 0) && (
                              <div style={{ padding: '8px 12px', fontSize: 13, color: '#8d95a4' }}>No chapters found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Critical Note <span style={{color: '#EF4444'}}>*</span></label>
                      <textarea rows="3" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }} placeholder="Provide critical context about this resource..." value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.criticalNote || "") : getVal(mediaForm.criticalNote, 'criticalNote', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, criticalNote: e.target.value});
    } else {
      setVal('criticalNote', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.criticalNote, 'criticalNote');
  }}></textarea>
                    </div>

                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Integration Question <span style={{color: '#EF4444'}}>*</span></label>
                      <textarea rows="3" style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }} placeholder="Ask a question that encourages personal reflection..." value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.integrationQuestion || "") : getVal(mediaForm.integrationQuestion, 'integrationQuestion', activeLanguageTab)} onChange={(e) => {
    if (activeLanguageTab === 'English 🇬🇧') {
      setMediaForm({...mediaForm, integrationQuestion: e.target.value});
    } else {
      setVal('integrationQuestion', activeLanguageTab, e.target.value);
    }
  }} onBlur={() => {
    if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.integrationQuestion, 'integrationQuestion');
  }}></textarea>
                    </div>
                  </>
                )}

                {mediaForm.status === "Internal Only" && (
                  <div className="chapter-form-field">
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Category <span style={{color: '#EF4444'}}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, appearance: 'none' }} value={mediaForm.category} onChange={(e) => setMediaForm({...mediaForm, category: e.target.value})}>
                        <option>Select content category</option><option>Book</option><option>Audio</option><option>Music</option><option>Movie</option><option>Internal Asset</option>
                      </select>
                      <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                        <ChevronDownIcon />
                      </div>
                    </div>
                  </div>
                )}

                {mediaForm.status === "Published" && (
                  <div className="chapter-form-field">
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Content Thumbnail <span style={{color: '#EF4444'}}>*</span></label>
                    {selectedThumbnail ? (
                      <div className="thumbnail-upload-box">
                        <div className="thumbnail-upload-left">
                          <img src={typeof selectedThumbnail === 'string' ? selectedThumbnail : selectedThumbnail.preview} alt="Thumbnail" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                          <div className="thumbnail-upload-info">
                            <strong>{typeof selectedThumbnail === 'string' ? "existing-thumbnail.jpg" : selectedThumbnail.name}</strong>
                            <span>{typeof selectedThumbnail === 'string' ? "..." : selectedThumbnail.size}</span>
                          </div>
                        </div>
                        <button type="button" className="thumbnail-delete-btn" onClick={() => setSelectedThumbnail(null)}>
                          <TrashIcon />
                        </button>
                      </div>
                    ) : (
                      <div className="drag-drop-box" onClick={() => thumbnailInputRef.current?.click()}>
                        <input type="file" ref={thumbnailInputRef} style={{ display: 'none' }} accept="image/png, image/jpeg" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            if (file.size > 2 * 1024 * 1024) {
                              alert("File size exceeds 2MB. Please upload a smaller file.");
                              e.target.value = null;
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
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
                                
                                setSelectedThumbnail({
                                  name: file.name,
                                  size: (file.size / 1024).toFixed(1) + ' KB',
                                  preview: resizedBase64
                                });
                              };
                              img.src = event.target.result;
                            };
                            reader.readAsDataURL(file);
                          }
                        }} />
                        <div className="drag-drop-icon">
                          {(mediaForm.category === "Audio" || mediaForm.category === "Music") ? <MusicIcon /> : <ImageIcon />}
                        </div>
                        <div className="drag-drop-text">Drag &amp; Drop or <strong>Choose File</strong> to Upload</div>
                        <div className="drag-drop-subtext">Supported file: PNG, JPG&nbsp;&nbsp;&nbsp;Max. size: 2 MB</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div className="chapter-form-field">
                    <label style={{ display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Content Type <span style={{color: '#EF4444'}}>*</span></label>
                    <div className="content-type-grid">
                      <div className={`content-type-card ${mediaForm.format === "Text" ? "active" : ""}`} onClick={() => { setMediaForm({...mediaForm, format: "Text"}); setSelectedMediaFile(null); }}>
                        <TextIcon />
                        <span>Text</span>
                      </div>
                      <div className={`content-type-card ${mediaForm.format === "Video" ? "active" : ""}`} onClick={() => { setMediaForm({...mediaForm, format: "Video"}); setSelectedMediaFile(null); }}>
                        <VideoIcon />
                        <span>Video</span>
                      </div>
                      <div className={`content-type-card ${mediaForm.format === "Image" ? "active" : ""}`} onClick={() => { setMediaForm({...mediaForm, format: "Image"}); setSelectedMediaFile(null); }}>
                        <ImageIcon2 />
                        <span>Image</span>
                      </div>
                      <div className={`content-type-card ${mediaForm.format === "Document" ? "active" : ""}`} onClick={() => { setMediaForm({...mediaForm, format: "Document"}); setSelectedMediaFile(null); }}>
                        <DocumentIcon />
                        <span>Document</span>
                      </div>
                      <div className={`content-type-card ${mediaForm.format === "Audio" ? "active" : ""}`} onClick={() => { setMediaForm({...mediaForm, format: "Audio"}); setSelectedMediaFile(null); }}>
                        <MusicIcon />
                        <span>Audio</span>
                      </div>
                    </div>
                  </div>
                  
                  {mediaForm.format === "Text" ? (
                    <div className="chapter-form-field">
                      <div className="language-tabs" style={{ display: "flex", gap: "24px", marginBottom: "16px", borderBottom: "1px solid #E3E7ED", paddingBottom: "12px" }}>
                        {['English 🇬🇧', 'France 🇫🇷', 'Indonesian 🇮🇩', 'Russian 🇷🇺', 'Spanish 🇪🇸'].map(lang => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              setActiveLanguageTab(lang);
                              if (lang !== 'English 🇬🇧') {
                                const targetLang = LANG_CODES[lang];
                                if (mediaForm.textContent && !translations.textContent?.[targetLang] && !isTranslating['textContent']) handleTranslate(mediaForm.textContent, 'textContent');
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              borderBottom: activeLanguageTab === lang ? '2px solid #5A4B81' : '2px solid transparent',
                              color: activeLanguageTab === lang ? '#2D3748' : '#718096',
                              fontWeight: activeLanguageTab === lang ? '600' : '500',
                              paddingBottom: '12px',
                              marginBottom: '-13px',
                              cursor: 'pointer',
                              fontSize: "13px"
                            }}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>
                        Content ({activeLanguageTab === 'English 🇬🇧' ? 'English - Primary' : activeLanguageTab.split(' ')[0]}) <span style={{color: '#EF4444'}}>*</span>
                        {activeLanguageTab !== 'English 🇬🇧' && isTranslating?.['textContent'] && <span style={{ fontSize: '12px', color: '#805AD5', marginLeft: '8px', fontWeight: '500' }}>Translating...</span>}
                      </label>
                      <textarea
                        rows="6"
                        style={{ width: '100%', padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: 8, resize: 'none', fontFamily: 'inherit' }}
                        placeholder={`Write section content in ${activeLanguageTab === 'English 🇬🇧' ? 'english' : activeLanguageTab.split(' ')[0].toLowerCase()}...`}
                        value={activeLanguageTab === 'English 🇬🇧' ? (mediaForm.textContent || "") : getVal(mediaForm.textContent, 'textContent', activeLanguageTab)}
                        onChange={(e) => {
                          if (activeLanguageTab === 'English 🇬🇧') {
                            setMediaForm({...mediaForm, textContent: e.target.value});
                          } else {
                            setVal('textContent', activeLanguageTab, e.target.value);
                          }
                        }}
                        onBlur={() => {
                          if (activeLanguageTab === 'English 🇬🇧') handleTranslate(mediaForm.textContent, 'textContent');
                        }}
                      ></textarea>
                    </div>
                  ) : (
                    <div className="chapter-form-field">
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#151c29' }}>Upload File <span style={{color: '#EF4444'}}>*</span></label>
                      {selectedMediaFile ? (
                        <div className="thumbnail-upload-box">
                          <div className="thumbnail-upload-left">
                            <div className="media-uploader-avatar" style={{ background: '#795289', color: 'white', borderRadius: 8, width: 48, height: 48 }}>
                              {mediaForm.format === "Video" ? <VideoIcon /> : mediaForm.format === "Audio" ? <MusicIcon /> : mediaForm.format === "Image" ? <ImageIcon /> : <DocumentIcon />}
                            </div>
                            <div className="thumbnail-upload-info">
                              <strong>{selectedMediaFile.name}</strong>
                              <span>{selectedMediaFile.size}</span>
                            </div>
                          </div>
                          <button type="button" className="thumbnail-delete-btn" onClick={() => setSelectedMediaFile(null)}>
                            <TrashIcon />
                          </button>
                        </div>
                      ) : (
                        <div className="drag-drop-box" onClick={() => mediaInputRef.current?.click()}>
                          <input type="file" ref={mediaInputRef} style={{ display: 'none' }} 
                            accept={
                              mediaForm.format === "Video" ? "video/mp4, video/quicktime" :
                              mediaForm.format === "Audio" ? "audio/mpeg, audio/wav, audio/ogg" :
                              mediaForm.format === "Image" ? "image/jpeg, image/png, image/webp" :
                              ".pdf,.doc,.docx,.txt"
                            } 
                            onChange={(e) => {
                            if (e.target.files?.[0]) {
                              const file = e.target.files[0];
                              if (file.size > 2 * 1024 * 1024) {
                                alert("File size exceeds 2MB. Please upload a smaller file.");
                                e.target.value = null;
                                return;
                              }
                              setSelectedMediaFile({
                                name: file.name,
                                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                              });
                            }
                          }} />
                          <div className="drag-drop-icon">
                            {mediaForm.format === "Video" ? <VideoIcon /> : mediaForm.format === "Audio" ? <MusicIcon /> : mediaForm.format === "Image" ? <ImageIcon /> : <DocumentIcon />}
                          </div>
                          <div className="drag-drop-text">Drag &amp; Drop or <strong>Choose File</strong> to Upload</div>
                          <div className="drag-drop-subtext">
                            {mediaForm.format === "Video" ? "Supported file: MP4, MOV   Max. size: 2 MB" :
                             mediaForm.format === "Audio" ? "Supported file: MP3, WAV, OGG   Max. size: 2 MB" :
                             mediaForm.format === "Image" ? "Supported file: JPG, PNG, WEBP   Max. size: 2 MB" :
                             "Supported file: PDF, DOC, DOCX, TXT   Max. size: 2 MB"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {addStep === 1 ? (
              <div className="media-drawer-footer">
                <button type="button" className="chapter-secondary-btn" onClick={() => { setIsAddModalOpen(false); setAddStep(1); }}>Cancel</button>
                <button type="button" className="chapter-primary-btn" style={{ gap: 8 }} onClick={() => setAddStep(2)}>
                  Continue 
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="media-drawer-footer" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="chapter-secondary-btn" style={{ gap: 8 }} onClick={() => setAddStep(1)}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Previous
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="chapter-secondary-btn" style={{ gap: 8 }}>
                    <DocumentIcon style={{ width: 16, height: 16 }} /> Save as Draft
                  </button>
                  <button type="button" className="chapter-primary-btn" style={{ gap: 8 }} onClick={async () => {
                    try {
                      await fetch(editingMediaId ? `/api/media/${editingMediaId}` : "/api/media", {
                        method: editingMediaId ? "PUT" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...mediaForm, shortQuote: merge(mediaForm.shortQuote, "shortQuote"), whyItMatters: merge(mediaForm.whyItMatters, "whyItMatters"), corpusConnection: merge(mediaForm.corpusConnection, "corpusConnection"), criticalNote: merge(mediaForm.criticalNote, "criticalNote"), integrationQuestion: merge(mediaForm.integrationQuestion, "integrationQuestion"), textContent: merge(mediaForm.textContent, "textContent"), thumbnail: typeof selectedThumbnail === 'string' ? selectedThumbnail : (selectedThumbnail?.preview || null), contentFile: selectedMediaFile }),
                      });
                      if (typeof fetchMediaFiles === "function") {
                        await fetchMediaFiles();
                      }
                      setIsAddModalOpen(false);
                      setAddStep(1);
                      setSelectedThumbnail(null);
                      setSelectedMediaFile(null);
                      setMediaForm({ name: "", author: "", format: "Video", category: "Book", status: "Published", relatedChapters: [] });
                      showToast(editingMediaId ? "Content Updated" : "New Content Added", editingMediaId ? "You have successfully updated the content." : "You have successfully added new content in media library.");
                    } catch(err) { console.error(err) }
                  }}>
                    <CheckIcon style={{ width: 16, height: 16 }} /> Publish Now
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {toast && (
        <div
          className="roles-toast"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: "#171e2b",
            color: "#FFF",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            border: "none",
            zIndex: 1100,
            maxWidth: "340px",
          }}
        >
          <div style={{ color: "#2ECC71", marginTop: "2px", flexShrink: 0 }}>
            <CheckIcon style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <strong
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#FFF",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {toast.title}
              </strong>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setToast(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#A0AEC0",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CloseIcon style={{ width: 16, height: 16 }} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </button>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#A0AEC0", lineHeight: 1.4 }}>
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {mediaToDelete && (
        <div className="chapter-delete-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setMediaToDelete(null)}>
          <div className="chapter-delete-modal-content" style={{ background: '#FFF', borderRadius: '16px', padding: '32px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="#DC2626" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>Are you sure you want to delete this media?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              You are about to permanently delete this item.<br />All associated content and data will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setMediaToDelete(null)} style={{ padding: '10px 24px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#FFF', color: '#4B5563', fontWeight: '500', cursor: 'pointer', flex: 1 }}>
                No, Keep It
              </button>
              <button 
                type="button" 
                onClick={confirmDeleteMedia} 
                style={{ padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#DC2626', color: '#FFF', fontWeight: '500', cursor: 'pointer', flex: 1 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MediaLibraryPage;
