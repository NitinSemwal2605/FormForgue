import { createContext, useContext, useState } from 'react'
import Toast from '../components/ui/Toast'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (messageOrOptions, type = 'success', duration = 5000) => {
    let opts = {}
    if (typeof messageOrOptions === 'string') {
      opts = { message: messageOrOptions, type, duration }
    } else if (typeof messageOrOptions === 'object') {
      opts = { ...messageOrOptions }
    }
    const id = Date.now() + Math.random()
    const newToast = { id, ...opts }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration) => showToast(message, 'success', duration)
  const error = (message, duration) => showToast(message, 'error', duration)

  return (
    <ToastContext.Provider value={{ showToast, success, error }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            title={toast.title}
            details={toast.details}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
} 