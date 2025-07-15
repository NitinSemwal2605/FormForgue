import {
    AlignLeft,
    Calendar,
    CheckSquare,
    ChevronDown,
    Circle,
    Hash,
    Mail,
    Type,
    Upload
} from 'lucide-react'

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Long Text', icon: AlignLeft },
  { type: 'select', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'radio', label: 'Multiple Choice', icon: Circle },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'file', label: 'File Upload', icon: Upload }, // New field type
]

export default function FormFieldsSidebar({ onAddField }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 h-fit">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Form Fields</h3>
      <div className="space-y-2">
        {fieldTypes.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => onAddField(type)}
            className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors drag-item"
          >
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}