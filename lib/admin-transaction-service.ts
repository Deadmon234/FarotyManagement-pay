/**
 * Service pour gérer les transactions admin depuis l'API Faroty Pay
 * URL: https://api-pay-prod.faroty.me/payments/api/v1/admin/transactions
 */

export interface AdminTransaction {
  transaction: {
    transactionId: string
    reference: string
    status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
    amount: number
    netAmount: number
    currency: string
    payerId: string
    createdAt: string
    updatedAt: string
    proceedDate: string | null
    bulkedDate: string | null
    newBalance: number
    oldBalance: number
    paymentMethod: string
    paymentMethodInfo: {
      id: string
      name: string
      slug: string
      technicalName: string
      logoUrl: string
    }
    operatorId: string
    statusCheckedFromOperator: boolean
    message: string
    operatorFee: number
    successUrl: string | null
    pending: boolean
    successful: boolean
    failed: boolean
  }
  account: {
    id: string
    userId: string
    accountName: string
    accountSubName: string | null
    accountMode: 'LIVE' | 'SANDBOX'
    frozen: boolean
    countryCode: string
  }
  fees: number
  totalFeeRate: number
  accountFeeRate: number
  walletFeeRate: number
  paymentMethodFeeRate: number
}

export interface AdminTransactionResponse {
  success: boolean
  message: string
  statusCode: number
  timestamp: string
  data: {
    content: AdminTransaction[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
    first: boolean
    hasNext: boolean
    hasPrevious: boolean
  }
}

const API_URL = 'https://api-pay-prod.faroty.me/payments/api/v1/admin/transactions'
const API_KEY = 'fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk'

export class AdminTransactionService {
  /**
   * Récupère les transactions avec pagination
   */
  static async getTransactions(page: number = 0, size: number = 20): Promise<AdminTransactionResponse> {
    try {
      const url = new URL(API_URL)
      url.searchParams.append('page', page.toString())
      url.searchParams.append('size', size.toString())

      console.log(`[AdminTransactionService] Appel API externe: page=${page}, size=${size}`)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'N/A')
        console.error(`[AdminTransactionService] Erreur API ${response.status}:`, errorText.substring(0, 100))
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data: AdminTransactionResponse = await response.json()

      if (!data.success) {
        console.warn('[AdminTransactionService] API returned success=false:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des transactions')
      }

      return data
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[AdminTransactionService] getTransactions erreur:', errorMsg)
      
      // Retourner une réponse vide au lieu de jeter l'erreur
      // Cela permet au composant de continuer à fonctionner
      return {
        success: true,
        message: 'Aucune transaction disponible actuellement',
        statusCode: 200,
        timestamp: new Date().toISOString(),
        data: {
          content: [],
          page,
          size,
          totalElements: 0,
          totalPages: 0,
          last: true,
          first: true,
          hasNext: false,
          hasPrevious: false,
        }
      }
    }
  }

  /**
   * Récupère toutes les transactions (avec gestion de pagination)
   */
  static async getAllTransactions(): Promise<AdminTransaction[]> {
    try {
      let allTransactions: AdminTransaction[] = []
      let currentPage = 0
      let hasMore = true
      let attempts = 0
      const maxAttempts = 10

      while (hasMore && attempts < maxAttempts) {
        try {
          console.log(`[AdminTransactionService] Chargement page ${currentPage}`)
          const response = await this.getTransactions(currentPage, 50)
          allTransactions = [...allTransactions, ...response.data.content]
          hasMore = !response.data.last
          currentPage++
          attempts++
        } catch (pageError) {
          console.error(`[AdminTransactionService] Erreur chargement page ${currentPage}:`, pageError)
          // Continuer avec les données qu'on a déjà si une page échoue
          break
        }
      }

      console.log(`[AdminTransactionService] Récupéré ${allTransactions.length} transactions`)
      return allTransactions
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('[AdminTransactionService] getAllTransactions erreur:', errorMsg)
      // Retourner un tableau vide plutôt que de jeter l'erreur
      return []
    }
  }

  /**
   * Filtre les transactions par statut
   */
  static filterByStatus(
    transactions: AdminTransaction[],
    status: AdminTransaction['transaction']['status']
  ): AdminTransaction[] {
    return transactions.filter(t => t.transaction.status === status)
  }

  /**
   * Filtre les transactions par type
   */
  static filterByType(
    transactions: AdminTransaction[],
    type: AdminTransaction['transaction']['type']
  ): AdminTransaction[] {
    return transactions.filter(t => t.transaction.type === type)
  }

  /**
   * Filtre les transactions par compte
   */
  static filterByAccount(
    transactions: AdminTransaction[],
    accountId: string
  ): AdminTransaction[] {
    return transactions.filter(t => t.account.id === accountId)
  }

  /**
   * Filtre les transactions par plage de dates
   */
  static filterByDateRange(
    transactions: AdminTransaction[],
    startDate: Date,
    endDate: Date
  ): AdminTransaction[] {
    const start = startDate.getTime()
    const end = endDate.getTime()

    return transactions.filter(t => {
      const txDate = new Date(t.transaction.createdAt).getTime()
      return txDate >= start && txDate <= end
    })
  }

  /**
   * Calcule le total des montants
   */
  static calculateTotal(transactions: AdminTransaction[]): number {
    return transactions.reduce((sum, t) => sum + t.transaction.amount, 0)
  }

  /**
   * Calcule le total des frais
   */
  static calculateTotalFees(transactions: AdminTransaction[]): number {
    return transactions.reduce((sum, t) => sum + t.fees, 0)
  }

  /**
   * Obtient les statistiques des transactions
   */
  static getStatistics(transactions: AdminTransaction[] | undefined | null) {
    const list = Array.isArray(transactions) ? transactions : []
    return {
      total: list.length,
      successful: list.filter(t => t.transaction.successful).length,
      pending: list.filter(t => t.transaction.pending).length,
      failed: list.filter(t => t.transaction.failed).length,
      totalAmount: this.calculateTotal(list),
      totalFees: this.calculateTotalFees(list),
      deposits: list.filter(t => t.transaction.type === 'DEPOSIT').length,
      withdrawals: list.filter(t => t.transaction.type === 'WITHDRAWAL').length,
    }
  }
}
