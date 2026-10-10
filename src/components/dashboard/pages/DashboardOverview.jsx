import React, { useEffect, useState } from "react";
import { ActivityChart } from "../charts/ActivityChart";
import { DonutChart } from "../charts/DonutChart";
import "./dashboardOverview.css";

const available = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
const count = value => available(value) ? Number(value).toLocaleString("en-US") : "0";
const money = value => available(value) ? Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }) : "$0.00";
const list = value => Array.isArray(value) ? value : [];
function text(value, fallback = "No data yet") {
  if (!value) return fallback;
  if (typeof value === "object") return text(value.en || value["English 🇬🇧"] || value.English || Object.values(value)[0], fallback);
  try { const parsed = JSON.parse(value); if (parsed && typeof parsed === "object") return text(parsed, fallback); } catch { /* Plain text */ }
  return String(value);
}
function date(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "No date";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function sectionName(item) {
  return item ? [text(item.chapter, ""), text(item.section, "")].filter(Boolean).join(" — ") : "No data yet";
}
function change(current, previous) {
  if (!available(current) || !available(previous)) return null;
  if (Number(previous) === 0) return Number(current) > 0 ? { label: `+${count(current)} new`, tone: "up" } : null;
  const value = Math.round((Number(current) - Number(previous)) / Number(previous) * 100);
  return { label: `${value > 0 ? "+" : ""}${value}%`, tone: value < 0 ? "down" : "up" };
}
function Skeleton() { return <span className="dsh-skeleton" aria-label="Loading" />; }
function Card({ label, value, detail, loading, metric = false, tone = "plain", delta }) {
  return <article className={`dsh-card dsh-card--${tone}${metric ? " dsh-card--metric" : ""}`}>
    <p className="dsh-label">{label}</p>
    {loading ? <Skeleton /> : <div className="dsh-value" title={typeof value === "string" ? value : undefined}>{value ?? "No data yet"}</div>}
    <p className="dsh-detail">{!loading && delta && <span className={`dsh-delta dsh-delta--${delta.tone}`}>{delta.label}</span>}{detail}</p>
  </article>;
}
function Section({ title, children }) {
  return <section className="dsh-section" aria-label={title}><h2 className="dsh-section-title">{title}</h2>{children}</section>;
}
function Avatar({ name }) {
  const initials = text(name, "Anonymous").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <span className="dsh-avatar" aria-hidden="true">{initials}</span>;
}
const BAR_COLORS = ["#885f9a", "#629cae", "#d4a03b", "#32b787", "#4186f5", "#b69bc6", "#dfbb65"];
function CategoryBars({ categories, loading, unavailable }) {
  const rows = list(categories);
  const max = Math.max(1, ...rows.map(item => Number(item.count) || 0));
  const ceiling = Math.ceil(max / 5) * 5;
  return <article className="dsh-card dsh-bars-card">
    <h3 className="dsh-card-title">Most Active Discussion Categories</h3>
    <p className="dsh-detail">Ranked by posts</p>
    {loading ? <Skeleton /> : rows.length ? <div className="dsh-bars">
      {rows.map((item, index) => <div className="dsh-bar-row" key={item.name}>
        <span className="dsh-bar-label" title={text(item.name)}>{text(item.name)}</span>
        <div className="dsh-bar-track"><div className="dsh-bar" style={{ width: `${Number(item.count) / ceiling * 100}%`, background: BAR_COLORS[index % BAR_COLORS.length] }} /></div>
        <span className="dsh-bar-count">{count(item.count)}</span>
      </div>)}
      <div className="dsh-bar-axis">{Array.from({ length: 6 }, (_, index) => <span key={index}>{count(ceiling * index / 5)}</span>)}</div>
    </div> : <p className="dsh-empty">{unavailable ? "Data unavailable" : "No discussions yet"}</p>}
  </article>;
}

export function DashboardOverview() {
  const overviewDate = new Intl.DateTimeFormat("en-US", {
    month: "long", year: "numeric", timeZone: "Asia/Jakarta",
  }).format(new Date());
  const [timeRange, setTimeRange] = useState("weekly");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updated, setUpdated] = useState(null);
  useEffect(() => {
    let mounted = true;
    let pending = false;
    const controller = new AbortController();
    async function fetchStats(first = false) {
      if (pending) return;
      pending = true;
      if (!first) setRefreshing(true);
      try {
        const response = await fetch("/api/dashboard/stats", { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || !data.metrics || !data.donations) throw new Error("Invalid dashboard response");
        if (mounted) { setStats(data); setError(null); setUpdated(new Date()); }
      } catch (err) {
        if (mounted && err.name !== "AbortError") setError("Dashboard data could not be loaded. Retrying automatically.");
      } finally {
        pending = false;
        if (mounted) { setLoading(false); setRefreshing(false); }
      }
    }
    fetchStats(true);
    const interval = setInterval(() => fetchStats(), 30000);
    return () => { mounted = false; controller.abort(); clearInterval(interval); };
  }, []);

  const m = stats?.metrics ?? {};
  const notes = stats?.notes ?? {};
  const content = stats?.content ?? {};
  const community = stats?.community ?? {};
  const donation = stats?.donations?.summary ?? {};
  const pending = stats?.reports?.pendingCount;
  const range = stats?.activity?.[timeRange];
  const newest = community.newestDiscussion;
  const resonated = community.mostResonatedCategory;
  const tagged = notes.mostTaggedCategory;
  const top = list(stats?.donations?.topSupporters);
  const recent = list(stats?.donations?.recentSupporters);
  const unavailable = stats === null;
  const usage = list(stats?.appUsage?.items);
  const usageTotal = usage.reduce((sum, item) => sum + Math.max(0, Number(item.count) || 0), 0);
  const donutItems = usageTotal > 0 ? usage.map((item, index) => ({ ...item,
    value: Math.max(0, Number(item.count) || 0) / usageTotal * 100,
    tone: ["primary", "secondary", "tertiary", "quaternary"][index % 4] })) : [];

  return <div className="dsh-page" aria-busy={loading}>
    <header className="dashboard-header chapter-header dsh-header">
      <div className="dsh-header-copy">
        <h1>Dashboard</h1>
        <p>Overview &bull; {overviewDate}</p>
      </div>
    <div className="dsh-status" role="status">
      {error ? <span className="dsh-error">{error}{stats && " Showing the last loaded data."}</span> :
        <span>{loading ? "Loading dashboard…" : refreshing ? "Refreshing…" : updated ? `Updated ${updated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Data unavailable"}</span>}
    </div>
    </header>
    <div className="dsh-grid">
      <Section title="Key Metrics">
        <div className="dsh-row dsh-row--four">
          <Card loading={loading} metric tone="lavender" label="Weekly Active Users" value={`${count(m.weeklyActiveUsers)} Users`} detail="Activity tracking not available" />
          <Card loading={loading} metric tone="lavender" label="Returning Users" value={`${count(m.returningUsers)} Users`} detail="Return visits not tracked yet" />
          <Card loading={loading} metric tone="lavender" label="Notes Created (Last 30 Days)" value={`${count(m.notesLast30Days)} notes`} detail="Created in the last 30 days" />
          <Card loading={loading} metric tone="lavender" label="Highest Friction Chapter" value={text(m.highestFriction)} detail="Reading progress not tracked yet" />
        </div>
      </Section>
      <Section title="Most Used Content">
        <div className="dsh-row dsh-row--four">
          <Card loading={loading} label="Top Practice" value={text(content.topPractice?.title)} detail="Practice usage not tracked yet" />
          <Card loading={loading} label="Top Resource" value={text(content.topResource?.title)} detail="Resource usage not tracked yet" />
          <Card loading={loading} label="Most Noted Content" value={sectionName(content.mostNoted)} detail={content.mostNoted ? `${count(content.mostNoted.count)} notes on this section` : unavailable ? "Data unavailable" : "No notes yet"} />
          <Card loading={loading} label="Most Revisited Chapter" value={text(content.mostRevisited?.title)} detail="Revisits not tracked yet" />
        </div>
      </Section>
      <Section title="User Activity">
        <div className="dsh-row dsh-row--charts">
          <article className="dsh-card dsh-chart-card">
            <div className="dsh-chart-head"><div><h3 className="dsh-card-title">Active Users &amp; New Registrations</h3><p className="dsh-detail">Registrations by creation date; active users not tracked</p></div>
              <div className="dsh-toggles" aria-label="Activity time range">{["weekly", "monthly", "yearly"].map(item => <button type="button" key={item} className={`dsh-toggle${timeRange === item ? " dsh-toggle--active" : ""}`} aria-pressed={timeRange === item} onClick={() => setTimeRange(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
            </div>
            {loading ? <div className="dsh-chart-loading"><Skeleton /></div> : range?.labels?.length ? <ActivityChart labels={range.labels} primaryValues={range.primaryValues ?? []} secondaryValues={range.secondaryValues ?? []} /> : <p className="dsh-empty">Registration data unavailable</p>}
          </article>
          <article className="dsh-card dsh-donut-card">
            <h3 className="dsh-card-title">App Usage by Section</h3><p className="dsh-detail">{usageTotal ? "How users consume content" : "Section usage not tracked yet"}</p>
            {loading ? <div className="dsh-chart-loading"><Skeleton /></div> : <DonutChart items={donutItems} center={<div className="dsh-donut-center"><strong>{count(m.totalUsers)}</strong><span>Total Users</span></div>} />}
            {!donutItems.length && <div className="donut-legend dsh-usage-legend">{["Corpus (Book)", "Practices", "Media Library", "Community"].map((label, index) => <span key={label}><i className={`legend-dot legend-dot-${["primary", "secondary", "tertiary", "quaternary"][index]}`} />{label}</span>)}</div>}
          </article>
        </div>
      </Section>
      <Section title="Attention Needed">
        <div className="dsh-row dsh-row--three">
          <Card loading={loading} tone="peach" label="Reading Drop-off Increased" value={`${count(stats?.attention?.readingDropOff)}%`} detail="Reading progress not tracked yet" />
          <Card loading={loading} tone="peach" label="Community Reports" value={`${count(pending)} pending report${Number(pending) === 1 ? "" : "s"}`} detail={available(pending) ? Number(pending) > 0 ? "Reports requiring moderator review" : "No pending reports" : "Report data unavailable"} />
          <Card loading={loading} tone="peach" label="Low Engagement Alert" value={`${count(stats?.attention?.lowEngagementUsers)} Users`} detail="Engagement not tracked yet" />
        </div>
      </Section>
      <Section title="Notes & Bookmarks">
        <div className="dsh-row dsh-row--three">
          <Card loading={loading} label="Notes Created (7 Days)" value={`${count(notes.recent7Days)} notes`} delta={change(notes.recent7Days, notes.previous7Days)} detail="from previous 7 days" />
          <Card loading={loading} label="Bookmarks Created (7 Days)" value={`${count(notes.bookmarksRecent7Days)} bookmarks`} delta={change(notes.bookmarksRecent7Days, notes.bookmarksPrevious7Days)} detail="from previous 7 days" />
          <Card loading={loading} label="Most Tagged Category" value={text(tagged?.name)} detail={tagged ? `Tagged in ${count(tagged.count)} notes` : unavailable ? "Data unavailable" : "No tagged notes yet"} />
        </div>
      </Section>
      <Section title="Community">
        <div className="dsh-community">
          <div className="dsh-community-tiles">
            <Card loading={loading} tone="lavender" label="Newest Discussion" value={text(newest?.message)} detail={newest ? `By ${text(newest.name, "Anonymous")} · ${date(newest.createdAt)}` : unavailable ? "Data unavailable" : "No discussions yet"} />
            <Card loading={loading} label="Most Resonated Category" value={text(resonated?.name)} detail={resonated ? `${count(resonated.count)} resonances across discussions` : unavailable ? "Data unavailable" : "No resonances yet"} />
            <Card loading={loading} tone="lavender" label="Most Reported Reason" value={text(community.mostReportedCategory?.reason)} detail={community.mostReportedCategory ? `${count(community.mostReportedCategory.count)} pending reports` : available(pending) ? "No pending report reasons" : "Report data unavailable"} />
            <Card loading={loading} tone="lavender" label="Most Questioned Section" value={sectionName(content.mostQuestioned)} detail={content.mostQuestioned ? `${count(content.mostQuestioned.count)} notes tagged “Question”` : unavailable ? "Data unavailable" : "No notes tagged “Question” yet"} />
          </div>
          <CategoryBars categories={community.topDiscussionCategories} loading={loading} unavailable={unavailable} />
        </div>
      </Section>
      <Section title="Donations">
        <div className="dsh-row dsh-row--four">
          <Card loading={loading} label="Total Contributions" value={money(donation.total)} detail="Recorded contributions · all time" />
          <Card loading={loading} label="Highest Contribution" value={money(donation.highest)} detail="Highest recorded supporter total" />
          <Card loading={loading} label="Average Contribution" value={money(donation.average)} detail="Average per contributing supporter" />
          <Card loading={loading} label="Recurring Donors" value={`${count(donation.recurring)} Donors`} detail="Recurring payments not tracked yet" />
        </div>
        <div className="dsh-row dsh-row--donations">
          <article className="dsh-card dsh-supporters-card"><h3 className="dsh-card-title">Recent Supporters</h3><p className="dsh-detail">Contributing accounts, ordered by join date</p>
            <div className="dsh-table-wrap"><table className="dsh-table"><thead><tr><th scope="col">Contributor</th><th scope="col">Joined</th><th scope="col">Contribution</th></tr></thead><tbody>
              {loading ? <tr><td colSpan="3"><Skeleton /></td></tr> : recent.length ? recent.map((item, index) => <tr key={item.id ?? index}><td><div className="dsh-table-name"><Avatar name={item.name} /><span title={text(item.name)}>{text(item.name, "Anonymous")}</span></div></td><td>{date(item.joinedAt)}</td><td>{money(item.amount)}</td></tr>) : <tr><td colSpan="3" className="dsh-empty">{unavailable ? "Data unavailable" : "No contributions yet"}</td></tr>}
            </tbody></table></div>
          </article>
          <article className="dsh-card dsh-supporters-card"><h3 className="dsh-card-title">Top Contributors</h3><p className="dsh-detail">Ranked by total contribution</p><ol className="dsh-rank-list">
            {loading ? <li><Skeleton /></li> : top.length ? top.map((item, index) => <li className="dsh-rank-row" key={item.id ?? index}><span className="dsh-rank">{index + 1}</span><Avatar name={item.name} /><span className="dsh-rank-name" title={text(item.name)}>{text(item.name, "Anonymous")}</span><span className="dsh-amount">{money(item.amount)}</span></li>) : <li className="dsh-empty">{unavailable ? "Data unavailable" : "No contributors yet"}</li>}
          </ol></article>
        </div>
      </Section>
    </div>
  </div>;
}
