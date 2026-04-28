export interface Country {
  id: number
  name: string
  iso3: string
  iso2: string
  numeric_code: string
  phone_code: string
  capital: string
  currency: string
  currency_name: string
  currency_symbol: string
  tld: string
  native: string
  region: string
  subregion: string
  timezones: Array<{
    zoneName: string
    gmtOffset: number
    gmtOffsetName: string
    abbreviation: string
    tzName: string
  }>
  translations: {
    kr: string
    'pt-BR': string
    pt: string
    nl: string
    hr: string
    fa: string
    de: string
    es: string
    fr: string
    ja: string
    it: string
    cn: string
    tr: string
  }
  latitude: string
  longitude: string
  emoji: string
  emojiU: string
}

export class CountryService {
  private static countries: Country[] = []
  private static loading = false
  private static loaded = false

  // Récupérer tous les pays depuis l'API
  static async fetchCountries(): Promise<Country[]> {
    if (this.loaded && this.countries.length > 0) {
      return this.countries
    }

    if (this.loading) {
      // Attendre que le chargement soit terminé
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.countries
    }

    this.loading = true

    try {
      const response = await fetch('https://countries.faroty.com/countries')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Filtrer pour ne garder que les pays avec un code téléphonique valide
      this.countries = data.filter((country: any) => 
        country.phone_code && 
        country.phone_code.trim() !== '' &&
        country.emoji
      )

      this.loaded = true
      return this.countries
    } catch (error) {
      console.error('Erreur lors de la récupération des pays:', error)
      // Retourner une liste vide en cas d'erreur
      this.countries = []
      return []
    } finally {
      this.loading = false
    }
  }

  // Obtenir un pays par son code téléphonique
  static getCountryByPhoneCode(phoneCode: string): Country | null {
    const cleanCode = phoneCode.replace(/[^\d+\-]/g, '')
    return this.countries.find(country => 
      country.phone_code.replace(/[^\d+\-]/g, '') === cleanCode
    ) || null
  }

  // Obtenir tous les pays triés par nom
  static getAllCountries(): Country[] {
    return [...this.countries].sort((a, b) => a.name.localeCompare(b.name))
  }

  // Obtenir les pays les plus courants (Cameroon, France, USA, etc.)
  static getCommonCountries(): Country[] {
    const commonCountryCodes = ['237', '33', '1', '44', '49', '81', '86', '91', '212', '216']
    return this.countries
      .filter(country => {
        const cleanCode = country.phone_code.replace(/[^\d]/g, '')
        return commonCountryCodes.includes(cleanCode)
      })
      .sort((a, b) => {
        const aIndex = commonCountryCodes.indexOf(a.phone_code.replace(/[^\d]/g, ''))
        const bIndex = commonCountryCodes.indexOf(b.phone_code.replace(/[^\d]/g, ''))
        return aIndex - bIndex
      })
  }

  // Rechercher des pays par nom ou code
  static searchCountries(query: string): Country[] {
    const lowercaseQuery = query.toLowerCase()
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(lowercaseQuery) ||
      country.phone_code.toLowerCase().includes(lowercaseQuery) ||
      country.native.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Initialiser les pays au démarrage
  static async initialize(): Promise<void> {
    await this.fetchCountries()
  }
}

export default CountryService
