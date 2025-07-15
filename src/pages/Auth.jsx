import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Auth = () => {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { login, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTo = location.state?.redirectTo || '/dashboard'

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!formData.email || !formData.password) {
        showToast('error', 'Please enter your email and password.')
        setLoading(false)
        return
      }
      const result = await login(formData.email, formData.password)
      if (result.success) {
        navigate(redirectTo)
      } else {
        showToast('error', result.error || 'Login failed. Please try again.')
      }
    } catch (err) {
      showToast('error', err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        showToast('error', 'Please fill in all fields.')
        setLoading(false)
        return
      }
      if (formData.password !== formData.confirmPassword) {
        showToast('error', 'Passwords do not match')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        showToast('error', 'Password must be at least 6 characters long')
        setLoading(false)
        return
      }
      const result = await register(formData.name, formData.email, formData.password)
      if (result.success) {
        navigate(redirectTo)
      } else {
        showToast('error', result.error || 'Registration failed. Please try again.')
      }
    } catch (err) {
      showToast('error', err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-950">
      <div className="w-full max-w-md bg-gray-900/90 rounded-2xl shadow-2xl p-10 border border-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">FormForge</h1>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <Button onClick={() => setMode('login')} className={`w-1/2 ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-blue-300'}`}>Login</Button>
          <Button onClick={() => setMode('register')} className={`w-1/2 ${mode === 'register' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-purple-300'}`}>Register</Button>
        </div>
        {mode === 'login' ? (
          <form className="space-y-6" onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Email"
              autoComplete="username"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10"
                placeholder="Password"
                autoComplete="current-password"
              />
              <AnimatePresence>
                {formData.password && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <Button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-md hover:scale-[1.02]" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
            <div className="text-right mt-2">
              <button type="button" className="text-xs text-blue-400 hover:underline">Forgot password?</button>
            </div>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSignup}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Full Name"
              autoComplete="name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Email"
              autoComplete="username"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                placeholder="Password"
                autoComplete="new-password"
              />
              <AnimatePresence>
                {formData.password && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
              <AnimatePresence>
                {formData.confirmPassword && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <Button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all shadow-md hover:scale-[1.02]" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Auth