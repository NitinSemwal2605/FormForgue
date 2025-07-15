import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function FormField({ field, isSelected, onSelect, onUpdate, onDelete }) {
  const [localValue, setLocalValue] = useState('')

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder || `Enter ${field.type}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            disabled
          />
        )
      
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder || 'Enter your response'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            disabled
          />
        )
      
      case 'select':
        return (
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled
          >
            <option>Choose an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
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
                  className="text-primary-500 focus:ring-primary-500"
                  disabled
                />
                <span className="text-gray-700">{option}</span>
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
                  className="text-primary-500 focus:ring-primary-500 rounded"
                  disabled
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled
          />
        )
      case 'file':
        return (
          <input
            type="file"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div 
      className={`field-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(field)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <div className="flex-1">
            <label className="form-field-label block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(field.id)
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {renderFieldInput()}
    </div>
  )
}