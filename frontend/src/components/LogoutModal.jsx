export default function LogoutModal({ userName, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[400px] h-[400px] flex flex-col items-center justify-center text-center p-10 gap-4"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        <div className="text-5xl">👋</div>
        <h2 className="text-2xl font-bold text-gray-800">¡Hasta pronto, {userName}!</h2>
        <p className="text-gray-500 text-sm">¿Seguro que quieres cerrar sesión?</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}