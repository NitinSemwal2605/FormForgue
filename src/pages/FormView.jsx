import {
    AlertCircle,
    ArrowLeft,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Edit,
    Eye,
    Share,
    Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'

export default function FormView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResponses: 0,
    todayResponses: 0,
    thisWeekResponses: 0,
    avgTimeSpent: 0
  })

  useEffect(() => {
    if (isSignedIn) {
    fetchData()
    }
  }, [id, isSignedIn])

  const fetchData = async () => {
    try {
      console.log('Fetching form with ID:', id)
      console.log('User signed in:', isSignedIn)
      
      // Try to fetch form first
      const formRes = await api.get(`/forms/${id}`)
      console.log('Form response:', formRes)
      setForm(formRes)
      
      // Try to fetch responses and stats (these might fail due to DB issues)
      try {
        const responsesRes = await api.get(`/responses/form/${id}`)
        console.log('Responses:', responsesRes)
        // The API returns an object with docs property, extract the array
        const responsesArray = responsesRes.docs || responsesRes || []
        setResponses(responsesArray)
      } catch (responsesError) {
        console.error('Error fetching responses:', responsesError)
        setResponses([])
        showToast('Warning: Could not load responses due to database issues', 'warning')
      }
      
      try {
        const statsRes = await api.get(`/forms/${id}/stats`)
        console.log('Stats:', statsRes)
        setStats(statsRes)
      } catch (statsError) {
        console.error('Error fetching stats:', statsError)
        setStats({
          totalResponses: 0,
          todayResponses: 0,
          thisWeekResponses: 0,
          avgTimeSpent: 0
        })
        showToast('Warning: Could not load statistics due to database issues', 'warning')
      }
      
    } catch (error) {
      console.error('Error fetching form:', error)
      console.error('Error details:', error.message)
      
      if (error.message.includes('Form not found')) {
        showToast('Form not found or you don\'t have permission to view it', 'error')
      } else if (error.message.includes('Database connection error')) {
        showToast('Database connection error. Please try again later.', 'error')
      } else {
        showToast('Failed to load form data', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const copyShareUrl = () => {
    const url = `${window.location.origin}/form/${form._id}`
    navigator.clipboard.writeText(url)
    showToast('Share link copied to clipboard!', 'success')
  }

  const previewForm = () => {
    window.open(`/form/${form._id}`, '_blank')
  }

  const handleEditForm = () => {
    navigate(`/forms/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
        <LoadingSpinner size="lg" />
          <p className="mt-4">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Form not found</h3>
          <p className="text-gray-400 mb-4">The form you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{form.title}</h1>
            {form.description && (
                  <p className="text-gray-400 text-lg">{form.description}</p>
            )}
              </div>
          </div>
          
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={previewForm} className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            
              <Button variant="outline" onClick={copyShareUrl} className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Link to={`/forms/${id}/analytics`}>
                <Button variant="outline" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </Link>
            
              <Button onClick={handleEditForm} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
                <Edit className="w-4 h-4 mr-2" />
                Edit Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Responses</p>
                <p className="text-2xl font-bold text-white">{stats.totalResponses}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Today</p>
                <p className="text-2xl font-bold text-white">{stats.todayResponses}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Week</p>
                <p className="text-2xl font-bold text-white">{stats.thisWeekResponses}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
                <p className="text-gray-400 text-sm">Avg. Time</p>
                <p className="text-2xl font-bold text-white">{Math.round(stats.avgTimeSpent || 0)}s</p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Share URL */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Share this form</h3>
              <p className="text-blue-200/80 text-sm mb-4">
                Anyone with this link can submit responses to your form
            </p>
              <div className="flex items-center space-x-3">
                <code className="bg-blue-900/30 px-4 py-2 rounded border border-blue-500/30 text-blue-200 text-sm flex-1">
                  {`${window.location.origin}/form/${form._id}`}
              </code>
                <Button variant="outline" size="sm" onClick={copyShareUrl} className="border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Preview */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Form Preview</h2>
            <span className="text-sm text-gray-400">
              {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
            </span>
          </div>
        
        <div className="space-y-6">
            {form.fields.map((field, index) => (
              <div key={field.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
                {field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'phone' || field.type === 'url' ? (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400"
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  disabled
                  rows={3}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400"
                />
              ) : field.type === 'select' ? (
                  <select disabled className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white">
                  <option>Choose an option</option>
                  {field.options?.map((option, index) => (
                    <option key={index}>{option}</option>
                  ))}
                </select>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-2">
                        <input type="radio" disabled className="text-blue-500" />
                        <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="space-y-2">
                  {field.options?.map((option, index) => (
                    <label key={index} className="flex items-center space-x-2">
                        <input type="checkbox" disabled className="text-blue-500 rounded" />
                        <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
              ) : field.type === 'date' ? (
                <input
                  type="date"
                  disabled
                    className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white"
                  />
                ) : field.type === 'rating' ? (
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="w-6 h-6 text-yellow-400">
                        ★
                      </div>
                    ))}
                  </div>
                ) : field.type === 'toggle' ? (
                  <div className="flex items-center">
                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                      <div className="h-4 w-4 transform rounded-full bg-white transition-transform"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Field type not supported in preview</div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Responses */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Recent Responses ({Array.isArray(responses) ? responses.length : 0})
          </h2>
          <Link to={`/forms/${id}/analytics`}>
              <Button variant="outline" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                View All Analytics
              </Button>
          </Link>
        </div>
        
          {!Array.isArray(responses) || responses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
              <h3 className="text-lg font-medium text-white mb-2">No responses yet</h3>
              <p className="text-gray-400 mb-4">Share your form to start collecting responses</p>
              <Button onClick={copyShareUrl} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
                <Share className="w-4 h-4 mr-2" />
                Share Form
              </Button>
          </div>
        ) : (
          <div className="space-y-4">
              {(Array.isArray(responses) ? responses.slice(0, 5) : []).map((response) => (
                <div key={response._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">
                    Response #{response._id.slice(-6)}
                  </span>
                    <span className="text-sm text-gray-400">
                      {new Date(response.submittedAt || response.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(response.responses || []).slice(0, 4).map((answer) => {
                    const field = form.fields.find(f => f.id === answer.fieldId)
                    if (!field) return null
                    
                    return (
                      <div key={answer.fieldId}>
                          <dt className="text-sm font-medium text-gray-400">{field.label}</dt>
                          <dd className="text-sm text-white mt-1">
                          {Array.isArray(answer.value) 
                            ? answer.value.join(', ') 
                            : answer.value || 'No response'
                          }
                        </dd>
                      </div>
                    )
                  })}
                </div>
                
                  {(response.responses || []).length > 4 && (
                    <p className="text-sm text-gray-400 mt-3">
                      +{(response.responses || []).length - 4} more responses
                  </p>
                )}
              </div>
            ))}
            
              {Array.isArray(responses) && responses.length > 5 && (
              <div className="text-center">
                <Link to={`/forms/${id}/analytics`}>
                    <Button variant="outline" className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:text-white">
                      View All {responses.length} Responses
                    </Button>
                </Link>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}