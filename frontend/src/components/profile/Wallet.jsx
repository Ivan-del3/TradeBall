import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

const TX_LABEL = {
  deposito:     'Ingreso',
  retirada:     'Retirada',
  pago_pedido:  'Pago de pedido',
  cobro_pedido: 'Cobro de pedido',
}

export default function Wallet() {
  const [wallet, setWallet]           = useState(null)
  const [loading, setLoading]         = useState(true)
  const [view, setView]               = useState(null) // 'deposit' | 'withdraw'
  const [amount, setAmount]           = useState('')
  const [error, setError]             = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const loadWallet = () =>
    client('/wallet')
      .then(data => { setWallet(data); setLoading(false) })
      .catch(() => setLoading(false))

  useEffect(() => { loadWallet() }, [])

  const balance = Number(wallet?.balance || 0)

  const openForm = (type) => {
    setView(type)
    setAmount('')
    setError('')
  }

  const closeForm = () => {
    setView(null)
    setAmount('')
    setError('')
  }

  const validateAmount = () => {
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val <= 0) return 'Introduce un importe válido.'
    if (view === 'deposit') {
      if (val > 99999)             return 'El importe máximo es 99.999€.'
      if (balance + val > 99999)   return `Solo puedes ingresar hasta ${(99999 - balance).toFixed(2)}€.`
    }
    if (view === 'withdraw') {
      if (val > balance) return 'Saldo insuficiente.'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateAmount()
    if (validationError) { setError(validationError); return }

    setSubmitting(true)
    setError('')
    try {
      const endpoint = view === 'deposit' ? '/wallet/deposit' : '/wallet/withdraw'
      const data = await client(endpoint, {
        method: 'PATCH',
        body: { amount: parseFloat(amount) },
      })
      setWallet(data)
      closeForm()
    } catch (err) {
      setError(err.message || 'Error al procesar la operación.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingCard />

  return (
    <div className="space-y-4">
      {/* Saldo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Monedero</h2>
        <div className="bg-yellow-400 rounded-2xl p-6 text-center mb-4">
          <p className="text-sm font-medium text-yellow-900 mb-1">Saldo disponible</p>
          <p className="text-4xl font-bold text-black">{balance.toFixed(2)}€</p>
        </div>

        {view === null && (
          <div className="flex gap-3">
            <button
              onClick={() => openForm('deposit')}
              className="flex-1 bg-yellow-400 text-black font-semibold py-2.5 rounded-xl hover:bg-yellow-300 transition text-sm"
            >
              Ingresar dinero
            </button>
            <button
              onClick={() => openForm('withdraw')}
              className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:border-gray-300 transition text-sm"
            >
              Retirar dinero
            </button>
          </div>
        )}

        {view !== null && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              {view === 'deposit' ? 'Ingresar dinero' : 'Retirar dinero'}
            </p>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
                placeholder="0.00"
                min="0.01"
                max={view === 'deposit' ? 99999 : balance}
                step="0.01"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            </div>
            {view === 'withdraw' && (
              <p className="text-xs text-gray-400">Máximo disponible: {balance.toFixed(2)}€</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-yellow-400 text-black font-semibold py-2.5 rounded-xl hover:bg-yellow-300 transition text-sm disabled:opacity-50"
              >
                {submitting ? 'Procesando...' : 'Confirmar'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:border-gray-300 transition text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Últimas transacciones */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Últimas transacciones</h2>
        {!wallet?.transactions?.length ? (
          <Empty text="No hay transacciones todavía" />
        ) : (
          <div className="space-y-3">
            {wallet.transactions.map(tx => {
              const isPositive = tx.type === 'deposito' || tx.type === 'cobro_pedido'
              return (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{TX_LABEL[tx.type] ?? tx.type}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {isPositive ? '+' : '-'}{Number(tx.amount).toFixed(2)}€
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
