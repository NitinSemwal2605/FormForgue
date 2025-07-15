import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
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
  const { login, register } = useAuth()
  const { showToast } = useToast()
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
          showToast('error', 'No account found with this email. Please sign up instead.')
          setLoading(false)
          return
        }

        // If userExists is null (not checked yet), check it now
        if (userExists === null && formData.email) {
          const userExistsResult = await checkUserExists(formData.email)
          if (userExistsResult.success && !userExistsResult.exists) {
            showToast('error', 'No account found with this email. Please sign up instead.')
            setLoading(false)
            return
          }
        }

        const result = await login(formData.email, formData.password)
        if (result.success) {
          showToast('success', 'Successfully logged in! Welcome back!')
          navigate(redirectTo)
        } else {
          showToast('error', result.error)
        }
      } else {
        // Registration validation
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

        // Check if user exists before registering
        const userExistsResult = await checkUserExists(formData.email)
        if (userExistsResult.success && userExistsResult.exists) {
          showToast('error', 'An account with this email already exists. Please sign in instead.')
          setLoading(false)
          return
        }

        const result = await register(formData.name, formData.email, formData.password)
        if (result.success) {
          showToast('success', 'Account created successfully! Welcome to FormForge!')
          navigate(redirectTo)
        } else {
          showToast('error', result.error)
        }
      }
    } catch (error) {
      showToast('error', 'An unexpected error occurred. Please try again.')
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
              showToast('info', `Welcome back, ${result.user.name}!`)
            } else if (result.exists && !result.active) {
              showToast('error', 'Account is deactivated. Please contact support.')
            }
          } else {
            // Registration mode
            if (result.exists) {
              showToast('error', 'An account with this email already exists. Please sign in instead.')
            }
          }
        } else {
          setUserExists(false)
          if (result.error) {
            showToast('error', result.error)
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

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-10 border border-white/20">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">Welcome to FormForge</h1>
          <p className="text-lg text-gray-300 mb-4">Create, manage, and analyze forms with ease. Secure, fast, and built for teams and individuals.</p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-semibold">Bank-level Security</span>
            <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs font-semibold">No Coding Required</span>
            <span className="px-3 py-1 rounded-full bg-pink-600/20 text-pink-300 text-xs font-semibold">Free Forever Plan</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">How to Register</h2>
            <ol className="list-decimal list-inside text-gray-200 space-y-1 mb-4">
              <li>Enter your name, email, and a strong password.</li>
              <li>Confirm your password for security.</li>
              <li>Click <b>Register</b> to create your account.</li>
              <li>Check your email for a welcome message.</li>
            </ol>
            <h2 className="text-xl font-bold text-white mb-2 mt-6">How to Login</h2>
            <ol className="list-decimal list-inside text-gray-200 space-y-1">
              <li>Enter your registered email and password.</li>
              <li>Click <b>Login</b> to access your dashboard.</li>
              <li>If you forget your password, use the reset option.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Why FormForge?</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1 mb-4">
              <li>Modern drag-and-drop form builder</li>
              <li>Real-time analytics and response management</li>
              <li>Customizable themes and branding</li>
              <li>Secure authentication and privacy</li>
              <li>Free and paid plans for all needs</li>
            </ul>
            <h2 className="text-xl font-bold text-white mb-2 mt-6">Security & Troubleshooting</h2>
            <ul className="list-disc list-inside text-gray-200 space-y-1">
              <li>All passwords are encrypted and never stored in plain text.</li>
              <li>We use JWT for secure sessions.</li>
              <li>If you have trouble logging in, check your email or contact support.</li>
            </ul>
          </div>
        </div>
        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-4">
            <Button onClick={() => setIsLogin(true)} className={`px-6 py-2 rounded-lg font-bold text-base transition-all ${isLogin ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-300 hover:bg-blue-600/20'}`}>Login</Button>
            <Button onClick={() => setIsLogin(false)} className={`px-6 py-2 rounded-lg font-bold text-base transition-all ${!isLogin ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-300 hover:bg-purple-600/20'}`}>Register</Button>
          </div>
          {isLogin ? (
            <form /* onSubmit={handleLogin} */ className="space-y-4">
              <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              <Button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all">Login</Button>
              <div className="text-right mt-2">
                <button type="button" className="text-xs text-blue-400 hover:underline">Forgot password?</button>
              </div>
            </form>
          ) : (
            <form /* onSubmit={handleRegister} */ className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
              <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
              <input type="password" placeholder="Password" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
              <input type="password" placeholder="Confirm Password" className="w-full px-4 py-3 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600" required />
              <Button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all">Register</Button>
            </form>
          )}
        </div>
        <div className="text-center text-gray-400 text-xs">
          By signing up, you agree to our <a href="#" className="text-blue-400 underline">Terms of Service</a> and <a href="#" className="text-blue-400 underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}

export default Auth