import { Palette, Settings } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'

export default function FormSettings({ form, setForm, selectedField, onUpdateField }) {
  const [activeTab, setActiveTab] = useState('form')

  const updateFormSettings = (updates) => {
    setForm(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }))
  }

  const updateFieldOption = (index, value) => {
    const newOptions = [...(selectedField.options || [])]
    newOptions[index] = value
    onUpdateField(selectedField.id, { options: newOptions })
  }

  const addFieldOption = () => {
    const newOptions = [...(selectedField.options || []), 'New Option']
    onUpdateField(selectedField.id, { options: newOptions })
  }

  const removeFieldOption = (index) => {
    const newOptions = selectedField.options?.filter((_, i) => i !== index) || []
    onUpdateField(selectedField.id, { options: newOptions })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 h-fit">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'form'
                ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Form
          </button>
          {selectedField && (
            <button
              onClick={() => setActiveTab('field')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'field'
                  ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
              }`}
            >
              Field
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'form' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Form Settings</h3>
            
            <div className="space-y-4">
              {/* Deadline Picker */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Form Deadline</label>
                  <input
                  type="datetime-local"
                  value={form.deadline ? new Date(form.deadline).toISOString().slice(0, 16) : ''}
                  onChange={e => setForm(prev => ({ ...prev, deadline: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                <p className="text-xs text-gray-400 mt-1">After this date, the form will be closed for responses.</p>
              </div>
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Category</label>
                <select
                  value={form.category || ''}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select a category</option>
                  <option value="General">General</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Survey">Survey</option>
                  <option value="Registration">Registration</option>
                  <option value="Event">Event</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Choose a category for this form.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={form.settings.customTheme.primaryColor}
                    onChange={(e) => updateFormSettings({
                      customTheme: {
                        ...form.settings.customTheme,
                        primaryColor: e.target.value
                      }
                    })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Background Color</label>
                  <input
                    type="color"
                    value={form.settings.customTheme.backgroundColor}
                    onChange={(e) => updateFormSettings({
                      customTheme: {
                        ...form.settings.customTheme,
                        backgroundColor: e.target.value
                      }
                    })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'field' && selectedField && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Field Settings</h3>
            
            <Input
              label="Field Label"
              value={selectedField.label}
              onChange={(e) => onUpdateField(selectedField.id, { label: e.target.value })}
            />

            <Input
              label="Placeholder"
              value={selectedField.placeholder || ''}
              onChange={(e) => onUpdateField(selectedField.id, { placeholder: e.target.value })}
            />

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) => onUpdateField(selectedField.id, { required: e.target.checked })}
                  className="rounded text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">Required field</span>
              </label>
            </div>

            {/* Options for select, radio, checkbox fields */}
            {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Options</label>
                <div className="space-y-2">
                  {selectedField.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateFieldOption(index, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => removeFieldOption(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addFieldOption}>
                    Add Option
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}