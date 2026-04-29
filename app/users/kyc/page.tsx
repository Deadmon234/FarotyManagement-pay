'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { UserService, User } from '@/lib/user-service'
import { ShieldCheck, Search, Globe, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

function KYCContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showKYCForm, setShowKYCForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const itemsPerPage = 30

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Appliquer le filtre de recherche
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Appliquer le filtre KYC
    if (kycFilter !== 'all') {
      filtered = filtered.filter(user => {
        const kycStatus = user.kycStatus || 'pending'
        return kycStatus === kycFilter
      })
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchQuery, kycFilter, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await UserService.getUsers()
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage || 'Impossible de charger les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  // Calculs pour la pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const getKYCBadge = (status: string) => {
    const badges = {
      'verified': { icon: '✓', text: 'Vérifié', color: 'bg-green-100 text-green-800 border-green-200' },
      'pending': { icon: '⏳', text: 'En attente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      'rejected': { icon: '✕', text: 'Rejeté', color: 'bg-red-100 text-red-800 border-red-200' }
    }
    const badge = badges[status as keyof typeof badges] || badges['pending']
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color}`}>
        <span className="text-sm">{badge.icon}</span>
        {badge.text}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">KYC</h1>
            <p className="text-gray-600 mt-1">Gérez les vérifications d'identité des utilisateurs</p>
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
          <h1 className="text-4xl font-bold text-gray-900">KYC</h1>
          <p className="text-gray-600 mt-1">Gérez les vérifications d'identité des utilisateurs</p>
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

      {/* Statistiques KYC */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
          <p className="text-green-600 text-sm font-semibold mb-2">Vérifiés</p>
          <p className="text-3xl font-bold text-green-900">
            {users.filter(u => u.kycStatus === 'verified').length}
          </p>
          <p className="text-xs text-green-600 mt-2">
            {((users.filter(u => u.kycStatus === 'verified').length / users.length) * 100 || 0).toFixed(1)}% du total
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm">
          <p className="text-amber-600 text-sm font-semibold mb-2">En Attente</p>
          <p className="text-3xl font-bold text-amber-900">
            {users.filter(u => u.kycStatus === 'pending').length}
          </p>
          <p className="text-xs text-amber-600 mt-2">À traiter</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 shadow-sm">
          <p className="text-red-600 text-sm font-semibold mb-2">Rejetés</p>
          <p className="text-3xl font-bold text-red-900">
            {users.filter(u => u.kycStatus === 'rejected').length}
          </p>
          <p className="text-xs text-red-600 mt-2">Demande révision</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
          <p className="text-blue-600 text-sm font-semibold mb-2">Total</p>
          <p className="text-3xl font-bold text-blue-900">{users.length}</p>
          <p className="text-xs text-blue-600 mt-2">Tous les utilisateurs</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="verified">Vérifiés</option>
            <option value="pending">En attente</option>
            <option value="rejected">Rejetés</option>
          </select>
          
          <button
            onClick={() => setShowKYCForm(true)}
            className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            style={{cursor: 'pointer'}}
          >
            <ShieldCheck className="w-4 h-4" />
            Créer KYC
          </button>
        </div>
      </div>

      {/* Tableau KYC */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pays</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut KYC</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Inscrit le</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8A56B2] to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        {user.guest && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Invité</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4 text-gray-400" />
                      {user.countryName || 'Non spécifié'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getKYCBadge(user.kycStatus || 'pending')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => {
                        setSelectedUser(user)
                        setShowKYCForm(true)
                      }}
                      className="text-[#8A56B2] hover:text-purple-700 font-semibold hover:underline mr-3" 
                      style={{cursor: 'pointer'}}
                    >
                      Créer KYC
                    </button>
                    <button className="text-[#8A56B2] hover:text-purple-700 font-semibold hover:underline" style={{cursor: 'pointer'}}>
                      Examiner
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun KYC trouvé</h3>
          <p className="text-gray-500">
            {searchQuery ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Aucun utilisateur à afficher.'}
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
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                      onClick={() => setCurrentPage(pageNum)}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* Afficher le formulaire KYC si nécessaire */}
      {showKYCForm && (
        <KYCForm
          user={selectedUser}
          onClose={() => {
            setShowKYCForm(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setRefreshKey(prev => prev + 1)
            setShowKYCForm(false)
            setSelectedUser(null)
            loadUsers()
          }}
        />
      )}
    </div>
  )
}

// Composant Formulaire KYC
function KYCForm({ user, onClose, onSuccess }: { user: User | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    profilePictureUrl: user?.profilePictureUrl || '',
    identificationType: 'CNI',
    frontImageUrl: '',
    backImageUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api-prod.faroty.com/auth/api/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()
      console.log('KYC créé avec succès:', result)
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la création du KYC:', err)
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user ? `KYC pour ${user.fullName}` : 'Créer un KYC'}
              </h2>
              <p className="text-gray-600 mt-1">
                {user ? `Email: ${user.email}` : 'Veuillez sélectionner un utilisateur'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              style={{cursor: 'pointer'}}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                placeholder="Jean Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL photo de profil
              </label>
              <input
                type="url"
                name="profilePictureUrl"
                value={formData.profilePictureUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'identification *
              </label>
              <select
                name="identificationType"
                value={formData.identificationType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
              >
                <option value="CNI">CNI (Carte Nationale d'Identité)</option>
                <option value="PASSEPORT">Passeport</option>
                <option value="PERMIS">Permis de conduire</option>
                <option value="CARTE_SEJOUR">Carte de séjour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL image avant *
              </label>
              <input
                type="url"
                name="frontImageUrl"
                value={formData.frontImageUrl}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                placeholder="https://example.com/cni-front.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL image arrière *
              </label>
              <input
                type="url"
                name="backImageUrl"
                value={formData.backImageUrl}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                placeholder="https://example.com/cni-back.jpg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              style={{cursor: 'pointer'}}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{cursor: loading ? 'not-allowed' : 'pointer'}}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Créer le KYC
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function KYCPageContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <KYCContent />
        </main>
      </div>
    </div>
  )
}

export default function KYCPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A56B2]"></div>
      </div>
    }>
      <KYCPageContent />
    </Suspense>
  )
}
