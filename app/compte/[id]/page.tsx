'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { AccountService } from '@/lib/account-service'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { ArrowLeft, Users, CreditCard, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, ArrowUpDown, Download, Send, Plus, Settings, Globe, Webhook, Shield } from 'lucide-react'

function AccountDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountId = params.id as string
  const section = searchParams.get('section') || 'accounts'

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'settings'>('overview')

  useEffect(() => {
    if (accountId) {
      loadAccountDetails()
    }
  }, [accountId])

  const loadAccountDetails = async () => {
    try {
      setLoading(true)
      const accountData = await AccountService.getAccountById(accountId)
      setAccount(accountData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du compte')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (account: any) => {
    if (account.frozen) return 'red'
    return 'green'
  }

  const getStatusText = (account: any) => {
    if (account.frozen) return 'Gelé'
    return 'Actif'
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

  if (error || !account) {
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
                  <p className="text-red-600">{error || 'Compte non trouvé'}</p>
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
                  onClick={() => router.push('/payment?section=accounts')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{account.accountName}</h1>
                  <p className="text-gray-600">Détails du compte</p>
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
            {/* Carte principale du compte */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{account.accountName}</h2>
                    <p className="text-white/80">{account.country.nameFr} • {account.country.code}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  account.frozen 
                    ? 'bg-red-500/20 text-red-100 border border-red-400/30' 
                    : 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                }`}>
                  {getStatusText(account)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Wallets</p>
                  <p className="text-3xl font-bold">
                    {account.walletsCount}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Méthodes de paiement</p>
                  <p className="text-3xl font-bold">
                    {account.accountPaymentMethodsCount}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-white/70 text-sm mb-1">Webhooks</p>
                  <p className="text-3xl font-bold">
                    {account.webhooksCount}
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
                    onClick={() => setActiveTab('wallets')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'wallets'
                        ? 'border-[#8A56B2] text-[#8A56B2]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Wallets
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
                          <p className="text-sm text-gray-600 mb-1">Mode du compte</p>
                          <p className="font-semibold text-gray-900">{account.accountMode}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">Pays</p>
                          <p className="font-semibold text-gray-900">{account.country.nameFr}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">Date de création</p>
                          <p className="font-semibold text-gray-900">{AccountService.formatDate(account.createdAt)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-600 mb-1">Identifiant</p>
                          <p className="font-mono text-sm text-gray-900">{account.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </div>

                    {/* Clé publique */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clé publique</h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm text-amber-900 break-all">{account.publicKey}</p>
                          <button className="bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors text-sm">
                            Copier
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Frais et limites */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Frais et limites</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                            <p className="text-sm text-amber-800 font-medium">Frais de dépôt</p>
                          </div>
                          <p className="text-2xl font-bold text-amber-900">{account.depositFeeRate}%</p>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ArrowUpDown className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-800 font-medium">Frais de retrait</p>
                          </div>
                          <p className="text-2xl font-bold text-red-900">{account.withdrawalFeeRate}%</p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">Limite max</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            {AccountService.formatAmount(account.country.maxPaymentAmount)}
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
                          Créer un wallet
                        </button>
                        <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                          <Webhook className="w-5 h-5" />
                          Configurer webhook
                        </button>
                        <button className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                          <Shield className="w-5 h-5" />
                          Sécurité
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'wallets' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Wallets associés</h3>
                      <p className="text-sm text-gray-600">{account.walletsCount} wallets</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Chargement des wallets...</p>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Paramètres du compte</h3>
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

export default function AccountDetailPage() {
  return (
    <AccountDetailContent />
  )
}
