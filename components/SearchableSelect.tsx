import React, { useState, useEffect, useRef } from 'react'

interface SearchableSelectProps<T> {
  items: T[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  displayField: keyof T
  valueField: keyof T
  searchFields?: (keyof T)[]
  loading?: boolean
  error?: string | null
  disabled?: boolean
  className?: string
}

function SearchableSelect<T extends Record<string, any>>({
  items,
  value,
  onChange,
  placeholder = "Sélectionner...",
  displayField,
  valueField,
  searchFields = [displayField],
  loading = false,
  error = null,
  disabled = false,
  className = ""
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<T[]>(items)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Trouver l'élément sélectionné
  const selectedItem = items.find(item => item[valueField] === value)

  // Filtrer les éléments en fonction de la recherche
  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items)
    } else {
      const lowerQuery = searchQuery.toLowerCase()
      const filtered = items.filter(item => 
        searchFields.some(field => {
          const fieldValue = item[field]
          return fieldValue && String(fieldValue).toLowerCase().includes(lowerQuery)
        })
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, items, searchFields])

  // Gérer le clic en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (item: T) => {
    onChange(item[valueField])
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onChange("")
    setSearchQuery("")
  }

  const getDisplayText = (item: T) => {
    return String(item[displayField] || "")
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Champ de sélection */}
      <div className="relative">
        <div
          className={`
            w-full px-3 py-2 pr-10 border rounded-lg cursor-pointer
            flex items-center justify-between
            ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 hover:border-[#8A56B2]'}
            ${error ? 'border-red-500' : ''}
            ${isOpen ? 'ring-2 ring-[#8A56B2] border-[#8A56B2]' : ''}
            transition-colors duration-200
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedItem ? 'text-gray-900' : 'text-gray-500'}>
            {selectedItem ? getDisplayText(selectedItem) : placeholder}
          </span>
          <div className="flex items-center space-x-2">
            {selectedItem && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#8A56B2] border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Champ de recherche */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A56B2]"
              autoFocus
            />
          </div>

          {/* Liste des options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchQuery ? 'Aucun résultat trouvé' : 'Aucune option disponible'}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <div
                  key={item[valueField] || index}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors duration-150
                    ${item[valueField] === value ? 'bg-[#8A56B2] text-white' : 'hover:bg-gray-100'}
                  `}
                  onClick={() => handleSelect(item)}
                >
                  <div className="font-medium">
                    {getDisplayText(item)}
                  </div>
                  {/* Afficher des informations supplémentaires si disponibles */}
                  {item.email && (
                    <div className={`text-sm ${item[valueField] === value ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.email}
                    </div>
                  )}
                  {item.phoneNumber && (
                    <div className={`text-sm ${item[valueField] === value ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.phoneNumber}
                    </div>
                  )}
                  {item.accountSubName && (
                    <div className={`text-sm ${item[valueField] === value ? 'text-gray-200' : 'text-gray-500'}`}>
                      {item.accountSubName}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
