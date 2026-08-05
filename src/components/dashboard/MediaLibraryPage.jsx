import React, { useEffect, useMemo, useState } from "react";
import "./media.css";

const mediaTypeOptions = ["All Media", "Image", "Video"];

const initialMediaFiles = [
  { id: 1, name: "Descartes' Error", author: "Antonio Damasio", format: "PDF", category: "Book", dateAdded: "12 Nov 2025", status: "Published" },
  { id: 2, name: "A Practical Guide to Spiritual Enlig...", author: "Eckhart Tolle", format: "MP3", category: "Audio", dateAdded: "11 Nov 2025", status: "Published" },
  { id: 3, name: "How Social Media Platforms Shape...", author: "Sam Harris", format: "MP3", category: "Music", dateAdded: "10 Nov 2025", status: "Drafted" },
  { id: 4, name: "A Guide to Spirituality Without Religion and Modern Mindfulness", author: "Jeff Orlowski", format: "PDF", category: "Book", dateAdded: "9 Nov 2025", status: "Published" },
  { id: 5, name: "chapter-1-thumbnail.jpg", author: "", format: "JPG", category: "Internal Asset", dateAdded: "11 Nov 2025", status: "Internal Only" },
  { id: 6, name: "video-session-2", author: "", format: "MP4", category: "Internal Asset", dateAdded: "11 Nov 2025", status: "Internal Only" },
  { id: 7, name: "the-power-of-now-ebook", author: "", format: "PDF", category: "Internal Asset", dateAdded: "10 Nov 2025", status: "Internal Only", color: "red" },
  { id: 8, name: "video-session-5", author: "", format: "MOV", category: "Internal Asset", dateAdded: "9 Nov 2025", status: "Internal Only" },
  { id: 9, name: "the-power-of-now-audio", author: "", format: "MP3", category: "Internal Asset", dateAdded: "9 Nov 2025", status: "Internal Only", color: "cyan" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
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

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      <polyline points="9 12 11 14 15 10"></polyline>
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

function MediaLibraryPage() {
  const [activeTab, setActiveTab] = useState("Content List");
  const [mediaFiles, setMediaFiles] = useState(initialMediaFiles);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  const [selectedMediaId, setSelectedMediaId] = useState(null);

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

  const selectedMedia = mediaFiles.find((media) => media.id === selectedMediaId) ?? null;

  const deleteMedia = (mediaId) => {
    setMediaFiles((current) => current.filter((media) => media.id !== mediaId));
    if (selectedMediaId === mediaId) {
      setSelectedMediaId(null);
    }
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

        <div className="media-toolbar">
          <div className="chapter-filters media-filters">
            <label className="chapter-search media-search" aria-label="Search practice or content name...">
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
          
          <button type="button" className="master-add-btn">
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
            <article key={media.id} className="media-row">
              <div className="media-file-cell">
                <div 
                  className="media-thumb" 
                  aria-hidden="true"
                  style={{
                    background: media.color === "red" ? "#FEE2E2" : media.color === "cyan" ? "#CFFAFE" : "",
                    color: media.color === "red" ? "#EF4444" : media.color === "cyan" ? "#06B6D4" : "",
                    border: "none",
                    backgroundImage: !media.color && media.id < 5 ? "url('https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&q=80')" : media.id >= 5 && !media.color ? "url('https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?w=100&q=80')" : "none",
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
                  {media.status === "Published" && <CheckCircleIcon />}
                  {media.status === "Drafted" && <FileIcon />}
                  {media.status === "Internal Only" && <ShieldCheckIcon />}
                  {media.status}
                </span>
              </div>

              <div className="media-actions">
                <button
                  type="button"
                  className="community-action-btn color-gray"
                  aria-label={`Edit ${media.name}`}
                  style={{ padding: "6px", minWidth: 0, minHeight: 0, width: "32px", height: "32px", justifyContent: "center" }}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="community-action-btn color-gray"
                  aria-label={`Delete ${media.name}`}
                  style={{ padding: "6px", minWidth: 0, minHeight: 0, width: "32px", height: "32px", justifyContent: "center" }}
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
            <span>from {visibleMediaFiles.length} results</span>
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

      {selectedMedia && (
        <div className="media-drawer-overlay" onClick={() => setSelectedMediaId(null)}>
          <aside className="media-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="media-drawer-header">
              <h2>Detail Media</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close media detail" onClick={() => setSelectedMediaId(null)}>
                <CloseIcon />
              </button>
            </div>

            <div className="media-drawer-body">
              <div className="media-preview-box" aria-hidden="true">
                <MediaVisualIcon />
              </div>

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
                  <strong>{selectedMedia.fileSize}</strong>
                </div>
                <div className="media-detail-item">
                  <span>Date Added</span>
                  <strong>{selectedMedia.dateAddedDetail}</strong>
                </div>
                <div className="media-detail-item">
                  <span>Uploaded by</span>
                  <div className="media-uploader">
                    <div className="media-uploader-avatar" aria-hidden="true">
                      <UserIcon />
                    </div>
                    <strong>{selectedMedia.uploadedBy}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="media-drawer-footer">
              <button type="button" className="chapter-secondary-btn" onClick={() => setSelectedMediaId(null)}>
                Close
              </button>
              <button type="button" className="chapter-primary-btn media-download-btn" onClick={() => triggerDownload(selectedMedia)}>
                Download File
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default MediaLibraryPage;
