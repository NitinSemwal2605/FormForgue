const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData
    try {
      errorData = await response.json()
    } catch {
      // If response is not JSON, try to get text
      const errorText = await response.text()
      errorData = { error: errorText || 'API error' }
    }
    
    // Create a more descriptive error message
    const errorMessage = errorData.message || errorData.error || 'API error'
    const error = new Error(errorMessage)
    error.status = response.status
    error.data = errorData
    throw error
  }
  return response.json()
}

const api = {
  get: async (url) => {
    const res = await fetch(BASE_URL + url, {
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    })
    return handleResponse(res)
  },
  post: async (url, data) => {
    const res = await fetch(BASE_URL + url, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },
  put: async (url, data) => {
    const res = await fetch(BASE_URL + url, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },
  delete: async (url) => {
    const res = await fetch(BASE_URL + url, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    })
    return handleResponse(res)
  },
}

export default api