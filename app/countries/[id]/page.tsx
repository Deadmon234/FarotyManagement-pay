'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FarotyCountryService } from '@/lib/faroty-country-service'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { ArrowLeft, Globe, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowUpDown, Download, Send, Plus, Settings, Shield, Timer, DollarSign, Users, CreditCard } from 'lucide-react'

function CountryDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const countryId = params.id as string
  const section = searchParams.get('section') || 'countries'

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [country, setCountry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'methods' | 'settings'>('overview')

  useEffect(() => {
    if (countryId) {
      loadCountryDetails()
    }
  }, [countryId])

  const loadCountryDetails = async () => {
    try {
      setLoading(true)
      const countryData = await FarotyCountryService.getCountryById(countryId)
      setCountry(countryData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du pays')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (country: any) => {
    if (country.active) return 'green'
    return 'gray'
  }

  const getStatusText = (country: any) => {
    if (country.active) return 'Actif'
    return 'Inactif'
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="h-32 bg-gray-300 rounded mb-6"></div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                  <div className="h-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !country) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          
          <main className="flex-1 overflow-y-auto p-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
                  <p className="text-red-600">{error || 'Pays non trouvé'}</p>
                </div>
              </div>
              <button 
                onClick={() => router.back()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-8">

          {/* Header avec navigation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/payment?section=countries')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{country.nameFr}</h1>
                  <p className="text-gray-600">Détails du pays</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
                <button className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </button>
              </div>
            </div>
          </div>

          {/* Carte principale du pays */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  <div className="text-3xl">
                    {FarotyCountryService.getCountryFlag(country)}
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{country.nameFr}</h2>
                  <p className="text-white/80">{country.nameEn} • {country.code}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                country.active 
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' 
                  : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
              }`}>
                {getStatusText(country)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Comptes</p>
                <p className="text-3xl font-bold">
                  {country.accountsCount}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Méthodes de paiement</p>
                <p className="text-3xl font-bold">
                  {country.paymentMethodsCount}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Validation paiement</p>
                <p className="text-3xl font-bold">
                  {country.paymentValidationTime}h
                </p>
              </div>
            </div>
          </div>

          {/* Navigation par onglets */}
          <div className="bg-white rounded-2xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#8A56B2] text-[#8A56B2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Aperçu
                </button>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'accounts'
                      ? 'border-[#8A56B2] text-[#8A56B2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Comptes
                </button>
                <button
                  onClick={() => setActiveTab('methods')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'methods'
                      ? 'border-[#8A56B2] text-[#8A56B2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Méthodes
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'settings'
                      ? 'border-[#8A56B2] text-[#8A56B2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Paramètres
                </button>
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Informations générales */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Code ISO</p>
                        <p className="font-semibold text-gray-900">{country.code}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Nom anglais</p>
                        <p className="font-semibold text-gray-900">{country.nameEn}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Date de création</p>
                        <p className="font-semibold text-gray-900">{FarotyCountryService.formatDate(country.createdAt)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Identifiant</p>
                        <p className="font-mono text-sm text-gray-900">{country.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </div>

                  {/* Limites de paiement */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites de paiement</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-blue-800 font-medium">Max paiement</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">
                          {FarotyCountryService.formatAmount(country.maxPaymentAmount)}
                        </p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-800 font-medium">Max retrait</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {country.maxWithdrawalAmount ? FarotyCountryService.formatAmount(country.maxWithdrawalAmount) : 'Non défini'}
                        </p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-5 h-5 text-purple-600" />
                          <p className="text-sm text-purple-800 font-medium">Seuil validation</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">
                          {country.withdrawalValidationThreshold ? FarotyCountryService.formatAmount(country.withdrawalValidationThreshold) : 'Non défini'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Temps de validation */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps de validation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Timer className="w-5 h-5 text-amber-600" />
                          <p className="text-sm text-amber-800 font-medium">Validation paiement</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">{country.paymentValidationTime} heures</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-800 font-medium">Validation retrait</p>
                        </div>
                        <p className="text-2xl font-bold text-red-900">{country.withdrawalValidationTime} heures</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowUpDown className="w-5 h-5 text-orange-600" />
                          <p className="text-sm text-orange-800 font-medium">Cooldown retrait</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-900">{country.withdrawalCooldown} minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* Frais et paramètres */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frais et paramètres</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-5 h-5 text-indigo-600" />
                          <p className="text-sm text-indigo-800 font-medium">Frais minimum</p>
                        </div>
                        <p className="text-2xl font-bold text-indigo-900">
                          {country.minTransactionFeeRate ? `${country.minTransactionFeeRate}%` : 'Non défini'}
                        </p>
                      </div>
                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="w-5 h-5 text-teal-600" />
                          <p className="text-sm text-teal-800 font-medium">Utilisateur paie les frais</p>
                        </div>
                        <p className="text-2xl font-bold text-teal-900">
                          {country.isUserPaysFees ? 'Oui' : 'Non'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Créer un compte
                      </button>
                      <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Configurer méthodes
                      </button>
                      <button className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                        <Settings className="w-5 h-5" />
                        Paramètres avancés
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Comptes du pays</h3>
                    <p className="text-sm text-gray-600">{country.accountsCount} comptes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des comptes...</p>
                  </div>
                </div>
              )}

              {activeTab === 'methods' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Méthodes de paiement</h3>
                    <p className="text-sm text-gray-600">{country.paymentMethodsCount} méthodes</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des méthodes...</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres du pays</h3>
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Les paramètres seront bientôt disponibles</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function CountryDetailPage() {
  return (
    <CountryDetailContent />
  )
}
