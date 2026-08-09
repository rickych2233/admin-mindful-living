import React, { useEffect, useMemo, useState } from "react";
import "./resources.css";

const RESOURCE_CATEGORY_OPTIONS = ["Book", "Audio", "Music", "Video"];

const RESOURCE_STEP_ITEMS = [
  { id: 1, label: "Content Info" },
  { id: 2, label: "Add Content" },
];

const RESOURCE_CONTENT_TYPES = [
  { value: "Text", icon: "text" },
  { value: "Video", icon: "video" },
  { value: "Image", icon: "image" },
  { value: "Document", icon: "document" },
  { value: "Audio", icon: "audio" },
];

const RESOURCE_LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "fr", label: "French" },
  { id: "id", label: "Indonesian" },
  { id: "ru", label: "Russian" },
  { id: "es", label: "Spanish" },
];

function createEmptyTextContent() {
  return {
    en: "",
    fr: "",
    id: "",
    ru: "",
    es: "",
  };
}

function createEmptyContentFiles() {
  return {
    Video: null,
    Image: null,
    Document: null,
    Audio: null,
  };
}

function createEmptyResourceForm() {
  return {
    publicationType: "Published Resource",
    title: "",
    category: "",
    thumbnail: null,
    contentType: "Text",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  };
}

function formatFileSize(bytes = 0) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
  }

  return `${(kilobytes / 1024).toFixed(1)} MB`;
}

function buildFileDescriptor(file) {
  return {
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    preview: URL.createObjectURL(file),
  };
}

function formatResourceDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toResourceForm(resource) {
  return {
    publicationType: resource.publicationType ?? "Published Resource",
    title: resource.title,
    category: resource.category,
    thumbnail: resource.thumbnail ? { ...resource.thumbnail } : null,
    contentType: resource.contentType ?? "Text",
    contentTexts: {
      ...createEmptyTextContent(),
      ...(resource.contentTexts ?? {}),
    },
    contentFiles: {
      ...createEmptyContentFiles(),
      ...(resource.contentFiles ?? {}),
    },
  };
}

const initialResources = [
  {
    id: 1,
    title: "Descartes' Error",
    caption: "Antonio Damasio",
    dateAdded: "12 Nov 2025",
    category: "Book",
    publicationType: "Published Resource",
    status: "Published",
    thumbnail: { name: "descartes-error.jpg", sizeLabel: "59.7 KB" },
    contentType: "Document",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 2,
    title: "A Practical Guide to Spiritual Enlightenment and Conscious Living",
    caption: "Eckhart Tolle",
    dateAdded: "11 Nov 2025",
    category: "Audio",
    publicationType: "Published Resource",
    status: "Published",
    thumbnail: { name: "a-new-earth-thumbnail.jpg", sizeLabel: "48.2 KB" },
    contentType: "Audio",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 3,
    title: "How Social Media Platforms Shape Human Behavior and Society",
    caption: "Sam Harris",
    dateAdded: "10 Nov 2025",
    category: "Music",
    publicationType: "Published Resource",
    status: "Drafted",
    thumbnail: { name: "kumare-thumbnail.jpg", sizeLabel: "64.8 KB" },
    contentType: "Audio",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 4,
    title: "A Guide to Spirituality Without Religion and Modern Mindfulness",
    caption: "Jeff Orlowski",
    dateAdded: "9 Nov 2025",
    category: "Book",
    publicationType: "Published Resource",
    status: "Published",
    thumbnail: { name: "waking-up-cover.jpg", sizeLabel: "42.1 KB" },
    contentType: "Document",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 5,
    title: "chapter-1-thumbnail.jpg",
    caption: "",
    dateAdded: "11 Nov 2025",
    category: "Internal Asset",
    publicationType: "Internal Asset",
    status: "Internal Only",
    thumbnail: { name: "chapter-1-thumbnail.jpg", sizeLabel: "38.6 KB" },
    contentType: "Image",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 6,
    title: "video-session-2",
    caption: "",
    dateAdded: "11 Nov 2025",
    category: "Internal Asset",
    publicationType: "Internal Asset",
    status: "Internal Only",
    thumbnail: { name: "video-session-2.jpg", sizeLabel: "34.4 KB" },
    contentType: "Video",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 7,
    title: "the-power-of-now-ebook",
    caption: "",
    dateAdded: "10 Nov 2025",
    category: "Internal Asset",
    publicationType: "Internal Asset",
    status: "Internal Only",
    thumbnail: null,
    contentType: "Document",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 8,
    title: "video-session-5",
    caption: "",
    dateAdded: "9 Nov 2025",
    category: "Internal Asset",
    publicationType: "Internal Asset",
    status: "Internal Only",
    thumbnail: { name: "video-session-5.jpg", sizeLabel: "34.4 KB" },
    contentType: "Video",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  },
  {
    id: 9,
    title: "the-power-of-now-audio",
    caption: "",
    dateAdded: "9 Nov 2025",
    category: "Internal Asset",
    publicationType: "Internal Asset",
    status: "Internal Only",
    thumbnail: null,
    contentType: "Audio",
    contentTexts: createEmptyTextContent(),
    contentFiles: createEmptyContentFiles(),
  }
];

