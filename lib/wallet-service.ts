import { buildWalletUrl, getWalletHeaders, WalletApiResponse, Wallet } from './api-config-wallet'
import { WALLET_API_CONFIG } from './api-config-wallet'

// Service pour la gestion des wallets
export class WalletService {
  // Cache pour les wallets
  private static walletsCache: Wallet[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les wallets
  static async getWallets(): Promise<Wallet[]> {
    try {
      // Vérifier le cache
      if (this.walletsCache && Date.now() < this.cacheExpiry) {
        return this.walletsCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.WALLETS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: WalletApiResponse<Wallet> = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des wallets')
      }

      // Mettre en cache
      this.walletsCache = data.data
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.data
    } catch (error) {
      console.error('Erreur WalletService.getWallets:', error)
      throw error
    }
  }

  // Récupérer un wallet par ID
  static async getWalletById(id: string): Promise<Wallet | null> {
    try {
      const wallets = await this.getWallets()
      return wallets.find(wallet => wallet.id === id) || null
    } catch (error) {
      console.error('Erreur WalletService.getWalletById:', error)
      throw error
    }
  }

  // Filtrer les wallets par type
  static async getWalletsByType(type: 'PERSONAL' | 'BUSINESS'): Promise<Wallet[]> {
    try {
      const wallets = await this.getWallets()
      return wallets.filter(wallet => wallet.walletType === type)
    } catch (error) {
      console.error('Erreur WalletService.getWalletsByType:', error)
      throw error
    }
  }

  // Filtrer les wallets actifs (non gelés)
  static async getActiveWallets(): Promise<Wallet[]> {
    try {
      const wallets = await this.getWallets()
      return wallets.filter(wallet => !wallet.frozen)
    } catch (error) {
      console.error('Erreur WalletService.getActiveWallets:', error)
      throw error
    }
  }

  // Calculer le solde total de tous les wallets
  static async getTotalBalance(): Promise<number> {
    try {
      const wallets = await this.getWallets()
      return wallets.reduce((total, wallet) => total + wallet.balance.totalBalance, 0)
    } catch (error) {
      console.error('Erreur WalletService.getTotalBalance:', error)
      throw error
    }
  }

  // Calculer le nombre total de transactions
  static async getTotalTransactions(): Promise<number> {
    try {
      const wallets = await this.getWallets()
      return wallets.reduce((total, wallet) => total + wallet.transactionsCount, 0)
    } catch (error) {
      console.error('Erreur WalletService.getTotalTransactions:', error)
      throw error
    }
  }

  // Obtenir les statistiques des wallets
  static async getWalletStats() {
    try {
      const wallets = await this.getWallets()
      
      const activeWallets = wallets.filter(w => !w.frozen)
      const frozenWallets = wallets.filter(w => w.frozen)
      const personalWallets = wallets.filter(w => w.walletType === 'PERSONAL')
      const businessWallets = wallets.filter(w => w.walletType === 'BUSINESS')
      
      const totalBalance = wallets.reduce((sum, w) => sum + w.balance.totalBalance, 0)
      const totalTransactions = wallets.reduce((sum, w) => sum + w.transactionsCount, 0)
      const totalFrozen = wallets.reduce((sum, w) => sum + w.balance.frozenBalance, 0)
      const totalPending = wallets.reduce((sum, w) => sum + w.balance.pendingBalance, 0)

      return {
        totalWallets: wallets.length,
        activeWallets: activeWallets.length,
        frozenWallets: frozenWallets.length,
        personalWallets: personalWallets.length,
        businessWallets: businessWallets.length,
        totalBalance,
        totalTransactions,
        totalFrozen,
        totalPending,
        availableBalance: totalBalance - totalFrozen - totalPending
      }
    } catch (error) {
      console.error('Erreur WalletService.getWalletStats:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.walletsCache = null
    this.cacheExpiry = 0
  }

  // Formater le montant avec devise spécifique
  static formatAmount(amount: number, currency: string = 'XOF'): string {
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    } catch (error) {
      // En cas d'erreur avec la devise, afficher le montant avec la devise en texte
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount) + ` ${currency}`
    }
  }

  // Formater le montant en XOF (pour compatibilité)
  static formatAmountXOF(amount: number): string {
    return this.formatAmount(amount, 'XOF')
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

  // Créer un nouveau wallet
  static async createWallet(walletData: {
    accountId: string
    currencyCode: string
    walletType: 'PERSONAL' | 'BUSINESS'
    legalIdentifier: string
    refId: string
  }): Promise<Wallet> {
    try {
      const url = 'https://api-pay-prod.faroty.me/payments/api/v1/wallets'
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(walletData)
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: WalletApiResponse<Partial<Wallet>> = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création du wallet')
      }

      // Vider le cache pour forcer le rechargement
      this.clearCache()

      return (Array.isArray(data.data) ? data.data[0] : data.data) as unknown as Wallet
    } catch (error) {
      console.error('Erreur WalletService.createWallet:', error)
      throw error
    }
  }
}

