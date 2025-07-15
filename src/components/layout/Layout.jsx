import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BottomNavigation from './BottomNavigation'
import Sidebar from './Sidebar'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  return isMobile
}

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const location = useLocation()

  // Check if we're on pages that don't need layout
  const isLandingPage = location.pathname === '/'
  const isAuthPage = location.pathname === '/auth'
  const isDocsPage = location.pathname === '/documentation'

  // Don't render layout for landing page, auth page, or documentation page
  if (isLandingPage || isAuthPage || isDocsPage) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        isMobile 
          ? 'ml-0 pb-20' // Full width on mobile with bottom nav padding
          : 'ml-72' // Always full sidebar width on desktop
      }`}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      {isMobile && <BottomNavigation onMenuClick={() => setSidebarOpen(true)} />}
    </div>
  )
} 