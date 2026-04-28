'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { UserService, User, UserStats } from '@/lib/user-service'
import { BarChart3, Users, CheckCircle, Mail, Clock, Globe, AlertCircle, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, Table } from 'lucide-react'

function UsersOverview() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const itemsPerPage = 30

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await UserService.getUsers()
      const statsData = await UserService.getUserStats()
      
      setUsers(usersData)
      setFilteredUsers(usersData)
      setUserStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      
      // Gérer les erreurs d'authentification
      if (errorMessage.includes('non authentifié') || errorMessage.includes('expiré') || errorMessage.includes('Non autorisé')) {
        setError('Session expirée - Redirection vers la page de connexion...')
        setTimeout(() => {
          router.push('/loginotp')
        }, 2000)
      } else {
        setError(errorMessage || 'Impossible de charger les utilisateurs')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(searchQuery))
      )
      setFilteredUsers(filtered)
    }
    // Réinitialiser la page à 1 lors d'une nouvelle recherche
    setCurrentPage(1)
  }, [searchQuery, users])

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
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}>
        <span>{icon}</span>
        {text}
      </span>
    )
  }

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  // Fonctions de navigation
  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Utilisateurs</h1>
            <p className="text-gray-600 mt-1">Gérez les utilisateurs de la plateforme</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
          <button 
            onClick={loadUsers}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            style={{cursor: 'pointer'}}
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadUsers}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            style={{cursor: 'pointer'}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-sm font-semibold mb-2">Total Utilisateurs</p>
          <p className="text-3xl font-bold text-blue-900">
            {userStats ? userStats.totalUsers : '0'}
          </p>
          <p className="text-xs text-blue-600 mt-2">
            {userStats ? `${userStats.activeUsers} actifs` : '0 actifs'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <p className="text-green-600 text-sm font-semibold mb-2">Utilisateurs Vérifiés</p>
          <p className="text-3xl font-bold text-green-900">
            {userStats ? userStats.verifiedUsers : '0'}
          </p>
          <p className="text-xs text-green-600 mt-2">
            {userStats ? `${userStats.emailVerifiedUsers} par email` : '0 par email'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
          <p className="text-purple-600 text-sm font-semibold mb-2">Nouveaux Utilisateurs</p>
          <p className="text-3xl font-bold text-purple-900">
            {userStats ? userStats.createdUsers : '0'}
          </p>
          <p className="text-xs text-purple-600 mt-2">En attente</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
          <p className="text-orange-600 text-sm font-semibold mb-2">Connexions Récentes</p>
          <p className="text-3xl font-bold text-orange-900">
            {userStats ? userStats.recentLogins : '0'}
          </p>
          <p className="text-xs text-orange-600 mt-2">7 derniers jours</p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtres
          </button>
          
          {/* Boutons de basculement d'affichage */}
          <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-[#8A56B2] text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={{cursor: 'pointer'}}
            >
              <Table className="w-4 h-4" />
              Tableau
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#8A56B2] text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              style={{cursor: 'pointer'}}
            >
              <LayoutGrid className="w-4 h-4" />
              Grille
            </button>
          </div>
        </div>
      </div>

      {/* Affichage des utilisateurs */}
      {viewMode === 'table' ? (
        /* Vue tableau */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profilePictureUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profilePictureUrl}
                              alt={user.fullName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#8A56B2] flex items-center justify-center text-white font-semibold">
                              {UserService.getUserInitials(user)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          {user.guest && (
                            <div className="text-xs text-gray-500">Invité</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {user.email}
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.842l-2.165-1.328a1 1 0 00-.946-.002L17 4H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 001.11 0L22 8"/>
                            </svg>
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.accountStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {user.countryName ? (
                          <>
                            <Globe className="w-3 h-3 text-gray-400 mr-1" />
                            {user.countryName}
                          </>
                        ) : (
                          <span className="text-gray-400">Non spécifié</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        {UserService.formatLastLogin(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {UserService.formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vue grille */
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="group relative bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-[#8A56B2]/20 transition-all duration-300 transform hover:-translate-y-1">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="h-14 w-14 flex-shrink-0">
                        {user.profilePictureUrl ? (
                          <img
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-lg"
                            src={user.profilePictureUrl}
                            alt={user.fullName}
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#8A56B2] to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
                            {UserService.getUserInitials(user)}
                          </div>
                        )}
                      </div>
                      {/* Indicateur de statut en ligne */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        user.active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-[#8A56B2] transition-colors">{user.fullName}</h3>
                      {user.guest && (
                        <div className="inline-flex items-center mt-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                          Invité
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(user.accountStatus)}
                  </div>
                </div>
                
                {/* Corps de la carte avec informations */}
                <div className="space-y-3">
                  {/* Email */}
                  {user.email && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-[#8A56B2]/5 transition-colors">
                      <Mail className="w-4 h-4 text-[#8A56B2] mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate font-medium">{user.email}</span>
                    </div>
                  )}
                  
                  {/* Téléphone */}
                  {user.phoneNumber && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-[#8A56B2]/5 transition-colors">
                      <svg className="w-4 h-4 text-[#8A56B2] mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.842l-2.165-1.328a1 1 0 00-.946-.002L17 4H6a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 001.11 0L22 8"/>
                      </svg>
                      <span className="text-sm text-gray-700 truncate font-medium">{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  {/* Pays */}
                  {user.countryName && (
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg group-hover:bg-[#8A56B2]/5 transition-colors">
                      <Globe className="w-4 h-4 text-[#8A56B2] mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate font-medium">{user.countryName}</span>
                    </div>
                  )}
                </div>
                
                {/* Pied de carte avec dates */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{UserService.formatLastLogin(user.lastLogin)}</span>
                    </div>
                    <div className="text-gray-500">
                      Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Overlay d'action au hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Aucun utilisateur disponible.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#8A56B2] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsersPageContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <UsersOverview />
        </main>
      </div>
    </div>
  )
}

export default function UsersPage() {
  return (
    <UsersPageContent />
  )
}
