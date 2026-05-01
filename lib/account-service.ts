import { buildWalletUrl, getWalletHeaders, AccountsApiResponse, Account } from './api-config-wallet'

// Service pour la gestion des comptes
export class AccountService {
  // Cache pour les comptes
  private static accountsCache: Account[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les comptes avec pagination
  static async getAccounts(forceRefresh: boolean = false): Promise<Account[]> {
    try {
      // Vérifier le cache (sauf si forceRefresh)
      if (!forceRefresh && this.accountsCache && Date.now() < this.cacheExpiry) {
        console.log('Utilisation du cache pour les comptes')
        return this.accountsCache
      }

      console.log('Récupération de tous les comptes depuis l\'API avec pagination...')
      
      let allAccounts: Account[] = []
      let page = 0
      let hasMorePages = true
      const MAX_PAGES = 100 // Protection contre les boucles infinies

      // Récupérer toutes les pages
      while (hasMorePages && page < MAX_PAGES) {
        const url = buildWalletUrl(`${WALLET_API_CONFIG.ENDPOINTS.ACCOUNTS}?page=${page}&size=50`)
        const headers = getWalletHeaders(true)

        console.log(`Récupération de la page ${page} des comptes...`)

        // Créer un contrôleur d'annulation avec timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // Timeout de 30 secondes

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
          }

          const data: AccountsApiResponse = await response.json()

          if (!data.success) {
            throw new Error(data.message || 'Erreur lors de la récupération des comptes')
          }

          // Validation des données
          if (!data.data || !Array.isArray(data.data.content)) {
            throw new Error('Format de données invalide: les comptes doivent être un tableau')
          }

          // Ajouter les comptes de cette page
          const pageAccounts = data.data.content
          allAccounts = allAccounts.concat(pageAccounts)

          console.log(`Page ${page}: ${pageAccounts.length} comptes récupérés`)

          // Vérifier s'il y a d'autres pages (avec vérification du champ 'last')
          const isLastPage = data.data.last === true
          hasMorePages = !isLastPage
          
          // Si aucun compte n'a été reçu, arrêter la pagination
          if (pageAccounts.length === 0) {
            hasMorePages = false
          }
          
          page++
        } catch (fetchError) {
          clearTimeout(timeoutId)
          console.error(`Erreur lors de la récupération de la page ${page}:`, fetchError)
          // Arrêter la pagination en cas d'erreur
          hasMorePages = false
          break
        }
      }

      if (page >= MAX_PAGES) {
        console.warn(`Limite de ${MAX_PAGES} pages atteinte lors de la pagination`)
      }

      console.log(`Total: ${allAccounts.length} comptes récupérés sur ${page} pages`)

      // Validation que chaque compte a les champs requis
      const validatedAccounts = allAccounts.filter(account => {
        const hasRequiredFields = account.id && account.accountName && account.country
        if (!hasRequiredFields) {
          console.warn('Compte invalide ignoré:', account.id)
        }
        return hasRequiredFields
      })

      console.log(`${validatedAccounts.length} comptes validés sur ${allAccounts.length} reçus`)

      // Mettre en cache
      this.accountsCache = validatedAccounts
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return validatedAccounts
    } catch (error) {
      console.error('Erreur AccountService.getAccounts:', error)
      
      // En cas d'erreur, essayer de retourner le cache s'il existe
      if (this.accountsCache && this.accountsCache.length > 0) {
        console.warn('Utilisation du cache en fallback suite à l\'erreur')
        return this.accountsCache
      }
      
      // Retourner un tableau vide au lieu de lever l'erreur
      console.warn('Retour d\'un tableau vide en dernier recours')
      return []
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
      // Ajouter un timeout pour éviter les blocages
      const statsPromise = (async () => {
        const accounts = await this.getAccounts()
        
        const activeAccounts = accounts.filter(a => !a.frozen)
        const frozenAccounts = accounts.filter(a => a.frozen)
        const liveAccounts = accounts.filter(a => a.accountMode === 'LIVE')
        const testAccounts = accounts.filter(a => a.accountMode === 'TEST')
        const verifiedAccounts = accounts.filter(a => a.accountSubName && a.accountSubName.trim() !== '')
        
        // Calculs précis avec conversion explicite en nombres
        const totalWallets = accounts.reduce((sum, a) => sum + (Number(a.walletsCount) || 0), 0)
        const totalWebhooks = accounts.reduce((sum, a) => sum + (Number(a.webhooksCount) || 0), 0)
        const totalPaymentMethods = accounts.reduce((sum, a) => sum + (Number(a.accountPaymentMethodsCount) || 0), 0)
        
        // Statistiques des frais
        const avgDepositFee = accounts.length > 0 
          ? accounts.reduce((sum, a) => sum + (Number(a.depositFeeRate) || 0), 0) / accounts.length 
          : 0
        const avgWithdrawalFee = accounts.length > 0 
          ? accounts.reduce((sum, a) => sum + (Number(a.withdrawalFeeRate) || 0), 0) / accounts.length 
          : 0

        // Calculer les soldes en récupérant les wallets de chaque compte
        let totalBalance = 0
        let totalAvailable = 0
        let totalFrozen = 0
        let totalPending = 0
        let totalTransactions = 0
        let pendingAccounts = 0
        let accountsWithWallets = 0

        try {
          // Importer WalletService pour accéder aux wallets
          const { WalletService } = await import('./wallet-service')
          // Utiliser un timeout pour éviter les blocages
          const walletTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout lors du chargement des wallets')), 15000)
          )
          const wallets = await Promise.race([
            WalletService.getWallets(),
            walletTimeoutPromise
          ]) as any
          
          // Calculer les soldes par compte
          for (const account of accounts) {
            const accountWallets = wallets.filter((w: any) => w.account.id === account.id)
            
            if (accountWallets.length > 0) {
              accountsWithWallets++
              const accountTotalBalance = accountWallets.reduce((sum: number, w: any) => sum + (Number(w.balance.totalBalance) || 0), 0)
              const accountAvailableBalance = accountWallets.reduce((sum: number, w: any) => sum + (Number(w.balance.balance) || 0), 0)
              const accountFrozenBalance = accountWallets.reduce((sum: number, w: any) => sum + (Number(w.balance.frozenBalance) || 0), 0)
              const accountPendingBalance = accountWallets.reduce((sum: number, w: any) => sum + (Number(w.balance.pendingBalance) || 0), 0)
              const accountTransactions = accountWallets.reduce((sum: number, w: any) => sum + (Number(w.transactionsCount) || 0), 0)
              
              totalBalance += accountTotalBalance
              totalAvailable += accountAvailableBalance
              totalFrozen += accountFrozenBalance
              totalPending += accountPendingBalance
              totalTransactions += accountTransactions
              
              // Compte en attente si tous ses wallets sont gelés
              const allWalletsFrozen = accountWallets.every((w: any) => w.frozen)
              if (allWalletsFrozen && accountWallets.length > 0) {
                pendingAccounts++
              }
            } else {
              // Compte sans wallet est considéré comme inactif
              pendingAccounts++
            }
          }
        } catch (walletError) {
          console.warn('Impossible de récupérer les wallets pour le calcul des soldes:', walletError)
          // Valeurs par défaut si on ne peut pas récupérer les wallets
          totalBalance = 0
          totalAvailable = 0
          totalFrozen = 0
          totalPending = 0
          totalTransactions = 0
          pendingAccounts = frozenAccounts.length
        }

        return {
          totalAccounts: accounts.length,
          activeAccounts: activeAccounts.length,
          frozenAccounts: frozenAccounts.length,
          liveAccounts: liveAccounts.length,
          testAccounts: testAccounts.length,
          verifiedAccounts: verifiedAccounts.length,
          pendingAccounts,
          accountsWithWallets,
          totalWallets,
          totalWebhooks,
          totalPaymentMethods,
          totalBalance,
          totalAvailable,
          totalFrozen,
          totalPending,
          totalTransactions,
          averageWalletsPerAccount: accounts.length > 0 ? Math.round(totalWallets / accounts.length) : 0,
          avgDepositFee: Math.round(avgDepositFee * 100) / 100,
          avgWithdrawalFee: Math.round(avgWithdrawalFee * 100) / 100,
          balanceConsistency: Math.abs(totalBalance - (totalAvailable + totalFrozen + totalPending)) < 0.01
        }
      })()

      // Timeout global pour getAccountStats
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout lors du calcul des statistiques')), 45000)
      )

      return await Promise.race([statsPromise, timeoutPromise])
    } catch (error) {
      console.error('Erreur AccountService.getAccountStats:', error)
      // Retourner des stats par défaut au lieu de lever l'erreur
      return {
        totalAccounts: 0,
        activeAccounts: 0,
        frozenAccounts: 0,
        liveAccounts: 0,
        testAccounts: 0,
        verifiedAccounts: 0,
        pendingAccounts: 0,
        accountsWithWallets: 0,
        totalWallets: 0,
        totalWebhooks: 0,
        totalPaymentMethods: 0,
        totalBalance: 0,
        totalAvailable: 0,
        totalFrozen: 0,
        totalPending: 0,
        totalTransactions: 0,
        averageWalletsPerAccount: 0,
        avgDepositFee: 0,
        avgWithdrawalFee: 0,
        balanceConsistency: false
      }
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
