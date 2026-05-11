'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Home, CreditCard, Info, BarChart3, Users,
  ArrowRightLeft, Wallet, User, Globe, ShieldCheck, ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  section?: string
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Détermine la section paiement active.
 * Les pages de détail ont la priorité absolue sur le ?section= query param.
 *
 * /wallet/:id            → 'wallets'
 * /compte/:id            → 'accounts'
 * /payment-methods/:id   → 'methods'
 * /countries/:id         → 'countries'
 * /payment?section=xxx   → xxx
 * /payment (sans param)  → null  (Vue d'ensemble)
 */
function resolvePaymentSection(pathname: string, section: string | null): string | null {
  if (pathname.startsWith('/wallet/'))          return 'wallets'
  if (pathname.startsWith('/compte/'))          return 'accounts'
  if (pathname.startsWith('/payment-methods/')) return 'methods'
  if (pathname.startsWith('/countries/'))       return 'countries'
  return section ?? null
}

/** Retourne true si le pathname appartient au domaine "paiement". */
function isPaymentRoute(pathname: string): boolean {
  return (
    pathname === '/payment' ||
    pathname.startsWith('/wallet/') ||
    pathname.startsWith('/countries/') ||
    pathname.startsWith('/compte/') ||
    pathname.startsWith('/payment-methods/')
  )
}

// ─────────────────────────────────────────────
// Navigation definitions
// ─────────────────────────────────────────────

const ICON_ITEMS: NavItem[] = [
  { icon: <Home size={20} className="text-inherit" />,       label: 'Accueil',      href: '/dashboard' },
  { icon: <CreditCard size={20} className="text-inherit" />, label: 'Paiement',     href: '/payment' },
  { icon: <Users size={20} className="text-inherit" />,      label: 'Utilisateurs', href: '/users' },
]

const HOME_NAV: NavItem[] = [
  { icon: <BarChart3 size={20} className="text-inherit" />, label: 'Tableau de bord', href: '/dashboard' },
]

const PAYMENT_NAV: NavItem[] = [
  { icon: <BarChart3 size={20} className="text-inherit" />,      label: "Vue d'ensemble",      href: '/payment',                     section: undefined },
  { icon: <ArrowRightLeft size={20} className="text-inherit" />, label: 'Transactions',         href: '/payment?section=transactions', section: 'transactions' },
  { icon: <Wallet size={20} className="text-inherit" />,         label: 'Wallets',              href: '/payment?section=wallets',      section: 'wallets' },
  { icon: <User size={20} className="text-inherit" />,           label: 'Comptes',              href: '/payment?section=accounts',     section: 'accounts' },
  { icon: <CreditCard size={20} className="text-inherit" />,     label: 'Méthode de paiement', href: '/payment?section=methods',      section: 'methods' },
  { icon: <Globe size={20} className="text-inherit" />,          label: 'Pays',                 href: '/payment?section=countries',    section: 'countries' },
]

const USERS_NAV: NavItem[] = [
  { icon: <BarChart3 size={20} className="text-inherit" />,   label: "Vue d'ensemble", href: '/users' },
  { icon: <ShieldCheck size={20} className="text-inherit" />, label: 'KYC',            href: '/users/kyc' },
]

// ─────────────────────────────────────────────
// SidebarContent
// ─────────────────────────────────────────────

function SidebarContent({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [isMounted,   setIsMounted]   = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)
  const [hoveredNav,  setHoveredNav]  = useState<number | null>(null)

  useEffect(() => { setIsMounted(true) }, [])

  // ── Route context ──────────────────────────

  const sectionParam = searchParams.get('section')

  const onPayment   = isMounted && isPaymentRoute(pathname)
  const onUsers     = isMounted && (pathname === '/users' || pathname.startsWith('/users/'))
  const onDashboard = isMounted && pathname === '/dashboard'

  const activeSection = isMounted
    ? resolvePaymentSection(pathname, sectionParam)
    : '__loading__'   // valeur sentinelle → aucun item actif avant hydratation

  const displayNav: NavItem[] = onPayment ? PAYMENT_NAV : onUsers ? USERS_NAV : HOME_NAV

  // ── Active state helpers ───────────────────

  const isIconActive = (item: NavItem): boolean => {
    if (!isMounted) return false
    if (item.href === '/dashboard') return onDashboard
    if (item.href === '/payment')   return onPayment
    if (item.href === '/users')     return onUsers
    return false
  }

  const isNavActive = (item: NavItem): boolean => {
    if (!isMounted) return false

    if (onPayment) {
      // Vue d'ensemble (section === undefined) : active seulement si aucune section résolue
      if (item.section === undefined) return activeSection === null
      return item.section === activeSection
    }

    if (onUsers) {
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }

    return pathname === item.href
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-white">

      {/* ── Icon strip (dark) ───────────────────── */}
      <div className="w-20 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 flex flex-col items-center py-5 space-y-4 border-r border-gray-800 shadow-2xl transition-all duration-300">

        {/* Logo / toggle */}
        <div className="relative group mb-2 cursor-pointer" onClick={onToggle}>
          {isCollapsed ? (
            <div className="flex items-center justify-center p-2 hover:opacity-90 transition-opacity">
              <Image
                src="/logo-preview.png"
                alt="Logo"
                width={44}
                height={44}
                className="object-contain hover:opacity-75 transition-opacity duration-200"
                onClick={(e) => { e.stopPropagation(); window.open('https://faroty.com', '_blank') }}
              />
            </div>
          ) : (
            <div className="relative group">
              <div className="bg-gray-800 hover:bg-gray-700 p-2.5 rounded-lg transition-colors duration-200">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="text-gray-300 group-hover:text-gray-100 transition-colors duration-200">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <path d="M15 3v18" />
                  <path d="M9 12l3-3" />
                  <path d="M12 15l-3-3" />
                </svg>
              </div>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-950 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg border border-gray-700 z-50">
                Fermer la sidebar
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-10 h-px bg-gray-700" />

        {/* Icon nav */}
        <nav className="flex-1 flex flex-col space-y-2.5">
          {ICON_ITEMS.map((item, index) => {
            const active = isIconActive(item)
            return (
              <Link key={index} href={item.href} className="relative group">
                <button
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  title={item.label}
                  className={`relative w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-300 ${
                    active
                      ? 'text-white shadow-xl shadow-purple-600/40 scale-105'
                      : 'text-gray-500 hover:text-gray-100 hover:bg-gray-800'
                  } ${hoveredIcon === index && !active ? 'bg-gray-800 scale-105' : ''}`}
                  style={active ? { background: 'linear-gradient(to bottom, #8A56B2, #6B3FA0)' } : undefined}
                >
                  {item.icon}
                </button>
              </Link>
            )
          })}
        </nav>

        {/* Info icon at bottom */}
        <div className="w-10 h-px bg-gradient-to-r from-gray-700 to-transparent" />
        <div className="relative group">
          <button
            className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-100 hover:bg-gray-800 transition-all duration-300 hover:scale-105"
            title="Informations"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* ── Secondary panel (white) ─────────────── */}
      <div className={`bg-white flex flex-col border-r border-gray-200 shadow-lg transition-all duration-500 overflow-hidden ${
        isCollapsed ? 'w-0' : 'w-80'
      }`}>

        {/* ── Logo ──────────────────────────────────
            Rendu immédiatement, sans condition isMounted ni classe opacity conditionnelle.
            Visible dès le premier paint : SSR, hydratation, refresh, navigation. */}
        <div className="border-b border-gray-200 bg-white shrink-0">
          <div className="px-4 py-3 flex items-center h-20">
            <img
              src="/logo_empty.png"
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 p-6 overflow-y-auto">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6 px-1">
            Navigation
          </p>

          <nav className="space-y-2">
            {displayNav.map((item, index) => {
              const active = isNavActive(item)
              return (
                <Link
                  key={index}
                  href={item.href}
                  onMouseEnter={() => setHoveredNav(index)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`group relative flex items-center justify-between p-3.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200/60 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                  }`}
                >
                  {/* Accent bar gauche */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 via-purple-500 to-blue-600 rounded-r-full" />
                  )}

                  <div className="flex items-center ml-2 flex-1">
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                      active
                        ? 'bg-[#8A56B2] text-white shadow-lg shadow-purple-600/40'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-purple-700'
                    }`}>
                      {item.icon}
                    </div>
                    <span className={`font-semibold ml-3 text-sm transition-all duration-300 whitespace-nowrap ${
                      hoveredNav === index ? 'translate-x-1' : ''
                    }`}>
                      {item.label}
                    </span>
                  </div>

                  <ChevronRight
                    size={18}
                    className={`transition-all duration-300 mr-1 flex-shrink-0 ${
                      active
                        ? 'opacity-100 text-purple-600'
                        : 'opacity-0 group-hover:opacity-100 text-gray-400'
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

// ─────────────────────────────────────────────
// Export — Suspense requis pour useSearchParams
// ─────────────────────────────────────────────

export default function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-white">
        {/* Icon strip skeleton */}
        <div className="w-20 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 flex flex-col items-center py-5 space-y-4 border-r border-gray-800 shadow-2xl">
          <div className="w-11 h-11 bg-gray-800 rounded-lg animate-pulse" />
        </div>
        {/* White panel skeleton — logo toujours visible */}
        <div className="w-80 bg-white flex flex-col border-r border-gray-200 shadow-lg">
          <div className="border-b border-gray-200 bg-white shrink-0">
            <div className="px-4 py-3 flex items-center h-20">
              <img
                src="/logo_empty.png"
                alt="Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    }>
      <SidebarContent isCollapsed={isCollapsed} onToggle={onToggle} />
    </Suspense>
  )
}