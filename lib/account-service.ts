import { buildWalletUrl, getWalletHeaders, AccountsApiResponse, Account } from './api-config-wallet'

// Service pour la gestion des comptes
export class AccountService {
  // Cache pour les comptes
  private static accountsCache: Account[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les comptes
  static async getAccounts(): Promise<Account[]> {
    try {
      // Vérifier le cache
      if (this.accountsCache && Date.now() < this.cacheExpiry) {
        return this.accountsCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.ACCOUNTS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: AccountsApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des comptes')
      }

      // Mettre en cache
      this.accountsCache = data.data.content
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.data.content
    } catch (error) {
      console.error('Erreur AccountService.getAccounts:', error)
      throw error
    }
  }

  // Récupérer un compte par ID
  static async getAccountById(id: string): Promise<Account | null> {
    try {
      const accounts = await this.getAccounts()
      return accounts.find(account => account.id === id) || null
    } catch (error) {
      console.error('Erreur AccountService.getAccountById:', error)
      throw error
    }
  }

  // Filtrer les comptes par mode
  static async getAccountsByMode(mode: 'LIVE' | 'TEST'): Promise<Account[]> {
    try {
      const accounts = await this.getAccounts()
      return accounts.filter(account => account.accountMode === mode)
    } catch (error) {
      console.error('Erreur AccountService.getAccountsByMode:', error)
      throw error
    }
  }

  // Filtrer les comptes actifs (non gelés)
  static async getActiveAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.getAccounts()
      return accounts.filter(account => !account.frozen)
    } catch (error) {
      console.error('Erreur AccountService.getActiveAccounts:', error)
      throw error
    }
  }

  // Calculer le nombre total de wallets
  static async getTotalWallets(): Promise<number> {
    try {
      const accounts = await this.getAccounts()
      return accounts.reduce((total, account) => total + account.walletsCount, 0)
    } catch (error) {
      console.error('Erreur AccountService.getTotalWallets:', error)
      throw error
    }
  }

  // Calculer le nombre total de webhooks
  static async getTotalWebhooks(): Promise<number> {
    try {
      const accounts = await this.getAccounts()
      return accounts.reduce((total, account) => total + account.webhooksCount, 0)
    } catch (error) {
      console.error('Erreur AccountService.getTotalWebhooks:', error)
      throw error
    }
  }

  // Obtenir les statistiques des comptes
  static async getAccountStats() {
    try {
      const accounts = await this.getAccounts()
      
      const activeAccounts = accounts.filter(a => !a.frozen)
      const frozenAccounts = accounts.filter(a => a.frozen)
      const liveAccounts = accounts.filter(a => a.accountMode === 'LIVE')
      const testAccounts = accounts.filter(a => a.accountMode === 'TEST')
      
      const totalWallets = accounts.reduce((sum, a) => sum + a.walletsCount, 0)
      const totalWebhooks = accounts.reduce((sum, a) => sum + a.webhooksCount, 0)
      const totalPaymentMethods = accounts.reduce((sum, a) => sum + a.accountPaymentMethodsCount, 0)

      return {
        totalAccounts: accounts.length,
        activeAccounts: activeAccounts.length,
        frozenAccounts: frozenAccounts.length,
        liveAccounts: liveAccounts.length,
        testAccounts: testAccounts.length,
        totalWallets,
        totalWebhooks,
        totalPaymentMethods,
        averageWalletsPerAccount: accounts.length > 0 ? Math.round(totalWallets / accounts.length) : 0
      }
    } catch (error) {
      console.error('Erreur AccountService.getAccountStats:', error)
      throw error
    }
  }

  // Créer un nouveau compte
  static async createAccount(accountData: {
    userId: string
    accountName: string
    countryId: string
    depositFeeRate: string
    withdrawalFeeRate: string
    accountMode: string
  }): Promise<Account> {
    try {
      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.ACCOUNTS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(accountData)
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création du compte')
      }

      // Vider le cache pour forcer le rechargement
      this.clearCache()

      return data.data
    } catch (error) {
      console.error('Erreur AccountService.createAccount:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.accountsCache = null
    this.cacheExpiry = 0
  }

  // Formater la date
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obtenir le nom d'affichage du compte
  static getAccountDisplayName(account: Account): string {
    if (account.accountSubName) {
      return `${account.accountName} - ${account.accountSubName}`
    }
    return account.accountName
  }

  // Obtenir le statut textuel du compte
  static getAccountStatusText(account: Account): string {
    if (account.frozen) return 'Gelé'
    if (account.accountMode === 'LIVE') return 'Actif'
    return 'Test'
  }

  // Obtenir la couleur selon le statut
  static getAccountStatusColor(account: Account): string {
    if (account.frozen) return 'red'
    if (account.accountMode === 'LIVE') return 'green'
    return 'blue'
  }

  // Formater le montant
  static formatAmount(amount: number): string {
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch (error) {
      // En cas d'erreur avec la devise, afficher le montant avec la devise en texte
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ' XOF'
    }
  }
}

// Importer les constantes nécessaires
import { WALLET_API_CONFIG } from './api-config-wallet'
