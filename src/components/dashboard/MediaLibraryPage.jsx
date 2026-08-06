import React, { useEffect, useMemo, useState } from "react";
import "./media.css";

const mediaTypeOptions = ["All Media", "Image", "Video"];



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
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mediaForm, setMediaForm] = useState({
    name: "",
    author: "",
    format: "MP4",
    category: "Book",
    status: "Published"
  });

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/media");
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map((m) => ({
          ...m,
          dateAdded: m.date_added,
        }));
        setMediaFiles(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch media files:", error);
    }
  };
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

  const deleteMedia = async (mediaId) => {
    try {
      await fetch(`http://localhost:3001/api/media/${mediaId}`, { method: "DELETE" });
      setMediaFiles((current) => current.filter((media) => media.id !== mediaId));
      if (selectedMediaId === mediaId) {
        setSelectedMediaId(null);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);
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
          
          <button type="button" className="master-add-btn" onClick={() => setIsAddModalOpen(true)}>
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
                  {media.status === "Published" && <PublishedStatusIcon />}
                  {media.status === "Drafted" && <DraftedStatusIcon />}
                  {media.status === "Internal Only" && <InternalStatusIcon />}
                  {media.status}
                </span>
              </div>

              <div className="media-actions">
                <button
                  type="button"
                  className="community-action-btn color-gray"
                  aria-label={`Edit ${media.name}`}
                  style={{ padding: "6px", minWidth: 0, minHeight: 0, width: "32px", height: "32px", justifyContent: "center" }}
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="community-action-btn color-gray"
                  aria-label={`Delete ${media.name}`}
                  style={{ padding: "6px", minWidth: 0, minHeight: 0, width: "32px", height: "32px", justifyContent: "center" }}
                  onClick={(e) => { e.stopPropagation(); deleteMedia(media.id); }}
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
      {isAddModalOpen && (
        <div className="chapter-drawer-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setIsAddModalOpen(false)}>
          <div className="community-modal" onClick={(e) => e.stopPropagation()} style={{ width: 400, backgroundColor: 'white', padding: 24, borderRadius: 12 }}>
            <div className="community-modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Add Media</h2>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsAddModalOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="community-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="chapter-form-field">
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#4B5563' }}>Name</label>
                <input type="text" style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6 }} value={mediaForm.name} onChange={(e) => setMediaForm({...mediaForm, name: e.target.value})} placeholder="Media Name" />
              </div>
              <div className="chapter-form-field">
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#4B5563' }}>Author</label>
                <input type="text" style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6 }} value={mediaForm.author} onChange={(e) => setMediaForm({...mediaForm, author: e.target.value})} placeholder="Author" />
              </div>
              <div className="chapter-form-field">
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#4B5563' }}>Format</label>
                <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6 }} value={mediaForm.format} onChange={(e) => setMediaForm({...mediaForm, format: e.target.value})}>
                  <option>MP4</option><option>MP3</option><option>PDF</option><option>JPG</option><option>MOV</option>
                </select>
              </div>
              <div className="chapter-form-field">
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#4B5563' }}>Category</label>
                <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6 }} value={mediaForm.category} onChange={(e) => setMediaForm({...mediaForm, category: e.target.value})}>
                  <option>Book</option><option>Audio</option><option>Music</option><option>Movie</option><option>Internal Asset</option>
                </select>
              </div>
              <div className="chapter-form-field">
                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#4B5563' }}>Status</label>
                <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: 6 }} value={mediaForm.status} onChange={(e) => setMediaForm({...mediaForm, status: e.target.value})}>
                  <option>Published</option><option>Drafted</option><option>Internal Only</option>
                </select>
              </div>
            </div>
            <div className="community-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button type="button" className="chapter-secondary-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button type="button" className="chapter-primary-btn" onClick={async () => {
                try {
                  await fetch("http://localhost:3001/api/media", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(mediaForm),
                  });
                  if (typeof fetchMediaFiles === "function") {
                    await fetchMediaFiles();
                  }
                  setIsAddModalOpen(false);
                  setMediaForm({ name: "", author: "", format: "MP4", category: "Book", status: "Published" });
                } catch(err) { console.error(err) }
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MediaLibraryPage;
