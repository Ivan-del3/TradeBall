import { useState, useEffect } from 'react'

function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/ping`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="p-8">Conectando con la API...</p>
  if (error)   return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test de conexión</h1>
      <div className="bg-green-100 border border-green-400 rounded p-4">
        <p>Estado: <strong>{data.status}</strong></p>
        <p>Mensaje: <strong>{data.message}</strong></p>
        <p>Timestamp: <strong>{data.timestamp}</strong></p>
      </div>
    </div>
  )
}

export default App