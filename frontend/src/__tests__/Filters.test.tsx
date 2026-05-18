import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import Filters from '../components/Filters'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mockCategories = [
  { id: 1, name: 'Fútbol' },
  { id: 2, name: 'Tenis' },
]

const emptyFilters = {
  search: '',
  category_id: '',
  condition: '',
  min_price: '',
  max_price: '',
}

// ---------------------------------------------------------------------------
// Stateful wrapper — simula la relación real con Home (onChange recibe updater)
// ---------------------------------------------------------------------------

function FiltersWrapper({
  initial = emptyFilters,
  spy,
}: {
  initial?: typeof emptyFilters
  spy?: ReturnType<typeof vi.fn>
}) {
  const [filters, setFilters] = useState(initial)

  const onChange = (updater: unknown) => {
    setFilters(prev => {
      const next =
        typeof updater === 'function'
          ? (updater as (p: typeof emptyFilters) => typeof emptyFilters)(prev)
          : (updater as typeof emptyFilters)
      spy?.(next)
      return next
    })
  }

  return (
    <Filters categories={mockCategories} filters={filters} onChange={onChange} />
  )
}

// ---------------------------------------------------------------------------
// Helper: abre el panel de filtros (colapsado por defecto)
// ---------------------------------------------------------------------------

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /filtros/i }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Filters', () => {
  let spy: ReturnType<typeof vi.fn>
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    spy = vi.fn()
    user = userEvent.setup()
  })

  test('onChange se llama con el category_id correcto al cambiar la categoría', async () => {
    render(<FiltersWrapper spy={spy} />)
    await openPanel(user)

    await user.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), '1')

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ category_id: '1' }))
  })

  test('onChange se llama con el condition correcto al cambiar el estado', async () => {
    render(<FiltersWrapper spy={spy} />)
    await openPanel(user)

    await user.selectOptions(screen.getByRole('combobox', { name: /estado/i }), 'nuevo')

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ condition: 'nuevo' }))
  })

  test('onChange se llama con min_price correcto al escribir precio mínimo', async () => {
    render(<FiltersWrapper spy={spy} />)
    await openPanel(user)

    await user.type(screen.getByLabelText('Precio mínimo'), '25')

    // El spy se llama en cada keystroke; el último valor debe ser '25'
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({ min_price: '25' })
  })

  test('onChange se llama con max_price correcto al escribir precio máximo', async () => {
    render(<FiltersWrapper spy={spy} />)
    await openPanel(user)

    await user.type(screen.getByLabelText('Precio máximo'), '100')

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0]
    expect(lastCall).toMatchObject({ max_price: '100' })
  })

  test('onChange se llama inmediatamente al cambiar filtros (sin debounce)', async () => {
    render(<FiltersWrapper spy={spy} />)
    await openPanel(user)

    await user.selectOptions(screen.getByRole('combobox', { name: /estado/i }), 'usado')

    // La llamada ocurre de forma síncrona — no hay que esperar ningún timer
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('contador muestra el número correcto de filtros activos', async () => {
    render(
      <FiltersWrapper
        initial={{ ...emptyFilters, category_id: '1', condition: 'nuevo', min_price: '10' }}
      />
    )

    const toggleBtn = screen.getByRole('button', { name: /filtros/i })
    expect(within(toggleBtn).getByText('3')).toBeInTheDocument()
  })

  test('el contador no cuenta el campo search', async () => {
    render(
      <FiltersWrapper
        initial={{ ...emptyFilters, search: 'Balón' }}
      />
    )

    const toggleBtn = screen.getByRole('button', { name: /filtros/i })
    // Sin filtros de panel activos, no debe aparecer el badge
    expect(within(toggleBtn).queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  test('"Limpiar todo" resetea category, condition, min_price y max_price', async () => {
    render(
      <FiltersWrapper
        initial={{ ...emptyFilters, category_id: '1', condition: 'nuevo' }}
        spy={spy}
      />
    )
    await openPanel(user)

    await user.click(screen.getByRole('button', { name: /limpiar todo/i }))

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        category_id: '',
        condition: '',
        min_price: '',
        max_price: '',
      }),
    )
  })
})
