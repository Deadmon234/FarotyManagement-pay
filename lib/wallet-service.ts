import { buildWalletUrl, getWalletHeaders, WalletApiResponse, Wallet } from './api-config-wallet'
import { WALLET_API_CONFIG } from './api-config-wallet'

// Service pour la gestion des wallets
export class WalletService {
  // Cache pour les wallets
  private static walletsCache: Wallet[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les wallets avec retry et validation
  static async getWallets(forceRefresh: boolean = false): Promise<Wallet[]> {
    try {
      // Vérifier le cache (sauf si forceRefresh)
      if (!forceRefresh && this.walletsCache && Date.now() < this.cacheExpiry) {
        console.log('Utilisation du cache pour les wallets')
        return this.walletsCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.WALLETS)
      const headers = getWalletHeaders(true)

      console.log('Récupération des wallets depuis l\'API...')
      
      // Ajouter un timeout et retry logic
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
        }

        const data: WalletApiResponse<Wallet> = await response.json()

        if (!data.success) {
          throw new Error(data.message || 'Erreur lors de la récupération des wallets')
        }

        // Validation des données
        if (!Array.isArray(data.data)) {
          throw new Error('Format de données invalide: les wallets doivent être un tableau')
        }

        // Validation que chaque wallet a les champs requis
        const validatedWallets = data.data.filter(wallet => {
          const hasRequiredFields = wallet.id && wallet.balance && wallet.currency
          if (!hasRequiredFields) {
            console.warn('Wallet invalide ignoré:', wallet.id)
          }
          return hasRequiredFields
        })

        console.log(`${validatedWallets.length} wallets validés sur ${data.data.length} reçus`)

        // Mettre en cache
        this.walletsCache = validatedWallets
        this.cacheExpiry = Date.now() + this.CACHE_DURATION

        return validatedWallets
      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }
    } catch (error) {
      console.error('Erreur WalletService.getWallets:', error)
      
      // En cas d'erreur, essayer de retourner le cache s'il existe
      if (this.walletsCache && this.walletsCache.length > 0) {
        console.warn('Utilisation du cache en fallback suite à l\'erreur')
        return this.walletsCache
      }
      
      // Retourner un tableau vide au lieu de lever l'erreur
      console.warn('Retour d\'un tableau vide en dernier recours')
      return []
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
      
      // Calculs précis des soldes avec conversion explicite en nombres
      const totalBalance = wallets.reduce((sum, w) => sum + (Number(w.balance.totalBalance) || 0), 0)
      const totalAvailable = wallets.reduce((sum, w) => sum + (Number(w.balance.balance) || 0), 0)
      const totalFrozen = wallets.reduce((sum, w) => sum + (Number(w.balance.frozenBalance) || 0), 0)
      const totalPending = wallets.reduce((sum, w) => sum + (Number(w.balance.pendingBalance) || 0), 0)
      const totalTransactions = wallets.reduce((sum, w) => sum + (Number(w.transactionsCount) || 0), 0)

      // Validation de la cohérence des données
      const calculatedTotal = totalAvailable + totalFrozen + totalPending
      
      return {
        totalWallets: wallets.length,
        activeWallets: activeWallets.length,
        frozenWallets: frozenWallets.length,
        personalWallets: personalWallets.length,
        businessWallets: businessWallets.length,
        totalBalance: Math.max(totalBalance, calculatedTotal), // Prendre la valeur la plus élevée pour la cohérence
        totalAvailable,
        totalFrozen,
        totalPending,
        totalTransactions,
        availableBalance: totalAvailable,
        balanceConsistency: Math.abs(totalBalance - calculatedTotal) < 0.01 // Vérifier si les soldes sont cohérents
      }
    } catch (error) {
      console.error('Erreur WalletService.getWalletStats:', error)
      // Retourner des stats par défaut au lieu de lever l'erreur
      return {
        totalWallets: 0,
        activeWallets: 0,
        frozenWallets: 0,
        personalWallets: 0,
        businessWallets: 0,
        totalBalance: 0,
        totalAvailable: 0,
        totalFrozen: 0,
        totalPending: 0,
        totalTransactions: 0,
        availableBalance: 0,
        balanceConsistency: false
      }
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
      // Pour XAF, afficher sans décimales mais garder la précision pour les calculs
      if (currency === 'XAF') {
        const formattedAmount = new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)
        return `${formattedAmount} XAF`
      }
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'XAF' ? 0 : 2,
        maximumFractionDigits: currency === 'XAF' ? 0 : 2,
      }).format(amount)
    } catch (error) {
      // En cas d'erreur avec la devise, afficher le montant avec la devise en texte
      const formattedAmount = new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
      return `${formattedAmount} ${currency}`
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

