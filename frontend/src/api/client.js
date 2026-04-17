const API_URL = import.meta.env.VITE_API_URL

const getToken = () => localStorage.getItem('token')

const client = async (endpoint, { method = 'GET', body } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    throw { status: response.status, errors: data.errors, message: data.message }
  }

  return data
}

export default client