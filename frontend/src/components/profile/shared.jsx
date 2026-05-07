export function LoadingCard() {
  return (
    <div className="tb-loading-card">
      <p className="tb-text-muted">Cargando...</p>
    </div>
  )
}

export function Empty({ text }) {
  return (
    <div className="tb-empty-state">
      <p style={{ fontSize: '32px' }}>📭</p>
      <p className="tb-text-muted">{text}</p>
    </div>
  )
}
