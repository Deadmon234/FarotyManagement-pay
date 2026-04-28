import { buildWalletUrl, getWalletHeaders, CountriesApiResponse, Country, WALLET_API_CONFIG } from './api-config-wallet'

// Service pour la gestion des pays Faroty
export class FarotyCountryService {
  // Cache pour les pays
  private static countriesCache: Country[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les pays
  static async getCountries(): Promise<Country[]> {
    try {
      // Vérifier le cache
      if (this.countriesCache && Date.now() < this.cacheExpiry) {
        return this.countriesCache
      }

      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.COUNTRIES)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: CountriesApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des pays')
      }

      // Mettre en cache
      this.countriesCache = data.data.content
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return data.data.content
    } catch (error) {
      console.error('Erreur FarotyCountryService.getCountries:', error)
      throw error
    }
  }

  // Récupérer un pays par ID
  static async getCountryById(id: string): Promise<Country | null> {
    try {
      const countries = await this.getCountries()
      return countries.find(country => country.id === id) || null
    } catch (error) {
      console.error('Erreur FarotyCountryService.getCountryById:', error)
      throw error
    }
  }

  // Récupérer un pays par code
  static async getCountryByCode(code: string): Promise<Country | null> {
    try {
      const countries = await this.getCountries()
      return countries.find(country => country.code === code) || null
    } catch (error) {
      console.error('Erreur FarotyCountryService.getCountryByCode:', error)
      throw error
    }
  }

  // Filtrer les pays actifs
  static async getActiveCountries(): Promise<Country[]> {
    try {
      const countries = await this.getCountries()
      return countries.filter(country => country.active)
    } catch (error) {
      console.error('Erreur FarotyCountryService.getActiveCountries:', error)
      throw error
    }
  }

  // Filtrer les pays avec des comptes
  static async getCountriesWithAccounts(): Promise<Country[]> {
    try {
      const countries = await this.getCountries()
      return countries.filter(country => country.accountsCount > 0)
    } catch (error) {
      console.error('Erreur FarotyCountryService.getCountriesWithAccounts:', error)
      throw error
    }
  }

  // Calculer le nombre total de comptes
  static async getTotalAccounts(): Promise<number> {
    try {
      const countries = await this.getCountries()
      return countries.reduce((total, country) => total + country.accountsCount, 0)
    } catch (error) {
      console.error('Erreur FarotyCountryService.getTotalAccounts:', error)
      throw error
    }
  }

  // Calculer le nombre total de méthodes de paiement
  static async getTotalPaymentMethods(): Promise<number> {
    try {
      const countries = await this.getCountries()
      return countries.reduce((total, country) => total + country.paymentMethodsCount, 0)
    } catch (error) {
      console.error('Erreur FarotyCountryService.getTotalPaymentMethods:', error)
      throw error
    }
  }

  // Obtenir les statistiques des pays
  static async getCountryStats() {
    try {
      const countries = await this.getCountries()
      
      const activeCountries = countries.filter(c => c.active)
      const countriesWithAccounts = countries.filter(c => c.accountsCount > 0)
      const countriesWithPaymentMethods = countries.filter(c => c.paymentMethodsCount > 0)
      
      const totalAccounts = countries.reduce((sum, c) => sum + c.accountsCount, 0)
      const totalPaymentMethods = countries.reduce((sum, c) => sum + c.paymentMethodsCount, 0)
      const totalMaxPaymentAmount = countries.reduce((sum, c) => sum + (c.maxPaymentAmount || 0), 0)
      const totalMaxWithdrawalAmount = countries.reduce((sum, c) => sum + (c.maxWithdrawalAmount || 0), 0)

      return {
        totalCountries: countries.length,
        activeCountries: activeCountries.length,
        countriesWithAccounts: countriesWithAccounts.length,
        countriesWithPaymentMethods: countriesWithPaymentMethods.length,
        totalAccounts,
        totalPaymentMethods,
        totalMaxPaymentAmount,
        totalMaxWithdrawalAmount,
        averagePaymentAmount: countries.length > 0 ? Math.round(totalMaxPaymentAmount / countries.length) : 0,
        averageWithdrawalAmount: countries.length > 0 ? Math.round(totalMaxWithdrawalAmount / countries.length) : 0
      }
    } catch (error) {
      console.error('Erreur FarotyCountryService.getCountryStats:', error)
      throw error
    }
  }

  // Créer un nouveau pays
  static async createCountry(countryData: Partial<Country>): Promise<Country> {
    try {
      const url = buildWalletUrl(WALLET_API_CONFIG.ENDPOINTS.COUNTRIES)
      const headers = getWalletHeaders(true)

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(countryData),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la création du pays')
      }

      // Vider le cache pour forcer le rafraîchissement
      this.clearCache()

      return data.data
    } catch (error) {
      console.error('Erreur FarotyCountryService.createCountry:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.countriesCache = null
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
  static formatAmount(amount: number | null, currency: string = 'XOF'): string {
    if (amount === null || amount === undefined) {
      return 'Non défini'
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

  // Formater le taux de frais
  static formatFeeRate(rate: number | null): string {
    if (rate === null || rate === undefined) {
      return 'Non défini'
    }
    return `${rate.toFixed(2)}%`
  }

  // Obtenir le drapeau emoji du pays
  static getCountryFlag(country: Country): string {
    const flagMap: { [key: string]: string } = {
      'CM': '🇨🇲',
      'NG': '🇳🇬',
      'SN': '🇸🇳',
      'FR': '🇫🇷',
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'IT': '🇮🇹',
      'ES': '🇪🇸',
      'CA': '🇨🇦',
      'AU': '🇦🇺',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'IN': '🇮🇳',
      'BR': '🇧🇷',
      'MX': '🇲🇽',
      'ZA': '🇿🇦',
      'KR': '🇰🇷',
      'RU': '🇷🇺',
      'TR': '🇹🇷',
      'SA': '🇸🇦',
      'AE': '🇦🇪',
      'EG': '🇪🇬',
      'MA': '🇲🇦',
      'TN': '🇹🇳',
      'DZ': '🇩🇿',
      'GH': '🇬🇭',
      'KE': '🇰🇪',
      'UG': '🇺🇬',
      'TZ': '🇹🇿',
      'ET': '🇪🇹',
      'CI': '🇨🇮',
      'BF': '🇧🇫',
      'ML': '🇲🇱',
      'NE': '🇳🇪',
      'TD': '🇹🇩',
      'CF': '🇨🇫',
      'CG': '🇨🇬',
      'GA': '🇬🇦',
      'GQ': '🇬🇶',
      'ST': '🇸🇹',
      'CV': '🇨🇻',
      'GW': '🇬🇼',
      'LR': '🇱🇷',
      'SL': '🇸🇱',
      'GN': '🇬🇳',
      'BJ': '🇧🇯',
      'TG': '🇹🇬',
      'MW': '🇲🇼',
      'ZM': '🇿🇲',
      'ZW': '🇿🇼',
      'BW': '🇧🇼',
      'NA': '🇳🇦',
      'SZ': '🇸🇿',
      'LS': '🇱🇸',
      'MG': '🇲🇬',
      'MU': '🇲🇺',
      'SC': '🇸🇨',
      'KM': '🇰🇲',
      'RE': '🇷🇪',
      'YT': '🇾🇹'
    }
    
    return flagMap[country.code] || '🌍'
  }

  // Obtenir la région du pays
  static getCountryRegion(country: Country): string {
    const regionMap: { [key: string]: string } = {
      'CM': 'Afrique Centrale',
      'NG': 'Afrique de l\'Ouest',
      'SN': 'Afrique de l\'Ouest',
      'FR': 'Europe',
      'US': 'Amérique du Nord',
      'GB': 'Europe',
      'DE': 'Europe',
      'IT': 'Europe',
      'ES': 'Europe',
      'CA': 'Amérique du Nord',
      'AU': 'Océanie',
      'JP': 'Asie',
      'CN': 'Asie',
      'IN': 'Asie',
      'BR': 'Amérique du Sud',
      'MX': 'Amérique du Nord',
      'ZA': 'Afrique Australe',
      'KR': 'Asie',
      'RU': 'Europe/Asie',
      'TR': 'Asie',
      'SA': 'Moyen-Orient',
      'AE': 'Moyen-Orient',
      'EG': 'Afrique du Nord',
      'MA': 'Afrique du Nord',
      'TN': 'Afrique du Nord',
      'DZ': 'Afrique du Nord',
      'GH': 'Afrique de l\'Ouest',
      'KE': 'Afrique de l\'Est',
      'UG': 'Afrique de l\'Est',
      'TZ': 'Afrique de l\'Est',
      'ET': 'Afrique de l\'Est',
      'CI': 'Afrique de l\'Ouest',
      'BF': 'Afrique de l\'Ouest',
      'ML': 'Afrique de l\'Ouest',
      'NE': 'Afrique de l\'Ouest',
      'TD': 'Afrique Centrale',
      'CF': 'Afrique Centrale',
      'CG': 'Afrique Centrale',
      'GA': 'Afrique Centrale',
      'GQ': 'Afrique Centrale',
      'ST': 'Afrique Centrale',
      'CV': 'Afrique de l\'Ouest',
      'GW': 'Afrique de l\'Ouest',
      'LR': 'Afrique de l\'Ouest',
      'SL': 'Afrique de l\'Ouest',
      'GN': 'Afrique de l\'Ouest',
      'BJ': 'Afrique de l\'Ouest',
      'TG': 'Afrique de l\'Ouest',
      'MW': 'Afrique Australe',
      'ZM': 'Afrique Australe',
      'ZW': 'Afrique Australe',
      'BW': 'Afrique Australe',
      'NA': 'Afrique Australe',
      'SZ': 'Afrique Australe',
      'LS': 'Afrique Australe',
      'MG': 'Afrique Australe',
      'MU': 'Afrique Australe',
      'SC': 'Afrique Australe',
      'KM': 'Afrique Australe',
      'RE': 'Afrique Australe',
      'YT': 'Afrique Australe'
    }
    
    return regionMap[country.code] || 'Autre'
  }

  // Obtenir le statut textuel du pays
  static getCountryStatusText(country: Country): string {
    return country.active ? 'Actif' : 'Inactif'
  }

  // Obtenir la couleur selon le statut
  static getCountryStatusColor(country: Country): string {
    return country.active ? 'green' : 'gray'
  }
}

