import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import client from '../api/client'

const NotificationsContext = createContext({
  counts: { sales: 0, purchases: 0, chat: 0, reviews: 0 },
  total: 0,
  markReviewsRead: () => {},
  refresh: () => {},
})

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ sales: 0, purchases: 0, chat: 0, reviews: 0 })
  const reviewsTotalRef = useRef(0)
  const countsRef       = useRef({ sales: 0, purchases: 0, chat: 0, reviews: 0 })

  const refresh = useCallback(async () => {
    if (!user) {
      setCounts({ sales: 0, purchases: 0, chat: 0, reviews: 0 })
      return
    }

    try {
      const data = await client('/notifications/counts')
      const seenKey = `tb_reviews_seen_${user.id}`
      const seen = parseInt(localStorage.getItem(seenKey) || '0') || 0
      reviewsTotalRef.current = data.reviews

      const next = {
        sales:     data.sales,
        purchases: data.purchases,
        chat:      data.chat,
        reviews:   Math.max(0, data.reviews - seen),
      }

      const prev = countsRef.current
      countsRef.current = next
      setCounts(next)

      if (next.sales > prev.sales || next.purchases > prev.purchases || next.chat > prev.chat) {
        window.dispatchEvent(new CustomEvent('trb:counts-changed', { detail: { prev, next } }))
      }
    } catch (err) {
      console.error('[Notifications] refresh failed:', err)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      reviewsTotalRef.current = 0
    }
    refresh()
    if (!user) return
    const id = setInterval(refresh, 10000)
    return () => clearInterval(id)
  }, [user, refresh])

  const markReviewsRead = useCallback(() => {
    if (!user) return
    localStorage.setItem(`tb_reviews_seen_${user.id}`, String(reviewsTotalRef.current))
    setCounts(prev => ({ ...prev, reviews: 0 }))
  }, [user])

  const total = counts.sales + counts.purchases + counts.chat + counts.reviews

  return (
    <NotificationsContext.Provider value={{ counts, total, markReviewsRead, refresh }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationsContext)
