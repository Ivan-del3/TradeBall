import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useState } from 'react'
import Favorites from '../pages/Favorites'
import Login from '../pages/Login'
import Register from '../pages/Register'
import LogoutModal from '../components/LogoutModal'

// Componente auxiliar para el fondo del modal


export default function Header() {
  const { user, logout } = useAuth()
  const { modal, openLogin, openRegister, closeModal } = useAuthModal()
  const [showFavorites, setShowFavorites] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogout(false)
    window.dispatchEvent(new CustomEvent('navigate:home'))
  }

  return (
    <div>
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-yellow-400 tracking-tight">
            TradeBall
          </a>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <a
                  href="/sell"
                  className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition"
                >
                  + Vender
                </a>
                
                <button
                  onClick={() => setShowFavorites(true)}
                  className="flex items-center gap-1 bg-gray-100 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  <span className="text-red-400">♥</span>
                  <span className="hidden sm:inline">Favoritos</span>
                </button>
                
                <a
                  href="/profile"
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  Tú - {user.name}
                </a>

                <button
                  onClick={() => setShowLogout(true)}
                  className="text-sm text-gray-500 hover:text-gray-800 transition"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={openLogin}
                  className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition"
                >
                  + Vender
                </button>
                <button
                  onClick={openLogin}
                  className="text-sm font-medium text-gray-700 hover:text-black transition"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={openRegister}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {modal === 'login' && (
        <Login
          onSwitch={() => openRegister()}
          onSuccess={closeModal}
          onClose={closeModal}
        />
      )}
      {modal === 'register' && (
        <Register
          onSwitch={() => openLogin()}
          onSuccess={closeModal}
          onClose={closeModal}
        />
      )}

      {showFavorites && (
        <Favorites onClose={() => setShowFavorites(false)} />
      )}

      {showLogout && (
        <LogoutModal
          userName={user?.name}
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  )
}