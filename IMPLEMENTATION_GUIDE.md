# Guide d'Implémentation - Compatibilité Cross-Platform

## 📋 Checklist d'Implémentation

### Phase 1: Critique (Immédiate) ✅

- [x] Ajouter viewport meta tag dans `layout.tsx` ✅
- [x] Créer service de stockage robuste (`robust-storage-service.ts`) ✅
- [x] Créer utilitaires de navigation (`navigation-utils.ts`) ✅
- [x] Créer PWA manifest (`manifest.json`) ✅
- [x] Créer service worker (`sw.js`) ✅
- [ ] **FAIRE**: Mettre à jour API config pour utiliser `RobustStorageService`
- [ ] **FAIRE**: Remplacer tous les `window.location.href` par `useRouter`
- [ ] **FAIRE**: Remplacer `window.open()` par `openInNewTab()`
- [ ] **FAIRE**: Ajouter `ServiceWorkerRegister` au layout

### Phase 2: Important (1-2 semaines)

- [x] Créer hooks pour touch events (`usePointerEvent.ts`) ✅
- [x] Créer CSS responsive (`styles/responsive.css`) ✅
- [ ] **FAIRE**: Mettre à jour `CountrySelector.tsx` avec `usePointerEvent`
- [ ] **FAIRE**: Mettre à jour `loginotp/page.tsx` avec `useClickOutside`
- [ ] **FAIRE**: Convertir tables en responsive cards sur mobile
- [ ] **FAIRE**: Créer fichier offline.html

### Phase 3: Optimisations (2-4 semaines)

- [ ] Ajouter optimisation images avec `next/image`
- [ ] Créer icônes PWA (192x192, 256x256, 512x512)
- [ ] Ajouter screenshots pour manifest
- [ ] Tester sur vrais appareils
- [ ] Ajouter monitoring Sentry

---

## 🔧 Étapes d'Implémentation Détaillées

### 1. Mettre à jour `app/layout.tsx`

```tsx
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
```

### 2. Remplacer `window.location.href` dans `app/payment/page.tsx`

**AVANT:**
```tsx
onClick={() => window.location.href = `/wallet/${wallet.id}`}
```

**APRÈS:**
```tsx
'use client'
import { useRouter } from 'next/navigation'

export default function PaymentPage() {
  const router = useRouter()
  
  return (
    <button onClick={() => router.push(`/wallet/${wallet.id}`)}>
      Accéder au wallet
    </button>
  )
}
```

### 3. Remplacer `window.open()` dans `components/sidebar.tsx`

**AVANT:**
```tsx
onClick={() => window.open('https://faroty.com', '_blank')}
```

**APRÈS:**
```tsx
'use client'
import { openInNewTab } from '@/lib/navigation-utils'

export default function Sidebar() {
  return (
    <button onClick={() => openInNewTab('https://faroty.com')}>
      Faroty Website
    </button>
  )
}
```

### 4. Mettre à jour `lib/storage-service.ts`

Remplacer l'utilisation de `localStorage` directe par `RobustStorageService`:

**AVANT:**
```tsx
static saveTokens(tokens: AuthTokens): void {
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
}
```

**APRÈS:**
```tsx
import RobustStorageService from './robust-storage-service'

static async saveTokens(tokens: AuthTokens): Promise<void> {
  await RobustStorageService.setItem(
    API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, 
    tokens.accessToken
  )
}
```

### 5. Mettre à jour `components/CountrySelector.tsx`

Ajouter gestion tactile:

```tsx
'use client'
import { useRef } from 'react'
import { useClickOutside } from '@/hooks/usePointerEvent'

export default function CountrySelector() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Remplacer le code existant
  useClickOutside(dropdownRef, () => setIsOpen(false))
  
  return <div ref={dropdownRef}>...</div>
}
```

### 6. Créer `app/offline.html`

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hors ligne - Faroty</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .offline-container {
      text-align: center;
      padding: 20px;
      max-width: 500px;
    }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>⚠️ Vous êtes hors ligne</h1>
    <p>Vérifiez votre connexion Internet et réessayez.</p>
    <button onclick="location.reload()" style="padding: 10px 20px; border: none; border-radius: 5px; background: #8A56B2; color: white; cursor: pointer;">Réessayer</button>
  </div>
