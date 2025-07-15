import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.get('/auth/me')
        setUser(response.user)
        setIsSignedIn(true)
      } else {
        // No token found, ensure user is logged out
        setUser(null)
        setIsSignedIn(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token and logout
      localStorage.removeItem('token')
      setUser(null)
      setIsSignedIn(false)
    } finally {
      setLoading(false)
    }
  }

  const checkUserExists = async (email) => {
    try {
      const response = await api.post('/auth/check-user', { email })
      return { 
        success: true, 
        exists: response.exists,
        active: response.active,
        message: response.message,
        user: response.user
      }
    } catch (error) {
      console.error('User existence check failed:', error)
      let errorMessage = 'Failed to check user'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = error.message || errorMessage
      }
      
      return { 
        success: false, 
        error: errorMessage,
        exists: false,
        active: false
      }
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user: userData, token } = response
      
      localStorage.setItem('token', token)
      setUser(userData)
      setIsSignedIn(true)
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      let errorMessage = 'Login failed'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = error.message || errorMessage
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { user: userData, token } = response
      
      localStorage.setItem('token', token)
      setUser(userData)
      setIsSignedIn(true)
      
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      let errorMessage = 'Registration failed'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage = error.message || errorMessage
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const logout = async () => {
    try {
      // Try to call logout endpoint if user is authenticated
      if (isSignedIn) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clean up local state regardless of API call success
      localStorage.removeItem('token')
      setUser(null)
      setIsSignedIn(false)
    }
  }

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates)
      setUser(response.user)
      return { success: true }
    } catch (error) {
      console.error('Profile update failed:', error)
      let errorMessage = 'Profile update failed'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage = error.message || errorMessage
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (error) {
      console.error('Password change failed:', error)
      let errorMessage = 'Password change failed'
      
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage = error.message || errorMessage
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const value = {
    user,
    isSignedIn,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkUserExists
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 