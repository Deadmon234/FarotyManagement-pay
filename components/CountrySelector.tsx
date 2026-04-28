'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Country, CountryService } from '../lib/country-service'
import { ChevronDown, Search } from 'lucide-react'

interface CountrySelectorProps {
  selectedCountry: Country | null
  onCountryChange: (country: Country) => void
  className?: string
  placeholder?: string
}

export default function CountrySelector({ 
  selectedCountry, 
  onCountryChange, 
  className = '',
  placeholder = 'Sélectionner un pays'
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [commonCountries, setCommonCountries] = useState<Country[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true)
        await CountryService.initialize()
        const allCountries = CountryService.getAllCountries()
        const common = CountryService.getCommonCountries()
        setCountries(allCountries)
        setCommonCountries(common)
        setFilteredCountries(common)
        
        // Sélectionner le Cameroun par défaut (+237)
        const cameroon = CountryService.getCountryByPhoneCode('237')
        if (cameroon && !selectedCountry) {
          onCountryChange(cameroon)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCountries()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCountries(commonCountries)
    } else {
      const filtered = CountryService.searchCountries(searchQuery)
      setFilteredCountries(filtered)
    }
  }, [searchQuery, commonCountries])

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country)
    setIsOpen(false)
    setSearchQuery('')
  }

  const formatPhoneCode = (code: string) => {
    return code.startsWith('+') ? code : `+${code}`
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 ${className}`}>
        <div className="w-6 h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
        </div>
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bouton de sélection */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#8A56B2] focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2] transition-all outline-none"
        style={{ cursor: 'pointer' }}
      >
        <div className="flex items-center space-x-3">
          {selectedCountry ? (
            <>
              <span className="text-xl filter grayscale text-gray-800 font-semibold">{selectedCountry.emoji}</span>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{selectedCountry.name}</div>
                <div className="text-xs text-gray-500">{formatPhoneCode(selectedCountry.phone_code)}</div>
              </div>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={20} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Barre de recherche */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un pays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2] outline-none text-sm placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>

          {/* Liste des pays */}
          <div className="overflow-y-auto max-h-60">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                Aucun pays trouvé
              </div>
            ) : (
              <>
                {/* Pays courants */}
                {searchQuery.trim() === '' && commonCountries.length > 0 && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                      Pays courants
                    </div>
                    {commonCountries.map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedCountry?.id === country.id ? 'bg-purple-50' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="text-xl filter grayscale text-gray-800 font-semibold">{country.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-900">{formatPhoneCode(country.phone_code)}</div>
                        </div>
                        {selectedCountry?.id === country.id && (
                          <div className="w-5 h-5 bg-[#8A56B2] rounded-full flex items-center justify-center">
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                )}

                {/* Résultats de recherche */}
                {searchQuery.trim() !== '' && (
                  <>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500">
                      Résultats de recherche
                    </div>
                    {filteredCountries.map((country) => (
                      <button
                        key={country.id}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedCountry?.id === country.id ? 'bg-purple-50' : ''
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="text-xl filter grayscale">{country.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-500">{formatPhoneCode(country.phone_code)}</div>
                        </div>
                        {selectedCountry?.id === country.id && (
                          <div className="w-5 h-5 bg-[#8A56B2] rounded-full flex items-center justify-center">
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4.5L4.5 8L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
