import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MediaLibraryPage from "./MediaLibraryPage";
import RolesPermissionsPageView from "./RolesPermissionsPage";
import ResourcesPage from "./ResourcesPage";
import SidebarNav from "./SidebarNav";
import { sidebarMainItems } from "./sidebarItems";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const USERS_API_URL = import.meta.env.VITE_USERS_API_URL || "http://72.61.143.83/api/users";
const USERS_API_FALLBACKS = Array.from(
  new Set([
    USERS_API_URL,
    `${API_BASE_URL}/users`,
    "http://72.61.143.83/api/users",
    "http://72.61.143.83:3002/users",
  ])
);
const EURO = "\u20AC";

const fallbackChapterRows = [
  {
    id: 1,
    title: "Chapter 1 - The Present Moment",
    summary: "Introduction to presence and awareness",
    sections: 5,
    status: "Published",
  },
  {
    id: 2,
    title: "Chapter 2 - The Ego and Identity",
    summary: "Understanding the thinking mind",
    sections: 6,
    status: "Published",
  },
  {
    id: 3,
    title: "Chapter 3 - The Awakened Mind",
    summary: "Moving beyond conditioned thought",
    sections: 7,
    status: "Published",
  },
  {
    id: 4,
    title: "Chapter 4 - Inner Body Awareness",
    summary: "Connecting with the energetic body",
    sections: 5,
    status: "Published",
  },
  {
    id: 5,
    title: "Chapter 5 - The Unmanifested",
    summary: "Exploring pure consciousness",
    sections: 4,
    status: "Published",
  },
  {
    id: 6,
    title: "Chapter 6 - Enlightened Relationships",
    summary: "Consciousness in connection",
    sections: 6,
    status: "Drafted",
  },
  {
    id: 7,
    title: "Chapter 7 - Beyond Time",
    summary: "Integration and transcendence",
    sections: 3,
    status: "Drafted",
  },
];

