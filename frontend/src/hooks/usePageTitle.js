import { useEffect } from 'react'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `TradeBall - ${title}` : 'TradeBall'
    return () => { document.title = 'TradeBall' }
  }, [title])
}
