export function LoadingCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-center py-20">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )
}

export function Empty({ text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-3xl">📭</p>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  )
}