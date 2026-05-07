export default function LogoutModal({ userName, onConfirm, onCancel }) {
  return (
    <div className="tb-overlay" onClick={onCancel}>
      <div className="tb-modal tb-modal-logout" onClick={e => e.stopPropagation()}>
        <button onClick={onCancel} className="tb-modal-close">&times;</button>
        <div className="tb-modal-emoji">👋</div>
        <h2 className="tb-modal-title">¡Hasta pronto, {userName}!</h2>
        <p className="tb-modal-subtitle">¿Seguro que quieres cerrar sesión?</p>
        <div className="tb-action-row">
          <button onClick={onCancel} className="tb-btn-secondary">Cancelar</button>
          <button onClick={onConfirm} className="tb-btn-dark">Cerrar sesión</button>
        </div>
      </div>
    </div>
  )
}
