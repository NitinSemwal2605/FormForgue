import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus } from 'lucide-react'
import FormField from './FormField'

function SortableItem({ field, isSelected, onSelect, onUpdate, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
      <FormField
        field={field}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  )
}

export default function FormCanvas({ 
  form, 
  setForm, 
  selectedField, 
  setSelectedField, 
  onUpdateField, 
  onDeleteField, 
  onReorderFields 
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = form.fields.findIndex(field => field.id === active.id)
      const newIndex = form.fields.findIndex(field => field.id === over.id)
      
      const newFields = arrayMove(form.fields, oldIndex, newIndex)
      onReorderFields(newFields)
    }
  }

  const handleFieldSelect = (field) => {
    setSelectedField(field)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="mb-6">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="text-2xl font-bold w-full bg-transparent border-none outline-none mb-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Form Title"
        />
        
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-transparent border-none outline-none text-gray-600 dark:text-gray-300 resize-none placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="Form description (optional)"
          rows={2}
        />
      </div>

      <div className="drop-zone dark:bg-gray-800 dark:border-gray-700">
        {form.fields.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start building your form</h3>
            <p className="text-gray-600 dark:text-gray-300">Drag fields from the sidebar to begin</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={form.fields.map(field => field.id)} strategy={verticalListSortingStrategy}>
              {form.fields.map((field) => (
                <SortableItem
                  key={field.id}
                  field={field}
                  isSelected={selectedField?.id === field.id}
                  onSelect={handleFieldSelect}
                  onUpdate={onUpdateField}
                  onDelete={onDeleteField}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}