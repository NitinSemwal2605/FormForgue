import { LogOut, Menu, Plus, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { user, isSignedIn, logout } = useAuth()
  const location = useLocation()

  const navLinkClass = (path) =>
    `px-4 py-2 rounded-lg transition-colors font-medium ${
      location.pathname === path
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
        : 'text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
    }`

  const handleLogout = async () => {
    await logout()
    setShowMobileMenu(false)
    // Navigation will be handled by the ProtectedRoute component
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">FormForge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
            <Link to="/forms/new" className={navLinkClass('/forms/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Form
            </Link>
            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                const body = document.body;
                body.classList.toggle('dark');
              }}
              className="ml-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow"
              title="Toggle dark/light mode"
            >
              <Sun className="w-5 h-5" />
            </button>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop user menu - Only show for authenticated users */}
            {isSignedIn && (
              <div className="hidden md:block">
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-white/60 dark:bg-gray-900/60 shadow">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'User'}</span>
                  <Link to="/profile" className="ml-2 px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors">Profile</Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 transition-colors flex items-center"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 bg-white/90 dark:bg-black/90 rounded-b-2xl shadow-xl">
            <div className="space-y-2">
              <Link to="/dashboard" className={navLinkClass('/dashboard')} onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
              <Link to="/forms/new" className={navLinkClass('/forms/new')} onClick={() => setShowMobileMenu(false)}>
                <Plus className="w-4 h-4 mr-2" />
                New Form
              </Link>
              <button
                onClick={() => {
                  const body = document.body;
                  body.classList.toggle('dark');
                }}
                className="w-full mt-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow"
                title="Toggle dark/light mode"
              >
                <Sun className="w-5 h-5" />
              </button>
              {/* User section - Only show for authenticated users */}
              {isSignedIn && (
                <div className="border-t border-gray-200 dark:border-gray-800 mt-4 pt-4">
                  <div className="px-4 py-2 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</span>
                    <Link to="/profile" className="ml-2 px-3 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors">Profile</Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}