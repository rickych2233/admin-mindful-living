import React from "react";
import { ActivityChart } from "../charts/ActivityChart";
import { DonutChart } from "../charts/DonutChart";
import { UserAvatar } from "../utils/commonComponents.jsx";

const EURO = "\u20AC";

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

export function DashboardOverview() {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <>
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Overview {"\u2022"} {monthName} {year}</p>
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
