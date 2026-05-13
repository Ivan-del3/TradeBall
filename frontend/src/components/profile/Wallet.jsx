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
  const [wallet, setWallet]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState(null)
  const [amount, setAmount]         = useState('')
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadWallet = () =>
    client('/wallet')
      .then(data => { setWallet(data); setLoading(false) })
      .catch(() => setLoading(false))

  useEffect(() => { loadWallet() }, [])

  const balance        = Number(wallet?.balance || 0)
  const pendingAmount  = Number(wallet?.pending_amount || 0)
  const availableBalance = Math.max(0, balance - pendingAmount)

  const openForm = (type) => { setView(type); setAmount(''); setError('') }
  const closeForm = ()    => { setView(null); setAmount(''); setError('') }

  const validateAmount = () => {
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val <= 0) return 'Introduce un importe válido.'
    if (view === 'deposit') {
      if (val > 99999)           return 'El importe máximo es 99.999€.'
      if (balance + val > 99999) return `Solo puedes ingresar hasta ${(99999 - balance).toFixed(2)}€.`
    }
    if (view === 'withdraw' && val > availableBalance) return 'Saldo insuficiente.'
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
    <div className="tb-stack">
      <div className="tb-card">
        <h2 className="tb-card-title">Monedero</h2>

        <div className="tb-wallet-balance-card">
          <p className="tb-wallet-balance-label">Saldo total</p>
          <p className="tb-wallet-balance-amount">{balance.toFixed(2)}€</p>
          {pendingAmount > 0 && (
            <p className="tb-text-muted" style={{ fontSize: 'var(--fs-meta)', marginTop: '0.25rem' }}>
              Reservado en compras pendientes: {pendingAmount.toFixed(2)}€ · Disponible para retirar: {availableBalance.toFixed(2)}€
            </p>
          )}
        </div>

        {view === null && (
          <div className="tb-wallet-actions">
            <button onClick={() => openForm('deposit')} className="tb-btn-wallet">
              Ingresar dinero
            </button>
            <button onClick={() => openForm('withdraw')} className="tb-btn-wallet-outline">
              Retirar dinero
            </button>
          </div>
        )}

        {view !== null && (
          <form onSubmit={handleSubmit} className="tb-form-stack">
            <p className="tb-wallet-form-label">
              {view === 'deposit' ? 'Ingresar dinero' : 'Retirar dinero'}
            </p>
            <div className="tb-wallet-input-wrap">
              <input
                type="number"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
                placeholder="0.00"
                min="0.01"
                max={view === 'deposit' ? 99999 : availableBalance}
                step="0.01"
                className="tb-wallet-input"
              />
              <span className="tb-input-suffix">€</span>
            </div>
            {view === 'withdraw' && (
              <p className="tb-text-muted" style={{ fontSize: 'var(--fs-meta)' }}>
                Máximo disponible: {availableBalance.toFixed(2)}€
                {pendingAmount > 0 && ` (${pendingAmount.toFixed(2)}€ reservados en compras pendientes)`}
              </p>
            )}
            {error && <p className="tb-hint-error">{error}</p>}
            <div className="tb-wallet-actions">
              <button type="submit" disabled={submitting} className="tb-btn-wallet">
                {submitting ? 'Procesando...' : 'Confirmar'}
              </button>
              <button type="button" onClick={closeForm} className="tb-btn-wallet-outline">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tb-card">
        <h2 className="tb-card-title--sm">Últimas transacciones</h2>
        {!wallet?.transactions?.length ? (
          <Empty text="No hay transacciones todavía" />
        ) : (
          <div className="tb-tx-list">
            {wallet.transactions.map(tx => {
              const isPositive = tx.type === 'deposito' || tx.type === 'cobro_pedido'
              return (
                <div key={tx.id} className="tb-tx-row">
                  <div>
                    <p className="tb-tx-label">{TX_LABEL[tx.type] ?? tx.type}</p>
                    <p className="tb-tx-date">{new Date(tx.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                  <span className={`tb-tx-amount ${isPositive ? 'tb-tx-amount--positive' : 'tb-tx-amount--negative'}`}>
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
