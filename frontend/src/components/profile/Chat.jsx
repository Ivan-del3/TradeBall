import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

export default function Chat() {
  const { user }                          = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv]       = useState(null)
  const [messages, setMessages]           = useState([])
  const [newMessage, setNewMessage]       = useState('')
  const [loading, setLoading]             = useState(true)
  const [sending, setSending]             = useState(false)
  const messagesEndRef                    = useRef(null)

  // Cargar conversaciones
  useEffect(() => {
    client('/chat/conversations')
      .then(data => {
        setConversations(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Cargar mensajes cuando cambia la conversación activa
  useEffect(() => {
    if (!activeConv) return
    client(`/chat/conversations/${activeConv.id}/messages`)
      .then(data => setMessages(data))
      .catch(() => {})
  }, [activeConv])

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      const data = await client(`/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: { message: newMessage.trim() },
      })
      setMessages(prev => [...prev, data])
      setNewMessage('')

      // Actualizar último mensaje en la lista de conversaciones
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, last_message: data }
          : c
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleProductClick = (productId) => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId }
    }))
  }

  if (loading) return <LoadingCard />

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: '600px' }}>
      <div className="flex h-full">

        {/* Lista de conversaciones */}
        <div className={`w-full md:w-72 flex-shrink-0 border-r border-gray-100 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Mensajes</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
                <p className="text-3xl">💬</p>
                <p className="text-gray-400 text-sm text-center">
                  No tienes conversaciones todavia
                </p>
              </div>
            ) : (
              conversations.map(conv => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  user={user}
                  isActive={activeConv?.id === conv.id}
                  onClick={() => setActiveConv(conv)}
                  onProductClick={handleProductClick}
                />
              ))
            )}
          </div>
        </div>

        {/* Ventana de chat */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0">

            {/* Header del chat */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              {/* Botón volver en móvil */}
              <button
                onClick={() => setActiveConv(null)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                ←
              </button>

              {/* Miniatura del producto */}
              <div
                onClick={() => handleProductClick(activeConv.product?.id)}
                className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {activeConv.product?.main_image?.image_url ? (
                    <img
                      src={activeConv.product.main_image.image_url}
                      alt={activeConv.product.name}
                      className="w-full h-full object-contain p-0.5"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {activeConv.product?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {Number(activeConv.product?.price).toFixed(2)}€
                    {' · '}
                    {getOtherUser(activeConv, user).name}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <p className="text-gray-400 text-sm">
                    Inicia la conversación sobre este producto
                  </p>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender_id === user.id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-2">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMessage.trim()}
                className="bg-yellow-400 text-black font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-yellow-300 transition disabled:opacity-40 flex-shrink-0"
              >
                →
              </button>
            </div>
          </div>
        ) : (
          /* Pantalla vacía en escritorio cuando no hay conv activa */
          <div className="hidden md:flex flex-1 items-center justify-center flex-col gap-3">
            <p className="text-4xl">💬</p>
            <p className="text-gray-400 text-sm">Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente fila de conversación
function ConversationRow({ conv, user, isActive, onClick }) {
  const other       = getOtherUser(conv, user)
  const lastMsg     = conv.last_message
  const hasUnread   = conv.unread_count > 0

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition text-left
        ${isActive ? 'bg-yellow-50' : ''}`}
    >
      {/* Miniatura producto */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {conv.product?.main_image?.image_url ? (
          <img
            src={conv.product.main_image.image_url}
            alt={conv.product.name}
            className="w-full h-full object-contain p-0.5"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
            {other.name}
          </p>
            {lastMsg && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
                {lastMsg.sender_id === user.id ? 'Tú: ' : ''}{lastMsg.message}  {/* ← corregido */}
            </p>
            )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 truncate">
            {conv.product?.name}
          </p>
          {hasUnread && (
            <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              {conv.unread_count}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {lastMsg.sender_id === user.id ? 'Tú: ' : ''}{lastMsg.content}
          </p>
        )}
      </div>
    </button>
  )
}

// Componente burbuja de mensaje
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm
        ${isOwn ? 'bg-yellow-400 text-black rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}
      >
        <p className="leading-relaxed">{message.message}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-yellow-800' : 'text-gray-400'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

// Helpers
function getOtherUser(conv, user) {
  return conv.buyer?.id === user.id ? conv.seller : conv.buyer
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = now - date

  if (diff < 60000)     return 'ahora'
  if (diff < 3600000)   return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000)  return `${Math.floor(diff / 3600000)}h`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}