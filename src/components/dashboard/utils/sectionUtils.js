import { getSectionsApiFallbacks } from "./apiConfig";

async function parseJsonSafely(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function normalizeSection(item) {
  const id = item.id ?? item._id ?? item.sectionId ?? item.section_id ?? null;
  const order = item.section_order ?? item.sectionOrder ?? item.order ?? 0;

  const rawType = String(item.type || item.sectionType || "Text").trim();
  const type = ["Text", "Video", "Audio"].includes(rawType) ? rawType : "Text";

  const rawStatus = String(item.status || "Drafted").trim();
  const status = rawStatus === "Published" ? "Published" : "Drafted";

  return {
    id,
    chapterId: item.chapter_id ?? item.chapterId ?? null,
    order,
    title: item.title || item.name || "-",
    description: item.description || "",
    content: item.content || "",
    contents: Array.isArray(item.contents) ? item.contents : [],
    type,
    status,
    createdAt: item.createdAt || item.created_at || null,
  };
}

export async function fetchSectionsByChapter(chapterId) {
  const endpoints = getSectionsApiFallbacks(chapterId);

  let lastError = "Gagal mengambil sections";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Endpoint error"}`;
        continue;
      }

      const rawSections = Array.isArray(data)
        ? data
        : Array.isArray(data?.sections)
        ? data.sections
        : Array.isArray(data?.data)
        ? data.data
        : [];

      return rawSections.map(normalizeSection);
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  throw new Error(lastError);
}

export async function createSection(chapterId, sectionData) {
  const endpoints = getSectionsApiFallbacks(chapterId);

  let lastError = "Gagal membuat section";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      const result = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${result?.message || "Error"}`;
        continue;
      }

      return result;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  throw new Error(lastError);
}

export async function deleteSection(chapterId, sectionId) {
  const endpoints = getSectionsApiFallbacks(chapterId).map(
    (ep) => `${ep}/${encodeURIComponent(sectionId)}`
  );

  let lastError = "Gagal menghapus section";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Error"}`;
        continue;
      }

      return data;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  throw new Error(lastError);
}

export async function toggleSectionStatus(chapterId, sectionId) {
  const endpoints = getSectionsApiFallbacks(chapterId).map(
    (ep) => `${ep}/${encodeURIComponent(sectionId)}/toggle-status`
  );

  let lastError = "Gagal mengubah status section";

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: "PATCH" });
      const data = await parseJsonSafely(response);

      if (!response.ok) {
        lastError = `${response.status} ${data?.message || "Error"}`;
        continue;
      }

      return data;
    } catch (error) {
      lastError = error.message || "Network error";
    }
  }

  throw new Error(lastError);
}