function ResourceVisualIcon({ type = "image" }) {
  if (type === "text") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="4.5" width="12" height="15" rx="3" />
        <path d="M9 9.5h6M9 13h6" />
      </svg>
    );
  }

  if (type === "video") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4.5" width="14" height="15" rx="3" />
        <path d="m11 10 4 2-4 2Z" />
        <path d="M9 7.5h6" />
      </svg>
    );
  }

  if (type === "document") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  }

  if (type === "audio") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="2" />
      <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
    </svg>
  );
}

function StepCompleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7 12 3 3 7-7" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="m9 12 2 2 4-4" />
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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
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

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5.5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-14a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

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

function FileCard({ file, type, onRemove, removeLabel }) {
  return (
    <div className="resources-file-card">
      <div className="resources-file-meta">
        {file?.preview && type === "image" ? (
          <img 
            src={file.preview} 
            alt={file.name} 
            className="resources-file-icon" 
            style={{ objectFit: 'cover' }} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'grid';
              }
            }} 
          />
        ) : null}
        <div 
          className="resources-file-icon" 
          aria-hidden="true" 
          style={{ display: file?.preview && type === "image" ? 'none' : 'grid' }}
        >
          <ResourceVisualIcon type={type === "video" ? "video" : "image"} />
        </div>

        <div className="resources-file-copy">
          <strong>{file.name}</strong>
          <span>{file.sizeLabel}</span>
        </div>
      </div>

      <button type="button" className="resources-remove-btn" aria-label={removeLabel} onClick={onRemove}>
        <TrashIcon />
      </button>
    </div>
  );
}

function UploadBox({ accept, helperText, label, onChange, type }) {
  return (
    <label className="resources-upload-box">
      <input type="file" accept={accept} onChange={onChange} />
      <ResourceVisualIcon type={type} />
      <strong>Drag &amp; Drop or Choose File to Upload</strong>
      <span>
        Supported file: {label}
        {"   "}
        Max. size: {helperText}
      </span>
    </label>
  );
}

