'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Globe, Sun, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User profile icon */}
      <div 
        className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => setIsOpen(!isOpen)}
        style={{cursor: 'pointer'}}
      >
        <div className="relative flex flex-col items-center">
          {/* User icon - head */}
          <div className="w-3 h-3 bg-[#8A56B2] rounded-full"></div>
          {/* User icon - body */}
          <div className="w-5 h-4 bg-[#8A56B2] rounded-full mt-0.5"></div>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User info section */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="flex flex-col items-center">
                  {/* User icon - head */}
                  <div className="w-3 h-3 bg-[#8A56B2] rounded-full"></div>
                  {/* User icon - body */}
                  <div className="w-5 h-4 bg-[#8A56B2] rounded-full mt-0.5"></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{user?.fullName || 'Utilisateur'}</div>
                <div className="text-sm text-gray-500">{user?.email || 'email@example.com'}</div>
                <div className="text-xs text-[#8A56B2] font-semibold mt-1">{user?.guest ? 'Guest' : 'ADMIN'}</div>
              </div>
            </div>
          </div>

          {/* Menu options */}
          <div className="p-2">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors" style={{cursor: 'pointer'}}>
              <div className="flex items-center space-x-3">
                <Globe size={18} className="text-gray-600" />
                <span className="text-gray-700">Langue</span>
              </div>
              <span className="text-sm text-gray-500">Français</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors" style={{cursor: 'pointer'}}>
              <div className="flex items-center space-x-3">
                <Sun size={18} className="text-gray-600" />
                <span className="text-gray-700">Mode</span>
              </div>
              <span className="text-sm text-gray-500">Clair</span>
            </button>

            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors" style={{cursor: 'pointer'}}>
              <div className="flex items-center space-x-3">
                <Settings size={18} className="text-gray-600" />
                <span className="text-gray-700">Paramètres</span>
              </div>
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 rounded-lg transition-colors group" 
              style={{cursor: 'pointer'}}
            >
              <LogOut size={18} className="text-gray-600 group-hover:text-red-600" />
              <span className="text-gray-700 group-hover:text-red-600">Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
