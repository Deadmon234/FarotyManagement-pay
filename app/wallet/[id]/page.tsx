'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { WalletService } from '@/lib/wallet-service'
import { Wallet } from '@/lib/api-config-wallet'
import { AccountService } from '@/lib/account-service'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { ArrowLeft, WalletIcon, CreditCard, TrendingUp, Users, Calendar, AlertCircle, CheckCircle, Clock, ArrowUpDown, Download, Send, Plus, Settings } from 'lucide-react'

function WalletDetailContent() {
  const params = useParams()
  const router = useRouter()
  const walletId = params.id as string

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'settings'>('overview')

  useEffect(() => {
    if (walletId) {
      loadWalletDetails()
    }
  }, [walletId])

  const loadWalletDetails = async () => {
    try {
      setLoading(true)
      const walletData = await WalletService.getWalletById(walletId)
      setWallet(walletData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du wallet')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (wallet: Wallet) => {
    if (wallet.frozen) return 'red'
    if (wallet.balance.totalBalance > 0) return 'green'
    return 'gray'
  }

  const getStatusText = (wallet: Wallet) => {
    if (wallet.frozen) return 'Gelé'
    if (wallet.balance.totalBalance > 0) return 'Actif'
    return 'Inactif'
  }

  const formatWalletName = (wallet: Wallet) => {
    return wallet.account?.accountName || `Wallet ${wallet.currency.code}`
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

  if (error || !wallet) {
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
                  <p className="text-red-600">{error || 'Wallet non trouvé'}</p>
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
        
        <main className="flex-1 overflow-y-auto">
          {/* Header avec navigation */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formatWalletName(wallet)}</h1>
                  <p className="text-gray-600">Détails du wallet</p>
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

          <div className="p-8">
            {/* Carte principale du wallet */}
            <div className="bg-gradient-to-br from-[#8A56B2] to-[#6B3F8A] rounded-2xl p-8 text-white mb-8 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <WalletIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{formatWalletName(wallet)}</h2>
                    <p className="text-white/80">{wallet.currency.nameFr} • {wallet.currency.code}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              wallet.frozen 
                ? 'bg-red-500/20 text-red-100 border border-red-400/30' 
                : 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
            }`}>
              {getStatusText(wallet)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-white/70 text-sm mb-1">Solde total</p>
              <p className="text-3xl font-bold">
                {WalletService.formatAmount(wallet.balance.totalBalance, wallet.currency.code)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-white/70 text-sm mb-1">Solde disponible</p>
              <p className="text-2xl font-semibold">
                {WalletService.formatAmount(wallet.balance.balance, wallet.currency.code)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-white/70 text-sm mb-1">En attente</p>
              <p className="text-2xl font-semibold">
                {WalletService.formatAmount(wallet.balance.pendingBalance, wallet.currency.code)}
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
                      <p className="text-sm text-gray-600 mb-1">Type de wallet</p>
                      <p className="font-semibold text-gray-900">{wallet.walletType}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Compte associé</p>
                      <p className="font-semibold text-gray-900">{wallet.account?.accountName}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Date de création</p>
                      <p className="font-semibold text-gray-900">{WalletService.formatDate(wallet.createdAt)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Identifiant</p>
                      <p className="font-mono text-sm text-gray-900">{wallet.id.slice(0, 8)}...</p>
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
                      <p className="text-2xl font-bold text-amber-900">{wallet.depositFeeRate}%</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ArrowUpDown className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-800 font-medium">Frais de retrait</p>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{wallet.withdrawalFeeRate}%</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <p className="text-sm text-blue-800 font-medium">Limite max</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {WalletService.formatAmount(wallet.maxTransactionAmount, wallet.currency.code)}
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
                      Déposer
                    </button>
                    <button className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Transférer
                    </button>
                    <button className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                      <Download className="w-5 h-5" />
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Historique des transactions</h3>
                  <p className="text-sm text-gray-600">{wallet.transactionsCount} transactions</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune transaction à afficher</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Paramètres du wallet</h3>
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Les paramètres seront bientôt disponibles</p>
                </div>
              </div>
            )}
          </div>
        </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default function WalletDetailPage() {
  return (
    <WalletDetailContent />
  )
}
