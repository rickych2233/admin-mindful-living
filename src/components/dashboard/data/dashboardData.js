import { EURO } from './constants.js';

export const fallbackChapterRows = [
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

export const fallbackRoleRows = [
  { roleName: "Super Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: false },
  { roleName: "General Admin", status: "Active", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Book Author", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
  { roleName: "Community Admin", status: "Inactive", lastUpdate: "18 Feb 2026", canDelete: true },
];

export const overviewMetrics = [
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

export const popularContent = [
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

export const notesMetrics = [
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

export const chapterCompletion = [
  { label: "Chapter 1", value: 94 },
  { label: "Chapter 2", value: 81 },
  { label: "Chapter 3", value: 72 },
  { label: "Chapter 4", value: 53 },
  { label: "Chapter 5", value: 38 },
  { label: "Chapter 6", value: 21 },
  { label: "Chapter 7", value: 9 },
];

export const recentDonations = [
  { name: "Adam Coles", date: "20 Jan 2026", amount: `${EURO}998.20` },
  { name: "Ashley Williams", date: "19 Jan 2026", amount: `${EURO}825.40` },
  { name: "Barry Allen", date: "18 Jan 2026", amount: `${EURO}748.50` },
  { name: "Bella Thorne", date: "17 Jan 2026", amount: `${EURO}624.10` },
  { name: "Camila Cabello", date: "16 Jan 2026", amount: `${EURO}535.87` },
];

export const topSupporters = [
  { name: "Adam Coles", amount: `${EURO}998.20` },
  { name: "Ashley Williams", amount: `${EURO}825.40` },
  { name: "Barry Allen", amount: `${EURO}748.50` },
  { name: "Bella Thorne", amount: `${EURO}624.10` },
  { name: "Camila Cabello", amount: `${EURO}535.87` },
];

export const communityOverview = [
  { label: "Total Discussion", value: "1024" },
  { label: "Reported & Pending", value: "7 pending" },
  { label: "Hidden Message", value: "23" },
  { label: "Active Categories", value: "9" },
];

export const discussionCategories = [
  { label: "Chapter 3", value: 96 },
  { label: "Meditation", value: 82 },
  { label: "Breathwork", value: 73 },
  { label: "Chapter 1", value: 56 },
  { label: "Grounding", value: 48 },
  { label: "Sleep", value: 48 },
  { label: "Chapter 2", value: 48 },
];

export const initialChapterForm = {
  title: "",
  description: "",
  thumbnailName: "",
  sectionTitle: "",
  sectionDescription: "",
  sectionType: "Text",
};

export const initialPracticeRows = [
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

export const initialPracticeForm = {
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

export const userManagementMetrics = [
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

export const communityMetricCards = [
  { label: "Pending Reports", value: "7 pending", chip: "+ 2 reports", note: "vs last week" },
  { label: "Total Discussions", value: "1204", chip: "+ 34 discussion", note: "vs last week" },
  { label: "Hidden Message", value: "23", chip: "+ 2", note: "vs last week" },
];

export const notesBookmarkMetrics = [
  { label: "Total Notes (All Time)", value: "1204", chip: "+ 34 notes", note: "vs last week" },
  { label: "Total Bookmarks (All Time)", value: "358", chip: "+ 14 bookmarks", note: "vs last week" },
  { label: "Most Tagged Category (All Time)", value: "Awareness", chip: "52 times", note: "total tagged" },
];