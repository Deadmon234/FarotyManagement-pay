import { apiService, ApiResponse } from './api-service'
import { StorageService } from './storage-service'

// Interface pour les utilisateurs
export interface User {
  id: string
  fullName: string
  email: string | null
  phoneNumber: string | null
  profilePictureUrl: string | null
  accountStatus: 'CREATED' | 'EMAIL_VERIFIED' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE'
  lastLogin: string | null
  createdAt: string
  countryName: string | null
  languageName: string | null
  active: boolean
  guest: boolean
  kycStatus?: 'pending' | 'verified' | 'rejected'
}

export interface UsersApiResponse {
  success: boolean
  message: string
  data: User[]
  error: string | null
  timestamp: string | null
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  verifiedUsers: number
  emailVerifiedUsers: number
  createdUsers: number
  guestUsers: number
  recentLogins: number
  usersByCountry: { [key: string]: number }
  usersByStatus: { [key: string]: number }
}

// Service pour la gestion des utilisateurs
export class UserService {
  // Cache pour les utilisateurs
  private static usersCache: User[] | null = null
  private static cacheExpiry: number = 0
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Récupérer tous les utilisateurs
  static async getUsers(): Promise<User[]> {
    try {
      // Vérifier le cache
      if (this.usersCache && Date.now() < this.cacheExpiry) {
        return this.usersCache
      }

      // Vérifier l'authentification
      const token = StorageService.getAccessToken()
      if (!token) {
        throw new Error('Utilisateur non authentifié')
      }

      // Vérifier si le token est expiré
      if (StorageService.isTokenExpired()) {
        throw new Error('Token d\'authentification expiré')
      }

      // Utiliser le nouvel endpoint pour récupérer les utilisateurs
      const response = await fetch('https://api-prod.faroty.com/auth/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Non autorisé - Veuillez vous reconnecter')
        } else if (response.status === 403) {
          throw new Error('Accès interdit - Permissions insuffisantes')
        }
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data: UsersApiResponse = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs')
      }

      // Mettre en cache
      this.usersCache = data.data
      this.cacheExpiry = Date.now() + this.CACHE_DURATION

      return this.usersCache
    } catch (error) {
      console.error('Erreur UserService.getUsers:', error)
      throw error
    }
  }

  // Récupérer un utilisateur par ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const users = await this.getUsers()
      return users.find(user => user.id === id) || null
    } catch (error) {
      console.error('Erreur UserService.getUserById:', error)
      throw error
    }
  }

  // Rechercher des utilisateurs par nom ou email
  static async searchUsers(query: string): Promise<User[]> {
    try {
      const users = await this.getUsers()
      const lowerQuery = query.toLowerCase()
      
      return users.filter(user => 
        user.fullName.toLowerCase().includes(lowerQuery) ||
        (user.email && user.email.toLowerCase().includes(lowerQuery)) ||
        (user.phoneNumber && user.phoneNumber.includes(query))
      )
    } catch (error) {
      console.error('Erreur UserService.searchUsers:', error)
      throw error
    }
  }

  // Filtrer les utilisateurs non invités
  static async getRealUsers(): Promise<User[]> {
    try {
      const users = await this.getUsers()
      return users.filter(user => !user.guest)
    } catch (error) {
      console.error('Erreur UserService.getRealUsers:', error)
      throw error
    }
  }

  // Vider le cache
  static clearCache(): void {
    this.usersCache = null
    this.cacheExpiry = 0
  }

  // Formater le nom d'affichage de l'utilisateur
  static getUserDisplayName(user: User): string {
    return user.fullName || 'Utilisateur inconnu'
  }

  // Obtenir les initiales de l'utilisateur
  static getUserInitials(user: User): string {
    if (!user.fullName) {
      return 'U' // Par défaut si le nom est null
    }
    return user.fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Filtrer les utilisateurs actifs
  static async getActiveUsers(): Promise<User[]> {
    try {
      const users = await this.getUsers()
      return users.filter(user => user.active)
    } catch (error) {
      console.error('Erreur UserService.getActiveUsers:', error)
      throw error
    }
  }

  // Filtrer les utilisateurs vérifiés
  static async getVerifiedUsers(): Promise<User[]> {
    try {
      const users = await this.getUsers()
      return users.filter(user => 
        user.accountStatus === 'VERIFIED' || 
        user.accountStatus === 'EMAIL_VERIFIED' || 
        user.accountStatus === 'ACTIVE'
      )
    } catch (error) {
      console.error('Erreur UserService.getVerifiedUsers:', error)
      throw error
    }
  }

  // Filtrer les utilisateurs par statut
  static async getUsersByStatus(status: string): Promise<User[]> {
    try {
      const users = await this.getUsers()
      return users.filter(user => user.accountStatus === status)
    } catch (error) {
      console.error('Erreur UserService.getUsersByStatus:', error)
      throw error
    }
  }

  // Calculer les statistiques des utilisateurs
  static async getUserStats(): Promise<UserStats> {
    try {
      const users = await this.getUsers()
      
      const activeUsers = users.filter(u => u.active)
      const verifiedUsers = users.filter(u => 
        u.accountStatus === 'VERIFIED' || 
        u.accountStatus === 'EMAIL_VERIFIED' || 
        u.accountStatus === 'ACTIVE'
      )
      const emailVerifiedUsers = users.filter(u => u.accountStatus === 'EMAIL_VERIFIED')
      const createdUsers = users.filter(u => u.accountStatus === 'CREATED')
      const guestUsers = users.filter(u => u.guest)
      
      // Calculer les connexions récentes (derniers 7 jours)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentLogins = users.filter(u => 
        u.lastLogin && new Date(u.lastLogin) > sevenDaysAgo
      )

      // Regrouper par pays
      const usersByCountry: { [key: string]: number } = {}
      users.forEach(user => {
        if (user.countryName) {
          usersByCountry[user.countryName] = (usersByCountry[user.countryName] || 0) + 1
        }
      })

      // Regrouper par statut
      const usersByStatus: { [key: string]: number } = {}
      users.forEach(user => {
        usersByStatus[user.accountStatus] = (usersByStatus[user.accountStatus] || 0) + 1
      })

      return {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        verifiedUsers: verifiedUsers.length,
        emailVerifiedUsers: emailVerifiedUsers.length,
        createdUsers: createdUsers.length,
        guestUsers: guestUsers.length,
        recentLogins: recentLogins.length,
        usersByCountry,
        usersByStatus
      }
    } catch (error) {
      console.error('Erreur UserService.getUserStats:', error)
      throw error
    }
  }

  // Formater la date de dernière connexion
  static formatLastLogin(dateString: string | null): string {
    if (!dateString) return 'Jamais'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.ceil(diffTime / (1000 * 60))
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
      }
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
    } else if (diffDays === 1) {
      return 'Hier'
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
    } else {
      return this.formatDate(dateString)
    }
  }

  // Obtenir le texte du statut du compte
  static getAccountStatusText(status: string): string {
    switch (status) {
      case 'CREATED':
        return 'Créé'
      case 'EMAIL_VERIFIED':
        return 'Email vérifié'
      case 'VERIFIED':
        return 'Vérifié'
      case 'ACTIVE':
        return 'Actif'
      case 'INACTIVE':
        return 'Inactif'
      default:
        return status
    }
  }

  // Obtenir la couleur du statut du compte
  static getAccountStatusColor(status: string): string {
    switch (status) {
      case 'CREATED':
        return 'gray'
      case 'EMAIL_VERIFIED':
        return 'blue'
      case 'VERIFIED':
        return 'green'
      case 'ACTIVE':
        return 'green'
      case 'INACTIVE':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Obtenir l'icône du statut
  static getAccountStatusIcon(status: string): string {
    switch (status) {
      case 'CREATED':
        return '📝'
      case 'EMAIL_VERIFIED':
        return '✉️'
      case 'VERIFIED':
        return '✅'
      case 'ACTIVE':
        return '🟢'
      case 'INACTIVE':
        return '🔴'
      default:
        return '❓'
    }
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
}
