'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { PaymentMethodService } from '@/lib/payment-method-service'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { ArrowLeft, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowUpDown, Download, Send, Plus, Settings, Globe, Shield, Zap, Timer, DollarSign } from 'lucide-react'

function PaymentMethodDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentMethodId = params.id as string
  const section = searchParams.get('section') || 'methods'

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview')

  useEffect(() => {
    if (paymentMethodId) {
      loadPaymentMethodDetails()
    }
  }, [paymentMethodId])

  const loadPaymentMethodDetails = async () => {
    try {
      setLoading(true)
      const paymentMethodData = await PaymentMethodService.getPaymentMethodById(paymentMethodId)
      setPaymentMethod(paymentMethodData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la méthode de paiement')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (method: any) => {
    if (method.active) return 'green'
    return 'gray'
  }

  const getStatusText = (method: any) => {
    if (method.active) return 'Actif'
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

  if (error || !paymentMethod) {
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
                  <p className="text-red-600">{error || 'Méthode de paiement non trouvée'}</p>
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
                  onClick={() => router.push('/payment?section=methods')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{paymentMethod.name}</h1>
                  <p className="text-gray-600">Détails de la méthode de paiement</p>
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

          {/* Carte principale de la méthode de paiement */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                  {paymentMethod.logoUrl ? (
                    <img 
                      src={paymentMethod.logoUrl} 
                      alt={paymentMethod.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <CreditCard className="w-8 h-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{paymentMethod.name}</h2>
                  <p className="text-white/80">{paymentMethod.technicalName} • {paymentMethod.referenceCurrency}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                paymentMethod.active 
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30' 
                  : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
              }`}>
                {getStatusText(paymentMethod)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Transactions totales</p>
                <p className="text-3xl font-bold">
                  {paymentMethod.transactionsCount}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Transactions actives</p>
                <p className="text-3xl font-bold">
                  {paymentMethod.activeTransactionsCount}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-white/70 text-sm mb-1">Cooldown</p>
                <p className="text-3xl font-bold">
                  {paymentMethod.transactionCooldown} min
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
                  onClick={() => setActiveTab('transactions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'transactions'
                      ? 'border-[#8A56B2] text-[#8A56B2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Transactions
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
                        <p className="text-sm text-gray-600 mb-1">Slug</p>
                        <p className="font-semibold text-gray-900">{paymentMethod.slug}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Devise de référence</p>
                        <p className="font-semibold text-gray-900">{paymentMethod.referenceCurrency}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Support multi-devise</p>
                        <p className="font-semibold text-gray-900">{paymentMethod.supportsMultiCurrency ? 'Oui' : 'Non'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 mb-1">Frais échelonnés</p>
                        <p className="font-semibold text-gray-900">{paymentMethod.useTieredFees ? 'Oui' : 'Non'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Frais détaillés */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Structure des frais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                          <p className="text-sm text-amber-800 font-medium">Frais de dépôt</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">{paymentMethod.depositFeeRate}%</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowUpDown className="w-5 h-5 text-red-600" />
                          <p className="text-sm text-red-800 font-medium">Frais de retrait</p>
                        </div>
                        <p className="text-2xl font-bold text-red-900">{paymentMethod.withdrawalFeeRate}%</p>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                          <p className="text-sm text-purple-800 font-medium">TVA</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">{paymentMethod.txTva}%</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-5 h-5 text-blue-600" />
                          <p className="text-sm text-blue-800 font-medium">Frais partenaire</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{paymentMethod.txPartner}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Limites et contraintes */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Limites et contraintes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-800 font-medium">Montant maximum</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">
                          {PaymentMethodService.formatMaxAmount(paymentMethod.maxTransactionAmount, paymentMethod.referenceCurrency)}
                        </p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Timer className="w-5 h-5 text-orange-600" />
                          <p className="text-sm text-orange-800 font-medium">Délai de cooldown</p>
                        </div>
                        <p className="text-2xl font-bold text-orange-900">{paymentMethod.transactionCooldown} minutes</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Tester la méthode
                      </button>
                      <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
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

              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Historique des transactions</h3>
                    <p className="text-sm text-gray-600">{paymentMethod.transactionsCount} transactions</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune transaction à afficher</p>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres de la méthode</h3>
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

export default function PaymentMethodDetailPage() {
  return (
    <PaymentMethodDetailContent />
  )
}
