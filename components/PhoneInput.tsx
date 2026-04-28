'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Country, CountryService } from '../lib/country-service'
import CountrySelector from './CountrySelector'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onCountryChange?: (country: Country) => void
  className?: string
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
}

export default function PhoneInput({
  value,
  onChange,
  onCountryChange,
  className = '',
  placeholder = '6XX XXX XXX',
  disabled = false,
  autoFocus = false
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initializeCountry = async () => {
      await CountryService.initialize()
      
      // Extraire le code pays du numéro actuel
      const country = CountryService.getCountryByPhoneCode('237') // Cameroun par défaut
      if (country) {
        setSelectedCountry(country)
        
        // Extraire le numéro de téléphone sans le code pays
        const cleanValue = value.replace(country.phone_code, '').trim()
        setPhoneNumber(cleanValue)
        
        if (onCountryChange) {
          onCountryChange(country)
        }
      }
    }

    initializeCountry()
  }, [])

  useEffect(() => {
    // Mettre à jour la valeur complète quand le pays ou le numéro change
    if (selectedCountry) {
      const fullNumber = `${selectedCountry.phone_code} ${phoneNumber}`.trim()
      onChange(fullNumber)
    }
  }, [phoneNumber, selectedCountry, onChange])

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country)
    if (onCountryChange) {
      onCountryChange(country)
    }
    
    // Garder le numéro de téléphone actuel mais changer le code pays
    setPhoneNumber(phoneNumber)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    
    // Ne permettre que les chiffres, espaces et tirets
    newValue = newValue.replace(/[^\d\s\-]/g, '')
    
    // Limiter la longueur (max 15 chiffres pour le numéro local)
    if (newValue.length > 15) {
      newValue = newValue.substring(0, 15)
    }
    
    setPhoneNumber(newValue)
  }

  const formatPhoneCode = (code: string) => {
    return code.startsWith('+') ? code : `+${code}`
  }

  const getPlaceholder = () => {
    if (selectedCountry?.name === 'Cameroon') {
      return '6XX XXX XXX'
    }
    return placeholder
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Sélecteur de pays */}
      <div className="flex-shrink-0">
        <CountrySelector
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          className="min-w-[140px]"
        />
      </div>

      {/* Input du numéro de téléphone */}
      <div className="flex-1 relative">
        {/* Indicateur visuel du code pays */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
          <span className="text-sm font-semibold text-gray-500">
            {selectedCountry ? formatPhoneCode(selectedCountry.phone_code) : '+237'}
          </span>
          <div className="w-px h-4 bg-gray-300"></div>
        </div>

        {/* Input du numéro */}
        <input
          ref={inputRef}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full pl-20 pr-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2] transition-all outline-none bg-white"
          style={{
            paddingLeft: selectedCountry ? `${formatPhoneCode(selectedCountry.phone_code).length * 8 + 32}px` : '80px'
          }}
        />
      </div>
    </div>
  )
}
