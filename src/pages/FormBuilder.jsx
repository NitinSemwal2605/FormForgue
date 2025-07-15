import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    ArrowLeft,
    Calendar,
    CheckSquare,
    Copy,
    CreditCard,
    Download,
    Eye,
    FileText,
    Globe,
    GripVertical,
    Hash,
    Image,
    Layers,
    List,
    Mail,
    MapPin,
    MoreHorizontal,
    Palette,
    Phone,
    Plus,
    Radio,
    Save,
    Send,
    Settings,
    Share2,
    Star,
    Star as StarIcon,
    ToggleLeft,
    Trash2,
    Type,
    X,
    Zap
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormSettings from '../components/form-builder/FormSettings'
import { Badge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import api from '../services/api'

// Field types with icons and descriptions
const fieldTypes = [
  {
    type: 'text',
    icon: Type,
    label: 'Text Input',
    description: 'Single line text input',
    category: 'basic'
  },
  {
    type: 'textarea',
    icon: AlignJustify,
    label: 'Text Area',
    description: 'Multi-line text input',
    category: 'basic'
  },
  {
    type: 'email',
    icon: Mail,
    label: 'Email',
    description: 'Email address input',
    category: 'basic'
  },
  {
    type: 'phone',
    icon: Phone,
    label: 'Phone',
    description: 'Phone number input',
    category: 'basic'
  },
  {
    type: 'number',
    icon: Hash,
    label: 'Number',
    description: 'Numeric input',
    category: 'basic'
  },
  {
    type: 'date',
    icon: Calendar,
    label: 'Date',
    description: 'Date picker',
    category: 'basic'
  },
  {
    type: 'checkbox',
    icon: CheckSquare,
    label: 'Checkbox',
    description: 'Multiple choice selection',
    category: 'choice'
  },
  {
    type: 'radio',
    icon: Radio,
    label: 'Radio',
    description: 'Single choice selection',
    category: 'choice'
  },
  {
    type: 'select',
    icon: List,
    label: 'Dropdown',
    description: 'Select from options',
    category: 'choice'
  },
  {
    type: 'rating',
    icon: Star,
    label: 'Rating',
    description: 'Star rating system',
    category: 'advanced'
  },
  {
    type: 'toggle',
    icon: ToggleLeft,
    label: 'Toggle',
    description: 'On/Off switch',
    category: 'advanced'
  },
  {
    type: 'file',
    icon: FileText,
    label: 'File Upload',
    description: 'File attachment',
    category: 'advanced'
  },
  {
    type: 'image',
    icon: Image,
    label: 'Image Upload',
    description: 'Image attachment',
    category: 'advanced'
  },
  {
    type: 'url',
    icon: Globe,
    label: 'URL',
    description: 'Website URL input',
    category: 'basic'
  },
  {
    type: 'address',
    icon: MapPin,
    label: 'Address',
    description: 'Address input',
    category: 'basic'
  },
  {
    type: 'payment',
    icon: CreditCard,
    label: 'Payment',
    description: 'Payment information',
    category: 'advanced'
  }
]

// Form themes
const themes = [
  { name: 'Modern', colors: { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#10B981' } },
  { name: 'Ocean', colors: { primary: '#0EA5E9', secondary: '#06B6D4', accent: '#14B8A6' } },
  { name: 'Sunset', colors: { primary: '#F59E0B', secondary: '#EF4444', accent: '#EC4899' } },
  { name: 'Forest', colors: { primary: '#059669', secondary: '#10B981', accent: '#84CC16' } },
  { name: 'Royal', colors: { primary: '#7C3AED', secondary: '#A855F7', accent: '#EC4899' } },
  { name: 'Minimal', colors: { primary: '#6B7280', secondary: '#9CA3AF', accent: '#D1D5DB' } }
]

export default function FormBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isSignedIn, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    title: 'Untitled Form',
    description: '',
    fields: [],
    settings: {
      theme: themes[0],
      allowMultipleResponses: true,
      requireLogin: false,
      showProgressBar: true,
      enableAnalytics: true
    }
  })
  const [selectedField, setSelectedField] = useState(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState('fields')
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const canvasRef = useRef(null)

  // Check authentication on component mount
  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      showToast('Please sign in to create forms', 'error')
      navigate('/auth')
    }
  }, [isSignedIn, authLoading, navigate, showToast])

  // Load existing form data if editing
  useEffect(() => {
    if (isSignedIn && id && !authLoading) {
      loadExistingForm()
    }
  }, [id, isSignedIn, authLoading])

  // Debug: Log authentication status
  useEffect(() => {
    console.log('Auth status:', { isSignedIn, authLoading })
    console.log('Token in localStorage:', !!localStorage.getItem('token'))
  }, [isSignedIn, authLoading])

  const loadExistingForm = async () => {
    try {
      const response = await api.get(`/forms/${id}`)
      const existingForm = response
      
      // Ensure all fields have required properties
      const normalizedFields = (existingForm.fields || []).map(field => ({
        ...field,
        validation: field.validation || {
          minLength: field.type === 'phone' ? '10' : '',
          maxLength: field.type === 'phone' ? '15' : '',
          pattern: field.type === 'phone' ? '[0-9]{10,15}' : ''
        },
        styling: field.styling || {
          width: 'full',
          alignment: 'left'
        },
        options: field.options || (field.type === 'select' || field.type === 'radio' ? ['Option 1', 'Option 2'] : [])
      }))
      
      setFormData({
        title: existingForm.title || 'Untitled Form',
        description: existingForm.description || '',
        fields: normalizedFields,
        settings: {
          theme: existingForm.theme || themes[0],
          allowMultipleResponses: existingForm.settings?.allowMultipleResponses ?? true,
          requireLogin: existingForm.settings?.requireLogin ?? false,
          showProgressBar: existingForm.settings?.showProgressBar ?? true,
          enableAnalytics: existingForm.settings?.enableAnalytics ?? true
        }
      })
    } catch (error) {
      console.error('Error loading form:', error)
      showToast('Failed to load form data', 'error')
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isSignedIn) {
    return null
  }

  // Generate unique field ID
  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Add new field
  const addField = (fieldType) => {
    const newField = {
      id: generateFieldId(),
      type: fieldType.type,
      label: `New ${fieldType.label}`,
      placeholder: `Enter ${fieldType.label.toLowerCase()}`,
      required: false,
      options: fieldType.type === 'select' || fieldType.type === 'radio' ? ['Option 1', 'Option 2'] : [],
      validation: {
        minLength: fieldType.type === 'phone' ? '10' : '',
        maxLength: fieldType.type === 'phone' ? '15' : '',
        pattern: fieldType.type === 'phone' ? '[0-9]{10,15}' : ''
      },
      styling: {
        width: 'full',
        alignment: 'left'
      }
    }

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
    setSelectedField(newField.id)
  }

  // Update field
  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  // Delete field
  const deleteField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
    setSelectedField(null)
  }

  // Move field
  const moveField = (fromIndex, toIndex) => {
    const newFields = [...formData.fields]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    setFormData(prev => ({ ...prev, fields: newFields }))
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const fieldType = e.dataTransfer.getData('fieldType')
    if (fieldType) {
      const type = fieldTypes.find(t => t.type === fieldType)
      if (type) addField(type)
    }
  }

  // Save form
  const saveForm = async () => {
    if (!isSignedIn) {
      showToast('Please sign in to save forms', 'error')
      navigate('/auth')
      return
    }

    if (!formData.title.trim()) {
      showToast('Please enter a form title', 'error')
      return
    }

    // Debug: Check if token exists
    const token = localStorage.getItem('token')
    console.log('Token exists:', !!token)
    console.log('User signed in:', isSignedIn)

    setSaving(true)
    try {
      let response
      if (id) {
        // Update existing form
        response = await api.put(`/forms/${id}`, formData)
        showToast('Form updated successfully!', 'success')
      } else {
        // Create new form
        response = await api.post('/forms', formData)
        showToast('Form created successfully!', 'success')
      }
      navigate('/dashboard')
    } catch (err) {
      console.error('Error saving form:', err)
      let errorMessage = id ? 'Failed to update form' : 'Failed to create form'
      
      try {
        const errorData = JSON.parse(err.message)
        errorMessage = errorData.error || errorMessage
      } catch {
        errorMessage = err.message || errorMessage
      }
      
      showToast(errorMessage, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Preview form
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Render field preview
  const renderFieldPreview = (field) => {
    const { type, label, placeholder, required, options, validation } = field

    switch (type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={type}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      case 'phone':
        return (
          <input
            type="tel"
            placeholder={placeholder}
            pattern={validation?.pattern || "[0-9]{10,15}"}
            minLength={validation?.minLength || "10"}
            maxLength={validation?.maxLength || "15"}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      case 'textarea':
        return (
          <textarea
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        )
      case 'number':
        return (
          <input
            type="number"
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
      case 'select':
        return (
          <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option} className="bg-gray-800">{option}</option>
            ))}
          </select>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name={field.id} className="text-blue-500" />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="text-blue-500" />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300" />
            ))}
          </div>
        )
      case 'toggle':
    return (
          <div className="flex items-center">
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
              <div className="h-4 w-4 transform rounded-full bg-white transition-transform"></div>
            </div>
      </div>
    )
      default:
        return <div className="text-gray-400">Field type not supported</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                  {id ? 'Editing Form' : 'Creating Form'}
                </span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-400"
                placeholder="Untitled Form"
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm bg-transparent border-none outline-none text-gray-400 placeholder-gray-500 block mt-1"
                placeholder="Form description (optional)"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={togglePreview} className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)} className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
            <Button 
              onClick={saveForm} 
              disabled={saving}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : (id ? 'Update Form' : 'Save Form')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'fields' 
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4 mr-2 inline" />
              Fields
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'themes' 
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-4 h-4 mr-2 inline" />
              Themes
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'fields' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Form Fields</h3>
                
                {/* Field Categories */}
                {['basic', 'choice', 'advanced'].map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                      {category} Fields
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {fieldTypes
                        .filter(field => field.category === category)
                        .map(field => (
                          <div
                            key={field.type}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('fieldType', field.type)
                            }}
                            className="flex items-center p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg cursor-move hover:bg-white/10 transition-all duration-200 group"
                          >
                            <field.icon className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white">{field.label}</div>
                              <div className="text-xs text-gray-400">{field.description}</div>
                            </div>
                            <GripVertical className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Form Themes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme, index) => (
                    <div
                      key={index}
                      onClick={() => setFormData(prev => ({ ...prev, settings: { ...prev.settings, theme } }))}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.settings.theme.name === theme.name
                          ? 'border-blue-400 bg-blue-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.primary }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.secondary }}></div>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                      </div>
                      <div className="text-sm font-medium text-white">{theme.name}</div>
        </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Zap className="w-3 h-3 mr-1" />
                  Auto-save enabled
                </Badge>
                <span className="text-sm text-gray-400">
                  {formData.fields.length} field{formData.fields.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
              </Button>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div 
            ref={canvasRef}
            className={`flex-1 p-6 overflow-y-auto transition-all duration-300 ${
              dragOver ? 'bg-blue-500/10 border-2 border-dashed border-blue-400' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isPreviewMode ? (
              // Preview Mode
              <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
                  <h1 className="text-3xl font-bold text-white mb-2">{formData.title}</h1>
                  {formData.description && (
                    <p className="text-gray-400 mb-8">{formData.description}</p>
                  )}
                  
                  <div className="space-y-6">
                    {formData.fields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {renderFieldPreview(field)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-white/10">
                    <Button className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
                      <Send className="w-4 h-4 mr-2" />
                      Submit Form
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Builder Mode
              <div className="max-w-4xl mx-auto">
                {formData.fields.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Start Building Your Form</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Drag and drop fields from the sidebar to create your form. You can customize each field's properties and styling.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-4 h-4" />
                        <span>Drag fields here</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Settings className="w-4 h-4" />
                        <span>Customize properties</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>Preview form</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.fields.map((field, index) => (
                      <Card 
                        key={field.id}
                        className={`transition-all duration-200 ${
                          selectedField === field.id 
                            ? 'ring-2 ring-blue-400 bg-white/10' 
                            : 'hover:bg-white/5'
                        }`}
                        onClick={() => setSelectedField(field.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                {React.createElement(fieldTypes.find(t => t.type === field.type)?.icon || Type, { className: "w-4 h-4 text-blue-400" })}
                              </div>
                              <div>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                                  className="text-lg font-semibold bg-transparent border-none outline-none text-white"
                                />
                                <div className="text-sm text-gray-400">{fieldTypes.find(t => t.type === field.type)?.label}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <div className="w-6 h-6 bg-gray-600/50 rounded cursor-move flex items-center justify-center">
                                <GripVertical className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {renderFieldPreview(field)}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="text-blue-500"
                                  />
                                  <span className="text-sm text-gray-300">Required</span>
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Field Properties Panel */}
        {selectedField && !isPreviewMode && (
          <div className="w-80 bg-white/5 backdrop-blur-xl border-l border-white/10 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Field Properties</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedField(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {(() => {
              const field = formData.fields.find(f => f.id === selectedField)
              if (!field) return null
              
              // Ensure field has required properties
              const normalizedField = {
                ...field,
                validation: field.validation || {
                  minLength: field.type === 'phone' ? '10' : '',
                  maxLength: field.type === 'phone' ? '15' : '',
                  pattern: field.type === 'phone' ? '[0-9]{10,15}' : ''
                },
                styling: field.styling || {
                  width: 'full',
                  alignment: 'left'
                },
                options: field.options || (field.type === 'select' || field.type === 'radio' ? ['Option 1', 'Option 2'] : [])
              }
              
                              return (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
                    <input
                      type="text"
                      value={normalizedField.label}
                      onChange={(e) => updateField(normalizedField.id, { label: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Placeholder</label>
                    <input
                      type="text"
                      value={normalizedField.placeholder}
                      onChange={(e) => updateField(normalizedField.id, { placeholder: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
              />
            </div>
                  
                  {(normalizedField.type === 'select' || normalizedField.type === 'radio' || normalizedField.type === 'checkbox') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                      <div className="space-y-2">
                        {normalizedField.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...normalizedField.options]
                                newOptions[index] = e.target.value
                                updateField(normalizedField.id, { options: newOptions })
                              }}
                              className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newOptions = normalizedField.options.filter((_, i) => i !== index)
                                updateField(normalizedField.id, { options: newOptions })
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newOptions = [...normalizedField.options, `Option ${normalizedField.options.length + 1}`]
                            updateField(normalizedField.id, { options: newOptions })
                          }}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Validation</label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min length"
                        value={normalizedField.validation.minLength}
                        onChange={(e) => updateField(normalizedField.id, { 
                          validation: { ...normalizedField.validation, minLength: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                      <input
                        type="number"
                        placeholder="Max length"
                        value={normalizedField.validation.maxLength}
                        onChange={(e) => updateField(normalizedField.id, { 
                          validation: { ...normalizedField.validation, maxLength: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                      
                      {/* Phone-specific validation */}
                      {normalizedField.type === 'phone' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Pattern (Regex)</label>
                            <input
                              type="text"
                              placeholder="[0-9]{10,15}"
                              value={normalizedField.validation.pattern}
                              onChange={(e) => updateField(normalizedField.id, { 
                                validation: { ...normalizedField.validation, pattern: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-400">Quick Patterns</label>
                            <div className="grid grid-cols-1 gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateField(normalizedField.id, { 
                                  validation: { 
                                    ...normalizedField.validation, 
                                    pattern: '[0-9]{10,15}',
                                    minLength: '10',
                                    maxLength: '15'
                                  }
                                })}
                                className="text-xs justify-start"
                              >
                                International (10-15 digits)
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateField(normalizedField.id, { 
                                  validation: { 
                                    ...normalizedField.validation, 
                                    pattern: '[0-9]{10}',
                                    minLength: '10',
                                    maxLength: '10'
                                  }
                                })}
                                className="text-xs justify-start"
                              >
                                US Format (10 digits)
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateField(normalizedField.id, { 
                                  validation: { 
                                    ...normalizedField.validation, 
                                    pattern: '\\+?[0-9]{10,15}',
                                    minLength: '10',
                                    maxLength: '16'
                                  }
                                })}
                                className="text-xs justify-start"
                              >
                                With Country Code (+1234567890)
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Styling</label>
                    <div className="space-y-2">
                      <select
                        value={normalizedField.styling.width}
                        onChange={(e) => updateField(normalizedField.id, { 
                          styling: { ...normalizedField.styling, width: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white"
                      >
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                        <option value="third">One Third</option>
                      </select>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant={normalizedField.styling.alignment === 'left' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateField(normalizedField.id, { 
                            styling: { ...normalizedField.styling, alignment: 'left' }
                          })}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant={normalizedField.styling.alignment === 'center' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateField(normalizedField.id, { 
                            styling: { ...normalizedField.styling, alignment: 'center' }
                          })}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant={normalizedField.styling.alignment === 'right' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateField(normalizedField.id, { 
                            styling: { ...normalizedField.styling, alignment: 'right' }
                          })}
                        >
                          <AlignRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
        {/* Form Settings Panel */}
        {showSettings && !isPreviewMode && (
          <div className="w-96 bg-white/5 backdrop-blur-xl border-l border-white/10 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Form Settings</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <FormSettings form={formData} setForm={setFormData} />
          </div>
        )}
        </div>
    </div>
  )
}