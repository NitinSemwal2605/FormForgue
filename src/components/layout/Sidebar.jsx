import {
    BarChart3,
    LayoutDashboard,
    LogOut,
    Plus,
    Settings,
    X
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/forms/new', label: 'Create Form', icon: Plus },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: Settings },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return isMobile
}

export default function Sidebar({ isOpen: propIsOpen, onToggle: propOnToggle }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)
  useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])
  const { user, isSignedIn, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
      showToast('Successfully logged out!', 'success')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      showToast('Failed to logout. Please try again.', 'error')
    }
  }

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className={`fixed left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-white font-bold text-lg">F</span>
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">FormForge</span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-base ${
                    location.pathname === to
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              {isSignedIn && (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-base text-red-300 hover:text-red-100 hover:bg-red-500/20 hover:scale-105 mt-auto"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              )}
            </nav>
            {isSignedIn && (
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/60 shadow-lg border border-gray-700">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-600">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.name}</span>
                  <span className="text-xs text-gray-400">{user?.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Large screen: always expanded
  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-gray-900 border-r border-gray-800 shadow-xl flex flex-col transition-all duration-300 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">FormForge</span>
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-base ${
                location.pathname === to
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800 hover:scale-105'
              }`}
              title={label}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
          {isSignedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-base text-red-300 hover:text-red-100 hover:bg-red-500/20 hover:scale-105 mt-auto"
              title="Logout"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </nav>
        {isSignedIn && (
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/60 shadow-lg border border-gray-700">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-600 flex-shrink-0">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user?.name}</span>
              <span className="text-xs text-gray-400 truncate">{user?.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
} 