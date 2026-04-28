import { buildWalletUrl, getWalletHeaders, PaymentMethodsApiResponse, PaymentMethod } from './api-config-wallet'

// Service pour la gestion des méthodes de paiement
export class PaymentMethodService {
  // Cache pour les méthodes de paiement
  private static paymentMethodsCache: PaymentMethod[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer toutes les méthodes de paiement
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      // Vérifier le cache
      if (this.paymentMethodsCache && Date.now() < this.cacheExpiry) {
        return this.paymentMethodsCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.PAYMENT_METHODS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: PaymentMethodsApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des méthodes de paiement')
      }

      // Mettre en cache
      this.paymentMethodsCache = data.data.content
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.data.content
    } catch (error) {
      console.error('Erreur PaymentMethodService.getPaymentMethods:', error)
      throw error
    }
  }

  // Récupérer une méthode de paiement par ID
  static async getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.find(method => method.id === id) || null
    } catch (error) {
      console.error('Erreur PaymentMethodService.getPaymentMethodById:', error)
      throw error
    }
  }

  // Filtrer les méthodes actives
  static async getActivePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.filter(method => method.active)
    } catch (error) {
      console.error('Erreur PaymentMethodService.getActivePaymentMethods:', error)
      throw error
    }
  }

  // Filtrer les méthodes inactives
  static async getInactivePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.filter(method => !method.active)
    } catch (error) {
      console.error('Erreur PaymentMethodService.getInactivePaymentMethods:', error)
      throw error
    }
  }

  // Filtrer les méthodes par type (mobile money, carte, etc.)
  static async getPaymentMethodsByType(type: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.filter(method => 
        method.technicalName.toLowerCase().includes(type.toLowerCase()) ||
        method.name.toLowerCase().includes(type.toLowerCase())
      )
    } catch (error) {
      console.error('Erreur PaymentMethodService.getPaymentMethodsByType:', error)
      throw error
    }
  }

  // Calculer le nombre total de transactions
  static async getTotalTransactions(): Promise<number> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.reduce((total, method) => total + method.transactionsCount, 0)
    } catch (error) {
      console.error('Erreur PaymentMethodService.getTotalTransactions:', error)
      throw error
    }
  }

  // Calculer le nombre total de transactions actives
  static async getTotalActiveTransactions(): Promise<number> {
    try {
      const paymentMethods = await this.getPaymentMethods()
      return paymentMethods.reduce((total, method) => total + method.activeTransactionsCount, 0)
    } catch (error) {
      console.error('Erreur PaymentMethodService.getTotalActiveTransactions:', error)
      throw error
    }
  }

  // Obtenir les statistiques des méthodes de paiement
  static async getPaymentMethodStats() {
    try {
      const paymentMethods = await this.getPaymentMethods()
      
      const activeMethods = paymentMethods.filter(m => m.active)
      const inactiveMethods = paymentMethods.filter(m => !m.active)
      const mobileMoneyMethods = paymentMethods.filter(m => 
        m.technicalName.includes('mobile_money') || 
        m.name.toLowerCase().includes('mobile money')
      )
      const cardMethods = paymentMethods.filter(m => 
        m.technicalName.includes('stripe') || 
        m.name.toLowerCase().includes('carte')
      )
      
      const totalTransactions = paymentMethods.reduce((sum, m) => sum + m.transactionsCount, 0)
      const totalActiveTransactions = paymentMethods.reduce((sum, m) => sum + m.activeTransactionsCount, 0)
      const totalFees = paymentMethods.reduce((sum, m) => sum + m.depositFeeRate + m.withdrawalFeeRate, 0)

      return {
        totalMethods: paymentMethods.length,
        activeMethods: activeMethods.length,
        inactiveMethods: inactiveMethods.length,
        mobileMoneyMethods: mobileMoneyMethods.length,
        cardMethods: cardMethods.length,
        totalTransactions,
        totalActiveTransactions,
        totalFees,
        averageFeeRate: paymentMethods.length > 0 ? Math.round((totalFees / paymentMethods.length) * 100) / 100 : 0
      }
    } catch (error) {
      console.error('Erreur PaymentMethodService.getPaymentMethodStats:', error)
      throw error
    }
  }

  // Créer une nouvelle méthode de paiement
  static async createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    try {
      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.PAYMENT_METHODS)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentMethodData),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création de la méthode de paiement')
      }

      // Vider le cache pour forcer le rechargement des données
      this.clearCache()

      return data.data
    } catch (error) {
      console.error('Erreur PaymentMethodService.createPaymentMethod:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.paymentMethodsCache = null
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

  // Formater le taux de frais
  static formatFeeRate(rate: number): string {
    return `${rate.toFixed(2)}%`
  }

  // Formater le montant maximum
  static formatMaxAmount(amount: number, currency: string): string {
    if (amount >= 999999999) {
      return 'Illimité'
    }
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

  // Obtenir le statut textuel de la méthode
  static getPaymentMethodStatusText(method: PaymentMethod): string {
    return method.active ? 'Actif' : 'Inactif'
  }

  // Obtenir la couleur selon le statut
  static getPaymentMethodStatusColor(method: PaymentMethod): string {
    return method.active ? 'green' : 'gray'
  }

  // Obtenir l'icône ou le logo
  static getPaymentMethodIcon(method: PaymentMethod): string {
    if (method.logoUrl) {
      return method.logoUrl
    }
    
    // Icônes par défaut selon le type
    if (method.technicalName.includes('bank') || method.name.toLowerCase().includes('bancaire')) {
      return '🏦'
    }
    if (method.technicalName.includes('cash') || method.name.toLowerCase().includes('espèce')) {
      return '💵'
    }
    if (method.technicalName.includes('mobile_money') || method.name.toLowerCase().includes('mobile money')) {
      return '📱'
    }
    if (method.technicalName.includes('stripe') || method.name.toLowerCase().includes('carte')) {
      return '💳'
    }
    if (method.technicalName.includes('paypal') || method.name.toLowerCase().includes('paypal')) {
      return '🅿️'
    }
    
    return '💳'
  }

  // Obtenir le type de méthode pour le filtrage
  static getPaymentMethodType(method: PaymentMethod): string {
    if (method.technicalName.includes('bank') || method.name.toLowerCase().includes('bancaire')) {
      return 'Virement'
    }
    if (method.technicalName.includes('cash') || method.name.toLowerCase().includes('espèce')) {
      return 'Espèce'
    }
    if (method.technicalName.includes('mobile_money') || method.name.toLowerCase().includes('mobile money')) {
      return 'Mobile Money'
    }
    if (method.technicalName.includes('stripe') || method.name.toLowerCase().includes('carte')) {
      return 'Carte'
    }
    if (method.technicalName.includes('paypal') || method.name.toLowerCase().includes('paypal')) {
      return 'PayPal'
    }
    
    return 'Autre'
  }
}

// Importer les constantes nécessaires
import { WALLET_API_CONFIG } from './api-config-wallet'
