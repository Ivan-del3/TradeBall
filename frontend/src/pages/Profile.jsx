import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import UserInfo from '../components/profile/UserInfo'
import Sales from '../components/profile/Sales'
import Purchases from '../components/profile/Purchases'
import Chat from '../components/profile/Chat'
import Notifications from '../components/profile/Notifications'
import Wallet from '../components/profile/Wallet'
import Reviews from '../components/profile/Reviews'

const SECTIONS = [
  { key: 'info',          label: 'Mi perfil',       icon: '👤' },
  { key: 'sales',         label: 'Mis ventas',       icon: '📦' },
  { key: 'purchases',     label: 'Mis compras',      icon: '🛍️' },
  { key: 'chat',          label: 'Chat',             icon: '💬' },
  { key: 'notifications', label: 'Notificaciones',   icon: '🔔' },
  { key: 'wallet',        label: 'Monedero',         icon: '💰' },
  { key: 'reviews',       label: 'Valoraciones',     icon: '⭐' },
]


export default function Profile({ initialSection, initialOrderId }) {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState(initialSection || 'info')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [chatOrderId, setChatOrderId]     = useState(initialOrderId || null)

  
  useEffect(() => {
    if (initialSection) setActiveSection(initialSection)
    if (initialOrderId) setChatOrderId(initialOrderId)
  }, [initialSection, initialOrderId])

  const handleSectionChange = (key) => {
    setActiveSection(key)
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">

          <aside className="hidden md:flex flex-col w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold text-black mb-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
              </div>
              <p className="font-semibold text-gray-900">{user.name} {user.lastname}</p>
              <p className="text-xs text-gray-400 mt-1">{user.email}</p>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {SECTIONS.map((section, index) => (
                <button
                  key={section.key}
                  onClick={() => handleSectionChange(section.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition text-left
                    ${index !== SECTIONS.length - 1 ? 'border-b border-gray-50' : ''}
                    ${activeSection === section.key
                      ? 'bg-yellow-50 text-yellow-700 border-r-2 border-r-yellow-400'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

            {/* Sidebar del movil */}
          <div className="md:hidden w-full mb-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full bg-white rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <span>{SECTIONS.find(s => s.key === activeSection)?.icon}</span>
                <span>{SECTIONS.find(s => s.key === activeSection)?.label}</span>
              </span>
              <span className="text-gray-400">{sidebarOpen ? '▲' : '▼'}</span>
            </button>

            {sidebarOpen && (
              <div className="bg-white rounded-2xl shadow-sm mt-2 overflow-hidden">
                {SECTIONS.map(section => (
                  <button
                    key={section.key}
                    onClick={() => { handleSectionChange(section.key); setSidebarOpen(false) }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition text-left border-b border-gray-50 last:border-0
                      ${activeSection === section.key
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span>{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          
          <main className="flex-1 min-w-0">
            {renderSection()}
          </main>

        </div>
      </div>
    </div>
  )
}