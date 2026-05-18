import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import Home from '../pages/Home'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../api/client')
vi.mock('../components/Header', () => ({ default: () => <div data-testid="header" /> }))
vi.mock('../components/ProductCard', () => ({
  default: ({ product }: { product: { id: number; name: string } }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import client from '../api/client'

const mockClient = vi.mocked(client)

function makeProductPage(names: string[], currentPage = 1, lastPage = 1) {
  return {
    data: names.map((name, i) => ({ id: currentPage * 100 + i, name })),
    current_page: currentPage,
    last_page: lastPage,
  }
}

function setupClientMock(
  getProducts: (url: string) => ReturnType<typeof makeProductPage> = () =>
    makeProductPage([]),
) {
  mockClient.mockImplementation((url: unknown) => {
    const endpoint = url as string
    if (endpoint === '/categories') return Promise.resolve([])
    if (endpoint.startsWith('/products')) return Promise.resolve(getProducts(endpoint))
    return Promise.resolve({})
  })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Home — integración', () => {
  beforeEach(() => {
    setupClientMock()
  })

  afterEach(() => {
    vi.clearAllMocks()
    // Garantiza que fake timers de cualquier test no contaminen los siguientes
    vi.useRealTimers()
  })

  // -------------------------------------------------------------------------
  // Carga inicial
  // -------------------------------------------------------------------------

  test('la carga inicial llama a client con /products?page=1', async () => {
    render(<Home />)

    await waitFor(() => {
      const call = mockClient.mock.calls.find(
        ([url]) => typeof url === 'string' && (url as string).startsWith('/products'),
      )
      expect(call?.[0]).toContain('page=1')
    })
  })

  // -------------------------------------------------------------------------
  // Filtros → query params correctos
  // -------------------------------------------------------------------------

  test('al cambiar la categoría, client se llama con category_id en los params', async () => {
    const user = userEvent.setup()
    const categories = [{ id: 3, name: 'Baloncesto' }]

    mockClient.mockImplementation((url: unknown) => {
      const endpoint = url as string
      if (endpoint === '/categories') return Promise.resolve(categories)
      return Promise.resolve(makeProductPage([]))
    })

    render(<Home />)

    await waitFor(() => expect(mockClient).toHaveBeenCalledWith('/categories'))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), '3')

    await waitFor(() => {
      const productCalls = mockClient.mock.calls.filter(
        ([url]) => typeof url === 'string' && (url as string).startsWith('/products'),
      )
      const lastUrl = productCalls[productCalls.length - 1]?.[0] as string
      expect(lastUrl).toContain('category_id=3')
    })
  })

  test('al cambiar condition, client se llama con el param correcto', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => expect(mockClient).toHaveBeenCalledWith('/categories'))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /estado/i }), 'nuevo')

    await waitFor(() => {
      const productCalls = mockClient.mock.calls.filter(
        ([url]) => typeof url === 'string' && (url as string).startsWith('/products'),
      )
      const lastUrl = productCalls[productCalls.length - 1]?.[0] as string
      expect(lastUrl).toContain('condition=nuevo')
    })
  })

  // -------------------------------------------------------------------------
  // Debounce del campo search — sin fake timers para evitar contaminación
  // -------------------------------------------------------------------------

  test('debounce: client no se llama con search= inmediatamente al escribir', async () => {
    render(<Home />)

    // Esperar la carga inicial antes de empezar a observar
    await waitFor(() => expect(mockClient).toHaveBeenCalledWith('/categories'))
    mockClient.mockClear()

    fireEvent.change(screen.getByLabelText('Buscar productos'), {
      target: { value: 'Balón' },
    })

    // Llamada síncrona inmediata — no debe existir todavía
    const immediateSearchCalls = mockClient.mock.calls.filter(
      ([url]) => typeof url === 'string' && (url as string).includes('search='),
    )
    expect(immediateSearchCalls).toHaveLength(0)

    // Después del debounce (≥ 400 ms) la llamada debe aparecer
    await waitFor(
      () => {
        const debouncedCalls = mockClient.mock.calls.filter(
          ([url]) => typeof url === 'string' && (url as string).includes('search='),
        )
        expect(debouncedCalls.length).toBeGreaterThan(0)
      },
      { timeout: 2000 },
    )
  })

  // -------------------------------------------------------------------------
  // Ordenación por precio
  // -------------------------------------------------------------------------

  test('al seleccionar sort_price=asc, client se llama con el param correcto', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => expect(mockClient).toHaveBeenCalledWith('/categories'))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /ordenar por precio/i }), 'asc')

    await waitFor(() => {
      const productCalls = mockClient.mock.calls.filter(
        ([url]) => typeof url === 'string' && (url as string).startsWith('/products'),
      )
      const lastUrl = productCalls[productCalls.length - 1]?.[0] as string
      expect(lastUrl).toContain('sort_price=asc')
    })
  })

  test('al seleccionar sort_price=desc, client se llama con el param correcto', async () => {
    const user = userEvent.setup()
    render(<Home />)

    await waitFor(() => expect(mockClient).toHaveBeenCalledWith('/categories'))

    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /ordenar por precio/i }), 'desc')

    await waitFor(() => {
      const productCalls = mockClient.mock.calls.filter(
        ([url]) => typeof url === 'string' && (url as string).startsWith('/products'),
      )
      const lastUrl = productCalls[productCalls.length - 1]?.[0] as string
      expect(lastUrl).toContain('sort_price=desc')
    })
  })

  // -------------------------------------------------------------------------
  // "Cargar más" — concatena productos
  // -------------------------------------------------------------------------

  test('"Cargar más" añade productos al array en lugar de reemplazarlos', async () => {
    const user = userEvent.setup()

    setupClientMock(url => {
      if (url.includes('page=2')) return makeProductPage(['Producto C'], 2, 2)
      return makeProductPage(['Producto A', 'Producto B'], 1, 2)
    })

    render(<Home />)

    await waitFor(() =>
      expect(screen.getAllByTestId('product-card')).toHaveLength(2),
    )

    await user.click(await screen.findByRole('button', { name: /cargar más/i }))

    await waitFor(() =>
      expect(screen.getAllByTestId('product-card')).toHaveLength(3),
    )

    expect(screen.getByText('Producto A')).toBeInTheDocument()
    expect(screen.getByText('Producto B')).toBeInTheDocument()
    expect(screen.getByText('Producto C')).toBeInTheDocument()
  })

  test('cambiar un filtro después de "Cargar más" resetea a la página 1', async () => {
    const user = userEvent.setup()
    const categories = [{ id: 1, name: 'Fútbol' }]

    let useCategoryFilter = false

    mockClient.mockImplementation((url: unknown) => {
      const endpoint = url as string
      if (endpoint === '/categories') return Promise.resolve(categories)
      if (useCategoryFilter) return Promise.resolve(makeProductPage(['Filtrado X'], 1, 1))
      if (endpoint.includes('page=2')) return Promise.resolve(makeProductPage(['Producto C'], 2, 2))
      return Promise.resolve(makeProductPage(['Producto A', 'Producto B'], 1, 2))
    })

    render(<Home />)

    await waitFor(() =>
      expect(screen.getAllByTestId('product-card')).toHaveLength(2),
    )

    await user.click(await screen.findByRole('button', { name: /cargar más/i }))
    await waitFor(() =>
      expect(screen.getAllByTestId('product-card')).toHaveLength(3),
    )

    // Activar el mock de categoría antes de cambiar el filtro
    useCategoryFilter = true
    await user.click(screen.getByRole('button', { name: /filtros/i }))
    await user.selectOptions(screen.getByRole('combobox', { name: /categoría/i }), '1')

    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(1)
      expect(screen.getByText('Filtrado X')).toBeInTheDocument()
    })
  })
})
