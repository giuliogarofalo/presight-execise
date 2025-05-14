interface FilterSectionProps {
  title: string
  items: { label: string }[]
  selectedItems: string[]
  onChange: (items: string[]) => void
  type?: 'checkbox' | 'badge'
}

export default function FilterSection({ 
  title, 
  items, 
  selectedItems, 
  onChange,
  type = 'checkbox'
}: FilterSectionProps) {
  const toggleItem = (item: string) => {
    const newItems = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item]
    onChange(newItems)
  }

  if (type === 'badge') {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {items.map(({ label }) => (
            <button
              key={label}
              onClick={() => toggleItem(label)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${selectedItems.includes(label)
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-2">
        {items.map(({ label }) => (
          <label key={label} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.includes(label)}
              onChange={() => toggleItem(label)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-600">
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
