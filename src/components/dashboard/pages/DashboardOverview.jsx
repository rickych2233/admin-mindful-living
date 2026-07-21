import React, { useState } from "react";
import { ActivityChart } from "../charts/ActivityChart";
import { DonutChart } from "../charts/DonutChart";

export function DashboardOverview() {
  const currentDate = new Date();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const year = currentDate.getFullYear();

  const [timeRange, setTimeRange] = useState("weekly");

  const activityData = {
    weekly: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      primaryValues: [30, 45, 35, 25, 50, 70, 90],
      secondaryValues: [5, 8, 4, 3, 10, 15, 20]
    },
    monthly: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      primaryValues: [120, 180, 250, 310],
      secondaryValues: [25, 40, 55, 80]
    },
    yearly: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      primaryValues: [400, 550, 600, 750, 800, 950, 1100, 1050, 1200, 1400, 1600, 1850],
      secondaryValues: [80, 110, 100, 150, 160, 200, 240, 210, 280, 320, 380, 450]
    }
  };

  return (
    <div className="dashboard-content-wrapper">
      <header className="dashboard-header-satyatech">
        <h1>Dashboard</h1>
        <p>Overview &bull; {monthName} {year}</p>
      </header>

      <div className="satyatech-dashboard-grid">
        {/* KEY METRICS */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">KEY METRICS</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card st-metric-card">
              <p className="st-card-label">Weekly Active Users</p>
              <h3 className="st-card-value">3,482 user</h3>
              <div className="st-card-meta">
                <span className="st-chip st-chip-positive">+ 12%</span>
                <span className="st-note">compared to last week</span>
              </div>
            </article>
            <article className="satyatech-card st-metric-card">
              <p className="st-card-label">Returning Users</p>
              <h3 className="st-card-value">1,284 users</h3>
              <div className="st-card-meta">
                <span className="st-note">Users who came back and continued their reading journey</span>
              </div>
            </article>
            <article className="satyatech-card st-metric-card">
              <p className="st-card-label">Notes Created (Last 30 Days)</p>
              <h3 className="st-card-value">1,204 notes</h3>
              <div className="st-card-meta">
                <span className="st-chip st-chip-positive">+ 148</span>
                <span className="st-note">notes added this month</span>
              </div>
            </article>
            <article className="satyatech-card st-metric-card">
              <p className="st-card-label">Highest Friction Chapter</p>
              <h3 className="st-card-value">Chapter 3</h3>
              <div className="st-card-meta">
                <span className="st-chip st-chip-neutral">72%</span>
                <span className="st-note">of users did not complete this chapter</span>
              </div>
            </article>
          </div>
        </section>

        {/* MOST USED CONTENT */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">MOST USED CONTENT</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Top Practice</p>
              <h4 className="st-card-subtitle">Box Breathing Technique...</h4>
              <p className="st-card-detail">Average completion rate: <strong>84%</strong></p>
              <div className="st-progress-bar"><div className="st-progress-fill" style={{ width: '84%' }}></div></div>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Top Resource</p>
              <h4 className="st-card-subtitle">"The Power of Now" &mdash; Tolle</h4>
              <p className="st-card-detail">Saved by <strong>312</strong> users</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Noted Chapter</p>
              <h4 className="st-card-subtitle">Chapter 5 &mdash; Awareness of Though...</h4>
              <p className="st-card-detail">Most highlighted section this month</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Revisited Chapter</p>
              <h4 className="st-card-subtitle">Chapter 2 &mdash; Being Present</h4>
              <p className="st-card-detail">Users returned 2.8x on average</p>
            </article>
          </div>
        </section>

        {/* USER ACTIVITY */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">USER ACTIVITY</h2>
          <div className="satyatech-cards-row st-activity-row">
            <article className="satyatech-card st-chart-card st-chart-line-card">
              <div className="st-chart-header">
                <div>
                  <h4 className="st-card-subtitle">Active Users &amp; New Registrations</h4>
                  <p className="st-card-detail">Toggle to change time range</p>
                </div>
                <div className="st-chart-toggles">
                  <button
                    className={`st-toggle-btn ${timeRange === 'weekly' ? 'st-toggle-active' : ''}`}
                    onClick={() => setTimeRange('weekly')}
                  >Weekly</button>
                  <button
                    className={`st-toggle-btn ${timeRange === 'monthly' ? 'st-toggle-active' : ''}`}
                    onClick={() => setTimeRange('monthly')}
                  >Monthly</button>
                  <button
                    className={`st-toggle-btn ${timeRange === 'yearly' ? 'st-toggle-active' : ''}`}
                    onClick={() => setTimeRange('yearly')}
                  >Yearly</button>
                </div>
              </div>
              <div className="st-chart-container">
                <ActivityChart
                  labels={activityData[timeRange].labels}
                  primaryValues={activityData[timeRange].primaryValues}
                  secondaryValues={activityData[timeRange].secondaryValues}
                />
              </div>
            </article>

            <article className="satyatech-card st-chart-card st-donut-card">
              <div className="st-chart-header">
                <div>
                  <h4 className="st-card-subtitle">App Usage by Section</h4>
                  <p className="st-card-detail">How users consume content</p>
                </div>
              </div>
              <div className="st-donut-container">
                <DonutChart items={[
                  { label: "Corpus (Book)", value: 65, tone: "primary" },
                  { label: "Practices", value: 15, tone: "secondary" },
                  { label: "Media Library", value: 10, tone: "tertiary" },
                  { label: "Community", value: 10, tone: "quaternary" }
                ]} />
                <div className="st-donut-center">
                  <strong>4821</strong>
                  <span>Total Users</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ATTENTION NEEDED */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">ATTENTION NEEDED</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Reading Drop-off Increased</p>
              <h4 className="st-card-subtitle">Chapter 3 &mdash; Managing Stress &amp; Emotional Overlo...</h4>
              <p className="st-card-detail"><strong>+18%</strong> unfinished sessions this week</p>
            </article>
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Community Reports Spike</p>
              <h4 className="st-card-subtitle">Discussion Reports Increased</h4>
              <p className="st-card-detail"><strong>7</strong> pending reports requiring moderat...</p>
            </article>
            <article className="satyatech-card st-warning-card">
              <p className="st-card-label st-warning-label">Low Engagement Alert</p>
              <h4 className="st-card-subtitle">Chapter 6 &mdash; Mindful Communication</h4>
              <p className="st-card-detail"><strong>-12%</strong> daily active readers this week</p>
            </article>
          </div>
        </section>

        {/* NOTES & BOOKMARKS */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">NOTES & BOOKMARKS</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Notes Created (7 Days)</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>120 notes</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}><strong>+34</strong> notes since last week</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Bookmarks Created (7 Days)</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>358 bookmarks</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}><strong>+14</strong> bookmarks this week</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Tagged Category</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Awareness</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}>Tagged <strong>52</strong> times across notes and discussions</p>
            </article>
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">COMMUNITY</h2>
          <div className="satyatech-cards-row">
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Newest Spike in Discussions</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>"Emotional Burnout & Recovery"</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}><strong>+42</strong> new discussions in the last 48 hours</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Resonated Category</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Personal Reflection</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}>Highest number of meaningful interactions</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Reported Section</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Chapter 4 — Community Discussion</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}><strong>12</strong> reports submitted this week</p>
            </article>
            <article className="satyatech-card">
              <p className="st-card-label st-purple-text">Most Questioned Section</p>
              <h4 className="st-card-subtitle" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>Chapter 2 — Awareness & Presence</h4>
              <p className="st-card-detail" style={{ fontSize: '0.85rem' }}><strong>28</strong> questions tagged under "Question"</p>
            </article>
          </div>
        </section>

        {/* ENGAGEMENT & DONATIONS */}
        <section className="satyatech-section">
          <h2 className="satyatech-section-title">ENGAGEMENT & DONATIONS</h2>
          <div className="satyatech-cards-row st-activity-row">
            {/* Community Overview */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Community Overview</h4>
              <p className="st-card-detail" style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Discussion & moderation</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', background: 'linear-gradient(135deg, #ffffff 0%, #f2fcf6 100%)', border: '1px solid #e9d8f4', padding: '1.5rem', borderRadius: '16px' }}>
                  <p className="st-card-label" style={{ margin: 0, color: '#6b7280', fontWeight: '400', fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal' }}>Total Discussion</p>
                  <h3 className="st-card-value" style={{ fontSize: '2rem', margin: 0, color: '#111827', fontWeight: '700' }}>1024</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', background: 'linear-gradient(135deg, #ffffff 0%, #f2fcf6 100%)', border: '1px solid #e9d8f4', padding: '1.5rem', borderRadius: '16px' }}>
                  <p className="st-card-label" style={{ margin: 0, color: '#6b7280', fontWeight: '400', fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal' }}>Reported & Pending</p>
                  <h3 className="st-card-value" style={{ fontSize: '2rem', margin: 0, color: '#111827', fontWeight: '700' }}>7 <span style={{ fontSize: '1rem', fontWeight: '500' }}>pending</span></h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', background: 'linear-gradient(135deg, #ffffff 0%, #f2fcf6 100%)', border: '1px solid #e9d8f4', padding: '1.5rem', borderRadius: '16px' }}>
                  <p className="st-card-label" style={{ margin: 0, color: '#6b7280', fontWeight: '400', fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal' }}>Hidden Message</p>
                  <h3 className="st-card-value" style={{ fontSize: '2rem', margin: 0, color: '#111827', fontWeight: '700' }}>23</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', background: 'linear-gradient(135deg, #ffffff 0%, #f2fcf6 100%)', border: '1px solid #e9d8f4', padding: '1.5rem', borderRadius: '16px' }}>
                  <p className="st-card-label" style={{ margin: 0, color: '#6b7280', fontWeight: '400', fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal' }}>Active Categories</p>
                  <h3 className="st-card-value" style={{ fontSize: '2rem', margin: 0, color: '#111827', fontWeight: '700' }}>9</h3>
                </div>
              </div>
            </article>

            {/* Most Active Discussion Categories */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Most Active Discussion Categories</h4>
              <p className="st-card-detail" style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Ranked by posts & replies</p>

              <div style={{ position: 'relative', paddingBottom: '2rem', marginTop: '1rem' }}>
                {/* Vertical Grid Lines and X-Axis Labels */}
                <div style={{ position: 'absolute', top: 0, bottom: '2rem', left: '106px', right: '10%', display: 'flex', justifyContent: 'space-between', zIndex: 0 }}>
                  <div style={{ borderLeft: '1px dashed #e5e7eb', height: '100%', position: 'relative' }}>
                    <span style={{ position: 'absolute', bottom: '-2rem', left: '-12px', color: '#9ca3af', fontSize: '0.8rem' }}>200</span>
                  </div>
                  <div style={{ borderLeft: '1px dashed #e5e7eb', height: '100%', position: 'relative' }}>
                    <span style={{ position: 'absolute', bottom: '-2rem', left: '-12px', color: '#9ca3af', fontSize: '0.8rem' }}>250</span>
                  </div>
                  <div style={{ borderLeft: '1px dashed #e5e7eb', height: '100%', position: 'relative' }}>
                    <span style={{ position: 'absolute', bottom: '-2rem', left: '-12px', color: '#9ca3af', fontSize: '0.8rem' }}>300</span>
                  </div>
                  <div style={{ borderLeft: '1px dashed #e5e7eb', height: '100%', position: 'relative' }}>
                    <span style={{ position: 'absolute', bottom: '-2rem', left: '-12px', color: '#9ca3af', fontSize: '0.8rem' }}>350</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Chapter 3</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '85%', background: '#885F9A', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Meditation</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '72%', background: '#629CAE', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Breathwork</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '64%', background: '#D4A03B', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Chapter 1</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '48%', background: '#36B37E', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Grounding</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '42%', background: '#4788ED', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Sleep</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '35%', background: '#C0A3CF', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '90px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Chapter 2</span>
                    <div style={{ flex: 1, margin: 0, height: '12px', borderRadius: '6px' }}>
                      <div style={{ width: '25%', background: '#DFBB65', borderRadius: '6px', height: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className="satyatech-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* Chapter Completion Rate */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Chapter Completion Rate</h4>
              <p className="st-card-detail" style={{ marginBottom: '0.5rem', color: '#6b7280' }}>Chapters completion percentage rate</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '1.5rem' }}>
                {[
                  { name: 'Chapter 1', percent: 94 },
                  { name: 'Chapter 2', percent: 81 },
                  { name: 'Chapter 3', percent: 72 },
                  { name: 'Chapter 4', percent: 53 },
                  { name: 'Chapter 5', percent: 38 },
                  { name: 'Chapter 6', percent: 21 },
                  { name: 'Chapter 7', percent: 9 },
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ width: '70px', fontSize: '0.85rem', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                    <div style={{ flex: 1, height: '8px', background: '#f3f4f6', borderRadius: '9999px' }}>
                      <div style={{ width: `${item.percent}%`, height: '100%', background: '#629CAE', borderRadius: '9999px' }}></div>
                    </div>
                    <span style={{ width: '30px', textAlign: 'right', fontSize: '0.85rem', color: '#9ca3af' }}>{item.percent}%</span>
                  </div>
                ))}
              </div>
            </article>

            {/* Recent Donations */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Recent Donations</h4>
              <p className="st-card-detail" style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Latest contributions</p>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ background: '#f8f5fa', padding: '1rem', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr' }}>
                  <span style={{ fontSize: '0.9rem', color: '#8e6d9b', fontWeight: '500' }}>Supporter</span>
                  <span style={{ fontSize: '0.9rem', color: '#8e6d9b', fontWeight: '500' }}>Date</span>
                  <span style={{ fontSize: '0.9rem', color: '#8e6d9b', fontWeight: '500', textAlign: 'right' }}>Amount</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                    { name: 'Adam Coles', date: '20 Jan 2026', amount: '$998.20' },
                    { name: 'Ashley Williams', date: '19 Jan 2026', amount: '$825.40' },
                    { name: 'Barry Allen', date: '18 Jan 2026', amount: '$748.50' },
                    { name: 'Bella Thorne', date: '17 Jan 2026', amount: '$624.10' },
                    { name: 'Camila Cabello', date: '16 Jan 2026', amount: '$535.87' },
                  ].map((item, index, arr) => (
                    <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1fr',
                      alignItems: 'center',
                      padding: '1rem',
                      borderBottom: index !== arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                      background: '#ffffff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={`https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=random&color=fff&size=32`} alt={item.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>{item.date}</span>
                      <span style={{ fontSize: '0.9rem', color: '#111827', textAlign: 'right' }}>{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Top Supporters */}
            <article className="satyatech-card">
              <h4 className="st-card-subtitle" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Top Supporters</h4>
              <p className="st-card-detail" style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Ranked by total contribution</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Adam Coles', amount: '$998.20' },
                  { name: 'Ashley Williams', amount: '$825.40' },
                  { name: 'Barry Allen', amount: '$748.50' },
                  { name: 'Bella Thorne', amount: '$624.10' },
                  { name: 'Camila Cabello', amount: '$535.87' },
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', background: '#f8f5fa', border: '1px solid #eae6f0', borderRadius: '16px', padding: '0.875rem 1.25rem' }}>
                    <span style={{ width: '36px', color: '#8e6d9b', fontWeight: '500', fontSize: '1.1rem' }}>{index + 1}</span>
                    <img src={`https://ui-avatars.com/api/?name=${item.name.replace(' ', '+')}&background=random&color=fff&size=36`} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '50%', marginRight: '1rem' }} />
                    <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                    <span style={{ fontSize: '0.95rem', color: '#111827' }}>{item.amount}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
