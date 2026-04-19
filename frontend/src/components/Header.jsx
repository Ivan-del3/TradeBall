import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Login from '../pages/Login'
import Register from '../pages/Register'

function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default function Header() {
  const { user, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

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
                
                <a
                  href="/profile"
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition"
                >
                  Tu - {user.name}
                </a>
                <button onClick={logout}>
                  Cerrar sesión
                </button>

                
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full text-sm hover:bg-yellow-300 transition"
                >
                  + Vender
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-sm font-medium text-gray-700 hover:text-black transition"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <Login
            onSwitch={() => { setShowLogin(false); setShowRegister(true) }}
            onSuccess={() => setShowLogin(false)}
          />
        </Modal>
      )}

      {showRegister && (
        <Modal onClose={() => setShowRegister(false)}>
          <Register
            onSwitch={() => { setShowRegister(false); setShowLogin(true) }}
            onSuccess={() => setShowRegister(false)}
          />
        </Modal>
      )}
    </div>
  )
}