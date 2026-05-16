import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useNotifications } from '../context/NotificationsContext'
import { useState } from 'react'
import Favorites from '../pages/Favorites'
import Login from '../pages/Login'
import Register from '../pages/Register'
import LogoutModal from '../components/LogoutModal'
import Icon from './Icon'

export default function Header() {
  const { user, logout } = useAuth()
  const { modal, openLogin, openRegister, closeModal } = useAuthModal()
  const { total: notifTotal } = useNotifications()
  const [showFavorites, setShowFavorites] = useState(false)
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    logout()
    setShowLogout(false)
    window.dispatchEvent(new CustomEvent('navigate:home'))
  }

  return (
    <div>
      <header className="tb-header">
        <div className="tb-header-inner">
          <div
            onClick={() => window.dispatchEvent(new CustomEvent('navigate:home'))}
            className="tb-logo"
          >
            <img src="/logo.png" width="50" height="50" alt="Tradeball" />
            TradeBall
          </div>

          {/* Acciones visibles solo ≥ 684px */}
          <div className="tb-header-actions tb-header-actions--desktop">
            {user ? (
              <div className="tb-header-actions">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate:sell'))}
                  className="tb-btn-sell"
                >
                  <Icon name="plus" size={16} />
                  Vender
                </button>

                <button
                  onClick={() => setShowFavorites(true)}
                  className="tb-btn-favorites"
                >
                  <Icon name="heart-filled" size={16} color="var(--tb-red)" />
                  <span className="tb-favorites-label">Favoritos</span>
                </button>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate:profile'))}
                  className="tb-btn-profile-nav"
                >
                  <div className="tb-profile-nav-avatar">
                    <div className="tb-avatar-xs">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="tb-img-cover" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {notifTotal > 0 && (
                      <span className="tb-profile-bubble">{notifTotal > 99 ? '99+' : notifTotal}</span>
                    )}
                  </div>
                  {user.name}
                </button>

                <button onClick={() => setShowLogout(true)} className="tb-btn-logout">
                  <Icon name="logout" size={15} />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="tb-header-actions">
                <button onClick={openLogin} className="tb-btn-sell">
                  <Icon name="plus" size={16} />
                  Vender
                </button>
                <button onClick={openLogin} className="tb-btn-text">Iniciar sesión</button>
                <button onClick={openRegister} className="tb-btn-register">Registrarse</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Barra de navegación inferior — solo < 684px */}
      <nav className="tb-bottom-nav">
        {user ? (
          <>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate:sell'))}
              className="tb-bottom-nav-item"
            >
              <Icon name="plus" size={20} />
              <span>Vender</span>
            </button>

            <button
              onClick={() => setShowFavorites(true)}
              className="tb-bottom-nav-item"
            >
              <Icon name="heart" size={20} />
              <span>Favoritos</span>
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate:profile'))}
              className="tb-bottom-nav-item"
            >
              <div className="tb-profile-nav-avatar">
                <div className="tb-avatar-xs">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="tb-img-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                {notifTotal > 0 && (
                  <span className="tb-profile-bubble">{notifTotal > 99 ? '99+' : notifTotal}</span>
                )}
              </div>
              <span>Perfil</span>
            </button>

            <button
              onClick={() => setShowLogout(true)}
              className="tb-bottom-nav-item"
            >
              <Icon name="logout" size={20} />
              <span>Cerrar sesión</span>
            </button>
          </>
        ) : (
          <>
            <button onClick={openLogin} className="tb-bottom-nav-item">
              <Icon name="plus" size={20} />
              <span>Vender</span>
            </button>
            <button onClick={openLogin} className="tb-bottom-nav-item">
              <Icon name="user" size={20} />
              <span>Iniciar sesión</span>
            </button>
            <button onClick={openRegister} className="tb-bottom-nav-item tb-bottom-nav-item--accent">
              <Icon name="user" size={20} />
              <span>Registrarse</span>
            </button>
          </>
        )}
      </nav>

      {modal === 'login' && (
        <Login onSwitch={() => openRegister()} onSuccess={closeModal} onClose={closeModal} />
      )}
      {modal === 'register' && (
        <Register onSwitch={() => openLogin()} onSuccess={closeModal} onClose={closeModal} />
      )}

      {showFavorites && <Favorites onClose={() => setShowFavorites(false)} />}

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
