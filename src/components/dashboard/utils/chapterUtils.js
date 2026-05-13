import { useState, useEffect } from "react";
import { API_URL, CHAPTERS_API_FALLBACKS } from "./apiConfig";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveChapterStatus(item) {
  const rawStatus = item.status ?? item.published ?? item.isPublished ?? item.is_published ?? item.drafted ?? item.isDrafted;

  if (rawStatus === true || rawStatus === 1 || rawStatus === "1") {
    return "Published";
  }
  if (rawStatus === false || rawStatus === 0 || rawStatus === "0") {
    return "Drafted";
  }

  const normalized = String(rawStatus ?? "").trim().toLowerCase();
  if (normalized === "drafted" || normalized === "draft" || normalized === "false") {
    return "Drafted";
  }
  if (normalized === "published" || normalized === "published" || normalized === "true" || normalized === "live") {
    return "Published";
  }

  return "Drafted";
}

export async function createChapter(chapterData) {
  const endpoints = CHAPTERS_API_FALLBACKS;

  let lastError = "Gagal membuat chapter";

  for (const endpoint of endpoints) {
    try {
      const data = { ...chapterData };
      if (data.summary) {
        data.description = data.summary;
        delete data.summary;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }

      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  try {
    throw new Error(lastError);
  } catch (error) {
    console.error("Error creating chapter:", error);
    throw error;
  }
}

export async function updateChapter(id, chapterData) {
  const encodedId = encodeURIComponent(String(id));
  const endpoints = CHAPTERS_API_FALLBACKS.map((endpoint) => `${String(endpoint).replace(/\/+$/, "")}/${encodedId}`);

  let lastError = "Gagal mengupdate chapter";

  for (const endpoint of endpoints) {
    try {
      const data = { ...chapterData };
      if (data.summary) {
        data.description = data.summary;
        delete data.summary;
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }

      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  try {
    throw new Error(lastError);
  } catch (error) {
    console.error("Error updating chapter:", error);
    throw error;
  }
}

export async function deleteChapter(id) {
  const encodedId = encodeURIComponent(String(id));
  const endpoints = CHAPTERS_API_FALLBACKS.map((endpoint) => `${String(endpoint).replace(/\/+$/, "")}/${encodedId}`);

  let lastError = "Gagal menghapus chapter";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }

      return data;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  try {
    throw new Error(lastError);
  } catch (error) {
    console.error("Error deleting chapter:", error);
    throw error;
  }
}

export async function toggleChapterStatus(id) {
  const encodedId = encodeURIComponent(String(id));
  const endpoints = CHAPTERS_API_FALLBACKS.map((endpoint) =>
    `${String(endpoint).replace(/\/+$/, "")}/${encodedId}/toggle-status`
  );

  let lastError = "Gagal mengubah status chapter";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
      });

      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Endpoint tidak ditemukan"}`;
        continue;
      }

      return data;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  try {
    throw new Error(lastError);
  } catch (error) {
    console.error("Error toggling chapter status:", error);
    throw error;
  }
}

export function normalizeChapter(item) {
  const idRaw = item.id ?? item._id ?? item.chapterId ?? item.chapter_id ?? item.uuid;
  const id = idRaw ?? `${item.title || "chapter"}-${Math.random().toString(36).slice(2, 8)}`;

  const sectionsRaw = item.sections ?? item.sectionCount ?? item.section_count ?? item.sectionsCount ?? 0;
  const sections = typeof sectionsRaw === "number" ? sectionsRaw : parseInt(String(sectionsRaw), 10) || 0;

  const status = resolveChapterStatus(item);

  return {
    id,
    apiId: idRaw ?? null,
    title: item.title || item.name || "-",
    summary: item.summary || item.description || item.brief || "-",
    sections,
    status,
    thumbnail: item.thumbnail || item.thumbnailUrl || item.thumbnail_url || null,
    createdAt: item.createdAt || item.created_at || null,
    updatedAt: item.updatedAt || item.updated_at || null,
  };
}

export function useChaptersCollection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadChapters() {
      setIsLoading(true);
      setError("");

      let lastError = "";
      try {
        let payload = null;
        for (const endpoint of CHAPTERS_API_FALLBACKS) {
          try {
            console.debug("[chapters] fetching endpoint:", endpoint);
            const response = await fetch(endpoint, { signal: controller.signal });
            console.debug("[chapters] response status:", response.status, "ok:", response.ok, "url:", response.url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            payload = await response.json();
            break;
          } catch (endpointError) {
            if (endpointError.name === "AbortError") {
              throw endpointError;
            }
            console.error("[chapters] endpoint failed:", endpoint, endpointError);
            lastError = endpointError.message || "Unknown error";
          }
        }

        if (!payload) {
          throw new Error(lastError || "All endpoints failed");
        }

        const rawRows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.chapters)
          ? payload.chapters
          : [];
        const normalizedRows = rawRows.map(normalizeChapter);
        setRows(normalizedRows);
      } catch (err) {
        if (err.name !== "AbortError") {
          setRows([]);
          setError(`Gagal ambil data chapters dari API. Detail: ${err.message || "Unknown error"}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadChapters();

    return () => {
      controller.abort();
    };
  }, []);

  return { rows, isLoading, error };
}
