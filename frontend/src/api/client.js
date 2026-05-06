const API_URL = import.meta.env.VITE_API_URL

const getToken = () => localStorage.getItem('token')

const client = async (endpoint, { method = 'GET', body, isFormData = false } = {}) => {
  const headers = { 'Accept': 'application/json' }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    const retryAfter = response.headers.get('Retry-After')
    throw {
      status: response.status,
      errors: data.errors,
      message: response.status === 429 && retryAfter
        ? `Demasiados intentos. Espera ${retryAfter} segundos antes de volver a intentarlo.`
        : data.message,
    }
  }

  return data
}

export default client