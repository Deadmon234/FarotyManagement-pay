import { API_CONFIG, buildApiUrl } from './api-config'

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  error: any
  timestamp: string
}

export interface LoginRequest {
  contact: string
  deviceInfo: {
    deviceId: string
    deviceType: string
    deviceModel: string
    osName: string
  }
}

export interface LoginResponse {
  tempToken: string
  contact: string
  channel: string
  message: string
  newUser: boolean
}

export interface VerifyOtpRequest {
  otpCode: string
  tempToken: string
  deviceInfo: {
    deviceId: string
    deviceType: string
    deviceModel: string
    osName: string
  }
}

export interface VerifyOtpResponse {
  accessToken: string
  refreshToken: string
  tokenType: string | null
  expiresIn: number
  user: {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    profilePictureUrl: string
    languageCode: string
    countryCode: string | null
    guest: boolean
  }
  device: {
    deviceId: string
    deviceType: string
    osName: string
    deviceModel: string
  }
  session: {
    id: string
    sessionToken: string
    loginTime: string
    lastActivityTime: string
    current: boolean
  }
}

// Classe d'erreur personnalisée pour les erreurs API
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Service API principal
class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL
  }

  // Méthode privée pour faire les requêtes HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint)
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Erreurs réseau ou autres
      throw new ApiError(
        error instanceof Error ? error.message : 'Erreur réseau inconnue'
      )
    }
  }

  // Méthode POST
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Méthode GET
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    })
  }

  // Méthode PUT
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Méthode DELETE
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Instance du service API
export const apiService = new ApiService()

// Services spécifiques pour l'authentification
export class AuthService {
  // Envoyer le code OTP
  static async sendOtp(contact: string): Promise<ApiResponse<LoginResponse>> {
    const deviceInfo = {
      deviceId: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceType: 'WEB',
      deviceModel: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
      osName: navigator.platform || 'Unknown',
    }

    const requestData: LoginRequest = {
      contact,
      deviceInfo,
    }

    return apiService.post<LoginResponse>(API_CONFIG.ENDPOINTS.LOGIN, requestData)
  }

  // Vérifier le code OTP
  static async verifyOtp(
    otpCode: string,
    tempToken: string
  ): Promise<ApiResponse<VerifyOtpResponse>> {
    const deviceInfo = {
      deviceId: `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      deviceType: 'WEB',
      deviceModel: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
      osName: navigator.platform || 'Unknown',
    }

    const requestData: VerifyOtpRequest = {
      otpCode,
      tempToken,
      deviceInfo,
    }

    return apiService.post<VerifyOtpResponse>(API_CONFIG.ENDPOINTS.VERIFY_OTP, requestData)
  }
}

export default apiService
