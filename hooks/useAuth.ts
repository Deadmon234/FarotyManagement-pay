'use client'

import { useState, useEffect } from 'react'
import { StorageService, StoredUserData } from '../lib/storage-service'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<StoredUserData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = () => {
      try {
        // Vérifier si l'utilisateur est authentifié
        const isAuth = StorageService.isAuthenticated()
        setIsAuthenticated(isAuth)

        if (isAuth) {
          // Récupérer les données utilisateur
          const userData = StorageService.getUserData()
          const token = StorageService.getAccessToken()

          setUser(userData)
          setAccessToken(token)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const logout = () => {
    StorageService.logout()
    setUser(null)
    setAccessToken(null)
    setIsAuthenticated(false)
    router.push('/loginotp')
  }

  const refreshToken = async (): Promise<boolean> => {
    const success = await StorageService.refreshTokenIfNeeded()
    if (success) {
      const token = StorageService.getAccessToken()
      setAccessToken(token)
    } else {
      logout()
    }
    return success
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    loading,
    logout,
    refreshToken
  }
}
