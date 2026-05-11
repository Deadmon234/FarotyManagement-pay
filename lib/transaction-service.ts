import { buildWalletUrl, getWalletHeaders, WALLET_API_CONFIG, TransactionsApiResponse, Transaction } from './api-config-wallet'

// Service pour la gestion des transactions
export class TransactionService {
  // Cache pour les transactions
  private static transactionsCache: Transaction[] | null = null
  private static cacheExpiry: number = 0
  private static readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutes (données fréquemment mises à jour)

  /** Total en base (toutes pages), dernier fetch `/api/v1/transactions` — null si pas encore chargé ou cache vidé. */
  private static lastCatalogTotalElements: number | null = null

  /** Nombre total de transactions côté API (pagination complète), d’après le dernier appel réussi. */
  static getLastCatalogTotalElements(): number {
    return typeof this.lastCatalogTotalElements === 'number' && !Number.isNaN(this.lastCatalogTotalElements)
      ? this.lastCatalogTotalElements
      : 0
  }

  /** Retour utilisable quand les stats ne peuvent pas être calculées (erreur réseau, etc.). */
  static emptyTransactionStats() {
    return this.getDefaultStats()
  }

  private static getDefaultStats() {
    return {
      totalTransactions: 0,
      pendingTransactions: 0,
      completedTransactions: 0,
      failedTransactions: 0,
      cancelledTransactions: 0,
      refundedTransactions: 0,
      depositTransactions: 0,
      withdrawalTransactions: 0,
      transferTransactions: 0,
      paymentTransactions: 0,
      totalAmount: 0,
      totalFees: 0,
      totalNetAmount: 0,
      averageAmount: 0,
      successRate: 0,
    }
  }

  private static normalizeTransactions(input: unknown): Transaction[] {
    if (!Array.isArray(input)) {
      return []
    }

    return input as Transaction[]
  }

