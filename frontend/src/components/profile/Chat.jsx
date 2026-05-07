import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'
import { LoadingCard } from './shared'
import Icon from '../Icon'
import echo from '../../echo'

export default function Chat({ initialOrderId }) {
  const { user }                            = useAuth()
  const [conversations, setConversations]   = useState([])
  const [activeConv, setActiveConv]         = useState(null)
  const [messages, setMessages]             = useState([])
  const [newMessage, setNewMessage]         = useState('')
  const [loading, setLoading]               = useState(true)
  const [sending, setSending]               = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState(null)
  const messagesEndRef                      = useRef(null)
  const prevMsgCountRef                     = useRef(0)
  const activeConvRef                       = useRef(null)
  const hiddenIdsRef                        = useRef(new Set())

  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  useEffect(() => {
    client('/chat/conversations')
      .then(data => {
        setConversations(data)
        setLoading(false)
        if (initialOrderId) {
          const conv = data.find(c => c.id === initialOrderId)
          if (conv) {
            setActiveConv(conv)
            if (!conv.last_message) setPendingOrderId(conv.id)
          }
        }
      })
      .catch(() => setLoading(false))
  }, [initialOrderId])

  useEffect(() => {
    if (loading) return
    const pollList = () => {
      client('/chat/conversations')
        .then(newConvs => {
          setConversations(prev => {
            const prevMap  = new Map(prev.map(c => [c.id, c]))
            const freshMap = new Map(newConvs.map(c => [c.id, c]))

            const merged = prev.map(c => {
              const fresh = freshMap.get(c.id)
              if (!fresh) return c
              const isActive = activeConvRef.current?.id === c.id
              return {
                ...c,
                unread_count: isActive ? c.unread_count : fresh.unread_count,
                last_message: fresh.last_message ?? c.last_message,
              }
            })

            newConvs.forEach(fresh => {
              if (prevMap.has(fresh.id)) return
              const wasHiddenManually = hiddenIdsRef.current.has(fresh.id)
              if (!wasHiddenManually) {
                merged.push(fresh)
              } else if (fresh.last_message) {
                hiddenIdsRef.current.delete(fresh.id)
                merged.push(fresh)
              }
            })

            const seen = new Set()
            return merged.filter(c => {
              if (seen.has(c.id)) return false
              seen.add(c.id)
              return true
            })
          })
        })
        .catch(() => {})
    }

    const intervalId = setInterval(pollList, 10000)
    return () => clearInterval(intervalId)
  }, [loading])

  useEffect(() => {
    if (!activeConv) return

    prevMsgCountRef.current = 0
    let fetchSettled = false
    const wsBuffer  = []

    const channel = echo.private(`order.${activeConv.id}`)

    channel.listen('MessageSent', (e) => {
      const msg = e.message
      if (!msg) return
      if (!fetchSettled) { wsBuffer.push(msg); return }

      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, last_message: msg, unread_count: 0 }
          : c
      ))
    })

    client(`/chat/conversations/${activeConv.id}/messages`)
      .then(data => {
        fetchSettled = true
        const extra = wsBuffer.filter(m => !data.some(d => d.id === m.id))
        setMessages([...data, ...extra])
        setConversations(prev => prev.map(c =>
          c.id === activeConv.id
            ? { ...c, unread_count: 0, last_message: data[data.length - 1] ?? c.last_message }
            : c
        ))
      })
      .catch(() => { fetchSettled = true })

    return () => { echo.leave(`order.${activeConv.id}`) }
  }, [activeConv])

  useEffect(() => {
    if (messages.length > prevMsgCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevMsgCountRef.current = messages.length
  }, [messages])

  useEffect(() => {
    if (pendingOrderId && activeConv?.id !== pendingOrderId) {
      setConversations(prev => prev.filter(c => c.id !== pendingOrderId))
      setPendingOrderId(null)
    }
  }, [activeConv, pendingOrderId])

  const visibleConversations = conversations.filter(c =>
    c.last_message !== null || c.id === activeConv?.id
  )

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      const data = await client(`/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: { message: newMessage.trim() },
      })
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
      setNewMessage('')
      setPendingOrderId(null)
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id ? { ...c, last_message: data } : c
      ))
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleProductClick = (productId) => {
    window.dispatchEvent(new CustomEvent('navigate:product', { detail: { productId } }))
  }

  const handleHide = async (orderId) => {
    if (!window.confirm('¿Eliminar esta conversación? Los mensajes se conservarán.')) return
    try {
      await client(`/chat/conversations/${orderId}/hide`, { method: 'PATCH' })
      hiddenIdsRef.current.add(orderId)
      setConversations(prev => prev.filter(c => c.id !== orderId))
      if (activeConv?.id === orderId) setActiveConv(null)
      if (pendingOrderId === orderId) setPendingOrderId(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <LoadingCard />

  return (
    <div className="tb-chat-wrapper">
      <div className="tb-chat-inner">

        {/* Lista de conversaciones */}
        <div className={`tb-chat-list${activeConv ? ' tb-chat-list--hidden-mobile' : ''}`}>
          <div className="tb-chat-list-header">
            <h2 className="tb-chat-list-title">Mensajes</h2>
          </div>

          <div className="tb-chat-list-body">
            {visibleConversations.length === 0 ? (
              <div className="tb-chat-empty-conv">
                <Icon name="chat" size={32} style={{ color: 'var(--fg-4)' }} />
                <p className="tb-chat-empty-text">No tienes conversaciones todavia</p>
              </div>
            ) : (
              visibleConversations.map(conv => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  user={user}
                  isActive={activeConv?.id === conv.id}
                  onClick={() => setActiveConv(conv)}
                  onHide={handleHide}
                />
              ))
            )}
          </div>
        </div>

        {/* Ventana de chat */}
        {activeConv ? (
          <div className="tb-chat-window">
            <div className="tb-chat-header">
              <button
                onClick={() => setActiveConv(null)}
                className="tb-btn-back-mobile"
              >
                <Icon name="arrow-left" size={20} />
              </button>

              <div
                onClick={() => handleProductClick(activeConv.product?.id)}
                className="tb-chat-header-link"
              >
                <div className="tb-chat-product-thumb">
                  {activeConv.product?.main_image?.image_url ? (
                    <img
                      src={activeConv.product.main_image.image_url}
                      alt={activeConv.product.name}
                    />
                  ) : (
                    <div className="tb-chat-product-thumb-empty" />
                  )}
                </div>
                <div className="tb-chat-product-info">
                  <p className="tb-chat-product-name">{activeConv.product?.name}</p>
                  <p className="tb-chat-product-meta">
                    {Number(activeConv.product?.price).toFixed(2)}€
                    {' · '}
                    {getOtherUser(activeConv, user).name}
                  </p>
                </div>
              </div>
            </div>

            <div className="tb-messages">
              {messages.length === 0 ? (
                <div className="tb-messages-empty">
                  <p className="tb-messages-empty-text">
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

            <div className="tb-chat-input-area">
              <div className="tb-chat-input-row">
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  maxLength={1000}
                  className="tb-chat-textarea"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="tb-chat-send"
                >
                  <Icon name="send" size={18} />
                </button>
              </div>
              {newMessage.length >= 900 && (
                <p className="tb-chat-counter">{1000 - newMessage.length} caracteres restantes</p>
              )}
            </div>
          </div>
        ) : (
          <div className="tb-chat-desktop-empty">
            <Icon name="chat" size={40} style={{ color: 'var(--fg-4)' }} />
            <p className="tb-chat-desktop-empty-text">Selecciona una conversación</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ConversationRow({ conv, user, isActive, onClick, onHide }) {
  const other     = getOtherUser(conv, user)
  const lastMsg   = conv.last_message
  const hasUnread = conv.unread_count > 0

  return (
    <div className={`tb-conv-row-wrap${isActive ? ' tb-conv-row-wrap--active' : ''}`}>
      <button onClick={onClick} className="tb-conv-btn">
        <div className="tb-conv-thumb">
          {conv.product?.main_image?.image_url ? (
            <img
              src={conv.product.main_image.image_url}
              alt={conv.product.name}
            />
          ) : (
            <div className="tb-conv-thumb-empty" />
          )}
        </div>

        <div className="tb-conv-info">
          <div className="tb-conv-info-top">
            <p className={`tb-conv-name${hasUnread ? ' tb-conv-name--unread' : ''}`}>
              {other.name}
            </p>
            {hasUnread && (
              <span className="tb-conv-unread">{conv.unread_count}</span>
            )}
          </div>
          <p className="tb-conv-product">{conv.product?.name}</p>
          {lastMsg && (
            <p className="tb-conv-last-msg">
              {lastMsg.sender_id === user.id ? 'Tú: ' : ''}{lastMsg.message}
            </p>
          )}
        </div>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onHide(conv.id) }}
        title="Eliminar conversación"
        className="tb-conv-hide"
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  )
}

function MessageBubble({ message, isOwn }) {
  const senderName = message.sender?.name ?? ''

  return (
    <div className={`tb-message${isOwn ? ' tb-message--own' : ' tb-message--other'}`}>
      <p className="tb-message-sender">{senderName}</p>
      <div className={`tb-bubble${isOwn ? ' tb-bubble--own' : ' tb-bubble--other'}`}>
        <p className="tb-bubble-text">{message.message}</p>
        <p className="tb-bubble-time">{formatTime(message.created_at)}</p>
      </div>
    </div>
  )
}

function getOtherUser(conv, user) {
  return conv.buyer?.id === user.id ? conv.seller : conv.buyer
}

function formatTime(dateString) {
  const date = new Date(dateString)
  const now  = new Date()
  const diff = now - date

  if (diff < 60000)    return 'ahora'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}
