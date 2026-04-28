import { buildWalletUrl, getWalletHeaders, TransactionsApiResponse, Transaction } from './api-config-wallet'

// Service pour la gestion des transactions
export class TransactionService {
  // Cache pour les transactions
  private static transactionsCache: Transaction[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 2 * 60 * 1000 // 2 minutes (plus court pour les données fréquemment mises à jour)

  // Récupérer toutes les transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      // Vérifier le cache
      if (this.transactionsCache && Date.now() < this.cacheExpiry) {
        return this.transactionsCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.TRANSACTIONS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: TransactionsApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des transactions')
      }

      // Mettre en cache
      this.transactionsCache = data.data.content
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.data.content
    } catch (error) {
      console.error('Erreur TransactionService.getTransactions:', error)
      throw error
    }
  }

  // Récupérer une transaction par ID
  static async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const transactions = await this.getTransactions()
      return transactions.find(transaction => transaction.id === id) || null
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionById:', error)
      throw error
    }
  }

  // Filtrer les transactions par statut
  static async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions()
      return transactions.filter(transaction => transaction.status === status)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByStatus:', error)
      throw error
    }
  }

  // Filtrer les transactions par type
  static async getTransactionsByType(type: Transaction['type']): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions()
      return transactions.filter(transaction => transaction.type === type)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByType:', error)
      throw error
    }
  }

  // Filtrer les transactions par méthode de paiement
  static async getTransactionsByPaymentMethod(paymentMethodId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions()
      return transactions.filter(transaction => transaction.paymentMethod.id === paymentMethodId)
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionsByPaymentMethod:', error)
      throw error
    }
  }

  // Obtenir les transactions récentes (dernières 24h)
  static async getRecentTransactions(): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions()
      const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000)
      
      return transactions.filter(transaction => {
        const createdAt = new Date(transaction.createdAt).getTime()
        return createdAt >= twentyFourHoursAgo
      })
    } catch (error) {
      console.error('Erreur TransactionService.getRecentTransactions:', error)
      throw error
    }
  }

  // Calculer le montant total des transactions
  static async getTotalAmount(): Promise<number> {
    try {
      const transactions = await this.getTransactions()
      return transactions.reduce((total, transaction) => total + transaction.amount, 0)
    } catch (error) {
      console.error('Erreur TransactionService.getTotalAmount:', error)
      throw error
    }
  }

  // Calculer le montant total des frais
  static async getTotalFees(): Promise<number> {
    try {
      const transactions = await this.getTransactions()
      return transactions.reduce((total, transaction) => total + transaction.fee, 0)
    } catch (error) {
      console.error('Erreur TransactionService.getTotalFees:', error)
      throw error
    }
  }

  // Obtenir les statistiques des transactions
  static async getTransactionStats() {
    try {
      const transactions = await this.getTransactions()
      
      const pendingTransactions = transactions.filter(t => t.status === 'PENDING')
      const completedTransactions = transactions.filter(t => t.status === 'COMPLETED')
      const failedTransactions = transactions.filter(t => t.status === 'FAILED')
      const cancelledTransactions = transactions.filter(t => t.status === 'CANCELLED')
      const refundedTransactions = transactions.filter(t => t.status === 'REFUNDED')
      
      const depositTransactions = transactions.filter(t => t.type === 'DEPOSIT')
      const withdrawalTransactions = transactions.filter(t => t.type === 'WITHDRAWAL')
      const transferTransactions = transactions.filter(t => t.type === 'TRANSFER')
      const paymentTransactions = transactions.filter(t => t.type === 'PAYMENT')
      
      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
      const totalFees = transactions.reduce((sum, t) => sum + t.fee, 0)
      const totalNetAmount = transactions.reduce((sum, t) => sum + t.netAmount, 0)

      return {
        totalTransactions: transactions.length,
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
        averageAmount: transactions.length > 0 ? Math.round(totalAmount / transactions.length) : 0,
        successRate: transactions.length > 0 ? Math.round((completedTransactions.length / transactions.length) * 100) : 0
      }
    } catch (error) {
      console.error('Erreur TransactionService.getTransactionStats:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.transactionsCache = null
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

// Importer les constantes nécessaires
import { WALLET_API_CONFIG } from './api-config-wallet'
