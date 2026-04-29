'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { UserService, User } from '@/lib/user-service'
import { ArrowLeft, Mail, Phone, Globe, Clock, Calendar, CheckCircle, XCircle, AlertCircle, User as UserIcon, Shield, CreditCard, Activity, Settings, Download, Edit, Trash2 } from 'lucide-react'

function UserDetailContent() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!userId) {
        throw new Error('ID utilisateur non fourni')
      }
      
      const userData = await UserService.getUserById(userId)
      
      if (!userData) {
        throw new Error('Utilisateur non trouvé')
      }
      
      setUser(userData)
    } catch (err) {
      console.error('Erreur lors du chargement de l\'utilisateur:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      
      if (errorMessage.includes('non authentifié') || errorMessage.includes('expiré') || errorMessage.includes('Non autorisé')) {
        setError('Session expirée - Redirection vers la page de connexion...')
        setTimeout(() => {
          router.push('/loginotp')
        }, 2000)
      } else {
        setError(errorMessage || 'Impossible de charger l\'utilisateur')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [userId])

  const getStatusBadge = (status: string) => {
    const color = UserService.getAccountStatusColor(status)
    const text = UserService.getAccountStatusText(status)
    const icon = UserService.getAccountStatusIcon(status)
    
    const colorClasses = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span>{icon}</span>
        {text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A56B2]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button 
            onClick={loadUser}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            style={{cursor: 'pointer'}}
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateur non trouvé</h3>
          <p className="text-gray-500">L'utilisateur demandé n'existe pas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          style={{cursor: 'pointer'}}
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Détail de l'utilisateur</h1>
          <p className="text-gray-600 mt-1">Informations complètes sur {user.fullName}</p>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="h-24 w-24 flex-shrink-0">
                {user.profilePictureUrl ? (
                  <img
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    src={user.profilePictureUrl}
                    alt={user.fullName}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8A56B2] to-purple-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                    {UserService.getUserInitials(user)}
                  </div>
                )}
              </div>
              {/* Indicateur de statut en ligne */}
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${
                user.active ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
              {user.guest && (
                <div className="inline-flex items-center mt-2 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                  Invité
                </div>
              )}
              <div className="mt-3">
                {getStatusBadge(user.accountStatus)}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#8A56B2] text-white rounded-lg hover:bg-[#7A46A2] transition-colors" style={{cursor: 'pointer'}}>
              <Edit className="w-4 h-4" />
              Modifier
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" style={{cursor: 'pointer'}}>
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors" style={{cursor: 'pointer'}}>
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Informations principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#8A56B2]" />
              </div>
              <h3 className="font-semibold text-gray-900">Contact</h3>
            </div>
            <div className="space-y-3">
              {user.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
              )}
              {user.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Localisation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#8A56B2]" />
              </div>
              <h3 className="font-semibold text-gray-900">Localisation</h3>
            </div>
            <div className="space-y-3">
              {user.countryName && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{user.countryName}</span>
                </div>
              )}
              {user.languageName && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Langue:</span> {user.languageName}
                </div>
              )}
            </div>
          </div>

          {/* Activité */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#8A56B2]" />
              </div>
              <h3 className="font-semibold text-gray-900">Activité</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-gray-700">
                    {UserService.formatLastLogin(user.lastLogin)}
                  </div>
                  <div className="text-xs text-gray-500">Dernière connexion</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-gray-700">
                    {UserService.formatDate(user.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500">Date d'inscription</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallets et comptes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#8A56B2]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Wallets et Comptes</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Wallet Principal</h4>
                  <p className="text-sm text-gray-600">Compte principal de l'utilisateur</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">0 XOF</div>
                  <div className="text-xs text-gray-500">Solde actuel</div>
                </div>
              </div>
            </div>
            <button className="w-full py-3 border border-[#8A56B2] text-[#8A56B2] rounded-lg hover:bg-[#8A56B2]/5 transition-colors font-medium" style={{cursor: 'pointer'}}>
              Voir tous les wallets
            </button>
          </div>
        </div>

        {/* Transactions et activité */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#8A56B2]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">0</div>
                <div className="text-xs text-gray-600">Entrées</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-semibold text-red-600">0</div>
                <div className="text-xs text-gray-600">Sorties</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">0</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
            <button className="w-full py-3 border border-[#8A56B2] text-[#8A56B2] rounded-lg hover:bg-[#8A56B2]/5 transition-colors font-medium" style={{cursor: 'pointer'}}>
              Voir l'historique
            </button>
          </div>
        </div>
      </div>

      {/* Paramètres et sécurité */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#8A56B2]/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#8A56B2]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Paramètres et Sécurité</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Sécurité</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Authentification</span>
                <span className="text-sm text-green-600 font-medium">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Double authentification</span>
                <span className="text-sm text-gray-500 font-medium">Non configurée</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Préférences</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications email</span>
                <span className="text-sm text-green-600 font-medium">Activées</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notifications SMS</span>
                <span className="text-sm text-gray-500 font-medium">Désactivées</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Statistiques</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nombre de transactions</span>
                <span className="text-sm text-gray-900 font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Volume total</span>
                <span className="text-sm text-gray-900 font-medium">0 XOF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserDetailPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <UserDetailContent />
        </main>
      </div>
    </div>
  )
}

export default function UserDetail() {
  return (
    <UserDetailPage />
  )
}
