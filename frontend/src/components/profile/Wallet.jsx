import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

export default function Wallet() {
  const [wallet, setWallet]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client('/wallet')
      .then(data => { setWallet(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingCard />

  return (
    <div className="space-y-4">
      {/* Saldo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monedero</h2>
        <div className="bg-yellow-400 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-yellow-900 mb-1">Saldo disponible</p>
          <p className="text-4xl font-bold text-black">
            {Number(wallet?.balance || 0).toFixed(2)}€
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Últimas transacciones</h2>
        {wallet?.transactions?.length === 0 ? (
          <Empty text="No hay transacciones todavia" />
        ) : (
          <div className="space-y-3">
            {wallet?.transactions?.map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                <p className="text-sm font-medium text-gray-900 capitalize">
                    {tx.type.replace('_', ' ')} 
                </p>
                <p className="text-xs text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString('es-ES')}
                </p>
                </div>
                <span className={`text-sm font-bold ${
                tx.type === 'deposito' || tx.type === 'cobro_pedido'
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}>
                {tx.type === 'deposito' || tx.type === 'cobro_pedido' ? '+' : '-'}
                {Number(tx.amount).toFixed(2)}€
                </span>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}