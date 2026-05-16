import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import { NotificationsProvider } from './context/NotificationsContext'
import App from './App.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthModalProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AuthModalProvider>
    </AuthProvider>
  </StrictMode>
)