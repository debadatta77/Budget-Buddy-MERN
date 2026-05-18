export default function PlaceholderPage({ title, description }) {
  return (
    <section className="page-card">
      <p className="eyebrow">React scaffold</p>
      <h1>{title}</h1>
      <p className="page-copy">{description}</p>
      <div className="status-grid">
        <div>
          <span className="status-label">Stage</span>
          <strong>Scaffolded</strong>
        </div>
        <div>
          <span className="status-label">Next</span>
          <strong>Port logic page by page</strong>
        </div>
      </div>
    </section>
  );
}
