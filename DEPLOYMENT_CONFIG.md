# Configuration Cross-Platform - Faroty Payment

Configuration pour tester et déployer l'application sur tous les appareils.

## 1. Configuration Next.js

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 375, 425, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  // Compression
  compress: true,

  // Generate sitemap pour SEO
  poweredByHeader: false,

  // Experimental features pour performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json'
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          },
        ],
      },
    ]
  },

  // Redirects pour compatibilité
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
```

## 2. Configuration TypeScript pour Multi-Platform

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": ["node_modules", ".next", "dist"]
}
```

## 3. Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:debug": "NODE_OPTIONS='--inspect-brk' next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,tsx,json,css}\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lighthouse": "lighthouse http://localhost:3000 --emulated-form-factor=mobile --output-path=./lighthouse-report.html",
    "lighthouse:desktop": "lighthouse http://localhost:3000 --output-path=./lighthouse-report-desktop.html",
    "test:mobile": "jest --testPathPattern=mobile",
    "validate": "npm run lint && npm run type-check && npm run test"
  }
}
```

## 4. Fichier .env pour Configuration

```bash
# .env.local

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api-prod.faroty.com
NEXT_PUBLIC_APP_NAME=Faroty

# Feature Flags pour platform-specific
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=

# Platform Detection
NEXT_PUBLIC_SUPPORTED_PLATFORMS=web,ios,android

# Timeout and Performance
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_CACHE_TTL=3600
```

## 5. GitHub Actions pour Tests Cross-Platform

```yaml
# .github/workflows/cross-platform-tests.yml
name: Cross-Platform Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm run test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.os == 'ubuntu-latest'

  lighthouse:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Start server
        run: npm start &
        env:
          NODE_ENV: production
      
      - name: Wait for server
        run: sleep 10
      
      - name: Run Lighthouse
        run: npm run lighthouse
      
      - name: Upload Lighthouse report
        uses: actions/upload-artifact@v3
        with:
          name: lighthouse-report
          path: lighthouse-report.html
```

## 6. Jest Configuration pour Tests

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

## 7. ESLint Config pour Cross-Platform

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      '@next/next/no-html-link-for-pages': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    'node_modules/**',
  ]),
])

export default eslintConfig
```

## 8. Dockerfile pour Deployment Cross-Platform

```dockerfile
# Dockerfile for multi-platform support
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

## 9. Performance Budgets

```javascript
// .budgetrc.json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "250kb"
    },
    {
      "name": "vendor",
      "maxSize": "200kb"
    }
  ],
  "metrics": [
    {
      "name": "LargestContentfulPaint",
      "maxNumericValue": 2500,
      "alert": true
    },
    {
      "name": "FirstInputDelay",
      "maxNumericValue": 100,
      "alert": true
    },
    {
      "name": "CumulativeLayoutShift",
      "maxNumericValue": 0.1,
      "alert": true
    }
  ]
}
```

## 10. Checklist de Déploiement

### Avant le déploiement
- [ ] Tests passent sur tous les OS (Linux, Windows, macOS)
- [ ] Build sans erreurs
- [ ] Lighthouse score >= 90
- [ ] Service Worker enregistré
- [ ] PWA manifest valide
- [ ] Images optimisées
- [ ] Aucune console error
- [ ] Responsive design testé (320px-2560px)

### Après le déploiement
- [ ] Mobile accessible via https
- [ ] Offline fonctionne (PWA)
- [ ] Performance monitored
- [ ] Analytics configuré
- [ ] Error tracking (Sentry) actif
- [ ] Backup en place

---

*Configuration mise à jour: 4 mai 2026*
