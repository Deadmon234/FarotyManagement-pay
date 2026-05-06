'use client'

import React from 'react'
import { ChevronDown, Users, SquareChevronRight } from 'lucide-react'
import { useSearchParams, usePathname } from 'next/navigation'
import UserProfileDropdown from './userProfileDropdown'
import { useAuth } from '../hooks/useAuth'

export default function TopNav({ isSidebarCollapsed, onToggleSidebar }: { isSidebarCollapsed: boolean; onToggleSidebar: () => void }) {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Fonction pour déterminer le breadcrumb complet
  const getBreadcrumb = () => {
    const section = searchParams.get('section')
    
    // Page d'accueil (racine ou dashboard)
    if (pathname === '/' || pathname.includes('/dashboard')) {
      return {
        first: 'Accueil',
        second: 'Tableau de bord'
      }
    }
    
    // Page paiement sans section (par défaut vue d'ensemble)
    if (pathname.includes('/payment') && !section) {
      return {
        first: 'Paiement',
        second: 'Vue d\'ensemble'
      }
    }
    
    // Pages de paiement avec section spécifique
    if (pathname.includes('/payment') && section) {
      let sectionName = ''
      switch (section) {
        case 'overview':
          sectionName = 'Vue d\'ensemble'
          break
        case 'wallets':
          sectionName = 'Wallets'
          break
        case 'accounts':
          sectionName = 'Comptes'
          break
        case 'methods':
          sectionName = 'Méthodes de paiement'
          break
        case 'countries':
          sectionName = 'Pays'
          break
        case 'transactions':
          sectionName = 'Transactions'
          break
        default:
          sectionName = 'Vue d\'ensemble'
      }
      
      return {
        first: 'Paiement',
        second: sectionName
      }
    }
    
    // Pages de wallet (détails d'un wallet)
    if (pathname.includes('/wallet')) {
      return {
        first: 'Paiement',
        second: 'Wallets'
      }
    }
    
    // Autres pages
    if (pathname.includes('/settings')) {
      return {
        first: 'Accueil',
        second: 'Paramètres'
      }
    }
    if (pathname.includes('/profile')) {
      return {
        first: 'Accueil',
        second: 'Profil'
      }
    }
    
    // Par défaut
    return {
      first: 'Accueil',
      second: 'Tableau de bord'
    }
  }
  
  const breadcrumb = getBreadcrumb()
  
  return (
    <div className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-3 text-sm">
        {isSidebarCollapsed && (
          <div 
            className="group p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 mr-2"
            onClick={onToggleSidebar}
            style={{cursor: 'pointer'}}
            title="Ouvrir la sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600 group-hover:text-gray-900 transition-colors duration-200">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M9 3v18"></path>
              <path d="M15 12l-3-3"></path>
              <path d="M12 15l3-3"></path>
            </svg>
          </div>
        )}
        <span className="text-gray-900 font-semibold text-sm">{breadcrumb.first}</span>
        <span className="text-gray-900 fond-semibold">›</span>
        <span className="text-gray-600 text-sm">{breadcrumb.second}</span>
      </div>

      {/* User profile section */}
      <div className="flex items-center space-x-5">
        {/* Organization dropdown */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all duration-200 group" style={{cursor: 'pointer'}}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#8A56B2] to-[#6B3FA0] rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Users size={18} className="text-white" />
          </div>
          <span className="text-gray-900 font-semibold text-sm">
            {loading ? 'Chargement...' : user?.fullName ? (
              <>
                {user.fullName} <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span><span className="text-green-600">connecté</span>
              </>
            ) : 'Utilisateur'}
          </span>
        </div>

        {/* User profile dropdown */}
        <UserProfileDropdown />
      </div>
    </div>
  )
}
