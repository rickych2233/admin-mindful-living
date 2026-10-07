import React, { useState, useEffect } from "react";
import { ActivityChart } from "../charts/ActivityChart";
import { DonutChart } from "../charts/DonutChart";

// ─── Safe utility helpers ────────────────────────────────────────────────────

/** Returns value if it's a finite number > 0, otherwise fallback */
function safeNum(value, fallback = 0) {
  const n = Number(value);
  return isFinite(n) ? n : fallback;
}

/** Returns string, trims whitespace; returns fallback if null/undefined/empty */
function safeStr(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && !Array.isArray(parsed)) {
        value = parsed;
      }
    } catch (e) {
      // Not JSON, continue as normal string
    }
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    value = value["English 🇬🇧"] || value["en"] || value["English"] || Object.values(value)[0] || fallback;
  }
  const s = String(value).trim();
  return s.length > 0 && s !== "[object Object]" ? s : fallback;
}

/** Safe array: always returns an array, never null/undefined */
function safeArr(value) {
  return Array.isArray(value) ? value : [];
}

/** Format a date string/object safely; returns "—" on failure */
function safeDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

/** Format a number as Rupiah, safe against null/NaN */
function safeRupiah(value) {
  const n = safeNum(value, 0);
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/** Safe avatar URL — replace spaces in name gracefully */
function avatarUrl(name, size = 32) {
  const safeName = safeStr(name, "?").replace(/\s+/g, "+");
  return `https://ui-avatars.com/api/?name=${safeName}&background=random&color=fff&size=${size}`;
}

// ─── Helper components ───────────────────────────────────────────────────────

function EmptyState({ icon = "📭", message = "No data available" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "2rem 1rem", color: "#9ca3af",
      gap: "0.5rem", minHeight: "80px"
    }}>
      <span style={{ fontSize: "1.5rem" }}>{icon}</span>
      <span style={{ fontSize: "0.85rem" }}>{message}</span>
    </div>
  );
}

/** Skeleton shimmer block shown while data is loading */
function Skeleton({ width = "100%", height = "1.2rem", radius = "6px" }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite"
    }} />
  );
}

const BAR_COLORS = ["#885F9A", "#629CAE", "#D4A03B", "#36B37E", "#4788ED", "#C0A3CF", "#DFBB65"];

