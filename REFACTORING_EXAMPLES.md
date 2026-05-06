# Exemples de Refactorisation - Cross-Platform

Ce document fournit des exemples de code montrant comment refactoriser le code existant pour la compatibilité cross-platform.

## 1. Remplacer `window.location.href`

### ❌ AVANT (Non compatible)

```tsx
// app/payment/page.tsx
<button onClick={() => window.location.href = `/wallet/${wallet.id}`}>
  Accéder au wallet
</button>
```

**Problèmes:**
- Force un rechargement complet
- Perte de l'état de l'application
- SPA experience brisée
- Mauvaise performance sur mobile

### ✅ APRÈS (Compatible)

```tsx
// app/payment/page.tsx
'use client'

import { useRouter } from 'next/navigation'

export default function PaymentPage() {
  const router = useRouter()

  const handleWalletClick = (walletId: string) => {
    try {
      router.push(`/wallet/${walletId}`)
    } catch (error) {
      console.error('Navigation failed:', error)
      // Fallback
      if (typeof window !== 'undefined') {
        window.location.href = `/wallet/${walletId}`
      }
    }
  }

  return (
    <div>
      <button onClick={() => handleWalletClick(wallet.id)}>
        Accéder au wallet
      </button>
    </div>
  )
}
```

**Avantages:**
- Navigation SPA rapide
- État préservé
- Meilleure UX
- Fallback pour erreurs

---

## 2. Remplacer `window.open()`

### ❌ AVANT (Non sécurisé)

```tsx
// components/sidebar.tsx
<button onClick={() => window.open('https://faroty.com', '_blank')}>
  Website
</button>
```

**Problèmes:**
- Pas d'attributs de sécurité
- Peut être bloqué
- Mobile: comportement imprévisible

### ✅ APRÈS (Sécurisé)

```tsx
// components/sidebar.tsx
'use client'

import { openInNewTab } from '@/lib/navigation-utils'

export default function Sidebar() {
  return (
    <button onClick={() => openInNewTab('https://faroty.com')}>
      Website
    </button>
  )
}
```

**Avantages:**
- Attributs de sécurité: `noopener, noreferrer`
- Gestion d'erreur
- Mobile compatible
- Type-safe

---

## 3. Remplacer `localStorage` direct

### ❌ AVANT (Non fiable)

```tsx
// lib/api-config.ts
export const getDeviceInfo = () => {
  const deviceId = localStorage.getItem(API_CONFIG.STORAGE_KEYS.DEVICE_ID)
  // Peut échouer en mode incognito!
  
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.DEVICE_ID, deviceId)
  // Peut lever une erreur
}
```

**Problèmes:**
- Échoue en mode incognito
- Pas de fallback
- Erreurs non gérées

### ✅ APRÈS (Robuste)

```tsx
// lib/api-config.ts
import RobustStorageService from './robust-storage-service'

export const getDeviceInfo = async () => {
  try {
    let deviceId = await RobustStorageService.getItem(
      API_CONFIG.STORAGE_KEYS.DEVICE_ID
    )
    
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      await RobustStorageService.setItem(
        API_CONFIG.STORAGE_KEYS.DEVICE_ID,
        deviceId
      )
    }
    
    return {
      deviceId,
      deviceType: 'WEB',
      deviceModel: getDeviceModel(),
      osName: getOS(),
    }
  } catch (error) {
    console.error('Failed to get device info:', error)
    // Retourner une valeur par défaut
    return {
      deviceId: 'unknown',
      deviceType: 'WEB',
      deviceModel: 'Unknown',
      osName: 'Unknown',
    }
  }
}
```

**Avantages:**
- Fonctionne en mode incognito (IndexedDB fallback)
- Gestion d'erreur
- Async-safe
- Type-safe

---

## 4. Remplacer les event listeners (Click Outside)

### ❌ AVANT (Non tactile)

```tsx
// components/CountrySelector.tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    // Utilise mousedown - pas de support touch
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => {
    document.removeEventListener('mousedown', handleClickOutside)
  }
}, [])
```

**Problèmes:**
- Dropdowns ne se ferment pas au touch
- Mauvaise UX sur mobile
- Event listeners non nettoyés sur unmount

### ✅ APRÈS (Tactile)

```tsx
// components/CountrySelector.tsx
import { useClickOutside } from '@/hooks/usePointerEvent'

export default function CountrySelector() {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Le hook gère automatiquement mouse + touch
  useClickOutside(dropdownRef, () => setIsOpen(false))

  return <div ref={dropdownRef}>...</div>
}
```

**Avantages:**
- Fonctionne sur mobile et desktop
- Événements mouse et touch
- Memory leaks évités
- Code simplifié

---

## 5. Remplacer les grilles statiques

### ❌ AVANT (Non responsive)

```tsx
// app/payment/page.tsx
<div className="grid grid-cols-4 gap-6">
  {/* Trop étroit sur mobile - 4 colonnes c'est trop */}
  {wallets.map(wallet => (
    <div key={wallet.id}>...</div>
  ))}
</div>
```

**Problèmes:**
- 4 colonnes sur petit mobile = imbitable
- Pas d'adaptation écran
- Tableau non responsive

