import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(false)
  const [userExists, setUserExists] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const { login, register, checkUserExists } = useAuth()
  const { success, error: showError, info } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state
  const redirectTo = location.state?.redirectTo || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        // Check if user exists before attempting login
        if (userExists === false) {
          showError('No account found with this email. Please sign up instead.')
          setLoading(false)
          return
        }

        // If userExists is null (not checked yet), check it now
        if (userExists === null && formData.email) {
          const userExistsResult = await checkUserExists(formData.email)
          if (userExistsResult.success && !userExistsResult.exists) {
            showError('No account found with this email. Please sign up instead.')
            setLoading(false)
            return
          }
        }

        const result = await login(formData.email, formData.password)
        if (result.success) {
          success('Successfully logged in! Welcome back!')
          navigate(redirectTo)
        } else {
          showError(result.error)
        }
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          showError('Passwords do not match')
          setLoading(false)
          return
        }
        if (formData.password.length < 6) {
          showError('Password must be at least 6 characters long')
          setLoading(false)
          return
        }

        // Check if user exists before registering
        const userExistsResult = await checkUserExists(formData.email)
        if (userExistsResult.success && userExistsResult.exists) {
          showError('An account with this email already exists. Please sign in instead.')
          setLoading(false)
          return
        }

        const result = await register(formData.name, formData.email, formData.password)
        if (result.success) {
          success('Account created successfully! Welcome to FormForge!')
          navigate(redirectTo)
        } else {
          showError(result.error)
        }
      }
    } catch (error) {
      showError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Check if user exists when email is entered (for both login and registration modes)
  const handleEmailChange = async (e) => {
    const email = e.target.value
    setFormData({
      ...formData,
      email
    })

    // Check user existence if email is valid (for both login and registration)
    if (email && email.includes('@')) {
      setCheckingUser(true)
      try {
        const result = await checkUserExists(email)
        if (result.success) {
          setUserExists(result.exists)
          if (isLogin) {
            if (result.exists && result.active) {
              info(`Welcome back, ${result.user.name}!`)
            } else if (result.exists && !result.active) {
              showError('Account is deactivated. Please contact support.')
            }
          } else {
            // Registration mode
            if (result.exists) {
              showError('An account with this email already exists. Please sign in instead.')
            }
          }
        } else {
          setUserExists(false)
          if (result.error) {
            showError(result.error)
          }
        }
      } catch (error) {
        setUserExists(null)
        console.error('Error checking user:', error)
      } finally {
        setCheckingUser(false)
      }
    } else {
      setUserExists(null)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setUserExists(null)
    setCheckingUser(false)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            FormForge
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Welcome back! Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleEmailChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400 ${
                  isLogin && userExists === true 
                    ? 'border-green-500' 
                    : isLogin && userExists === false 
                    ? 'border-red-500' 
                    : !isLogin && userExists === true
                    ? 'border-red-500'
                    : !isLogin && userExists === false
                    ? 'border-green-500'
                    : 'border-gray-700'
                }`}
                placeholder="Enter your email"
              />
              {checkingUser && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
              {isLogin && userExists === true && !checkingUser && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              {isLogin && userExists === false && !checkingUser && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              {!isLogin && userExists === true && !checkingUser && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              {!isLogin && userExists === false && !checkingUser && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {isLogin && userExists === false && !checkingUser && (
              <p className="text-red-400 text-sm mt-1">
                No account found with this email. Please sign up instead.
              </p>
            )}
            {!isLogin && userExists === true && !checkingUser && (
              <p className="text-red-400 text-sm mt-1">
                An account with this email already exists. Please sign in instead.
              </p>
            )}
            {!isLogin && userExists === false && !checkingUser && (
              <p className="text-green-400 text-sm mt-1">
                Email is available for registration.
              </p>
            )}
            {isLogin && userExists === false && !checkingUser && (
              <p className="text-yellow-400 text-sm mt-1">
                💡 Switch to "Sign up" mode to create a new account.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              placeholder="Enter your password"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || (isLogin && userExists === false) || checkingUser}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : checkingUser ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Checking...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth