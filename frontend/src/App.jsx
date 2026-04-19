import { useAuth } from './context/AuthContext'
import Home from './pages/Home'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return <Home />
}

export default App