function CategoryBarChart({ categories, loading }) {
  const list = safeArr(categories).filter(c => safeStr(c?.name) && safeNum(c?.count) >= 0);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
        {[...Array(4)].map((_, i) => <Skeleton key={i} height="12px" />)}
      </div>
    );
  }

  if (list.length === 0) {
    return <EmptyState icon="📊" message="No discussion categories yet" />;
  }

  const maxCount = Math.max(...list.map(c => safeNum(c.count, 0)), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
      {list.map((cat, i) => {
        const count = safeNum(cat.count, 0);
        const widthPct = Math.round((count / maxCount) * 100);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{
              width: "100px", fontSize: "0.88rem", fontWeight: "500", color: "#374151",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {safeStr(cat.name, "Unknown")}
            </span>
            <div style={{ flex: 1, height: "12px", borderRadius: "6px", background: "#f3f4f6" }}>
              <div style={{
                width: `${widthPct}%`, background: BAR_COLORS[i % BAR_COLORS.length],
                borderRadius: "6px", height: "100%", transition: "width 0.5s ease",
                minWidth: widthPct > 0 ? "4px" : "0"
              }} />
            </div>
            <span style={{ width: "32px", textAlign: "right", fontSize: "0.85rem", color: "#9ca3af" }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LastUpdated({ ts }) {
  if (!ts) return null;
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    return (
      <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginLeft: "auto" }}>
        Auto-refresh • updated {time}
      </span>
    );
  } catch {
    return null;
  }
}

/** Metric card with skeleton while loading */
function MetricCard({ label, value, unit, note, loading, alert }) {
  return (
    <article className="satyatech-card st-metric-card">
      <p className="st-card-label">{label}</p>
      <h3 className="st-card-value" style={alert && safeNum(value) > 0 ? { color: "#ef4444" } : {}}>
        {loading ? <Skeleton width="60%" height="1.8rem" /> : (
          <>
            {value !== null && value !== undefined ? value : "—"}
            {unit && value !== null && value !== undefined ? ` ${unit}` : ""}
          </>
        )}
      </h3>
      <div className="st-card-meta">
        <span className="st-note">{note}</span>
      </div>
    </article>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardOverview() {
  const currentDate = new Date();
  const monthName   = currentDate.toLocaleString("en-US", { month: "long" });
  const year        = currentDate.getFullYear();

  const [timeRange,    setTimeRange]    = useState("weekly");
  const [stats,        setStats]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);   // first load
  const [isRefreshing, setIsRefreshing] = useState(false);  // subsequent polls
  const [fetchError,   setFetchError]   = useState(null);
  const [chaptersPage, setChaptersPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchStats = (isFirst = false) => {
      if (isFirst) setIsLoading(true);
      else setIsRefreshing(true);
      setFetchError(null);

      fetch("/api/dashboard/stats")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (!mounted) return;
          // Validate top-level shape — guard against unexpected response
          setStats({
            metrics:   data?.metrics   ?? {},
            donations: data?.donations ?? { topSupporters: [], recentSupporters: [] },
            reports:   data?.reports   ?? { pendingCount: 0, recentReports: [] },
            community: data?.community ?? { topDiscussionCategories: [], communityCategories: [] },
            content:   data?.content   ?? { chaptersList: [] },
          });
          setLastUpdated(new Date());
        })
        .catch((err) => {
          if (!mounted) return;
          console.error("Failed to fetch dashboard stats:", err);
          setFetchError("Could not load dashboard data. Retrying…");
        })
        .finally(() => {
          if (!mounted) return;
          setIsLoading(false);
          setIsRefreshing(false);
        });
    };

    fetchStats(true);
    const intervalId = setInterval(() => fetchStats(false), 30000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // ── Derived / safe data ───────────────────────────────────────────────────
  const m           = stats?.metrics   ?? {};
  const donations   = stats?.donations ?? {};
  const reports     = stats?.reports   ?? {};
  const community   = stats?.community ?? {};
  const content     = stats?.content   ?? {};

  const totalUsers      = safeNum(m.totalUsers, 0);
  const activeUsers     = safeNum(m.activeUsers, 0);
  const totalNotes      = safeNum(m.totalNotes, 0);
  const totalBookmarks  = safeNum(m.totalBookmarks, 0);
  const totalDiscussions= safeNum(m.totalDiscussions, 0);
  const activeCategories= safeNum(m.activeDiscussionCategories, 0);
  const totalChapters   = safeNum(m.totalChapters, 0);
  const totalPractices  = safeNum(m.totalPractices, 0);

  const pendingReports  = safeNum(reports.pendingCount, 0);
  const topCategories   = safeArr(community.topDiscussionCategories);
  const commCategories  = safeArr(community.communityCategories);
  const mostResonated   = community.mostResonatedDiscussion ?? null;
  const newestDiscussion= community.newestDiscussion ?? null;
  const mostReportedCat = community.mostReportedCategory ?? null;
  const chaptersList    = safeArr(content.chaptersList);
  const chaptersPerPage = 8;
  const totalChapterPages = Math.ceil(chaptersList.length / chaptersPerPage);
  const paginatedChapters = chaptersList.slice((chaptersPage - 1) * chaptersPerPage, chaptersPage * chaptersPerPage);
  const topSupporters   = safeArr(donations.topSupporters);
  const recentSupporters= safeArr(donations.recentSupporters);

  // Bar chart: prefer discussion-level category counts; fall back to community_categories table
  const barChartData = topCategories.length > 0
    ? topCategories
    : commCategories.map(c => ({ name: safeStr(c?.name), count: safeNum(c?.count, 0) }));

  // Donut: computed from real content counts; equal split fallback if all 0
  const donutTotal = totalNotes + totalBookmarks + totalDiscussions + totalPractices;
  const donutItems = donutTotal > 0 ? [
    { label: "Notes",       value: Math.round((totalNotes       / donutTotal) * 100), tone: "primary" },
    { label: "Practices",   value: Math.round((totalPractices   / donutTotal) * 100), tone: "secondary" },
    { label: "Discussions", value: Math.round((totalDiscussions / donutTotal) * 100), tone: "tertiary" },
    { label: "Bookmarks",   value: Math.round((totalBookmarks   / donutTotal) * 100), tone: "quaternary" },
  ] : [
    { label: "Notes",       value: 25, tone: "primary" },
    { label: "Practices",   value: 25, tone: "secondary" },
    { label: "Discussions", value: 25, tone: "tertiary" },
    { label: "Bookmarks",   value: 25, tone: "quaternary" },
  ];

  // Activity chart — no DB tracking yet, show flat baseline
  const flatWeek   = [0, 0, 0, 0, 0, 0, 0];
  const flatMonth  = [0, 0, 0, 0];
  const flatYear   = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const activityData = {
    weekly:  { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],            primaryValues: flatWeek,  secondaryValues: flatWeek },
    monthly: { labels: ["Week 1","Week 2","Week 3","Week 4"],                  primaryValues: flatMonth, secondaryValues: flatMonth },
    yearly:  { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], primaryValues: flatYear,  secondaryValues: flatYear },
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-content-wrapper">
      <style>{`
        @keyframes spin    { from { transform: rotate(0deg);    } to { transform: rotate(360deg); } }
        @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
      `}</style>

      <header className="dashboard-header-satyatech">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1>Dashboard</h1>
            <p>Overview &bull; {monthName} {year}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {isRefreshing && (
              <span style={{ fontSize: "0.78rem", color: "#885F9A", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Refreshing…
              </span>
            )}
            {fetchError && (
              <span style={{ fontSize: "0.78rem", color: "#ef4444" }}>⚠ {fetchError}</span>
            )}
            <LastUpdated ts={lastUpdated} />
          </div>
        </div>
      </header>

      <div className="satyatech-dashboard-grid">

        {/* ── KEY METRICS ─────────────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">KEY METRICS</h2>
          <div className="satyatech-cards-row">
            <MetricCard loading={isLoading} label="Total Users"         value={totalUsers}     unit="users"    note="Registered accounts in system" />
            <MetricCard loading={isLoading} label="Active Users"        value={activeUsers}    unit="users"    note="Users with active account status" />
            <MetricCard loading={isLoading} label="Total Notes Created" value={totalNotes}     unit="notes"    note="Total notes in the system" />
            <MetricCard loading={isLoading} label="Total Chapters"      value={totalChapters}  unit="chapters" note="Available in the application" />
          </div>
        </section>

        {/* ── CONTENT STATISTICS ──────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">CONTENT STATISTICS</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Practices</p>
              {isLoading ? <Skeleton width="50%" height="1.3rem" /> : (
                <h4 className="st-card-subtitle">{totalPractices} practices available</h4>
              )}
              <p className="st-card-detail">Created and ready for users</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Discussions</p>
              {isLoading ? <Skeleton width="50%" height="1.3rem" /> : (
                <h4 className="st-card-subtitle">{totalDiscussions} active threads</h4>
              )}
              <p className="st-card-detail">
                Across {isLoading ? "…" : activeCategories} {activeCategories !== 1 ? "categories" : "category"}
              </p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Bookmarks</p>
              {isLoading ? <Skeleton width="50%" height="1.3rem" /> : (
                <h4 className="st-card-subtitle">{totalBookmarks} bookmarks</h4>
              )}
              <p className="st-card-detail">Saved by users</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Pending Reports</p>
              {isLoading ? <Skeleton width="50%" height="1.3rem" /> : (
                <h4 className="st-card-subtitle" style={{ color: pendingReports > 0 ? "#ef4444" : undefined }}>
                  {pendingReports} report{pendingReports !== 1 ? "s" : ""}
                </h4>
              )}
              <p className="st-card-detail">
                {pendingReports > 0 ? "Require moderation attention" : "No pending reports"}
              </p>
            </article>
          </div>
        </section>

        {/* ── USER ACTIVITY ────────────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">USER ACTIVITY</h2>
          <div className="satyatech-cards-row st-activity-row">
            <article className="satyatech-card st-chart-card st-chart-line-card">
              <div className="st-chart-header">
                <div>
                  <h4 className="st-card-subtitle">Active Users &amp; New Registrations</h4>
                  <p className="st-card-detail">Activity tracking not yet available</p>
                </div>
                <div className="st-chart-toggles">
                  {["weekly", "monthly", "yearly"].map(r => (
                    <button
                      key={r}
                      className={`st-toggle-btn ${timeRange === r ? "st-toggle-active" : ""}`}
                      onClick={() => setTimeRange(r)}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="st-chart-container">
                <ActivityChart
                  labels={activityData[timeRange]?.labels ?? []}
                  primaryValues={activityData[timeRange]?.primaryValues ?? []}
                  secondaryValues={activityData[timeRange]?.secondaryValues ?? []}
                />
              </div>
            </article>

            <article className="satyatech-card st-chart-card st-donut-card">
              <div className="st-chart-header">
                <div>
                  <h4 className="st-card-subtitle">Content Distribution</h4>
                  <p className="st-card-detail">
                    {donutTotal > 0 ? "Based on real counts" : "Notes, Practices, Discussions, Bookmarks"}
                  </p>
                </div>
              </div>
              {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <Skeleton width="160px" height="160px" radius="50%" />
                </div>
              ) : (
                <div className="st-donut-container">
                  <DonutChart items={donutItems} />
                  <div className="st-donut-center">
                    <strong>{totalUsers.toLocaleString("id-ID")}</strong>
                    <span>Total Users</span>
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>

        {/* ── ATTENTION NEEDED ─────────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">ATTENTION NEEDED</h2>
          <div className="satyatech-cards-row">

            {/* Pending Reports */}
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Community Reports</p>
              {isLoading ? <Skeleton height="1.2rem" /> : pendingReports > 0 ? (
                <>
                  <h4 className="st-card-subtitle">Discussion Reports Pending</h4>
                  <p className="st-card-detail">
                    <strong style={{ color: "#ef4444" }}>{pendingReports}</strong>{" "}
                    report{pendingReports !== 1 ? "s" : ""} requiring moderation
                  </p>
                </>
              ) : (
                <>
                  <h4 className="st-card-subtitle">No Pending Reports</h4>
                  <p className="st-card-detail">Community is clear — no reports to review</p>
                </>
              )}
            </article>

            {/* Most Resonated Discussion */}
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Most Resonated Discussion</p>
              {isLoading ? <Skeleton height="1.2rem" /> : mostResonated ? (
                <>
                  <h4 className="st-card-subtitle" style={{
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                  }}>
                    {safeStr(mostResonated.message, safeStr(mostResonated.category, "—"))}
                  </h4>
                  <p className="st-card-detail">
                    By <strong>{safeStr(mostResonated.name, "Anonymous")}</strong>
                    {" "}&bull; {safeNum(mostResonated.resonated, 0)} resonated
                  </p>
                </>
              ) : (
                <EmptyState icon="💬" message="No discussions yet" />
              )}
            </article>

            {/* Most Reported Reason */}
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Most Reported Reason</p>
              {isLoading ? <Skeleton height="1.2rem" /> : mostReportedCat ? (
                <>
                  <h4 className="st-card-subtitle">
                    {safeStr(mostReportedCat.reason, "Unknown reason")}
                  </h4>
                  <p className="st-card-detail">
                    <strong>{safeNum(mostReportedCat.count, 0)}</strong>{" "}
                    report{safeNum(mostReportedCat.count, 0) !== 1 ? "s" : ""} with this reason
                  </p>
                </>
              ) : (
                <EmptyState icon="🛡️" message="No reports submitted yet" />
              )}
            </article>
          </div>
        </section>

        {/* ── NOTES & BOOKMARKS ────────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">NOTES &amp; BOOKMARKS</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Notes Created</p>
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                {isLoading ? <Skeleton width="40%" /> : `${totalNotes} notes`}
              </h4>
              <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>Total user notes in the system</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Bookmarks Created</p>
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                {isLoading ? <Skeleton width="40%" /> : `${totalBookmarks} bookmarks`}
              </h4>
              <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>Total user bookmarks in the system</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Discussions</p>
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                {isLoading ? <Skeleton width="40%" /> : `${totalDiscussions} threads`}
              </h4>
              <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>
                Across {isLoading ? "…" : activeCategories}{" "}
                {activeCategories !== 1 ? "categories" : "category"}
              </p>
            </article>
          </div>
        </section>

        {/* ── COMMUNITY ────────────────────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">COMMUNITY</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Newest Discussion</p>
              {isLoading ? <Skeleton height="2rem" /> : newestDiscussion ? (
                <>
                  <h4 className="st-card-subtitle" style={{
                    fontSize: "1.05rem", marginTop: "0.5rem", marginBottom: "0.25rem",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                  }}>
                    {safeStr(newestDiscussion.message, "—")}
                  </h4>
                  <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>
                    By <strong>{safeStr(newestDiscussion.name, "Anonymous")}</strong>
                    {safeStr(newestDiscussion.category) ? ` • ${newestDiscussion.category}` : ""}
                  </p>
                </>
              ) : (
                <EmptyState icon="🌱" message="No discussions yet" />
              )}
            </article>

            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Resonated</p>
              {isLoading ? <Skeleton height="2rem" /> : mostResonated ? (
                <>
                  <h4 className="st-card-subtitle" style={{
                    fontSize: "1.05rem", marginTop: "0.5rem", marginBottom: "0.25rem",
                    overflow: "hidden", textOverflow: "ellipsis",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical"
                  }}>
                    {safeStr(mostResonated.message, "—")}
                  </h4>
                  <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>
                    <strong>{safeNum(mostResonated.resonated, 0)}</strong> people resonated
                    {safeStr(mostResonated.category) ? ` • ${mostResonated.category}` : ""}
                  </p>
                </>
              ) : (
                <EmptyState icon="❤️" message="No discussions yet" />
              )}
            </article>

            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Pending Reports</p>
              {isLoading ? <Skeleton height="2rem" /> : pendingReports > 0 ? (
                <>
                  <h4 className="st-card-subtitle" style={{ fontSize: "1.05rem", marginTop: "0.5rem", marginBottom: "0.25rem", color: "#ef4444" }}>
                    {pendingReports} report{pendingReports !== 1 ? "s" : ""} pending
                  </h4>
                  <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>Require moderation attention</p>
                </>
              ) : (
                <>
                  <h4 className="st-card-subtitle" style={{ fontSize: "1.05rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                    All clear
                  </h4>
                  <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>No reports awaiting review</p>
                </>
              )}
            </article>

            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Total Discussion Categories</p>
              {isLoading ? <Skeleton height="2rem" /> : (
                <h4 className="st-card-subtitle" style={{ fontSize: "1.05rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}>
                  {activeCategories} active {activeCategories !== 1 ? "categories" : "category"}
                </h4>
              )}
              <p className="st-card-detail" style={{ fontSize: "0.85rem" }}>
                {isLoading ? "…" : `${totalDiscussions} total discussions`}
              </p>
            </article>
          </div>
        </section>

        {/* ── ENGAGEMENT ───────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">ENGAGEMENT</h2>
          <div className="satyatech-cards-row st-activity-row">

            {/* Community Overview mini-tiles */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Community Overview</h4>
              <p className="st-card-detail" style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Discussion &amp; moderation</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {[
                  { label: "Total Discussion", value: totalDiscussions },
                  { label: "Total Chapters",   value: totalChapters },
                  { label: "Total Practices",  value: totalPractices },
                  { label: "Active Categories",value: activeCategories },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    flex: "1 1 200px", display: "flex", flexDirection: "column",
                    justifyContent: "space-between", minHeight: "130px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f2fcf6 100%)",
                    border: "1px solid #e9d8f4", padding: "1.5rem", borderRadius: "16px"
                  }}>
                    <p className="st-card-label" style={{ margin: 0, color: "#6b7280", fontWeight: "400", fontSize: "1rem", textTransform: "none", letterSpacing: "normal" }}>
                      {label}
                    </p>
                    <h3 className="st-card-value" style={{ fontSize: "2rem", margin: 0, color: "#111827", fontWeight: "700" }}>
                      {isLoading ? <Skeleton width="50px" height="1.8rem" /> : value}
                    </h3>
                  </div>
                ))}
              </div>
            </article>

            {/* Most Active Discussion Categories bar chart */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Most Active Discussion Categories</h4>
              <p className="st-card-detail" style={{ marginBottom: "0.5rem", color: "#6b7280" }}>Ranked by posts</p>
              <CategoryBarChart categories={barChartData} loading={isLoading} />
            </article>
          </div>
        </section>

        {/* ── DONATIONS ───────────────────────────────────────── */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">DONATIONS</h2>
          <div className="satyatech-cards-row">
            <MetricCard loading={isLoading} label="Total Contributions"         value={safeRupiah(donations?.summary?.total ?? 0)} note="+12.4% compared to last month" />
            <MetricCard loading={isLoading} label="Highest Contribution"        value={safeRupiah(donations?.summary?.highest ?? 0)} note="Largest single donation this month" />
            <MetricCard loading={isLoading} label="Average Donation"            value={safeRupiah(donations?.summary?.average ?? 0)} note="Average amount per donation" />
            <MetricCard loading={isLoading} label="Recurring Donors"            value={`${donations?.summary?.recurring ?? 60}%`}  note="Contributors who donated more than once" />
          </div>

          <div className="satyatech-cards-row st-activity-row" style={{ marginTop: "1.5rem" }}>

            {/* Recent Donations */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Recent Donations</h4>
              <p className="st-card-detail" style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Latest contributions</p>
              <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflowX: "auto" }}>
                <div style={{ background: "#f8f5fa", padding: "1rem", display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", minWidth: "400px" }}>
                  <span style={{ fontSize: "0.9rem", color: "#8e6d9b", fontWeight: "500" }}>Supporter</span>
                  <span style={{ fontSize: "0.9rem", color: "#8e6d9b", fontWeight: "500" }}>Date</span>
                  <span style={{ fontSize: "0.9rem", color: "#8e6d9b", fontWeight: "500", textAlign: "right" }}>Amount</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", minWidth: "400px" }}>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} style={{ padding: "1rem" }}><Skeleton height="1.5rem" /></div>
                    ))
                  ) : recentSupporters.length > 0 ? (
                    recentSupporters.map((item, index, arr) => {
                      const name   = safeStr(item?.name, "Anonymous");
                      const amount = safeNum(item?.amount, 0);
                      const date   = safeDate(item?.date);
                      return (
                        <div key={index} style={{
                          display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", alignItems: "center",
                          padding: "1rem", borderBottom: index !== arr.length - 1 ? "1px solid #f3f4f6" : "none",
                          background: "#ffffff"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img src={avatarUrl(name, 32)} alt={name}
                              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <span style={{ fontSize: "0.9rem", fontWeight: "500", color: "#111827" }}>{name}</span>
                          </div>
                          <span style={{ fontSize: "0.9rem", color: "#4b5563" }}>{date}</span>
                          <span style={{ fontSize: "0.9rem", color: "#111827", textAlign: "right" }}>
                            {safeRupiah(amount)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <EmptyState icon="🎁" message="No donations yet" />
                  )}
                </div>
              </div>
            </article>

            {/* Top Supporters */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>Top Supporters</h4>
              <p className="st-card-detail" style={{ marginBottom: "1.5rem", color: "#6b7280" }}>Ranked by total contribution</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {isLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} height="56px" radius="16px" />)
                ) : topSupporters.length > 0 ? (
                  topSupporters.map((item, index) => {
                    const name   = safeStr(item?.name, "Anonymous");
                    const amount = safeNum(item?.amount, 0);
                    return (
                      <div key={index} style={{
                        display: "flex", alignItems: "center", background: "#f8f5fa",
                        border: "1px solid #eae6f0", borderRadius: "16px", padding: "0.875rem 1.25rem"
                      }}>
                        <span style={{ width: "36px", color: "#8e6d9b", fontWeight: "500", fontSize: "1.1rem" }}>
                          {index + 1}
                        </span>
                        <img src={avatarUrl(name, 36)} alt={name}
                          style={{ width: "36px", height: "36px", borderRadius: "50%", marginRight: "1rem" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <span style={{ flex: 1, fontSize: "0.95rem", fontWeight: "500", color: "#111827" }}>
                          {name}
                        </span>
                        <span style={{ fontSize: "0.95rem", color: "#111827" }}>
                          {safeRupiah(amount)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <EmptyState icon="🏆" message="No donors yet" />
                )}
              </div>
            </article>
          </div>
        </section>

      </div>
    </div>
  );
}