  /**
   * Récupère toutes les transactions depuis l'API locale
   * @returns Promise<Transaction[]> - Liste des transactions
   */
  static async getTransactions(): Promise<Transaction[]> {
    try {
      // Forcer le rechargement pour le débogage
      this.clearCache()
      
      // Retourner les données en cache si valides (toujours un tableau, y compris [])
      if (Array.isArray(this.transactionsCache) && Date.now() < this.cacheExpiry) {
        return this.transactionsCache
      }

      // Appeler l'API locale (pagination ; totalElements = catalogue complet)
      const response = await fetch('/api/v1/transactions?page=0&size=100', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        console.error(`[TransactionService] Erreur HTTP ${response.status} de l'API locale`)
        throw new Error(`Erreur HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('[TransactionService] API Response:', data)

      if (!data.success) {
        console.warn('[TransactionService] API retourné success=false:', data.message)
        // Ne pas jeter d'erreur, retourner un tableau vide
        return []
      }

      // Extraire les transactions de la réponse paginée
      const transactions = this.normalizeTransactions(data.data?.content)
      console.log('[TransactionService] transactions extraites:', transactions.length)

      const rawTotal = data.data?.totalElements
      this.lastCatalogTotalElements =
        typeof rawTotal === 'number' && !Number.isNaN(rawTotal)
          ? rawTotal
          : transactions.length

      // Mettre en cache pour optimiser les appels suivants
      this.transactionsCache = transactions
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return this.normalizeTransactions(transactions)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[TransactionService] getTransactions erreur:', errorMsg)
      // Retourner un tableau vide plutôt que de propager l'erreur
      // Ça permet au composant de continuer à fonctionner
      return []
    }
  }

  // Récupérer une transaction par ID
  static async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.find(transaction => transaction.id === id) || null
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionById:', error)
      throw error
    }
  }

  // Filtrer les transactions par statut
  static async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.filter(transaction => transaction.status === status)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByStatus:', error)
      return []
    }
  }

  // Filtrer les transactions par type
  static async getTransactionsByType(type: Transaction['type']): Promise<Transaction[]> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.filter(transaction => transaction.type === type)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByType:', error)
      return []
    }
  }

  // Filtrer les transactions par méthode de paiement
  static async getTransactionsByPaymentMethod(paymentMethodId: string): Promise<Transaction[]> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.filter(transaction => transaction.paymentMethod.id === paymentMethodId)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByPaymentMethod:', error)
      return []
    }
  }

  // Obtenir les transactions récentes (dernières 24h)
  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000)
      
      return transactions.filter(transaction => {
        const createdAt = new Date(transaction.createdAt).getTime()
        return createdAt >= twentyFourHoursAgo
      })
    } catch (error) {
      console.error('Erreur TransactionService.getRecentTransactions:', error)
      return []
    }
  }

  // Calculer le montant total des transactions
  static async getTotalAmount(): Promise<number> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.reduce((total, transaction) => total + transaction.amount, 0)
    } catch (error) {
      console.error('Erreur TransactionService.getTotalAmount:', error)
      return 0
    }
  }

  // Calculer le montant total des frais
  static async getTotalFees(): Promise<number> {
    try {
      const transactions = this.normalizeTransactions(await this.getTransactions())
      return transactions.reduce((total, transaction) => total + transaction.fee, 0)
    } catch (error) {
      console.error('Erreur TransactionService.getTotalFees:', error)
      return 0
    }
  }

  // Obtenir les statistiques des transactions
  static async getTransactionStats(passTransactions?: Transaction[] | null) {
    const safeArray = (value: unknown): Transaction[] => {
      if (!Array.isArray(value)) return []
      return value as Transaction[]
    }

    try {
      let list = safeArray(passTransactions)
      if (list.length === 0) {
        const fetched = await this.getTransactions()
        list = safeArray(fetched)
      }
      list = this.normalizeTransactions(list)
      if (list.length === 0) {
        return this.getDefaultStats()
      }

      const pendingTransactions = list.filter(t => t.status === 'PENDING')
      const completedTransactions = list.filter(t => t.status === 'COMPLETED')
      const failedTransactions = list.filter(t => t.status === 'FAILED')
      const cancelledTransactions = list.filter(t => t.status === 'CANCELLED')
      const refundedTransactions = list.filter(t => t.status === 'REFUNDED')

      const depositTransactions = list.filter(t => t.type === 'DEPOSIT')
      const withdrawalTransactions = list.filter(t => t.type === 'WITHDRAWAL')
      const transferTransactions = list.filter(t => t.type === 'TRANSFER')
      const paymentTransactions = list.filter(t => t.type === 'PAYMENT')

      const totalAmount = list.reduce((sum, t) => sum + t.amount, 0)
      const totalFees = list.reduce((sum, t) => sum + t.fee, 0)
      const totalNetAmount = list.reduce((sum, t) => sum + t.netAmount, 0)

      return {
        totalTransactions: list.length,
        pendingTransactions: pendingTransactions.length,
        completedTransactions: completedTransactions.length,
        failedTransactions: failedTransactions.length,
        cancelledTransactions: cancelledTransactions.length,
        refundedTransactions: refundedTransactions.length,
        depositTransactions: depositTransactions.length,
        withdrawalTransactions: withdrawalTransactions.length,
        transferTransactions: transferTransactions.length,
        paymentTransactions: paymentTransactions.length,
        totalAmount,
        totalFees,
        totalNetAmount,
        averageAmount: list.length > 0 ? Math.round(totalAmount / list.length) : 0,
        successRate: list.length > 0 ? Math.round((completedTransactions.length / list.length) * 100) : 0
      }
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionStats:', error)
      return this.getDefaultStats()
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.transactionsCache = null
    this.cacheExpiry = 0
    this.lastCatalogTotalElements = null
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

  // Formater le montant
  static formatAmount(amount: number, currency: string): string {
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

  // Obtenir le statut textuel de la transaction
  static getTransactionStatusText(status: Transaction['status']): string {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'COMPLETED': return 'Complétée'
      case 'FAILED': return 'Échouée'
      case 'CANCELLED': return 'Annulée'
      case 'REFUNDED': return 'Remboursée'
      default: return status
    }
  }

  // Obtenir la couleur selon le statut
  static getTransactionStatusColor(status: Transaction['status']): string {
    switch (status) {
      case 'PENDING': return 'orange'
      case 'COMPLETED': return 'green'
      case 'FAILED': return 'red'
      case 'CANCELLED': return 'gray'
      case 'REFUNDED': return 'blue'
      default: return 'gray'
    }
  }

  // Obtenir le type textuel de la transaction
  static getTransactionTypeText(type: Transaction['type']): string {
    switch (type) {
      case 'DEPOSIT': return 'Dépôt'
      case 'WITHDRAWAL': return 'Retrait'
      case 'TRANSFER': return 'Transfert'
      case 'PAYMENT': return 'Paiement'
      default: return type
    }
  }

  // Obtenir l'icône selon le type
  static getTransactionTypeIcon(type: Transaction['type']): string {
    switch (type) {
      case 'DEPOSIT': return '📥'
      case 'WITHDRAWAL': return '📤'
      case 'TRANSFER': return '🔄'
      case 'PAYMENT': return '💳'
      default: return '💰'
    }
  }

  // Obtenir la couleur selon le type
  static getTransactionTypeColor(type: Transaction['type']): string {
    switch (type) {
      case 'DEPOSIT': return 'green'
      case 'WITHDRAWAL': return 'red'
      case 'TRANSFER': return 'blue'
      case 'PAYMENT': return 'purple'
      default: return 'gray'
    }
  }

  // Formater la référence
  static formatReference(reference: string): string {
    return reference.length > 12 ? reference.substring(0, 12) + '...' : reference
  }

  // Obtenir le nom complet de l'expéditeur/récepteur
  static getFullName(info: { name: string; email: string | null; phone: string | null }): string {
    if (info.email && info.email !== info.name) {
      return `${info.name} (${info.email})`
    }
    if (info.phone) {
      return `${info.name} (${info.phone})`
    }
    return info.name
  }
}
