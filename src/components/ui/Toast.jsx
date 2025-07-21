import { AlertTriangle, CheckCircle, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

const formatDetails = (details) => {
  if (!details) return null
  if (typeof details === 'string') return <pre className="whitespace-pre-wrap break-words text-xs text-gray-700 mt-1">{details}</pre>
  if (typeof details === 'object') return (
    <pre className="whitespace-pre-wrap break-words text-xs text-gray-700 mt-1 bg-gray-100 rounded p-2 overflow-x-auto max-h-40">{JSON.stringify(details, null, 2)}</pre>
  )
  return null
}

const Toast = ({ message, type = 'success', duration = 5000, onClose, title, details }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out animation
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500 bg-green-50 text-green-900'
      case 'error':
        return 'border-l-4 border-red-500 bg-red-50 text-red-900'
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-900'
      default:
        return 'border-l-4 border-green-500 bg-green-50 text-green-900'
    }
  }

  if (!isVisible) return null

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-2xl transition-all duration-300 transform ${getStyles()} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`} style={{ boxShadow: '0 8px 32px 0 rgba(60,60,100,0.12)' }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold text-base mb-0.5">{title}</div>}
          <div className="text-sm font-medium leading-snug">{message}</div>
          {formatDetails(details)}
        </div>
        <div className="ml-2 flex-shrink-0">
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast 