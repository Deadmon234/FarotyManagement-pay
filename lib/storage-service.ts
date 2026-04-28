import { API_CONFIG } from './api-config'
import { VerifyOtpResponse } from './api-service'

// Types pour les données utilisateur
export interface StoredUserData {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  profilePictureUrl: string
  languageCode: string
  countryCode: string | null
  guest: boolean
}

export interface StoredSessionData {
  id: string
  sessionToken: string
  loginTime: string
  lastActivityTime: string
  current: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// Service de stockage local
export class StorageService {
  // Sauvegarder les tokens d'authentification
  static saveTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      
      // Sauvegarder la date d'expiration
      const expirationTime = Date.now() + (tokens.expiresIn * 1000)
      localStorage.setItem('faroty_token_expires_at', expirationTime.toString())
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des tokens:', error)
    }
  }

  // Sauvegarder le token temporaire
  static saveTempToken(tempToken: string): void {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.TEMP_TOKEN, tempToken)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token temporaire:', error)
    }
  }

  // Récupérer le token d'accès
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    } catch (error) {
      console.error('Erreur lors de la récupération du token d\'accès:', error)
      return null
    }
  }

  // Récupérer le token de rafraîchissement
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
    } catch (error) {
      console.error('Erreur lors de la récupération du token de rafraîchissement:', error)
      return null
    }
  }

  // Récupérer le token temporaire
  static getTempToken(): string | null {
    try {
      return localStorage.getItem(API_CONFIG.STORAGE_KEYS.TEMP_TOKEN)
    } catch (error) {
      console.error('Erreur lors de la récupération du token temporaire:', error)
      return null
    }
  }

  // Vérifier si le token est expiré
  static isTokenExpired(): boolean {
    try {
      const expirationTime = localStorage.getItem('faroty_token_expires_at')
      if (!expirationTime) return true
      
      return Date.now() > parseInt(expirationTime)
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'expiration du token:', error)
      return true
    }
  }

  // Sauvegarder les données utilisateur
  static saveUserData(userData: StoredUserData): void {
    try {
      localStorage.setItem(API_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error)
    }
  }

  // Récupérer les données utilisateur
  static getUserData(): StoredUserData | null {
    try {
      const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error)
      return null
    }
  }

  // Sauvegarder toutes les données d'authentification après une connexion réussie
  static saveAuthData(response: VerifyOtpResponse): void {
    // Sauvegarder les tokens
    this.saveTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    })

    // Sauvegarder les données utilisateur
    this.saveUserData(response.user)

    // Nettoyer le token temporaire
    this.clearTempToken()
  }

  // Nettoyer le token temporaire
  static clearTempToken(): void {
    try {
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TEMP_TOKEN)
    } catch (error) {
      console.error('Erreur lors du nettoyage du token temporaire:', error)
    }
  }

  // Vérifier si l'utilisateur est authentifié
  static isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return token !== null && !this.isTokenExpired()
  }

  // Déconnexion - nettoyer toutes les données
  static logout(): void {
    try {
      // Supprimer tous les tokens et données
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TEMP_TOKEN)
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA)
      localStorage.removeItem('faroty_token_expires_at')
      
      // Garder l'ID de l'appareil pour une utilisation future
      // localStorage.removeItem(API_CONFIG.STORAGE_KEYS.DEVICE_ID)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Rafraîchir le token si nécessaire
  static async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.isTokenExpired()) {
      return true // Token encore valide
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return false // Pas de token de rafraîchissement
    }

    try {
      // TODO: Implémenter l'appel API pour rafraîchir le token
      // Pour l'instant, retourner false
      return false
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error)
      return false
    }
  }
}

export default StorageService
