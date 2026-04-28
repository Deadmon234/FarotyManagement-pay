// Configuration des URLs API pour les wallets
export const WALLET_API_CONFIG = {
  // URLs de base
  BASE_URL: 'https://api-pay-prod.faroty.me',
  
  // Endpoints
  ENDPOINTS: {
    WALLETS: '/payments/api/v1/wallets',
    TRANSACTIONS: '/payments/api/v1/transactions',
    ACCOUNTS: '/payments/api/v1/accounts',
    PAYMENT_METHODS: '/payments/api/v1/payment-methods',
    COUNTRIES: '/payments/api/v1/countries',
  },
  
  // Clés API
  API_KEYS: {
    LIVE: 'fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk',
    TEST: 'fk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Clé de test si nécessaire
  },
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Fonction pour construire les URLs complètes
export const buildWalletUrl = (endpoint: string): string => {
  return `${WALLET_API_CONFIG.BASE_URL}${endpoint}`
}

// Fonction pour obtenir les headers avec authentification
export const getWalletHeaders = (useLive: boolean = true): Record<string, string> => {
  const apiKey = useLive ? WALLET_API_CONFIG.API_KEYS.LIVE : WALLET_API_CONFIG.API_KEYS.TEST
  
  return {
    ...WALLET_API_CONFIG.DEFAULT_HEADERS,
    'x-api-key': apiKey,
  }
}

// Types pour les réponses API
export interface WalletApiResponse<T = any> {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: T[]
  pagination: any
  metadata: any
}

// Types pour les wallets
export interface Wallet {
  id: string
  legalIdentifier: string
  walletType: 'PERSONAL' | 'BUSINESS'
  depositFeeRate: number
  maxTransactionAmount: number
  withdrawalFeeRate: number
  frozenReason: string | null
  refId: string
  refName: string | null
  createdAt: string
  updatedAt: string
  currency: {
    id: string
    code: string
    nameFr: string
    nameEn: string
    symbol: string
    active: boolean
  }
  account: {
    id: string
    userId: string
    accountName: string
    accountSubName: string | null
    accountMode: 'LIVE' | 'TEST'
    publicKey: string
    country: {
      id: string
      code: string
      nameFr: string
      nameEn: string
    }
    frozen: boolean
  }
  balance: {
    id: string
    balance: number
    frozenBalance: number
    pendingBalance: number
    totalBalance: number
  }
  walletOwners: Array<{
    id: string
    userId: string
    walletId: string
    type: 'LEGAL_OWNER' | 'BENEFICIARY'
  }>
  transactionsCount: number
  webhooksCount: number
  suspiciousActivitiesCount: number
  frozen: boolean
}

// Types pour les comptes
export interface Account {
  id: string
  userId: string
  accountName: string
  accountSubName: string | null
  accountMode: 'LIVE' | 'TEST'
  publicKey: string
  expiresAt: string | null
  frozenReason: string | null
  depositFeeRate: number
  withdrawalFeeRate: number
  createdAt: string
  updatedAt: string
  country: {
    id: string
    code: string
    nameFr: string
    nameEn: string
    maxPaymentAmount: number
    paymentValidationTime: number
    minTransactionFeeRate: number
    isUserPaysFees: boolean
    maxWithdrawalAmount: number
    withdrawalValidationThreshold: number
    isAutoValidateWithdrawals: boolean
    withdrawalValidationTime: number
    withdrawalCooldown: number
    accountsCount: number
    paymentMethodsCount: number
    active: boolean
  }
  walletsCount: number
  accountPaymentMethodsCount: number
  webhooksCount: number
  frozen: boolean
}

// Types pour la réponse paginée des comptes
export interface AccountsApiResponse {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: {
    content: Account[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
    first: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
  pagination: any
  metadata: any
}

// Types pour les méthodes de paiement
export interface PaymentMethod {
  id: string
  name: string
  slug: string
  technicalName: string
  logoUrl: string
  depositFeeRate: number
  withdrawalFeeRate: number
  maxTransactionAmount: number
  transactionCooldown: number
  txTva: number
  txPartner: number
  withdrawMode: string | null
  useTieredFees: boolean
  referenceCurrency: string
  supportsMultiCurrency: boolean
  createdAt: string
  updatedAt: string
  transactionsCount: number
  activeTransactionsCount: number
  active: boolean
}

// Types pour la réponse paginée des méthodes de paiement
export interface PaymentMethodsApiResponse {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: {
    content: PaymentMethod[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
    first: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
  pagination: any
  metadata: any
}

// Types pour les pays
export interface Country {
  id: string
  code: string
  nameFr: string
  nameEn: string
  maxPaymentAmount: number
  paymentValidationTime: number
  minTransactionFeeRate: number | null
  isUserPaysFees: boolean
  maxWithdrawalAmount: number | null
  withdrawalValidationThreshold: number | null
  isAutoValidateWithdrawals: boolean
  withdrawalValidationTime: number
  withdrawalCooldown: number
  createdAt: string
  updatedAt: string
  accountsCount: number
  paymentMethodsCount: number
  active: boolean
}

// Types pour la réponse paginée des pays
export interface CountriesApiResponse {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: {
    content: Country[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
    first: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
  pagination: any
  metadata: any
}

// Types pour les transactions
export interface Transaction {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT'
  description: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
  failedAt: string | null
  cancelledAt: string | null
  refundedAt: string | null
  fee: number
  netAmount: number
  senderInfo: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  receiverInfo: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  paymentMethod: {
    id: string
    name: string
    technicalName: string
  }
  wallet: {
    id: string
    name: string
    currency: string
  }
  metadata: any
}

// Types pour la réponse paginée des transactions
export interface TransactionsApiResponse {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: {
    content: Transaction[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
    first: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
  pagination: any
  metadata: any
}