### ✅ APRÈS (Responsive)

```tsx
// app/payment/page.tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
  {wallets.map(wallet => (
    <div key={wallet.id} className="p-4 md:p-6">
      {/* Padding responsive aussi */}
      ...
    </div>
  ))}
</div>

{/* Alternative avec tables responsive */}
<div className="overflow-x-auto -webkit-overflow-scrolling-touch">
  <table className="w-full">
    {/* Table se transforme en cards sur mobile */}
  </table>
</div>
```

**Avantages:**
- Responsive à tous les écrans
- Lisible sur petit mobile
- Momentum scroll sur iOS
- Padding adapté

---

## 6. Remplacer `navigator.platform` statique

### ❌ AVANT (Limité)

```tsx
// lib/api-config.ts
export const getDeviceInfo = () => {
  return {
    osName: navigator.platform || 'Unknown',  // Déprécié
  }
}
```

**Problèmes:**
- `navigator.platform` est déprécié
- Pas d'info système d'exploitation fiable
- Code fragile

### ✅ APRÈS (Robuste)

```tsx
// lib/navigation-utils.ts
export const getOS = (): 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Unknown' => {
  if (typeof window === 'undefined') {
    return 'Unknown'
  }

  const userAgent = window.navigator.userAgent
  const platform = window.navigator.platform?.toUpperCase()

  // Vérifier User-Agent d'abord (iOS/Android)
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS'
  if (/Android/.test(userAgent)) return 'Android'
  
  // Vérifier platform pour desktop
  if (platform?.includes('WIN')) return 'Windows'
  if (platform?.includes('MAC')) return 'macOS'
  if (platform?.includes('LINUX')) return 'Linux'

  // Fallback User-Agent
  if (/Win/.test(userAgent)) return 'Windows'
  if (/Mac/.test(userAgent)) return 'macOS'
  if (/Linux/.test(userAgent)) return 'Linux'

  return 'Unknown'
}
```

**Avantages:**
- Detection fiable cross-platform
- Gère mobile et desktop
- Future-proof
- Type-safe

---

## 7. Gestion des inputs responsives

### ❌ AVANT (Zoom involontaire iOS)

```tsx
// components/PhoneInput.tsx
<input
  type="tel"
  value={phoneNumber}
  onChange={handlePhoneChange}
  // Font size < 16px cause zoom iOS!
  className="text-sm"
/>
```

**Problèmes:**
- iOS zoome automatiquement si font < 16px
- Mauvaise UX sur mobile

### ✅ APRÈS (Mobile optimisé)

```tsx
// components/PhoneInput.tsx
<input
  type="tel"
  value={phoneNumber}
  onChange={handlePhoneChange}
  // Font size >= 16px évite le zoom iOS
  className="text-base md:text-sm"
  // Désactiver zoom automatique
  style={{
    fontSize: '16px',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
  }}
/>
```

**Avantages:**
- Pas de zoom involontaire iOS
- Meilleure UX tactile
- Lisible partout
- Accessible

---

## 8. Gestion des formulaires multi-étapes

### ❌ AVANT (Non mobile-friendly)

```tsx
// Formulaire sur une grande page avec scroll
export default function Form() {
  return (
    <form>
      <div className="space-y-6">
        <input />
        <input />
        <input />
        {/* 20+ inputs... */}
      </div>
    </form>
  )
}
```

### ✅ APRÈS (Mobile-optimisé)

```tsx
// Formulaire par étapes
'use client'

import { useState } from 'react'

export default function StepForm() {
  const [step, setStep] = useState(1)

  return (
    <form className="max-h-[calc(100vh-100px)] overflow-y-auto -webkit-overflow-scrolling-touch">
      {step === 1 && (
        <div className="space-y-4 p-4 md:p-6">
          <input type="text" placeholder="Étape 1/3" />
          <button onClick={() => setStep(2)} className="w-full py-3">
            Suivant
          </button>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4 p-4 md:p-6">
          <input type="email" placeholder="Étape 2/3" />
          <button onClick={() => setStep(3)} className="w-full py-3">
            Suivant
          </button>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-4 p-4 md:p-6">
          <input type="tel" placeholder="Étape 3/3" />
          <button type="submit" className="w-full py-3 bg-[#8A56B2]">
            Envoyer
          </button>
        </div>
      )}
    </form>
  )
}
```

**Avantages:**
- Pas de scroll infini sur mobile
- Étapes claires
- UX mobile optimisée
- Accessible

---

## Résumé des Changements

| Ancien | Nouveau | Bénéfice |
|--------|---------|----------|
| `window.location.href` | `router.push()` | SPA rapide |
| `window.open()` | `openInNewTab()` | Sécurisé |
| `localStorage` direct | `RobustStorageService` | Incognito safe |
| `mousedown` listener | `useClickOutside` hook | Mobile compatible |
| `grid-cols-4` | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` | Responsive |
| `navigator.platform` | `getOS()` function | Future-proof |
| `text-sm` input | `text-base` input | No iOS zoom |
| Long form | Multi-step form | Mobile friendly |

---

*Ces exemples peuvent être copiés/collés dans le code existant.*
