import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'

export default function PublicForm() {
  const { shareUrl } = useParams()
  const navigate = useNavigate()
  const { isSignedIn, user } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(null)
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchForm()
  }, [shareUrl])

  const fetchForm = async () => {
    try {
      console.log('Fetching public form:', shareUrl)
      const response = await api.get(`/forms/public/${shareUrl}`)
      console.log('Public form response:', response)
      setForm(response)
    } catch (error) {
      console.error('Error fetching public form:', error)
      console.error('Error details:', error.message)
      if (error.message.includes('Form not found')) {
      setError('Form not found or no longer accepting responses')
      } else if (error.message.includes('Database connection error')) {
        setError('Database connection error. Please try again later.')
      } else {
        setError('Failed to load form. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user is authenticated
    if (!isSignedIn) {
      showToast('Please create an account or sign in to submit this form', 'warning')
      navigate('/auth', { state: { redirectTo: `/form/${shareUrl}` } })
      return
    }
    
    setSubmitting(true)
    setError('')

    // Validate required fields
    const missingFields = form.fields
      .filter(field => field.required && !responses[field.id])
      .map(field => field.label)

    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      setSubmitting(false)
      return
    }

    try {
      console.log('Submitting form responses:', responses)
      const answers = form.fields.map(field => ({
        fieldId: field.id,
        fieldType: field.type,
        label: field.label,
        value: responses[field.id],
        required: field.required
      }))

      console.log('Submitting answers:', answers)
      // Use the new authenticated endpoint
      const result = await api.post('/responses/submit', { 
        formId: form._id,
        responses: answers,
        timeSpent: 0 // You can calculate this if needed
      })
      console.log('Submit result:', result)
      setSubmitted(true)
      showToast('Form submitted successfully!', 'success')
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error.message.includes('Required field')) {
        setError(error.message)
      } else if (error.message.includes('Authentication')) {
        showToast('Please sign in to submit this form', 'error')
        navigate('/auth', { state: { redirectTo: `/form/${shareUrl}` } })
      } else {
      setError('Failed to submit form. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleFieldChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const renderField = (field) => {
    const value = responses[field.id] || ''

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      
      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            pattern={field.validation?.pattern || "[0-9]{10,15}"}
            minLength={field.validation?.minLength || "10"}
            maxLength={field.validation?.maxLength || "15"}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option} className="bg-gray-800 text-white">{option}</option>
            ))}
          </select>
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option)
                    handleFieldChange(field.id, newValues)
                  }}
                  className="text-blue-500 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Form Not Found</h1>
          <p className="text-gray-400">{error}</p>
          <div className="mt-4">
            <a href="/" className="text-blue-400 hover:text-blue-300 underline">
              Go back to home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Thank you!</h1>
          <p className="text-gray-300">Your response has been submitted successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div 
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-8"
          style={{ backgroundColor: form.settings?.customTheme?.backgroundColor }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{form.title}</h1>
            {form.description && (
              <p className="text-gray-300 text-lg">{form.description}</p>
            )}
            
            {/* Authentication Status */}
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
              {isSignedIn ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-green-400 font-medium">Signed in as</p>
                      <p className="text-white">{user?.name || user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/auth')}
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                  >
                    Switch Account
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-400 font-medium">Authentication Required</p>
                      <p className="text-gray-300">You need to create an account to submit this form</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/auth', { state: { redirectTo: `/form/${shareUrl}` } })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-sm text-gray-400">
              Created with FormForge
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {(form.fields || []).map((field) => (
              <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                  {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                loading={submitting}
                size="lg"
                className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                style={{ backgroundColor: form.settings?.customTheme?.primaryColor }}
                disabled={!isSignedIn}
              >
                {isSignedIn ? 'Submit Response' : 'Sign In to Submit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}