</body>
</html>
```

### 7. Ajouter l'import du CSS responsive

Dans `app/globals.css`:

```css
@import '/styles/responsive.css';
```

---

## 🧪 Test Cross-Platform

### Outils Recommandés

1. **Chrome DevTools**
   - Responsive Design Mode (Ctrl+Shift+M)
   - Émulation d'appareils (iPhone, Android, iPad)
   - Throttling réseau

2. **BrowserStack** (Appareils réels)
   - iOS 16+ sur iPhone
   - Android 12+ sur Samsung, Pixel, etc.
   - Windows/macOS

3. **Lighthouse**
   ```bash
   npm install -g lighthouse
   lighthouse https://localhost:3000 --emulated-form-factor=mobile
   ```

### Checklist de Test

#### Mobile (iOS/Android)
- [ ] Layout responsive à 320px, 375px, 412px
- [ ] Boutons tactiles >= 44px
- [ ] Forms lisibles sans zoom
- [ ] Défilement horizontal inexistant
- [ ] Notch support (iPhone X+)
- [ ] Safe area insets respectés
- [ ] Dark mode fonctionne
- [ ] Landscape mode testé

#### Desktop (Windows/macOS/Linux)
- [ ] Viewport complet utilisé
- [ ] Tables affichées normalement
- [ ] Padding/margin correct
- [ ] Hover states fonctionnent
- [ ] Keyboard navigation fonctionne

#### PWA
- [ ] Manifest apparaît dans DevTools
- [ ] Installation fonctionne
- [ ] Service Worker enregistré
- [ ] Offline fonctionne
- [ ] Icons affichés

### Commandes de Test

```bash
# Développement local
npm run dev

# Build production
npm run build
npm start

# Lighthouse
lighthouse http://localhost:3000 --emulated-form-factor=mobile

# Test PWA
npm install -g pwa-asset-generator
pwa-asset-generator icon.svg ./icons
```

---

## 📱 Appareils à Tester (Priorité)

### Essentiels
- [ ] iPhone 12/13/14 (iOS 16+)
- [ ] Samsung Galaxy S21+ (Android 12+)
- [ ] iPad (iPadOS 16+)
- [ ] Google Pixel 6+ (Android 12+)

### Important
- [ ] iPhone SE (petit écran)
- [ ] Android device 720p (petit écran)
- [ ] Tablet Android
- [ ] iPad Pro (grand écran)

### Nice to have
- [ ] Fold devices (Samsung Galaxy Fold)
- [ ] iPhone 11 Pro Max (grand écran)
- [ ] Older Android (API 30)

---

## 🐛 Dépannage Courant

### Problem: localStorage manquant en mode incognito
**Solution**: Utiliser `RobustStorageService` avec IndexedDB fallback ✅

### Problem: window.location.href recharge la page
**Solution**: Utiliser `useRouter().push()` ✅

### Problem: Dropdown se ferme au touch
**Solution**: Utiliser `useClickOutside` hook ✅

### Problem: Tables non lisibles sur mobile
**Solution**: CSS responsive avec breakpoints ✅

### Problem: Service Worker ne se met pas à jour
**Solution**: Ajouter `updateViaCache: 'none'` ✅

### Problem: Safe area insets ignorés sur notch
**Solution**: Utiliser `env(safe-area-inset-*)` en CSS ✅

---

## 📊 Performance Cibles

| Métrique | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| FCP | < 1.5s | < 1.5s | < 1s |
| LCP | < 2.5s | < 2.5s | < 1.5s |
| CLS | < 0.1 | < 0.1 | < 0.1 |

---

## 🔐 Sécurité

- [ ] CSP headers configurés
- [ ] HTTPS requis pour PWA
- [ ] Service Worker valide et signé
- [ ] localStorage/IndexedDB chiffré (optionnel)
- [ ] Pas de données sensibles en cache

---

## 📝 Notes d'Implémentation

1. **Pas de breaking changes**: Toutes les modifications sont backward compatible
2. **Graceful degradation**: L'app fonctionne sans PWA features
3. **Progressive enhancement**: Chaque feature s'ajoute progressivement
4. **Testing first**: Tester sur vrais appareils avant de déployer

---

## 📞 Ressources

- [Next.js Mobile Optimization](https://nextjs.org/docs)
- [Web.dev - Mobile](https://web.dev/mobile/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [iOS Safe Area](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Android Guidelines](https://material.io/design)

---

*Mise à jour: 4 mai 2026*
