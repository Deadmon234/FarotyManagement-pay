// Configuration des URLs API
export const API_CONFIG = {
  // URL de base de l'API
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-prod.faroty.com',
  
  // Endpoints
  ENDPOINTS: {
    // Authentification
    LOGIN: '/auth/api/auth/login',
    VERIFY_OTP: '/auth/api/auth/verify-otp',
    REFRESH_TOKEN: '/auth/api/auth/refresh',
    LOGOUT: '/auth/api/auth/logout',
    
    // Utilisateurs
    USER_PROFILE: '/auth/api/users/profile',
    UPDATE_PROFILE: '/auth/api/users/update',
  },
  
  // Clés pour le stockage local
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'faroty_access_token',
    REFRESH_TOKEN: 'faroty_refresh_token',
    TEMP_TOKEN: 'faroty_temp_token',
    USER_DATA: 'faroty_user_data',
    DEVICE_ID: 'faroty_device_id',
  },
  
  // Configuration des requêtes
  REQUEST_CONFIG: {
    TIMEOUT: 30000, // 30 secondes
    RETRY_ATTEMPTS: 3,
  }
}

// Informations sur l'appareil
export const getDeviceInfo = () => {
  const deviceId = localStorage.getItem(API_CONFIG.STORAGE_KEYS.DEVICE_ID) || 
                   `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Sauvegarder l'ID de l'appareil pour une utilisation future
  localStorage.setItem(API_CONFIG.STORAGE_KEYS.DEVICE_ID, deviceId)
  
  return {
    deviceId,
    deviceType: 'WEB',
    deviceModel: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
    osName: navigator.platform || 'Unknown',
  }
}

// Fonction utilitaire pour construire les URLs complètes
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}
