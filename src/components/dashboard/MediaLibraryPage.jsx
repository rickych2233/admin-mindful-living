import React, { useEffect, useMemo, useState } from "react";
import "./media.css";

const mediaTypeOptions = ["All Media", "Image", "Video"];

const initialMediaFiles = [
  {
    id: 1,
    name: "thumbnail-chapter-1",
    format: "JPG",
    mediaType: "Image",
    fileSize: "24 KB",
    dateAdded: "12 Nov 2025",
    dateAddedDetail: "12 Nov 2025 at 08:35",
    uploadedBy: "Adrian Halim",
  },
  {
    id: 2,
    name: "video-session-2",
    format: "MP4",
    mediaType: "Video",
    fileSize: "120 MB",
    dateAdded: "12 Nov 2025",
    dateAddedDetail: "12 Nov 2025 at 09:12",
    uploadedBy: "Adrian Halim",
  },
  {
    id: 3,
    name: "thumbnail-chapter-2",
    format: "PNG",
    mediaType: "Image",
    fileSize: "50 KB",
    dateAdded: "12 Nov 2025",
    dateAddedDetail: "12 Nov 2025 at 09:30",
    uploadedBy: "Adrian Halim",
  },
  {
    id: 4,
    name: "video-session-5",
    format: "MOV",
    mediaType: "Video",
    fileSize: "351 MB",
    dateAdded: "12 Nov 2025",
    dateAddedDetail: "12 Nov 2025 at 10:05",
    uploadedBy: "Adrian Halim",
  },
  {
    id: 5,
    name: "thumbnail-chapter-3",
    format: "JPG",
    mediaType: "Image",
    fileSize: "25 KB",
    dateAdded: "12 Nov 2025",
    dateAddedDetail: "12 Nov 2025 at 10:28",
    uploadedBy: "Adrian Halim",
  },
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
  const [mediaFiles, setMediaFiles] = useState(initialMediaFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("All Media");
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
      const matchesType = mediaTypeFilter === "All Media" || media.mediaType === mediaTypeFilter;

      return matchesQuery && matchesType;
    });
  }, [mediaFiles, mediaTypeFilter, searchQuery]);

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
        <div className="media-toolbar">
          <div className="chapter-filters media-filters">
            <label className="chapter-search media-search" aria-label="Search file name">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="chapter-select chapter-select-shell media-select">
              <select value={mediaTypeFilter} onChange={(event) => setMediaTypeFilter(event.target.value)}>
                {mediaTypeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDownIcon />
            </label>
          </div>
        </div>

        <div className="chapter-table-card media-table-card">
          <div className="media-table-head">
            <span className="sortable-head">
              File
              <SortIcon />
            </span>
            <span className="sortable-head">
              Format
              <SortIcon />
            </span>
            <span className="sortable-head">
              File Size
              <SortIcon />
            </span>
            <span className="sortable-head">
              Date Added
              <SortIcon />
            </span>
            <span>Action</span>
          </div>

          {visibleMediaFiles.map((media) => (
            <article key={media.id} className="media-row" onClick={() => setSelectedMediaId(media.id)}>
              <div className="media-file-cell">
                <div className="media-thumb" aria-hidden="true">
                  <MediaVisualIcon />
                </div>

                <div className="media-file-copy">
                  <h3>{media.name}</h3>
                </div>
              </div>

              <span className="media-cell-text">{media.format}</span>
              <span className="media-cell-text">{media.fileSize}</span>
              <span className="media-cell-text">{media.dateAdded}</span>

              <div className="media-actions">
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Download ${media.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    triggerDownload(media);
                  }}
                >
                  <DownloadIcon />
                </button>
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Delete ${media.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteMedia(media.id);
                  }}
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