const fallbackRoleRows = [
  { roleName: "Super Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: false },
  { roleName: "General Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Book Author", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Community Admin", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
];

const overviewMetrics = [
  {
    label: "Total Users",
    value: "4821 user",
    chip: "+ 5 user",
    note: "vs last month",
  },
  {
    label: "Total Donations (All Time)",
    value: `${EURO}24,249.24`,
    chip: "\u2191 8%",
    note: "overall growth",
  },
  {
    label: "Donation This Month",
    value: `${EURO}4,249.21`,
    chip: "\u2191 5%",
    note: "vs last month",
  },
  {
    label: "Avg. Donation Amount",
    value: `${EURO}49.20`,
    chip: "\u2191 5.6%",
    note: "vs last month",
  },
];

const popularContent = [
  {
    label: "Top Chapter",
    title: "Chapter 3 - Managing Stress & Emotions",
    meta: "2,340 completions",
    progress: 67,
  },
  {
    label: "Top Session",
    title: "Being Present in Daily Activities",
    meta: "1,892 completions",
    progress: 63,
  },
  {
    label: "Top Practice",
    title: "Box Breathing Technique",
    meta: "1,540 completions",
    progress: 58,
  },
  {
    label: "Top Resource",
    title: "The Power of Now - Tolle",
    meta: "987 views",
    progress: 61,
  },
];

const notesMetrics = [
  {
    label: "Total Notes (All Time)",
    value: "1204",
    chip: "+ 34 notes",
    note: "vs last week",
  },
  {
    label: "Total Bookmarks (All Time)",
    value: "358",
    chip: "+ 14 bookmarks",
    note: "vs last week",
  },
  {
    label: "Most Tagged Category (All Time)",
    value: "Awareness",
    chip: "52 times",
    note: "total tagged",
  },
];

const chapterCompletion = [
  { label: "Chapter 1", value: 94 },
  { label: "Chapter 2", value: 81 },
  { label: "Chapter 3", value: 72 },
  { label: "Chapter 4", value: 53 },
  { label: "Chapter 5", value: 38 },
  { label: "Chapter 6", value: 21 },
  { label: "Chapter 7", value: 9 },
];

const recentDonations = [
  { name: "Adam Coles", date: "20 Jan 2026", amount: `${EURO}998.20` },
  { name: "Ashley Williams", date: "19 Jan 2026", amount: `${EURO}825.40` },
  { name: "Barry Allen", date: "18 Jan 2026", amount: `${EURO}748.50` },
  { name: "Bella Thorne", date: "17 Jan 2026", amount: `${EURO}624.10` },
  { name: "Camila Cabello", date: "16 Jan 2026", amount: `${EURO}535.87` },
];

const topSupporters = [
  { name: "Adam Coles", amount: `${EURO}998.20` },
  { name: "Ashley Williams", amount: `${EURO}825.40` },
  { name: "Barry Allen", amount: `${EURO}748.50` },
  { name: "Bella Thorne", amount: `${EURO}624.10` },
  { name: "Camila Cabello", amount: `${EURO}535.87` },
];

const communityOverview = [
  { label: "Total Discussion", value: "1024" },
  { label: "Reported & Pending", value: "7 pending" },
  { label: "Hidden Message", value: "23" },
  { label: "Active Categories", value: "9" },
];

const discussionCategories = [
  { label: "Chapter 3", value: 96 },
  { label: "Meditation", value: 82 },
  { label: "Breathwork", value: 73 },
  { label: "Chapter 1", value: 56 },
  { label: "Grounding", value: 48 },
  { label: "Sleep", value: 48 },
  { label: "Chapter 2", value: 48 },
];

const activityLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const activeUsersSeries = [44, 58, 49, 39, 53, 67, 82];
const newRegistrationsSeries = [7, 10, 14, 6, 11, 8, 16];
const contentModes = [
  { label: "Text (AI Voices)", value: 68, tone: "primary" },
  { label: "Video", value: 32, tone: "secondary" },
];

const chapterStepItems = [
  { id: 1, label: "Chapter Info" },
  { id: 2, label: "Add Section" },
  { id: 3, label: "Review & Publish" },
];

const initialChapterForm = {
  title: "",
  description: "",
  thumbnailName: "",
  sectionTitle: "",
  sectionDescription: "",
  sectionType: "Text",
};

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

const userManagementMetrics = [
  {
    label: "Total Registered",
    value: "4821 user",
    chip: "+ 5 user",
    note: "vs last month",
  },
  {
    label: "Community Supporters",
    value: "1204",
    chip: "25%",
    note: "of users",
  },
  {
    label: "Active Last Day",
    value: "2,341",
    chip: "\u2191 5%",
    note: "vs last week",
  },
];

const communityMetricCards = [
  { label: "Pending Reports", value: "7 pending", chip: "+ 2 reports", note: "vs last week" },
  { label: "Total Discussions", value: "1204", chip: "+ 34 discussion", note: "vs last week" },
  { label: "Hidden Message", value: "23", chip: "+ 2", note: "vs last week" },
];

const initialCommunityDiscussions = [
  {
    id: 1,
    author: "Marie Laura",
    date: "21 Feb 2026",
    time: "08:52",
    title:
      "How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I keep getting pulled back into reactive thinking. Has anyone found a practical method that works alongside the audio sessions?",
    preview:
      "How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I keep...",
    category: "Breathing",
    resonatedAmount: "83.571",
    hidden: false,
    thread: [
      {
        id: "1-a",
        author: "Andi Kurniawan",
        date: "21 Feb 2026",
        time: "09:05",
        body:
          "How do we silence the ego in daily life? I've been trying to apply Chapter 3 but I keep getting pulled back into reactive thinking. Has anyone found a practical method that works alongside the audio sessions?",
      },
      {
        id: "1-b",
        author: "Anonymous User",
        date: "21 Feb 2026",
        time: "09:14",
        body:
          "You clearly haven't understood anything if you believe that. People like you don't belong here.",
        tag: "Reported: Harassment",
      },
      {
        id: "1-c",
        author: "Sofia Bauer",
        date: "21 Feb 2026",
        time: "09:05",
        body:
          "Section B of Chapter 3 really helped me. Listening in audio mode during my commute made it feel more embodied. The voice pacing in German was perfect.",
      },
    ],
  },
  {
    id: 2,
    author: "Marcus Chen",
    date: "21 Feb 2026",
    time: "09:14",
    title:
      "Has anyone tried the 4-7-8 breathing technique before bed? I've been struggling with late-night anxiety and wondering if this practice actually helps long term.",
    preview: "Has anyone tried the 4-7-8 breathing technique before bed? I've been struggling with...",
    category: "Breathing",
    resonatedAmount: "283.571",
    hidden: false,
    thread: [],
  },
  {
    id: 3,
    author: "Elena Rodriguez",
    date: "21 Feb 2026",
    time: "09:14",
    title:
      "I realized today how often I eat while looking at my phone. Taking 10 minutes to just notice my food felt surprisingly grounding.",
    preview:
      "I realized today how often I eat while looking at my phone. Taking 10 minutes to just notice...",
    category: "Mindful Eating",
    resonatedAmount: "328.733",
    hidden: false,
    thread: [],
  },
  {
    id: 4,
    author: "David Kim",
    date: "21 Feb 2026",
    time: "09:05",
    title:
      "Feeling a bit overwhelmed with deadlines. Taking a 5-minute 'micro-break' to focus on the breath has helped more than I expected.",
    preview:
      "Feeling a bit overwhelmed with deadlines. Taking a 5-minute 'micro-break' to focus on...",
    category: "Focus & Clarity",
    resonatedAmount: "21.024",
    hidden: false,
    thread: [],
  },
  {
    id: 5,
    author: "David Miller",
    date: "21 Feb 2026",
    time: "09:05",
    title:
      "It definitely helps! Pro tip: make sure your tongue is resting against the ridge of tissue just behind your upper front teeth while breathing.",
    preview: "It definitely helps! Pro tip: make sure your tongue is resting against the ridge of tissue j...",
    category: "Guided Meditation",
    resonatedAmount: "35.093",
    hidden: false,
    thread: [],
  },
];

const initialReportedDiscussions = [
  {
    id: "report-1",
    discussionId: 1,
    content: "You clearly haven't understood anything if you believe that. People like you don't belong here.",
    date: "21 Feb 2026",
    time: "09:14",
    category: "Breathing",
    reportedBy: "Marie Laura",
    tag: "Harassment",
  },
  {
    id: "report-2",
    discussionId: 2,
    content: "Check out my meditation app - link in bio! 100% results in 7 days!",
    date: "21 Feb 2026",
    time: "09:14",
    category: "Breathing",
    reportedBy: "Andi Kim",
    tag: "Harassment",
  },
];

const initialCommunityCategories = [
  { id: 1, name: "Anxiety Relief", taggedAmount: "2 discussion" },
  { id: 2, name: "Breathing", taggedAmount: "2 discussion" },
  { id: 3, name: "Daily Gratitude", taggedAmount: "1 discussion" },
  { id: 4, name: "Emotional Health", taggedAmount: "1 discussion" },
  { id: 5, name: "Focus & Clarity", taggedAmount: "2 discussion" },
  { id: 6, name: "Guided Meditation", taggedAmount: "2 discussion" },
  { id: 7, name: "Mindful Eating", taggedAmount: "2 discussion" },
  { id: 8, name: "Work-life balance", taggedAmount: "1 discussion" },
];

const notesBookmarkMetrics = [
  { label: "Total Notes (All Time)", value: "1204", chip: "+ 34 notes", note: "vs last week" },
  { label: "Total Bookmarks (All Time)", value: "358", chip: "+ 14 bookmarks", note: "vs last week" },
  { label: "Most Tagged Category (All Time)", value: "Awareness", chip: "52 times", note: "total tagged" },
];

const initialNotesRows = [
  {
    id: 1,
    title: "Embracing Change: The Need for Adaptability and Innovation in Today's World",
    author: "Marie Laura",
    date: "21 Feb 2026",
    section: "Section 2",
    chapterSection: "Chapter 1, Section 2",
    tags: [
      { label: "Personal Reflection", tone: "green" },
      { label: "Awareness", tone: "yellow" },
    ],
    content:
      "In today's fast-paced world, our modern environment demands high levels of adaptability and innovation to keep pace with rapid technological advancements and changing consumer needs. Companies must embrace a culture of continuous improvement, where creativity and flexibility are at the forefront of their strategies.\n\nThis involves not only adopting new technologies but also fostering an agile mindset among employees. By encouraging collaboration and open communication, organizations can better respond to market shifts and customer feedback. Ultimately, those who prioritize innovation will thrive, turning challenges into opportunities and ensuring long-term success in an ever-evolving landscape.",
  },
  {
    id: 2,
    title: "The Power of Mindfulness: Embracing the Present Moment",
    author: "Marcus Chen",
    date: "21 Feb 2026",
    section: "Section 1",
    chapterSection: "Chapter 1, Section 1",
    tags: [{ label: "Key Concept", tone: "purple" }],
    content:
      "Mindfulness invites us to return to the present moment. Noticing breath, body, and thoughts without judgment can soften mental noise and create space for clarity.",
  },
  {
    id: 3,
    title: "The Power of Mindful Eating: A 10-Minute Transformation",
    author: "Elena Rodriguez",
    date: "21 Feb 2026",
    section: "Section 3",
    chapterSection: "Chapter 2, Section 3",
    tags: [
      { label: "Awareness", tone: "yellow" },
      { label: "Scientific Evidence", tone: "violet" },
    ],
    content:
      "A brief pause before eating can transform an automatic routine into a grounded ritual. Taste, texture, and pace become anchors for awareness.",
  },
  {
    id: 4,
    title: "Finding Calm: The Power of Mindful Breathing Amidst Deadlines",
    author: "David Kim",
    date: "21 Feb 2026",
    section: "Section 2",
    chapterSection: "Chapter 2, Section 2",
    tags: [
      { label: "Question", tone: "gold" },
      { label: "Key Concept", tone: "purple" },
    ],
    content:
      "Short breathing resets can interrupt stress cycles during demanding work periods. Even a few conscious breaths can restore regulation and focus.",
  },
  {
    id: 5,
    title: "Maximize Your Breathing Technique: A Quick Tip",
    author: "David Miller",
    date: "21 Feb 2026",
    section: "Section 6",
    chapterSection: "Chapter 4, Section 6",
    tags: [{ label: "Scientific Evidence", tone: "violet" }],
    content:
      "Extending the exhale slightly longer than the inhale often supports a calmer nervous system. This subtle shift can improve the effectiveness of breath practice.",
  },
];

const initialBookmarkRows = [
  {
    id: 1,
    sentence:
      "In a world that constantly evolves, cultivating a mindset of adaptability and innovation is essential for personal growth and harmony.",
    chapterSection: "Chapter 1, Section 2",
    bookmarksAmount: "125 user",
    category: "Awareness",
  },
  {
    id: 2,
    sentence: "Finding peace within chaos is the true essence of mindfulness.",
    chapterSection: "Chapter 1, Section 1",
    bookmarksAmount: "524 user",
    category: "Key Concept",
  },
  {
    id: 3,
    sentence: "Finding tranquility in the chaos of life can be achieved through simple moments of reflection.",
    chapterSection: "Chapter 2, Section 3",
    bookmarksAmount: "47 user",
    category: "Scientific Evidence",
  },
  {
    id: 4,
    sentence: "Finding peace in the chaos of everyday life can transform your perspective.",
    chapterSection: "Chapter 2, Section 2",
    bookmarksAmount: "375 user",
    category: "Question",
  },
  {
    id: 5,
    sentence: "Embracing the present moment can lead to profound insights and a deeper connection with ourselves.",
    chapterSection: "Chapter 4, Section 6",
    bookmarksAmount: "65 user",
    category: "Personal Reflection",
  },
];

const initialNotesCategories = [
  { id: 1, name: "Awareness", tone: "yellow", taggedAmount: "2 discussion" },
  { id: 2, name: "Key Concept", tone: "purple", taggedAmount: "2 discussion" },
  { id: 3, name: "Personal Reflection", tone: "green", taggedAmount: "1 discussion" },
  { id: 4, name: "Scientific Evidence", tone: "violet", taggedAmount: "1 discussion" },
  { id: 5, name: "Question", tone: "gold", taggedAmount: "2 discussion" },
];

const notesCategoryToneCycle = ["yellow", "purple", "green", "violet", "gold"];

function normalizeUser(item) {
  const idRaw = item.id ?? item.userId ?? item.user_id ?? item.uuid;
  const id = idRaw ?? `${item.email || item.name || "user"}-${Math.random().toString(36).slice(2, 8)}`;
  const languageDetail = String(item.languageDetail || item.language_detail || item.language || "English");
  const languageCode = languageDetail.slice(0, 2).toUpperCase() || "EN";
  const biometricRaw = item.biometric ?? item.biometricEnabled ?? item.biometric_enabled;
  const biometric = biometricRaw === true || biometricRaw === "On" ? "On" : "Off";

  const donationRaw = item.donation ?? item.donationAmount ?? item.donation_amount ?? item.amount;
  const donation =
    donationRaw === null || donationRaw === undefined || donationRaw === ""
      ? "-"
      : typeof donationRaw === "number"
      ? `$${donationRaw.toFixed(2)}`
      : String(donationRaw);

  const statusRaw = item.status ?? item.accountStatus ?? item.account_status;
  const status = String(statusRaw || "Active").toLowerCase() === "inactive" ? "Inactive" : "Active";
  const registeredRaw = item.registered ?? item.createdAt ?? item.created_at;
  const registeredDate = registeredRaw ? new Date(registeredRaw) : null;
  const registered =
    registeredDate && !Number.isNaN(registeredDate.getTime())
      ? registeredDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : "-";

  const lastLoginRaw = item.lastLogin || item.last_login || item.lastActive || item.last_active || item.updated_at || item.created_at;
  const lastLoginDate = lastLoginRaw ? new Date(lastLoginRaw) : null;
  const lastActiveDetail =
    lastLoginDate && !Number.isNaN(lastLoginDate.getTime())
      ? lastLoginDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      : String(lastLoginRaw || "-");

  const chaptersCompletedRaw =
    item.chaptersCompleted ?? item.chapters_completed ?? item.completedChapters ?? item.completed_chapters;
  const chaptersCompleted = chaptersCompletedRaw ? String(chaptersCompletedRaw) : "-";

  return {
    id,
    name: item.name || item.fullName || "-",
    email: item.email || "-",
    language: languageCode,
    languageDetail,
    biometric,
    donationAmount: donation,
    lastActive: lastActiveDetail,
    lastActiveDetail,
    status,
    registered,
    chaptersCompleted,
  };
}

function useUsersCollection() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      let lastError = "";
      try {
        let payload = null;
        for (const endpoint of USERS_API_FALLBACKS) {
          try {
            console.debug("[users] fetching endpoint:", endpoint);
            const response = await fetch(endpoint, { signal: controller.signal });
            console.debug("[users] response status:", response.status, "ok:", response.ok, "url:", response.url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            payload = await response.json();
            break;
          } catch (endpointError) {
            if (endpointError.name === "AbortError") {
              throw endpointError;
            }
            console.error("[users] endpoint failed:", endpoint, endpointError);
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
          : Array.isArray(payload?.users)
          ? payload.users
          : [];
        const normalizedRows = rawRows.map(normalizeUser);
        setRows(normalizedRows);
      } catch (err) {
        if (err.name !== "AbortError") {
          setRows([]);
          setError(`Gagal ambil data users dari API. Detail: ${err.message || "Unknown error"}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      controller.abort();
    };
  }, []);

  return { rows, isLoading, error };
}

function UserAvatar() {
  return (
    <span className="mini-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="3.1" />
        <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      </svg>
    </span>
  );
}

function buildChartPoints(values, width, height, padding, maxValue) {
  if (values.length === 0) {
    return [];
  }

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const stepX = values.length === 1 ? 0 : innerWidth / (values.length - 1);

  return values.map((value, index) => {
    const x = padding + stepX * index;
    const y = height - padding - (value / maxValue) * innerHeight;
    return { x, y };
  });
}

function pointsToPath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function pointsToArea(points, height, padding) {
  if (points.length === 0) {
    return "";
  }

  const linePath = pointsToPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`;
}

function ActivityChart({ labels, primaryValues, secondaryValues }) {
  const width = 660;
  const height = 250;
  const padding = 18;
  const maxValue = Math.max(...primaryValues, ...secondaryValues) * 1.15;
  const primaryPoints = buildChartPoints(primaryValues, width, height, padding, maxValue);
  const secondaryPoints = buildChartPoints(secondaryValues, width, height, padding, maxValue);
  const innerWidth = width - padding * 2;

  return (
    <div className="activity-chart">
      <svg className="activity-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="User activity chart">
        {labels.map((label, index) => {
          const x = labels.length === 1 ? width / 2 : padding + (innerWidth / (labels.length - 1)) * index;
          return <line key={label} x1={x} y1={padding} x2={x} y2={height - padding} className="chart-grid-line" />;
        })}

        <path d={pointsToArea(primaryPoints, height, padding)} className="chart-area" />
        <path d={pointsToPath(primaryPoints)} className="chart-line chart-line-primary" />
        <path d={pointsToPath(secondaryPoints)} className="chart-line chart-line-secondary" />
      </svg>

      <div className="chart-labels">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="chart-legend">
        <span>
          <i className="legend-dot legend-dot-primary" />
          Active Users
        </span>
        <span>
          <i className="legend-dot legend-dot-secondary" />
          New Registrations
        </span>
      </div>
    </div>
  );
}

function DonutChart({ items }) {
  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="donut-chart-shell">
      <svg className="donut-chart" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Content mode preference chart">
        <circle
          className="donut-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {items.map((item) => {
            const dashLength = (item.value / 100) * circumference;
            const segment = (
              <circle
                key={item.label}
                className={`donut-segment donut-segment-${item.tone}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={-offset}
              />
            );

            offset += dashLength;
            return segment;
          })}
        </g>
      </svg>

      <div className="donut-legend">
        {items.map((item) => (
          <span key={item.label}>
            <i className={`legend-dot legend-dot-${item.tone}`} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <>
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, Adrian! {"\u2022"} Tue, 14 Jan 2026
        </p>
      </header>

      <div className="overview-content">
        <section className="dashboard-section">
          <h2 className="section-title">Key Metrics</h2>
          <div className="metric-grid">
            {overviewMetrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <p className="metric-card-label">{metric.label}</p>
                <h3 className="metric-card-value">{metric.value}</h3>
                <div className="metric-meta">
                  <span className="metric-pill">{metric.chip}</span>
                  <span className="metric-note">{metric.note}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Most Popular Content</h2>
          <div className="popular-grid">
            {popularContent.map((item) => (
              <article key={item.label} className="popular-card">
                <p className="popular-card-label">{item.label}</p>
                <h3 className="popular-card-title">{item.title}</h3>
                <p className="popular-card-meta">{item.meta}</p>
                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${item.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">User Activity</h2>
          <div className="analytics-grid">
            <article className="panel-card panel-card-wide">
              <div className="panel-card-header">
                <div>
                  <h3 className="panel-card-title">Active Users &amp; New Registrations</h3>
                  <p className="panel-card-subtitle">Toggle to change time range</p>
                </div>
                <button type="button" className="panel-chip">
                  Weekly
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m7 10 5 5 5-5" />
                  </svg>
                </button>
              </div>

              <ActivityChart
                labels={activityLabels}
                primaryValues={activeUsersSeries}
                secondaryValues={newRegistrationsSeries}
              />
            </article>

            <article className="panel-card">
              <div>
                <h3 className="panel-card-title">Content Mode Preference</h3>
                <p className="panel-card-subtitle">How users consume content</p>
              </div>

              <DonutChart items={contentModes} />
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Notes &amp; Bookmarks</h2>
          <div className="notes-grid">
            {notesMetrics.map((metric) => (
              <article key={metric.label} className="metric-card">
                <p className="metric-card-label">{metric.label}</p>
                <h3 className="metric-card-value">{metric.value}</h3>
                <div className="metric-meta">
                  <span className="metric-pill">{metric.chip}</span>
                  <span className="metric-note">{metric.note}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Engagement &amp; Donations</h2>
          <div className="engagement-grid">
            <article className="panel-card engagement-card completion-card">
              <div>
                <h3 className="panel-card-title">Chapter Completion Rate</h3>
                <p className="panel-card-subtitle">Chapters completion percentage rate</p>
              </div>

              <div className="progress-list completion-list">
                {chapterCompletion.map((item) => (
                  <div key={item.label} className="progress-row completion-row">
                    <span className="completion-label">{item.label}</span>
                    <div className="progress-track completion-track" aria-hidden="true">
                      <div className="progress-fill completion-fill" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="completion-value">{item.value}%</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card engagement-card donation-card">
              <div>
                <h3 className="panel-card-title">Recent Donations</h3>
                <p className="panel-card-subtitle">Latest contributions</p>
              </div>

              <div className="donation-table donation-table-card">
                <div className="donation-header">
                  <span>Supporter</span>
                  <span>Date</span>
                  <span>Amount</span>
                </div>

                {recentDonations.map((row) => (
                  <div key={`${row.name}-${row.date}`} className="donation-row donation-entry">
                    <div className="person-cell donation-person">
                      <UserAvatar />
                      <div className="person-copy donation-person-copy">
                        <strong>{row.name}</strong>
                        <span className="person-date-mobile">{row.date}</span>
                      </div>
                    </div>
                    <span className="person-date">{row.date}</span>
                    <span className="person-amount">{row.amount}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card engagement-card supporters-card">
              <div>
                <h3 className="panel-card-title">Top Supporters</h3>
                <p className="panel-card-subtitle">Ranked by total contribution</p>
              </div>

              <div className="supporter-list supporters-stack">
                {topSupporters.map((supporter, index) => (
                  <div key={supporter.name} className="supporter-item">
                    <span className="supporter-rank">{index + 1}</span>
                    <UserAvatar />
                    <div className="person-copy supporter-copy">
                      <strong>{supporter.name}</strong>
                    </div>
                    <span className="supporter-amount">{supporter.amount}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Community</h2>
          <div className="community-grid">
            <article className="panel-card">
              <div>
                <h3 className="panel-card-title">Community Overview</h3>
                <p className="panel-card-subtitle">Discussion &amp; moderation</p>
              </div>

              <div className="overview-mini-grid">
                {communityOverview.map((item) => (
                  <article key={item.label} className="overview-mini-card">
                    <p>{item.label}</p>
                    <h4>{item.value}</h4>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div>
                <h3 className="panel-card-title">Most Active Discussion Categories</h3>
                <p className="panel-card-subtitle">Ranked by posts &amp; replies</p>
              </div>

              <div className="progress-list">
                {discussionCategories.map((item) => (
                  <div key={item.label} className="progress-row">
                    <span>{item.label}</span>
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </>
  );
}

function ChapterManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [chapterRows, setChapterRows] = useState(fallbackChapterRows);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chapterStep, setChapterStep] = useState(1);
  const [chapterForm, setChapterForm] = useState(initialChapterForm);

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

  const filteredChapterRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return chapterRows.filter((chapter) => {
      const matchesQuery =
        normalizedQuery === "" ||
        chapter.title.toLowerCase().includes(normalizedQuery) ||
        chapter.summary.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === "All Status" || chapter.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [chapterRows, searchQuery, statusFilter]);

  const closeChapterDrawer = () => {
    setIsDrawerOpen(false);
    setChapterStep(1);
    setChapterForm(initialChapterForm);
  };

  const handleChapterFieldChange = (field) => (event) => {
    setChapterForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleThumbnailChange = (event) => {
    const nextFile = event.target.files?.[0];

    setChapterForm((current) => ({
      ...current,
      thumbnailName: nextFile ? nextFile.name : "",
    }));
  };

  const canContinue =
    chapterStep === 1
      ? chapterForm.title.trim() !== "" && chapterForm.description.trim() !== ""
      : chapterStep === 2
      ? chapterForm.sectionTitle.trim() !== "" && chapterForm.sectionDescription.trim() !== ""
      : true;

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }

    if (chapterStep < 3) {
      setChapterStep((current) => current + 1);
      return;
    }

    setChapterRows((current) => {
      const nextChapterNumber = current.length + 1;
      const normalizedTitle = chapterForm.title.trim();
      const hasChapterPrefix = /^chapter\s+\d+/i.test(normalizedTitle);

      return [
        ...current,
        {
          id: nextChapterNumber,
          title: hasChapterPrefix ? normalizedTitle : `Chapter ${nextChapterNumber} - ${normalizedTitle}`,
          summary: chapterForm.description.trim(),
          sections: 1,
          status: "Drafted",
        },
      ];
    });

    closeChapterDrawer();
  };

  const footerButtonLabel = chapterStep === 3 ? "Publish" : "Continue";

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Chapter Management</h1>
        <p>Organize the chapters and sections of your book</p>
      </header>

      <section className="chapter-page chapter-management-page">
        <div className="chapter-toolbar">
          <div className="chapter-filters">
            <label className="chapter-search" aria-label="Search chapters">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="chapter-select chapter-select-shell">
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

          <button type="button" className="chapter-add-btn" onClick={() => setIsDrawerOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Chapter
          </button>
        </div>

        <div className="chapter-table-card">
          <div className="chapter-table-head chapter-table-head-redesign">
            <span>No</span>
            <span className="sortable-head">
              Chapter Name
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

          {filteredChapterRows.map((chapter) => (
            <article key={chapter.id} className="chapter-row chapter-row-redesign">
              <div className="chapter-order-cell">
                <button type="button" className="chapter-drag-btn" aria-label={`Move ${chapter.title}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="8" cy="7" r="1.5" />
                    <circle cx="16" cy="7" r="1.5" />
                    <circle cx="8" cy="12" r="1.5" />
                    <circle cx="16" cy="12" r="1.5" />
                    <circle cx="8" cy="17" r="1.5" />
                    <circle cx="16" cy="17" r="1.5" />
                  </svg>
                </button>
                <span className="chapter-order-number">{chapter.id}</span>
              </div>

              <div className="chapter-main-cell chapter-main-cell-redesign">
                <div className="chapter-thumb" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="8" cy="8" r="2" />
                    <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                  </svg>
                </div>
                <div className="chapter-copy">
                  <h3>{chapter.title}</h3>
                  <p>
                    {chapter.summary} {"\u2022"} {chapter.sections} sections
                  </p>
                </div>
              </div>

              <div className={`chapter-status chapter-status-pill chapter-status-${chapter.status.toLowerCase()}`}>
                <i aria-hidden="true" />
                <span>{chapter.status}</span>
              </div>

              <div className="chapter-actions">
                <button type="button" className="chapter-view-btn">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                  View Sections
                </button>

                <button type="button" className="chapter-icon-btn" aria-label={`Edit ${chapter.title}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                  </svg>
                </button>

                <button type="button" className="chapter-icon-btn" aria-label={`Delete ${chapter.title}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                  </svg>
                </button>
              </div>
            </article>
          ))}

          {filteredChapterRows.length === 0 && (
            <div className="chapter-empty-state">
              <p>No chapters match the current filter.</p>
            </div>
          )}
        </div>
      </section>

      {isDrawerOpen && (
        <div className="chapter-drawer-overlay" onClick={closeChapterDrawer}>
          <aside className="chapter-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="chapter-drawer-header">
              <div>
                <h2>Add Chapter</h2>
                <p>Step through to set up chapter and first section</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close add chapter form" onClick={closeChapterDrawer}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="chapter-stepper">
              {chapterStepItems.map((step) => {
                const isActive = chapterStep === step.id;
                const isComplete = chapterStep > step.id;

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
              {chapterStep === 1 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Chapter Title *</span>
                    <input
                      type="text"
                      placeholder="Enter section name"
                      value={chapterForm.title}
                      onChange={handleChapterFieldChange("title")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Short Description *</span>
                    <input
                      type="text"
                      placeholder="Enter chapters brief description or short explanation"
                      value={chapterForm.description}
                      onChange={handleChapterFieldChange("description")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Chapter Thumbnail *</span>
                    <label className="chapter-upload-box">
                      <input type="file" accept=".png,.jpg,.jpeg" onChange={handleThumbnailChange} />
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="8" cy="8" r="2" />
                        <path d="m5 18 4.2-5.2a2 2 0 0 1 3 .1L14 15l1.3-1.5a2 2 0 0 1 3 .1L20 16v2H5Z" />
                      </svg>
                      <strong>{chapterForm.thumbnailName || "Drag & Drop or Choose File to Upload"}</strong>
                      <span>
                        {chapterForm.thumbnailName
                          ? "Supported file: PNG, JPG"
                          : "Supported file: PNG, JPG      Max. size: 2 MB"}
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {chapterStep === 2 && (
                <div className="chapter-form-grid">
                  <div className="chapter-field">
                    <span>Section Title *</span>
                    <input
                      type="text"
                      placeholder="Enter first section title"
                      value={chapterForm.sectionTitle}
                      onChange={handleChapterFieldChange("sectionTitle")}
                    />
                  </div>

                  <div className="chapter-field">
                    <span>Section Type *</span>
                    <label className="chapter-select chapter-select-shell chapter-step-select">
                      <select value={chapterForm.sectionType} onChange={handleChapterFieldChange("sectionType")}>
                        <option>Text</option>
                        <option>Audio</option>
                        <option>Video</option>
                      </select>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    </label>
                  </div>

                  <div className="chapter-field chapter-field-wide">
                    <span>Section Description *</span>
                    <textarea
                      rows="6"
                      placeholder="Describe the first section for this chapter"
                      value={chapterForm.sectionDescription}
                      onChange={handleChapterFieldChange("sectionDescription")}
                    />
                  </div>
                </div>
              )}

              {chapterStep === 3 && (
                <div className="chapter-review-card">
                  <div className="chapter-review-block">
                    <span>Chapter Title</span>
                    <strong>{chapterForm.title || "-"}</strong>
                  </div>
                  <div className="chapter-review-block">
                    <span>Short Description</span>
                    <p>{chapterForm.description || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>First Section</span>
                    <strong>{chapterForm.sectionTitle || "-"}</strong>
                    <p>{chapterForm.sectionDescription || "-"}</p>
                  </div>
                  <div className="chapter-review-block">
                    <span>Thumbnail</span>
                    <strong>{chapterForm.thumbnailName || "No file selected"}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="chapter-drawer-footer">
              <button
                type="button"
                className="chapter-secondary-btn"
                onClick={() => {
                  if (chapterStep === 1) {
                    closeChapterDrawer();
                    return;
                  }

                  setChapterStep((current) => current - 1);
                }}
              >
                {chapterStep === 1 ? "Cancel" : "Back"}
              </button>

              <button type="button" className="chapter-primary-btn" onClick={handleContinue} disabled={!canContinue}>
                {footerButtonLabel}
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

function PracticeManagementPage() {
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

function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { rows: apiUserRows, isLoading, error } = useUsersCollection();
  const [userRows, setUserRows] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    setUserRows(apiUserRows);
  }, [apiUserRows]);

  useEffect(() => {
    if (!selectedUserId) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedUserId]);

  const filteredUserRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return userRows.filter((user) => {
      if (normalizedQuery === "") {
        return true;
      }

      return (
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.status.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [userRows, searchQuery]);

  const selectedUser = userRows.find((user) => user.id === selectedUserId) ?? null;

  const handleExportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Language",
      "Biometric",
      "Donation Amount",
      "Last Active",
      "Status",
      "Registered",
      "Chapters Completed",
    ];

    const rows = filteredUserRows.map((user) => [
      user.name,
      user.email,
      user.languageDetail,
      user.biometric,
      user.donationAmount,
      user.lastActiveDetail,
      user.status,
      user.registered,
      user.chaptersCompleted,
    ]);

    const csvContent = [header, ...rows].map((columns) => columns.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const toggleSelectedUserStatus = () => {
    if (!selectedUser) {
      return;
    }

    setUserRows((current) =>
      current.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              status: user.status === "Active" ? "Inactive" : "Active",
            }
          : user
      )
    );
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>User Management</h1>
        <p>Monitor all user activity in the platform</p>
      </header>

      <section className="chapter-page user-management-page">
        <div className="user-stat-grid">
          {userManagementMetrics.map((metric) => (
            <article key={metric.label} className="metric-card user-stat-card">
              <p className="metric-card-label">{metric.label}</p>
              <h3 className="metric-card-value">{metric.value}</h3>
              <div className="metric-meta">
                <span className="metric-pill">{metric.chip}</span>
                <span className="metric-note">{metric.note}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="user-management-toolbar">
          <label className="chapter-search user-search" aria-label="Search users">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <button type="button" className="user-export-btn" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>

        <div className="user-table-card user-table-card-redesign">
          <div className="user-table-head user-table-head-redesign">
            <span className="sortable-head">
              User
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Email
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Language
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Biometric
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Donation Amount
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span className="sortable-head">
              Last Active
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

          {filteredUserRows.map((user) => (
            <article
              key={user.id}
              className="user-row user-row-redesign"
              onClick={() => setSelectedUserId(user.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedUserId(user.id);
                }
              }}
            >
              <div className="user-name-cell">
                <div className="user-avatar user-list-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.1" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>
                <span>{user.name}</span>
              </div>

              <span className="user-email">{user.email}</span>
              <span className="user-language-pill">{user.language}</span>

              <span className={`user-biometric-pill ${user.biometric === "On" ? "is-on" : "is-off"}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {user.biometric === "On" ? (
                    <path d="m7 12 3 3 7-7" />
                  ) : (
                    <path d="m8 8 8 8M16 8l-8 8" />
                  )}
                </svg>
                {user.biometric}
              </span>

              <span className="user-donation">{user.donationAmount}</span>
              <span className="user-last-login">{user.lastActive}</span>
              <span className={`user-status-pill ${user.status === "Active" ? "is-active" : "is-inactive"}`}>
                {user.status}
              </span>

              <button
                type="button"
                className="user-view-btn"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedUserId(user.id);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                View
              </button>
            </article>
          ))}

          {isLoading && (
            <div className="chapter-empty-state">
              <p>Loading users...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="chapter-empty-state">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredUserRows.length === 0 && (
            <div className="chapter-empty-state">
              <p>No users match the current search.</p>
            </div>
          )}
        </div>
      </section>

      {selectedUser && (
        <div className="user-profile-overlay" onClick={() => setSelectedUserId(null)}>
          <aside
            className="user-profile-drawer"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="user-profile-header">
              <div>
                <h2>User Profile</h2>
                <p>Full account details &amp; activity</p>
              </div>

              <button type="button" className="chapter-drawer-close" aria-label="Close user profile" onClick={() => setSelectedUserId(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="user-profile-body">
              <div className="user-profile-summary">
                <div className="user-avatar user-profile-avatar" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="3.1" />
                    <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                  </svg>
                </div>

                <div className="user-profile-title">
                  <h3>{selectedUser.name}</h3>
                  <span className={`user-status-pill ${selectedUser.status === "Active" ? "is-active" : "is-inactive"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="user-profile-grid">
                <div className="user-profile-item">
                  <span>Email</span>
                  <strong>{selectedUser.email}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Language</span>
                  <strong>{selectedUser.languageDetail}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Biometric</span>
                  <strong>{selectedUser.biometric}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Registered</span>
                  <strong>{selectedUser.registered}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Last Active</span>
                  <strong>{selectedUser.lastActiveDetail}</strong>
                </div>
                <div className="user-profile-item">
                  <span>Chapters Completed</span>
                  <strong>{selectedUser.chaptersCompleted}</strong>
                </div>
                <div className="user-profile-item user-profile-item-wide">
                  <span>Donation Amount</span>
                  <strong>{selectedUser.donationAmount}</strong>
                </div>
              </div>
            </div>

            <div className="user-profile-footer">
              <button type="button" className="user-status-action-btn" onClick={toggleSelectedUserStatus}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 8v4m0 4h.01M10.3 3.7 1.8 18.2A1.4 1.4 0 0 0 3 20.3h18a1.4 1.4 0 0 0 1.2-2.1L13.7 3.7a1.4 1.4 0 0 0-2.4 0Z" />
                </svg>
                {selectedUser.status === "Active" ? "Mark as Inactive" : "Mark as Active"}
              </button>

              <button type="button" className="chapter-primary-btn user-close-btn" onClick={() => setSelectedUserId(null)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function CommunityManagementPage() {
  const [activeTab, setActiveTab] = useState("discussion");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [tagFilter, setTagFilter] = useState("All Tag");
  const [discussions, setDiscussions] = useState(initialCommunityDiscussions);
  const [reportedRows, setReportedRows] = useState(initialReportedDiscussions);
  const [categoryRows, setCategoryRows] = useState(initialCommunityCategories);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!selectedDiscussionId && !isCategoryModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDiscussionId, isCategoryModalOpen]);

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

  const discussionCategories = useMemo(
    () => ["All Category", ...new Set(discussions.filter((item) => !item.hidden).map((item) => item.category))],
    [discussions]
  );

  const tagOptions = useMemo(() => ["All Tag", ...new Set(reportedRows.map((item) => item.tag))], [reportedRows]);

  const visibleDiscussions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return discussions.filter((discussion) => {
      if (discussion.hidden) {
        return false;
      }

      const matchesQuery =
        normalizedQuery === "" ||
        discussion.preview.toLowerCase().includes(normalizedQuery) ||
        discussion.author.toLowerCase().includes(normalizedQuery) ||
        discussion.category.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "All Category" || discussion.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [discussions, searchQuery, categoryFilter]);

  const visibleReportedRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return reportedRows.filter((row) => {
      const matchesQuery =
        normalizedQuery === "" ||
        row.content.toLowerCase().includes(normalizedQuery) ||
        row.reportedBy.toLowerCase().includes(normalizedQuery) ||
        row.category.toLowerCase().includes(normalizedQuery);
      const matchesTag = tagFilter === "All Tag" || row.tag === tagFilter;

      return matchesQuery && matchesTag;
    });
  }, [reportedRows, searchQuery, tagFilter]);

  const visibleCategoryRows = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categoryRows.filter((category) => {
      if (normalizedQuery === "") {
        return true;
      }

      return category.name.toLowerCase().includes(normalizedQuery);
    });
  }, [categoryRows, searchQuery]);

  const selectedDiscussion = discussions.find((discussion) => discussion.id === selectedDiscussionId) ?? null;

  const showToast = (title, message) => {
    setToast({ title, message });
  };

  const hideDiscussion = (discussionId) => {
    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              hidden: true,
            }
          : discussion
      )
    );
    setReportedRows((current) => current.filter((row) => row.discussionId !== discussionId));
    if (selectedDiscussionId === discussionId) {
      setSelectedDiscussionId(null);
    }
    showToast("Discussion Hidden", "You have successfully hidden a discussion");
  };

  const dismissReportedDiscussion = (reportId) => {
    setReportedRows((current) => current.filter((row) => row.id !== reportId));
    showToast("Discussion Dismissed", "You have successfully dismiss a discussion");
  };

  const deleteDiscussion = (discussionId) => {
    setDiscussions((current) => current.filter((discussion) => discussion.id !== discussionId));
    setReportedRows((current) => current.filter((row) => row.discussionId !== discussionId));
    if (selectedDiscussionId === discussionId) {
      setSelectedDiscussionId(null);
    }
    showToast("Discussion Deleted", "The discussion has been deleted");
  };

  const updateThreadReplies = (discussionId, replyId, actionType) => {
    setDiscussions((current) =>
      current.map((discussion) =>
        discussion.id === discussionId
          ? {
              ...discussion,
              thread: discussion.thread.filter((reply) => reply.id !== replyId),
            }
          : discussion
      )
    );

    showToast(
      actionType === "delete" ? "Reply Deleted" : "Reply Hidden",
      actionType === "delete" ? "The reply has been deleted" : "You have successfully hidden a reply"
    );
  };

  const saveCategory = () => {
    const normalizedName = newCategoryName.trim();

    if (normalizedName === "") {
      return;
    }

    setCategoryRows((current) => [
      {
        id: Date.now(),
        name: normalizedName,
        taggedAmount: "0 discussion",
      },
      ...current,
    ]);
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  const toolbarPlaceholder =
    activeTab === "category" ? "Search category name..." : "Search discussion...";
  const footerCount =
    activeTab === "discussion"
      ? visibleDiscussions.length
      : activeTab === "reported"
      ? visibleReportedRows.length
      : visibleCategoryRows.length;

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Community</h1>
        <p>Moderation &amp; Discussion Management</p>
      </header>

      <section className="chapter-page community-management-page">
        <div className="community-stat-grid">
          {communityMetricCards.map((metric) => (
            <article key={metric.label} className="metric-card user-stat-card">
              <p className="metric-card-label">{metric.label}</p>
              <h3 className="metric-card-value">{metric.value}</h3>
              <div className="metric-meta">
                <span className="metric-pill">{metric.chip}</span>
                <span className="metric-note">{metric.note}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="community-tabs">
          <button
            type="button"
            className={`community-tab${activeTab === "discussion" ? " is-active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion List
          </button>
          <button
            type="button"
            className={`community-tab${activeTab === "reported" ? " is-active" : ""}`}
            onClick={() => setActiveTab("reported")}
          >
            Reported List
          </button>
          <button
            type="button"
            className={`community-tab${activeTab === "category" ? " is-active" : ""}`}
            onClick={() => setActiveTab("category")}
          >
            Category List
          </button>
        </div>

        <div className="community-toolbar">
          <div className="chapter-filters community-filters">
            <label className="chapter-search community-search" aria-label="Search community content">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder={toolbarPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            {activeTab === "discussion" && (
              <label className="chapter-select chapter-select-shell community-select">
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  {discussionCategories.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </label>
            )}

            {activeTab === "reported" && (
              <label className="chapter-select chapter-select-shell community-select">
                <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
                  {tagOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 10 5 5 5-5" />
                </svg>
              </label>
            )}
          </div>

          {activeTab === "category" && (
            <button type="button" className="chapter-add-btn community-add-btn" onClick={() => setIsCategoryModalOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Category
            </button>
          )}
        </div>

        {activeTab === "discussion" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head discussion-head">
              <span className="sortable-head">
                Discussion
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Resonated Amount
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
              <span>Action</span>
            </div>

            {visibleDiscussions.map((discussion) => (
              <article key={discussion.id} className="community-row discussion-row">
                <div className="community-discussion-cell">
                  <div className="user-avatar user-list-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.1" />
                      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </div>

                  <div className="community-copy">
                    <h3>{discussion.preview}</h3>
                    <p>
                      {discussion.author} {"\u2022"} {discussion.date} {"\u2022"} {discussion.category}
                    </p>
                  </div>
                </div>

                <div className="community-resonated">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 20.5s-7-4.4-7-10.1A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4c0 5.7-7 10.1-7 10.1Z" />
                  </svg>
                  {discussion.resonatedAmount}
                </div>

                <span className="community-category-text">{discussion.category}</span>

                <div className="community-actions">
                  <button type="button" className="community-action-btn" onClick={() => setSelectedDiscussionId(discussion.id)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    View
                  </button>
                  <button type="button" className="community-action-btn" onClick={() => hideDiscussion(discussion.id)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4 20 20M10.6 10.7A2.5 2.5 0 0 0 14 14M9.9 4.7A10.6 10.6 0 0 1 12 4.5c6.1 0 9.5 7.5 9.5 7.5a15.2 15.2 0 0 1-3.1 4.2M6.2 6.2A15.7 15.7 0 0 0 2.5 12S5.9 19.5 12 19.5c1.3 0 2.5-.2 3.6-.6" />
                    </svg>
                    Hide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "reported" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head reported-head">
              <span className="sortable-head">
                Reported Discussion
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Reported by
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Tag
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span>Action</span>
            </div>

            {visibleReportedRows.map((report) => (
              <article key={report.id} className="community-row reported-row">
                <div className="community-copy">
                  <h3>{report.content}</h3>
                  <p>
                    {report.date} {"\u2022"} {report.time} {"\u2022"} {report.category}
                  </p>
                </div>

                <div className="community-reporter">
                  <div className="user-avatar user-list-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.1" />
                      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </div>
                  <span>{report.reportedBy}</span>
                </div>

                <span className="community-tag-pill">{report.tag}</span>

                <div className="community-actions">
                  <button type="button" className="community-action-btn" onClick={() => dismissReportedDiscussion(report.id)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m7 12 3 3 7-7" />
                    </svg>
                    Dismiss
                  </button>
                  <button
                    type="button"
                    className="community-action-btn"
                    onClick={() => {
                      hideDiscussion(report.discussionId);
                      setReportedRows((current) => current.filter((item) => item.id !== report.id));
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4 20 20M10.6 10.7A2.5 2.5 0 0 0 14 14M9.9 4.7A10.6 10.6 0 0 1 12 4.5c6.1 0 9.5 7.5 9.5 7.5a15.2 15.2 0 0 1-3.1 4.2M6.2 6.2A15.7 15.7 0 0 0 2.5 12S5.9 19.5 12 19.5c1.3 0 2.5-.2 3.6-.6" />
                    </svg>
                    Hide
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === "category" && (
          <div className="chapter-table-card community-table-card">
            <div className="community-table-head category-head">
              <span className="community-checkbox-header" aria-hidden="true">
                <input type="checkbox" disabled />
              </span>
              <span className="sortable-head">
                Category Name
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Amount of tagged
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span>Action</span>
            </div>

            {visibleCategoryRows.map((category) => (
              <article key={category.id} className="community-row category-row">
                <span className="community-checkbox-cell">
                  <input type="checkbox" />
                </span>
                <span className="community-category-name">{category.name}</span>
                <span className="community-tagged-amount">{category.taggedAmount}</span>
                <div className="community-actions">
                  <button type="button" className="chapter-icon-btn" aria-label={`Edit ${category.name}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="chapter-icon-btn"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => setCategoryRows((current) => current.filter((item) => item.id !== category.id))}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="practice-footer community-footer">
          <div className="practice-footer-left">
            <span>Showing</span>
            <button type="button" className="practice-page-size">
              10
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
            <span>from {footerCount} results</span>
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

        {toast && (
          <div className="community-toast" role="status" aria-live="polite">
            <div className="community-toast-header">
              <div>
                <strong>{toast.title}</strong>
                <p>{toast.message}</p>
              </div>
              <button type="button" onClick={() => setToast(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <button type="button" className="community-toast-dismiss" onClick={() => setToast(null)}>
              Dismiss
            </button>
          </div>
        )}
      </section>

      {selectedDiscussion && (
        <div className="community-thread-overlay" onClick={() => setSelectedDiscussionId(null)}>
          <aside className="community-thread-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="community-thread-header">
              <h2>Discussion Thread</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close discussion thread" onClick={() => setSelectedDiscussionId(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="community-thread-body">
              <article className="community-thread-item community-thread-item-primary">
                <div className="community-thread-title">
                  <div className="user-avatar user-list-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.1" />
                      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </div>
                  <div>
                    <strong>
                      {selectedDiscussion.author} {"\u2022"} Original Post
                    </strong>
                    <p>{selectedDiscussion.title}</p>
                  </div>
                </div>

                <div className="community-thread-meta">
                  <span>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 20.5s-7-4.4-7-10.1A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4c0 5.7-7 10.1-7 10.1Z" />
                    </svg>
                    {selectedDiscussion.resonatedAmount}
                  </span>
                  <span>
                    {selectedDiscussion.date} {"\u2022"} {selectedDiscussion.time}
                  </span>
                </div>

                <div className="community-thread-actions">
                  <button type="button" className="community-action-btn" onClick={() => hideDiscussion(selectedDiscussion.id)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4 20 20M10.6 10.7A2.5 2.5 0 0 0 14 14M9.9 4.7A10.6 10.6 0 0 1 12 4.5c6.1 0 9.5 7.5 9.5 7.5a15.2 15.2 0 0 1-3.1 4.2M6.2 6.2A15.7 15.7 0 0 0 2.5 12S5.9 19.5 12 19.5c1.3 0 2.5-.2 3.6-.6" />
                    </svg>
                    Hide
                  </button>
                  <button type="button" className="community-action-btn" onClick={() => deleteDiscussion(selectedDiscussion.id)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                    Delete
                  </button>
                </div>
              </article>

              {selectedDiscussion.thread.map((reply) => (
                <article key={reply.id} className="community-thread-item">
                  <div className="community-thread-title">
                    <div className="user-avatar user-list-avatar" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="8" r="3.1" />
                        <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                      </svg>
                    </div>
                    <div>
                      <strong>
                        {reply.author} {reply.tag && <span className="community-reported-chip">{reply.tag}</span>}
                      </strong>
                      <p>{reply.body}</p>
                    </div>
                  </div>

                  <div className="community-thread-meta">
                    <span>
                      {reply.date} {"\u2022"} {reply.time}
                    </span>
                  </div>

                  <div className="community-thread-actions">
                    <button type="button" className="community-action-btn" onClick={() => updateThreadReplies(selectedDiscussion.id, reply.id, "hide")}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 4 20 20M10.6 10.7A2.5 2.5 0 0 0 14 14M9.9 4.7A10.6 10.6 0 0 1 12 4.5c6.1 0 9.5 7.5 9.5 7.5a15.2 15.2 0 0 1-3.1 4.2M6.2 6.2A15.7 15.7 0 0 0 2.5 12S5.9 19.5 12 19.5c1.3 0 2.5-.2 3.6-.6" />
                      </svg>
                      Hide
                    </button>
                    <button type="button" className="community-action-btn" onClick={() => updateThreadReplies(selectedDiscussion.id, reply.id, "delete")}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="community-thread-footer">
              <button type="button" className="chapter-primary-btn user-close-btn" onClick={() => setSelectedDiscussionId(null)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="community-modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
          <div className="community-category-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="community-category-modal-header">
              <h2>Add Category</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close add category modal" onClick={() => setIsCategoryModalOpen(false)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="community-category-modal-body">
              <div className="chapter-field">
                <span>Category Name *</span>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
              </div>
            </div>

            <div className="community-category-modal-footer">
              <button type="button" className="chapter-secondary-btn" onClick={() => setIsCategoryModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="chapter-primary-btn" onClick={saveCategory} disabled={newCategoryName.trim() === ""}>
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NotesBookmarksPage() {
  const [activeTab, setActiveTab] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [noteRows] = useState(initialNotesRows);
  const [bookmarkRows] = useState(initialBookmarkRows);
  const [categoryRows, setCategoryRows] = useState(initialNotesCategories);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    if (!selectedDetail && !isCategoryModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedDetail, isCategoryModalOpen]);

  const categoryOptions = useMemo(() => ["All Category", ...new Set(categoryRows.map((item) => item.name))], [categoryRows]);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return noteRows.filter((note) => {
      const matchesQuery =
        normalizedQuery === "" ||
        note.title.toLowerCase().includes(normalizedQuery) ||
        note.author.toLowerCase().includes(normalizedQuery) ||
        note.section.toLowerCase().includes(normalizedQuery) ||
        note.tags.some((tag) => tag.label.toLowerCase().includes(normalizedQuery));
      const matchesCategory = categoryFilter === "All Category" || note.tags.some((tag) => tag.label === categoryFilter);

      return matchesQuery && matchesCategory;
    });
  }, [noteRows, searchQuery, categoryFilter]);

  const visibleBookmarks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return bookmarkRows.filter((bookmark) => {
      const matchesQuery =
        normalizedQuery === "" ||
        bookmark.sentence.toLowerCase().includes(normalizedQuery) ||
        bookmark.chapterSection.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "All Category" || bookmark.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [bookmarkRows, searchQuery, categoryFilter]);

  const visibleCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return categoryRows.filter((category) => {
      if (normalizedQuery === "") {
        return true;
      }

      return category.name.toLowerCase().includes(normalizedQuery);
    });
  }, [categoryRows, searchQuery]);

  const selectedNote = selectedDetail?.type === "note" ? noteRows.find((note) => note.id === selectedDetail.id) ?? null : null;
  const selectedBookmark =
    selectedDetail?.type === "bookmark" ? bookmarkRows.find((bookmark) => bookmark.id === selectedDetail.id) ?? null : null;

  const footerCount =
    activeTab === "notes" ? visibleNotes.length : activeTab === "bookmarks" ? visibleBookmarks.length : visibleCategories.length;
  const toolbarPlaceholder = activeTab === "category" ? "Search category name..." : "Search notes...";

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName("");
    setEditingCategoryId(null);
  };

  const openCategoryModal = (category = null) => {
    setEditingCategoryId(category?.id ?? null);
    setNewCategoryName(category?.name ?? "");
    setIsCategoryModalOpen(true);
  };

  const saveCategory = () => {
    const normalizedName = newCategoryName.trim();

    if (normalizedName === "") {
      return;
    }

    if (editingCategoryId) {
      setCategoryRows((current) =>
        current.map((category) => (category.id === editingCategoryId ? { ...category, name: normalizedName } : category))
      );
    } else {
      setCategoryRows((current) => [
        {
          id: Date.now(),
          name: normalizedName,
          tone: notesCategoryToneCycle[current.length % notesCategoryToneCycle.length],
          taggedAmount: "0 discussion",
        },
        ...current,
      ]);
    }

    closeCategoryModal();
  };

  const deleteCategory = (categoryId, categoryName) => {
    setCategoryRows((current) => current.filter((category) => category.id !== categoryId));

    if (categoryFilter === categoryName) {
      setCategoryFilter("All Category");
    }
  };

  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Notes &amp; Bookmarks</h1>
        <p>Keep track of users&apos; notes &amp; bookmark within the platform.</p>
      </header>

      <section className="chapter-page notes-bookmarks-page">
        <div className="notes-stat-grid">
          {notesBookmarkMetrics.map((metric) => (
            <article key={metric.label} className="metric-card user-stat-card">
              <p className="metric-card-label">{metric.label}</p>
              <h3 className="metric-card-value">{metric.value}</h3>
              <div className="metric-meta">
                <span className="metric-pill">{metric.chip}</span>
                <span className="metric-note">{metric.note}</span>
              </div>
            </article>
          ))}
        </div>

        <div className="notes-tabs">
          <button type="button" className={`notes-tab${activeTab === "notes" ? " is-active" : ""}`} onClick={() => setActiveTab("notes")}>
            Notes List
          </button>
          <button
            type="button"
            className={`notes-tab${activeTab === "bookmarks" ? " is-active" : ""}`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmark List
          </button>
          <button
            type="button"
            className={`notes-tab${activeTab === "category" ? " is-active" : ""}`}
            onClick={() => setActiveTab("category")}
          >
            Category List
          </button>
        </div>

        <div className="notes-toolbar">
          <div className="chapter-filters notes-toolbar-filters">
            <label className="chapter-search notes-toolbar-search" aria-label="Search notes and bookmarks">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                placeholder={toolbarPlaceholder}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            {activeTab !== "category" && (
              <label className="chapter-select chapter-select-shell notes-toolbar-select">
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
          </div>

          {activeTab === "category" && (
            <button type="button" className="chapter-add-btn notes-add-btn" onClick={() => openCategoryModal()}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Category
            </button>
          )}
        </div>

        {activeTab === "notes" && (
          <div className="chapter-table-card notes-table-card">
            <div className="notes-table-head notes-list-head">
              <span className="sortable-head">
                Notes
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
              <span>Action</span>
            </div>

            {visibleNotes.map((note) => (
              <article key={note.id} className="notes-row notes-list-row">
                <div className="notes-title-cell">
                  <div className="user-avatar user-list-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="3.1" />
                      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </div>

                  <div className="notes-copy">
                    <h3>{note.title}</h3>
                    <p>
                      {note.author} {"\u2022"} {note.date} {"\u2022"} {note.section}
                    </p>
                  </div>
                </div>

                <div className="notes-tags-cell">
                  {note.tags.map((tag) => (
                    <span key={tag.label} className={`notes-tag notes-tag-${tag.tone}`}>
                      {tag.label}
                    </span>
                  ))}
                </div>

                <div className="notes-action-cell">
                  <button type="button" className="community-action-btn notes-action-btn" onClick={() => setSelectedDetail({ type: "note", id: note.id })}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    View
                  </button>
                </div>
              </article>
            ))}

            {visibleNotes.length === 0 && (
              <div className="chapter-empty-state">
                <p>No notes match the current filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "bookmarks" && (
          <div className="chapter-table-card notes-table-card">
            <div className="notes-table-head bookmarks-list-head">
              <span className="sortable-head">
                Bookmarked
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Bookmarks Amount
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span>Action</span>
            </div>

            {visibleBookmarks.map((bookmark) => (
              <article key={bookmark.id} className="notes-row bookmarks-list-row">
                <div className="notes-copy">
                  <h3>{bookmark.sentence}</h3>
                  <p>{bookmark.chapterSection.replace(", ", " \u2022 ")}</p>
                </div>

                <span className="notes-bookmark-amount">{bookmark.bookmarksAmount}</span>

                <div className="notes-action-cell">
                  <button
                    type="button"
                    className="community-action-btn notes-action-btn"
                    onClick={() => setSelectedDetail({ type: "bookmark", id: bookmark.id })}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2.5 12s3.4-5.5 9.5-5.5S21.5 12 21.5 12 18.1 17.5 12 17.5 2.5 12 2.5 12Z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                    View
                  </button>
                </div>
              </article>
            ))}

            {visibleBookmarks.length === 0 && (
              <div className="chapter-empty-state">
                <p>No bookmarks match the current filters.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "category" && (
          <div className="chapter-table-card notes-table-card">
            <div className="notes-table-head notes-category-head">
              <span className="notes-checkbox-cell" aria-hidden="true">
                <input type="checkbox" disabled />
              </span>
              <span className="sortable-head">
                Category Name
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span className="sortable-head">
                Amount of tagged
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m8 10 4-4 4 4" />
                  <path d="m16 14-4 4-4-4" />
                </svg>
              </span>
              <span>Action</span>
            </div>

            {visibleCategories.map((category) => (
              <article key={category.id} className="notes-row notes-category-row">
                <span className="notes-checkbox-cell">
                  <input type="checkbox" />
                </span>

                <div className="notes-category-name">
                  <span className={`notes-category-dot notes-tag-${category.tone}`} aria-hidden="true" />
                  <span>{category.name}</span>
                </div>

                <span className="notes-tagged-amount">{category.taggedAmount}</span>

                <div className="notes-icon-actions">
                  <button type="button" className="chapter-icon-btn" aria-label={`Edit ${category.name}`} onClick={() => openCategoryModal(category)}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="chapter-icon-btn"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => deleteCategory(category.id, category.name)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}

            {visibleCategories.length === 0 && (
              <div className="chapter-empty-state">
                <p>No categories match the current search.</p>
              </div>
            )}
          </div>
        )}

        <div className="practice-footer notes-footer">
          <div className="practice-footer-left">
            <span>Showing</span>
            <button type="button" className="practice-page-size">
              10
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
            <span>from {footerCount} results</span>
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

      {(selectedNote || selectedBookmark) && (
        <div className="notes-detail-overlay" onClick={() => setSelectedDetail(null)}>
          <aside className="notes-detail-drawer" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="notes-detail-header">
              <h2>{selectedNote ? "Detail Notes" : "Detail Bookmarks"}</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close detail panel" onClick={() => setSelectedDetail(null)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="notes-detail-body">
              {selectedNote && (
                <>
                  <div className="notes-detail-field">
                    <span>Notes Title</span>
                    <strong>{selectedNote.title}</strong>
                  </div>
                  <div className="notes-detail-field">
                    <span>Notes by</span>
                    <strong>{selectedNote.author}</strong>
                  </div>
                  <div className="notes-detail-field">
                    <span>Date Created</span>
                    <strong>{selectedNote.date}</strong>
                  </div>
                  <div className="notes-detail-field">
                    <span>Chapters &amp; Section</span>
                    <strong>{selectedNote.chapterSection}</strong>
                  </div>
                  <div className="notes-detail-field">
                    <span>Category</span>
                    <div className="notes-detail-tags">
                      {selectedNote.tags.map((tag) => (
                        <span key={tag.label} className={`notes-tag notes-tag-${tag.tone}`}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="notes-detail-field notes-detail-field-body">
                    <span>Notes</span>
                    <p>{selectedNote.content}</p>
                  </div>
                </>
              )}

              {selectedBookmark && (
                <>
                  <div className="notes-detail-field">
                    <span>Chapters &amp; Section</span>
                    <strong>{selectedBookmark.chapterSection}</strong>
                  </div>
                  <div className="notes-detail-field">
                    <span>Bookmarks Amount</span>
                    <strong>{selectedBookmark.bookmarksAmount}</strong>
                  </div>
                  <div className="notes-detail-field notes-detail-field-body">
                    <span>Sentence Bookmarked</span>
                    <p>{selectedBookmark.sentence}</p>
                  </div>
                </>
              )}
            </div>

            <div className="notes-detail-footer">
              <button type="button" className="chapter-primary-btn user-close-btn" onClick={() => setSelectedDetail(null)}>
                Close
              </button>
            </div>
          </aside>
        </div>
      )}

      {isCategoryModalOpen && (
        <div className="notes-modal-overlay" onClick={closeCategoryModal}>
          <div className="notes-category-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="notes-category-modal-header">
              <h2>{editingCategoryId ? "Edit Category" : "Add Category"}</h2>
              <button type="button" className="chapter-drawer-close" aria-label="Close category modal" onClick={closeCategoryModal}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="notes-category-modal-body">
              <div className="chapter-field">
                <span>Category Name *</span>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
              </div>
            </div>

            <div className="notes-category-modal-footer">
              <button type="button" className="chapter-secondary-btn" onClick={closeCategoryModal}>
                Cancel
              </button>
              <button type="button" className="chapter-primary-btn" onClick={saveCategory} disabled={newCategoryName.trim() === ""}>
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function RolesPermissionsPage() {
  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>Roles &amp; Permissions</h1>
        <p>Manage all access &amp; permission in the system</p>
      </header>

      <section className="chapter-page">
        <div className="roles-toolbar">
          <div className="chapter-filters">
            <label className="chapter-search" aria-label="Search role name">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input type="search" placeholder="Search role name..." />
            </label>

            <button type="button" className="chapter-select">
              All Status
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </button>
          </div>

          <button type="button" className="roles-add-btn">
            <span>+</span>
            Add Role
          </button>
        </div>

        <div className="roles-table-card">
          <div className="roles-table-head">
            <span className="roles-checkbox" aria-hidden="true" />
            <span className="sortable-head">
              Role Name
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
            <span className="sortable-head">
              Last Update
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m8 10 4-4 4 4" />
                <path d="m16 14-4 4-4-4" />
              </svg>
            </span>
            <span aria-hidden="true" />
          </div>

          {fallbackRoleRows.map((role) => (
            <article key={role.roleName} className="roles-row">
              <span className="roles-checkbox" aria-hidden="true" />
              <span className="roles-name">{role.roleName}</span>
              <span className={`roles-status ${role.status === "Active" ? "is-active" : "is-inactive"}`}>
                {role.status}
              </span>
              <span className="roles-date">{role.lastUpdate}</span>
              <div className="roles-actions">
                <button type="button" className="roles-icon-btn" aria-label={`Edit ${role.roleName}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.8 5.7 18.3 10.2M6 18h4l8.6-8.6a1.7 1.7 0 0 0 0-2.4l-1.6-1.6a1.7 1.7 0 0 0-2.4 0L6 14v4Z" />
                  </svg>
                </button>
                {role.canDelete && (
                  <button type="button" className="roles-icon-btn" aria-label={`Delete ${role.roleName}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 7h14M10 4h4m-7 3 1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7M10 11v5M14 11v5" />
                    </svg>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function PlaceholderPage({ title }) {
  return (
    <>
      <header className="dashboard-header chapter-header">
        <h1>{title}</h1>
        <p>This section is ready for implementation.</p>
      </header>
      <section className="chapter-page placeholder-page">
        <p>{title} content is not available yet.</p>
      </section>
    </>
  );
}

const dashboardSegmentByItemId = {
  dashboard: "",
  chapter: "chapter",
  practice: "practice",
  user: "user",
  community: "community",
  notes: "notes",
  resources: "resources",
  roles: "roles",
  media: "media",
};

function DashboardPage({ onLogout = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathAfterDashboard = location.pathname.replace(/^\/dashboard\/?/, "");
  const activeSegment = pathAfterDashboard.split("/")[0];
  const activeItem = sidebarMainItems.find((item) => dashboardSegmentByItemId[item.id] === activeSegment)?.id ?? "dashboard";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleSelectItem = (itemId) => {
    const nextSegment = dashboardSegmentByItemId[itemId];
    navigate(nextSegment ? `/dashboard/${nextSegment}` : "/dashboard");
  };

  const activeTitle = useMemo(
    () => sidebarMainItems.find((item) => item.id === activeItem)?.label ?? "Dashboard",
    [activeItem]
  );

  return (
    <section className="dashboard-shell">
      {isSidebarOpen && (
        <button
          type="button"
          className="dashboard-scrim"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <SidebarNav
        activeItem={activeItem}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectItem={handleSelectItem}
        onLogout={onLogout}
      />

      <div className="dashboard-main">
        <div className="dashboard-mobile-bar">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-dot brand-dot-left" />
              <span className="brand-dot brand-dot-right" />
            </span>
            <strong>Mindful Living</strong>
          </div>
        </div>

        {activeItem === "dashboard" && <DashboardOverview />}
        {activeItem === "chapter" && <ChapterManagementPage />}
        {activeItem === "practice" && <PracticeManagementPage />}
        {activeItem === "user" && <UserManagementPage />}
        {activeItem === "community" && <CommunityManagementPage />}
        {activeItem === "notes" && <NotesBookmarksPage />}
        {activeItem === "resources" && <ResourcesPage />}
        {activeItem === "roles" && <RolesPermissionsPageView />}
        {activeItem === "media" && <MediaLibraryPage />}
        {activeItem !== "dashboard" &&
          activeItem !== "chapter" &&
          activeItem !== "practice" &&
          activeItem !== "user" &&
          activeItem !== "community" &&
          activeItem !== "notes" &&
          activeItem !== "resources" &&
          activeItem !== "roles" &&
          activeItem !== "media" && <PlaceholderPage title={activeTitle} />}
      </div>
    </section>
  );
}

export default DashboardPage;
