import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import { usePageTitle } from '../hooks/usePageTitle'
import Icon from '../components/Icon'
import UserInfo from '../components/profile/UserInfo'
import Sales from '../components/profile/Sales'
import Purchases from '../components/profile/Purchases'
import Chat from '../components/profile/Chat'
import Notifications from '../components/profile/Notifications'
import Wallet from '../components/profile/Wallet'
import Reviews from '../components/profile/Reviews'

const SECTIONS = [
  { key: 'info',          label: 'Mi perfil',       icon: 'user'   },
  { key: 'sales',         label: 'Mis ventas',       icon: 'box'    },
  { key: 'purchases',     label: 'Mis compras',      icon: 'bag'    },
  { key: 'chat',          label: 'Chat',             icon: 'chat'   },
  { key: 'notifications', label: 'Notificaciones',   icon: 'bell'   },
  { key: 'wallet',        label: 'Monedero',         icon: 'wallet' },
  { key: 'reviews',       label: 'Valoraciones',     icon: 'star'   },
]

export default function Profile({ initialSection, initialOrderId }) {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState(initialSection || 'info')
  usePageTitle(SECTIONS.find(s => s.key === activeSection)?.label ?? 'Perfil')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [chatOrderId, setChatOrderId]     = useState(initialOrderId || null)

  useEffect(() => {
    if (initialSection) setActiveSection(initialSection)
    if (initialOrderId) setChatOrderId(initialOrderId)
  }, [initialSection, initialOrderId])

  const handleSectionChange = (key) => {
    setActiveSection(key)
    window.dispatchEvent(new CustomEvent('navigate:profile', { detail: { section: key } }))
    if (key !== 'chat') setChatOrderId(null)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'info':          return <UserInfo />
      case 'sales':         return <Sales />
      case 'purchases':     return <Purchases />
      case 'chat':          return <Chat initialOrderId={chatOrderId} />
      case 'notifications': return <Notifications />
      case 'wallet':        return <Wallet />
      case 'reviews':       return <Reviews />
      default:              return <UserInfo />
    }
  }

  return (
    <div className="tb-page">
      <Header />

      <div className="tb-main-container">
        <div className={`tb-profile-layout${activeSection === 'chat' ? ' tb-profile-layout--chat' : ''}`}>

          {/* Sidebar escritorio */}
          <aside className="tb-profile-sidebar">
            <div className="tb-profile-card">
              <div className="tb-profile-avatar-lg">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="tb-img-cover-circle" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() ?? '?'
                )}
              </div>
              <p className="tb-profile-name">{user.name} {user.lastname}</p>
              <p className="tb-profile-email">{user.email}</p>
            </div>

            <nav className="tb-sidebar-nav">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.key}
                  onClick={() => handleSectionChange(section.key)}
                  className={`tb-sidebar-nav-item${activeSection === section.key ? ' tb-sidebar-nav-item--active' : ''}`}
                  style={index === SECTIONS.length - 1 ? { borderBottom: 'none' } : {}}
                >
                  <Icon name={section.icon} size={18} />
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Navegación móvil */}
          <div className="tb-mobile-nav">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="tb-mobile-nav-toggle"
            >
              <span className="tb-mobile-nav-current">
                <Icon name={SECTIONS.find(s => s.key === activeSection)?.icon} size={18} />
                <span>{SECTIONS.find(s => s.key === activeSection)?.label}</span>
              </span>
              <Icon
                name="chevron-down"
                size={16}
                style={{ color: 'var(--fg-3)', transform: sidebarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
              />
            </button>

            {sidebarOpen && (
              <div className="tb-mobile-nav-dropdown">
                {SECTIONS.map(section => (
                  <button
                    key={section.key}
                    onClick={() => { handleSectionChange(section.key); setSidebarOpen(false) }}
                    className={`tb-mobile-nav-item${activeSection === section.key ? ' tb-mobile-nav-item--active' : ''}`}
                  >
                    <Icon name={section.icon} size={18} />
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <main className="tb-profile-content">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  )
}
