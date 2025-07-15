import { BarChart3, LayoutDashboard, Menu, Plus, Settings } from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/forms/new', label: 'Create', icon: Plus },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: Settings },
]

export default function BottomNavigation({ onMenuClick }) {
  const location = useLocation()

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-900 border-t border-gray-800 z-50 shadow-t md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
              location.pathname === to
                ? 'text-blue-400 bg-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>
    </div>
  )
} 