function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("Content List");
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceStep, setResourceStep] = useState(1);
  const [resourceForm, setResourceForm] = useState(createEmptyResourceForm());
  const [activeLanguage, setActiveLanguage] = useState("en");
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [toast, setToast] = useState(null);

  const mockSuggestions = [
    { id: 1, name: "Marie Laura", title: "Stillness Speaks — E. Tolle", date: "11 Nov 2025", category: "Book" },
    { id: 2, name: "Kenny Roberts", title: "Inner Worlds, Outer Worlds", date: "12 Nov 2025", category: "Movie" },
    { id: 3, name: "Sophia Turner", title: "The Art of Happiness — D. Lama", date: "13 Nov 2025", category: "Book" },
    { id: 4, name: "Liam Johnson", title: "Planet Earth II", date: "14 Nov 2025", category: "Audio" },
    { id: 5, name: "Ava Martinez", title: "Inception", date: "15 Nov 2025", category: "Movie" },
  ];

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        const normalized = data.map((r) => ({
          ...r,
          contentType: r.content_type || "Text",
          contentTexts: r.content_texts || {},
          contentFiles: r.content_files || {},
          dateAdded: r.created_at ? formatResourceDate(new Date(r.created_at)) : formatResourceDate(new Date()),
        }));
        setResources(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  const categoryFilterOptions = useMemo(
    () => ["All Category", ...new Set(resources.map((resource) => resource.category))],
    [resources]
  );

  const visibleResources = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesQuery =
        normalizedQuery === "" ||
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "All Category" || resource.category === categoryFilter;
      const matchesStatus = statusFilter === "All Status" || resource.status === statusFilter;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [resources, searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    if (categoryFilter !== "All Category" && !categoryFilterOptions.includes(categoryFilter)) {
      setCategoryFilter("All Category");
    }
  }, [categoryFilter, categoryFilterOptions]);

  useEffect(() => {
    if (statusFilter !== "All Status" && !resources.some((resource) => resource.status === statusFilter)) {
      setStatusFilter("All Status");
    }
  }, [resources, statusFilter]);

  const activeLanguageLabel =
    RESOURCE_LANGUAGE_OPTIONS.find((language) => language.id === activeLanguage)?.label ?? "English";

  const selectedContentFile = resourceForm.contentFiles[resourceForm.contentType] ?? null;

  const canContinue =
    resourceForm.publicationType !== "" &&
    resourceForm.title.trim() !== "" &&
    resourceForm.category !== "" &&
    Boolean(resourceForm.thumbnail);

  const canPublish =
    resourceForm.contentType === "Text"
      ? resourceForm.contentTexts.en.trim() !== ""
      : Boolean(selectedContentFile);

  const resetModalState = () => {
    setIsModalOpen(false);
    setResourceStep(1);
    setEditingResourceId(null);
    setActiveLanguage("en");
    setResourceForm(createEmptyResourceForm());
  };

  const openCreateModal = () => {
    setEditingResourceId(null);
    setResourceStep(1);
    setActiveLanguage("en");
    setResourceForm(createEmptyResourceForm());
    setIsModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResourceId(resource.id);
    setResourceStep(1);
    setActiveLanguage("en");
    setResourceForm(toResourceForm(resource));
    setIsModalOpen(true);
  };

  const handleResourceFieldChange = (field) => (event) => {
    const nextValue = event.target.value;
    setResourceForm((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  const handleThumbnailChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setResourceForm((current) => ({
        ...current,
        thumbnail: {
          name: file.name,
          sizeLabel: formatFileSize(file.size),
          preview: e.target.result,
        },
      }));
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeThumbnail = () => {
    setResourceForm((current) => ({
      ...current,
      thumbnail: null,
    }));
  };

  const handleTextContentChange = (event) => {
    const nextValue = event.target.value;
    setResourceForm((current) => ({
      ...current,
      contentTexts: {
        ...current.contentTexts,
        [activeLanguage]: nextValue,
      },
    }));
  };

  const handleContentFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setResourceForm((current) => ({
      ...current,
      contentFiles: {
        ...current.contentFiles,
        [current.contentType]: buildFileDescriptor(file),
      },
    }));

    event.target.value = "";
  };

  const removeContentFile = () => {
    setResourceForm((current) => ({
      ...current,
      contentFiles: {
        ...current.contentFiles,
        [current.contentType]: null,
      },
    }));
  };

  const showToast = (title, message) => {
    setToast({ title, message });
  };

  const saveResource = async (nextStatus) => {
    if (nextStatus === "Published" && !canPublish) {
      return;
    }

    const finalStatus = resourceForm.publicationType === "Internal Asset" ? "Internal Only" : nextStatus;

    const nextResource = {
      title: resourceForm.title.trim(),
      category: resourceForm.category,
      publicationType: resourceForm.publicationType,
      status: finalStatus,
      thumbnail: resourceForm.thumbnail ? { ...resourceForm.thumbnail } : null,
      content_type: resourceForm.contentType,
      content_texts: { ...resourceForm.contentTexts },
      content_files: {
        ...resourceForm.contentFiles,
      },
    };

    try {
      if (editingResourceId) {
        await fetch(`/api/resources/${editingResourceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextResource),
        });
      } else {
        await fetch(`/api/resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextResource),
        });
      }

      await fetchResources();

      resetModalState();

      if (editingResourceId) {
        showToast(
          nextStatus === "Drafted" ? "Draft Updated" : "Resource Updated",
          nextStatus === "Drafted"
            ? "Changes have been saved to your draft resource"
            : "The resource has been updated successfully"
        );
        return;
      }

      showToast(
        nextStatus === "Drafted" ? "Resource Saved as Draft" : "New Resource Added",
        nextStatus === "Drafted"
          ? "The resource has been saved to drafts"
          : "You have successfully added new resource"
      );
    } catch (error) {
      console.error("Failed to save resource:", error);
      showToast("Error", "Failed to save resource");
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      await fetch(`/api/resources/${resourceId}`, {
        method: "DELETE",
      });
      await fetchResources();
      showToast("Resource Deleted", "The resource has been removed");
    } catch (error) {
      console.error("Failed to delete resource:", error);
      showToast("Error", "Failed to delete resource");
    }
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Media Library</h1>
        <p>Manage Publised &amp; Suggested Content</p>
      </header>

      <section className="chapter-page resources-page">
        <div className="resources-tabs">
          <button 
            type="button" 
            className={`resources-tab${activeTab === "Content List" ? " is-active" : ""}`}
            onClick={() => setActiveTab("Content List")}
          >
            Content List
          </button>
          <button 
            type="button" 
            className={`resources-tab${activeTab === "User Suggestion List" ? " is-active" : ""}`}
            onClick={() => setActiveTab("User Suggestion List")}
          >
            User Suggestion List
          </button>
        </div>

        {activeTab === "Content List" ? (
          <>
            <div className="resources-toolbar">
              <div className="chapter-filters resources-filters">
                <label className="chapter-search resources-search" aria-label="Search resources">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search practice or content name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="chapter-select chapter-select-shell resources-filter-select">
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                {categoryFilterOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDownIcon />
            </label>

            <label className="chapter-select chapter-select-shell resources-filter-select">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All Status</option>
                <option>Published</option>
                <option>Drafted</option>
                <option>Internal Only</option>
              </select>
              <ChevronDownIcon />
            </label>
          </div>

          <button type="button" className="master-add-btn" onClick={openCreateModal}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add Content</span>
          </button>
        </div>

        <div className="chapter-table-card resources-table-card">
          <div className="resources-table-head">
            <span className="sortable-head">
              Content
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Format
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
              Date Added
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

          {visibleResources.map((resource) => (
            <article key={resource.id} className="resources-row">
              <div className="resources-title-cell">
                {resource.thumbnail?.preview ? (
                  <img
                    src={resource.thumbnail.preview}
                    alt={resource.title}
                    className="resources-thumb"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'grid';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className="resources-thumb" 
                  aria-hidden="true" 
                  style={{ display: resource.thumbnail?.preview ? 'none' : 'grid' }}
                >
                  <ResourceVisualIcon type={resource.contentType.toLowerCase()} />
                </div>

                <div className="resources-copy">
                  <h3>{resource.title}</h3>
                  {resource.caption && <p>{resource.caption}</p>}
                </div>
              </div>

              <span className="resources-type-text">{
                resource.contentType === "Text" ? "PDF" : 
                resource.contentType === "Video" ? (resource.title.includes("session-5") ? "MOV" : "MP4") :
                resource.contentType === "Document" ? "PDF" :
                resource.contentType === "Audio" ? "MP3" :
                "JPG"
              }</span>
              <span className="resources-category-pill">{resource.category}</span>
              <span className="resources-date">{resource.dateAdded}</span>

              <span
                className={`resources-status-pill${
                  resource.status === "Published" ? " is-published" : 
                  resource.status === "Internal Only" ? " is-internal" : " is-drafted"
                }`}
              >
                <StatusIcon />
                {resource.status}
              </span>

              <div className="resources-actions">
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Edit ${resource.title}`}
                  onClick={() => openEditModal(resource)}
                >
                  <EditIcon />
                </button>
                <button
                  type="button"
                  className="chapter-icon-btn"
                  aria-label={`Delete ${resource.title}`}
                  onClick={() => deleteResource(resource.id)}
                >
                  <TrashIcon />
                </button>
              </div>
            </article>
          ))}

          {visibleResources.length === 0 && (
            <div className="chapter-empty-state">
              <p>No resources match the current filters.</p>
            </div>
          )}
        </div>

        <div className="practice-footer resources-footer">
          <div className="practice-footer-left">
            <span>Showing</span>
            <button type="button" className="practice-page-size">
              10
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
            <span>from {visibleResources.length} data</span>
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
        </>
        ) : (
          <div className="resources-suggestion-view">
            <div className="chapter-table-card resources-table-card">
              <div className="resources-table-head suggestion-table-head">
                <span className="sortable-head">Suggested by</span>
                <span className="sortable-head">Title</span>
                <span className="sortable-head">Date</span>
                <span className="sortable-head">Category</span>
                <span>Action</span>
              </div>
              
              {mockSuggestions.map((suggestion) => (
                <article key={suggestion.id} className="resources-row suggestion-row">
                  <div className="suggestion-user-cell">
                    <div className="suggestion-avatar"></div>
                    <span>{suggestion.name}</span>
                  </div>
                  <div className="resources-title-cell">
                    <span className="resources-suggestion-title">{suggestion.title}</span>
                  </div>
                  <span className="resources-date">{suggestion.date}</span>
                  <span className="resources-category-pill">{suggestion.category}</span>
                  <div className="suggestion-actions">
                    <button type="button" className="suggestion-approve-btn" onClick={() => showToast("Suggestion Approved", "You have approve a resource suggestion")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Approve
                    </button>
                    <button type="button" className="suggestion-reject-btn" onClick={() => showToast("Suggestion Rejected", "You have reject a resource suggestion")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {toast && (
          <div className="resources-toast" role="status" aria-live="polite">
            <div className="resources-toast-header">
              <div className="resources-toast-copy">
                <div className="resources-toast-icon" aria-hidden="true">
                  <StatusIcon />
                </div>
                <div className="resources-toast-copy-text">
                  <strong>{toast.title}</strong>
                  <p>{toast.message}</p>
                </div>
              </div>

              <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="resources-modal-overlay" onClick={resetModalState}>
          <aside className="resources-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="resources-modal-header">
              <h2>{editingResourceId ? "Edit Content" : "Add Content"}</h2>

              <button
                type="button"
                className="chapter-drawer-close"
                aria-label="Close resource modal"
                onClick={resetModalState}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="resources-stepper">
              {RESOURCE_STEP_ITEMS.map((step) => {
                const isActive = resourceStep === step.id;
                const isComplete = resourceStep > step.id;
                const isClickable = step.id < resourceStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`resources-step${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}${
                      isClickable ? " is-clickable" : ""
                    }`}
                    onClick={() => {
                      if (isClickable) {
                        setResourceStep(step.id);
                      }
                    }}
                  >
                    <div className="resources-step-circle" aria-hidden="true">
                      {isComplete ? <StepCompleteIcon /> : step.id}
                    </div>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="resources-modal-body">
              {resourceStep === 1 && (
                <div className="resources-form-grid">
                  <div className="resources-field">
                    <span>Publication Type *</span>
                    <div className="resources-publication-types">
                      <button 
                        type="button" 
                        className={`resources-pub-btn${resourceForm.publicationType === "Published Resource" ? " is-active" : ""}`}
                        onClick={() => setResourceForm(c => ({...c, publicationType: "Published Resource"}))}
                      >
                        <ResourceVisualIcon type="document" />
                        Published Resource
                      </button>
                      <button 
                        type="button" 
                        className={`resources-pub-btn${resourceForm.publicationType === "Internal Asset" ? " is-active" : ""}`}
                        onClick={() => setResourceForm(c => ({...c, publicationType: "Internal Asset"}))}
                      >
                        <ResourceVisualIcon type="image" />
                        Internal Asset
                      </button>
                    </div>
                  </div>

                  <div className="resources-field">
                    <span>Content Title *</span>
                    <input
                      type="text"
                      placeholder="Enter content title"
                      value={resourceForm.title}
                      onChange={handleResourceFieldChange("title")}
                    />
                  </div>

                  <div className="resources-field">
                    <span>Category *</span>
                    <label className="chapter-select chapter-select-shell resources-select-shell">
                      <select value={resourceForm.category} onChange={handleResourceFieldChange("category")}>
                        <option value="">Select content category</option>
                        {RESOURCE_CATEGORY_OPTIONS.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDownIcon />
                    </label>
                  </div>

                  <div className="resources-field">
                    <span>Content Thumbnail *</span>

                    {resourceForm.thumbnail ? (
                      <FileCard
                        file={resourceForm.thumbnail}
                        type="image"
                        removeLabel="Remove thumbnail"
                        onRemove={removeThumbnail}
                      />
                    ) : (
                      <UploadBox
                        accept=".png,.jpg,.jpeg"
                        label="PNG, JPG"
                        helperText="2 MB"
                        onChange={handleThumbnailChange}
                        type="image"
                      />
                    )}
                  </div>
                </div>
              )}

              {resourceStep === 2 && (
                <div className="resources-form-grid">
                  <div className="resources-field">
                    <span>Content Type *</span>

                    <div className="resources-content-options">
                      {RESOURCE_CONTENT_TYPES.map((option) => {
                        const isActive = resourceForm.contentType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={`resources-content-card${isActive ? " is-active" : ""}`}
                            onClick={() =>
                              setResourceForm((current) => ({
                                ...current,
                                contentType: option.value,
                              }))
                            }
                          >
                            <ResourceVisualIcon type={option.icon} />
                            <span>{option.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {resourceForm.contentType === "Text" && (
                    <>
                      <div className="resources-language-tabs" aria-label="Content language tabs">
                        {RESOURCE_LANGUAGE_OPTIONS.map((language) => (
                          <button
                            key={language.id}
                            type="button"
                            className={`resources-language-tab${activeLanguage === language.id ? " is-active" : ""}`}
                            onClick={() => setActiveLanguage(language.id)}
                          >
                            {language.label}
                          </button>
                        ))}
                      </div>

                      <div className="resources-field">
                        <span>
                          Content ({activeLanguageLabel}
                          {activeLanguage === "en" ? " - Primary" : ""}) *
                        </span>
                        <textarea
                          rows="8"
                          placeholder={`Write content in ${activeLanguageLabel.toLowerCase()}...`}
                          value={resourceForm.contentTexts[activeLanguage]}
                          onChange={handleTextContentChange}
                        />
                      </div>
                    </>
                  )}

                  {resourceForm.contentType !== "Text" && (
                    <div className="resources-field">
                      <span>Upload File *</span>

                      {selectedContentFile ? (
                        <FileCard
                          file={selectedContentFile}
                          type={resourceForm.contentType.toLowerCase()}
                          removeLabel={`Remove ${resourceForm.contentType.toLowerCase()} file`}
                          onRemove={removeContentFile}
                        />
                      ) : (
                        <UploadBox
                          accept={
                            resourceForm.contentType === "Video" ? ".mp4" :
                            resourceForm.contentType === "Document" ? ".pdf" :
                            resourceForm.contentType === "Audio" ? ".mp3" :
                            ".png,.jpg,.jpeg"
                          }
                          label={
                            resourceForm.contentType === "Video" ? "MP4" :
                            resourceForm.contentType === "Document" ? "PDF" :
                            resourceForm.contentType === "Audio" ? "MP3" :
                            "PNG, JPG"
                          }
                          helperText={
                            resourceForm.contentType === "Video" ? "50 MB" :
                            resourceForm.contentType === "Document" ? "10 MB" :
                            resourceForm.contentType === "Audio" ? "10 MB" :
                            "2 MB"
                          }
                          onChange={handleContentFileChange}
                          type={resourceForm.contentType.toLowerCase()}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="resources-modal-footer">
              {resourceStep === 1 ? (
                <>
                  <button type="button" className="chapter-secondary-btn" onClick={resetModalState}>
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="chapter-primary-btn resources-primary-btn"
                    onClick={() => setResourceStep(2)}
                    disabled={!canContinue}
                  >
                    Continue
                    <ArrowRightIcon />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="chapter-secondary-btn" onClick={resetModalState}>
                    Cancel
                  </button>

                  <div className="resources-modal-actions">
                    <button type="button" className="resources-draft-btn" onClick={() => saveResource("Drafted")}>
                      <DraftIcon />
                      Save as Draft
                    </button>

                    <button
                      type="button"
                      className="chapter-primary-btn resources-primary-btn"
                      onClick={() => saveResource("Published")}
                      disabled={!canPublish}
                    >
                      Publish Now
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

export default ResourcesPage;
