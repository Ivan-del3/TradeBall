import { createContext, useContext, useState } from 'react'

const AuthModalContext = createContext()

export function AuthModalProvider({ children }) {
  const [modal, setModal] = useState(null) 

  const openLogin    = () => setModal('login')
  const openRegister = () => setModal('register')
  const closeModal   = () => setModal(null)

  return (
    <AuthModalContext.Provider value={{ modal, openLogin, openRegister, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}