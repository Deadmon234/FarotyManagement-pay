'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, CreditCard, Info, BarChart3, Users, TrendingUp, Activity, ChevronRight, Crown, ChevronLeft, ArrowRightLeft, Wallet, User, Globe, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  isActive?: boolean
}

function SidebarContent({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)
  const [hoveredNav, setHoveredNav] = useState<number | null>(null)

  const iconItems: NavItem[] = [
    { icon: <Home size={20} />, label: 'Accueil', href: '/dashboard' },
    { icon: <CreditCard size={20} />, label: 'Paiement', href: '/payment' },
    { icon: <Users size={20} />, label: 'Utilisateurs', href: '/users' },
    // { icon: <Info size={20} />, label: 'Informations', href: '#' },
  ]

  const homeNavItems: NavItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Tableau de bord', href: '/dashboard' },
  ]

  const paymentNavItems: NavItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Vue d\'ensemble', href: '/payment' },
    { icon: <ArrowRightLeft size={20} />, label: 'Transactions', href: '/payment?section=transactions' },
    { icon: <Wallet size={20} />, label: 'Wallets', href: '/payment?section=wallets' },
    { icon: <User size={20} />, label: 'Comptes', href: '/payment?section=accounts' },
    { icon: <CreditCard size={20} />, label: 'Méthode de paiement', href: '/payment?section=methods' },
    { icon: <Globe size={20} />, label: 'Pays', href: '/payment?section=countries' },
  ]

  const usersNavItems: NavItem[] = [
    { icon: <BarChart3 size={20} />, label: 'Vue d\'ensemble', href: '/users' },
    { icon: <ShieldCheck size={20} />, label: 'KYC', href: '/users/kyc' },
  ]

  const isOnPaymentPage = pathname === '/payment' || pathname.startsWith('/wallet') || pathname.startsWith('/countries') || pathname.startsWith('/compte') || pathname.startsWith('/payment-methods')
  const isOnDashboardPage = pathname === '/dashboard'
  const isOnUsersPage = pathname === '/users' || pathname.startsWith('/users')
  const displayNavItems = isOnPaymentPage ? paymentNavItems : isOnUsersPage ? usersNavItems : homeNavItems

  return (
    <div className="flex h-screen bg-white">
      {/* Left dark sidebar with icons */}
      <div className="w-20 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 flex flex-col items-center py-5 space-y-4 border-r border-gray-800 shadow-2xl transition-all duration-300">
        {/* Logo/Toggle button */}
        <div 
          className="relative group mb-2"
          onClick={onToggle}
          style={{cursor: 'pointer'}}
        >
          {isCollapsed ? (
            <div className="flex items-center justify-center p-2 hover:opacity-90 transition-opacity">
              <Image 
                src="/logo-preview.png" 
                alt="Logo" 
                width={44} 
                height={44} 
                className="object-contain cursor-pointer hover:opacity-75 transition-opacity duration-200"
                onClick={() => window.open('https://faroty.com', '_blank')}
              />
            </div>
          ) : (
            <div className="relative group">
              <div className="bg-gray-800 hover:bg-gray-700 p-2.5 rounded-lg cursor-pointer transition-colors duration-200" onClick={onToggle} style={{cursor: 'pointer'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M15 3v18"></path>
                  <path d="M9 12l3-3"></path>
                  <path d="M12 15l-3-3"></path>
                </svg>
              </div>
              {/* Tooltip */}
              <div className="absolute left-full bg-gray-950 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-gray-700">
                Fermer la sidebar
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>

        {/* Icon navigation */}
        <nav className="flex-1 flex flex-col space-y-2.5">
          {iconItems.map((item, index) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard' 
              : item.href === '/payment' 
                ? pathname.startsWith('/payment') || pathname.startsWith('/wallet')
                : pathname.startsWith(item.href)
            
            // Vérifier si on est sur une page de détail et sélectionner la sous-section appropriée
            const isOnPaymentMethodDetail = pathname.startsWith('/payment-methods/')
            const isOnAccountDetail = pathname.startsWith('/compte/')
            const isOnCountryDetail = pathname.startsWith('/countries/')
            const isOnWalletDetail = pathname.startsWith('/wallet/')
            const isOnUsersDetail = pathname.startsWith('/users/')
            
            // Déterminer quelle sous-section de paiement doit être sélectionnée
            let paymentSectionActive = null
            if (isOnPaymentMethodDetail) {
              paymentSectionActive = 'methods'
            } else if (isOnAccountDetail) {
              paymentSectionActive = 'accounts'
            } else if (isOnCountryDetail) {
              paymentSectionActive = 'countries'
            } else if (isOnWalletDetail) {
              paymentSectionActive = 'wallets'
            }
            return (
              <Link key={index} href={item.href} className="relative group">
                <button
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  title={item.label}
                  className={`relative w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#8A56B2] to-[#6B3FA0] text-white shadow-xl shadow-purple-600/40'
                      : 'text-gray-500 hover:text-gray-100 hover:bg-gray-800'
                  } ${hoveredIcon === index && !isActive ? 'bg-gray-800 scale-105' : ''} ${hoveredIcon === index && isActive ? 'scale-105 shadow-xl shadow-purple-600/50' : ''} ${
                    // Mettre en évidence la sous-section active dans la navigation contextuelle
                    item.href.startsWith('/payment?section=') && paymentSectionActive && item.href.includes(paymentSectionActive) 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#8A56B2]' 
                      : ''
                  }`}
                  style={{
                    background: isActive ? 'linear-gradient(to bottom, #8A56B2, #6B3FA0)' : undefined,
                    color: isActive ? 'white' : undefined,
                    cursor: 'pointer'
                  }}
                >
                  {item.icon}
                </button>

                {/* Tooltip */}
                <div className="absolute left-full ml-2 bottom-full mb-2 z-[9999] opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                  <div className="bg-gray-950 text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
                    {item.label}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 border-6 border-transparent border-t-gray-950"></div>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Settings icon at bottom */}
        <div className="w-10 h-px bg-gradient-to-r from-gray-700 to-transparent"></div>
        <div className="relative group">
          <button className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 hover:scale-105" style={{cursor: 'pointer'}} title="Paramètres">
            <Info size={20} />
          </button>
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-gray-950 text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border border-gray-700">
              Paramètres
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-6 border-transparent border-r-gray-950"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main white sidebar */}
      <div className={`bg-white flex flex-col border-r border-gray-200 shadow-lg transition-all duration-500 overflow-hidden ${
        isCollapsed ? 'w-0' : 'w-64'
      }`}>
        {/* Header section */}
        <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          {/* Logo */}
          <div className="p-4 relative overflow-hidden">
            <div className="flex items-left justify-left relative h-12">
              {/* Logo complet (sidebar ouverte) */}
              <img 
                src="/logo_empty.png" 
                alt="Company Logo" 
                className={`absolute h-12 w-auto object-contain transition-all duration-700 ease-in-out transform ${
                  isCollapsed 
                    ? 'opacity-0 scale-95 translate-x-2' 
                    : 'opacity-100 scale-100 translate-x-0'
                }`}
              />
              {/* Logo compact (sidebar fermée) */}
              <img 
                src="/logo-preview.png" 
                alt="Company Logo" 
                className={`absolute h-12 w-auto object-contain transition-all duration-700 ease-in-out transform ${
                  isCollapsed 
                    ? 'opacity-100 scale-100 translate-x-0' 
                    : 'opacity-0 scale-105 -translate-x-2'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Navigation section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6 px-1">
            Navigation
          </div>
          
          <nav className="space-y-2">
            {displayNavItems.map((item, index) => {
              let isActive = false
              if (isOnPaymentPage || pathname.startsWith('/wallet')) {
                // Pour la page paiement ou les pages de wallet, vérifier le paramètre de requête ou le pathname
                const section = searchParams.get('section')
                if (pathname.startsWith('/wallet')) {
                  // Si on est sur une page de wallet, considérer que la section wallets est active
                  isActive = item.href.includes('section=wallets')
                } else if (item.href === '/payment') {
                  isActive = !section // Vue d'ensemble n'a pas de paramètre
                } else {
                  // Vérification exacte du paramètre de section
                  const itemSection = item.href.split('section=')[1]
                  isActive = itemSection === section
                }
              } else if (isOnUsersPage) {
                // Pour la page utilisateurs
                isActive = item.href === '/users'
              } else {
                // Pour le dashboard
                isActive = pathname === '/dashboard'
              }
              
              return (
                <Link
                  key={index}
                  href={item.href}
                  onMouseEnter={() => setHoveredNav(index)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200/60 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {/* Left accent bar for active */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 via-purple-500 to-blue-600 rounded-r-full"></div>
                  )}

                  <div className="flex items-center ml-2 flex-1">
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/40'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-purple-700'
                    } ${hoveredNav === index && !isActive ? 'scale-105' : ''}`}>
                      {item.icon}
                    </div>
                    <span className={`font-semibold ml-3 text-sm transition-all duration-300 whitespace-nowrap ${
                    hoveredNav === index ? 'translate-x-1' : ''
                  }`}>
                    {item.label}
                  </span>
                </div>

                {/* Chevron icon */}
                <ChevronRight 
                  size={18} 
                  className={`transition-all duration-300 mr-1 flex-shrink-0 ${
                    isActive ? 'opacity-100 text-purple-600' : 'opacity-0 group-hover:opacity-100 text-gray-400'
                  } ${hoveredNav === index ? 'translate-x-1' : ''}`}
                />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-white">
        <div className="w-20 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 flex flex-col items-center py-5 space-y-4 border-r border-gray-800 shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-center">
            <div className="w-11 h-11 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    }>
      <SidebarContent isCollapsed={isCollapsed} onToggle={onToggle} />
    </Suspense>
  )
}
