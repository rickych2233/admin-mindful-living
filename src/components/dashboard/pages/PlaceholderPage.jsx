import React from "react";

export function PlaceholderPage({ title }) {
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