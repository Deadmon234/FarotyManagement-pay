'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AccountService } from '@/lib/account-service'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { 
  ArrowLeft, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  MoreVertical, 
  Edit2, 
  Download, 
  Plus, 
  Settings, 
  Globe, 
  Webhook, 
  Shield, 
  X, 
  Lock, 
  BarChart3 
} from 'lucide-react'

// Modal Component
function FormModal({ 
  isOpen, 
  title, 
  onClose, 
  children
}: { 
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// Create Wallet Form
function CreateWalletForm({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({ currencyCode: 'XOF', description: '' })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
        <select value={formData.currencyCode} onChange={(e) => setFormData({...formData, currencyCode: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]">
          <option value="XOF">Franc CFA (XOF)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="USD">Dollar (USD)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description du wallet (optionnel)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] resize-none" rows={3} />
      </div>
      <button type="submit" className="w-full bg-[#8A56B2] text-white py-2 rounded-lg hover:bg-[#7a48a0] transition-colors font-medium">Créer le wallet</button>
    </form>
  )
}

// Configure Webhook Form
function ConfigureWebhookForm({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({ url: '', events: [] as string[] })
  const events = ['payment.completed', 'payment.failed', 'withdrawal.completed', 'account.updated']
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url || formData.events.length === 0) return
    onSubmit(formData)
    onClose()
  }
  const toggleEvent = (event: string) => {
    setFormData({...formData, events: formData.events.includes(event) ? formData.events.filter(e => e !== event) : [...formData.events, event]})
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL du Webhook</label>
        <input type="url" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://example.com/webhook" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Événements à surveiller</label>
        <div className="space-y-2">
          {events.map(event => (
            <label key={event} className="flex items-center">
              <input type="checkbox" checked={formData.events.includes(event)} onChange={() => toggleEvent(event)} className="rounded border-gray-300 text-[#8A56B2]" />
              <span className="ml-2 text-sm text-gray-700">{event}</span>
            </label>
          ))}
        </div>
      </div>
      <button type="submit" disabled={!formData.url || formData.events.length === 0} className="w-full bg-[#8A56B2] text-white py-2 rounded-lg hover:bg-[#7a48a0] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">Configurer le webhook</button>
    </form>
  )
}

// Edit Account Form
function EditAccountForm({ account, onSubmit, onClose }: { account: any; onSubmit: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({ accountName: account.accountName, depositFeeRate: account.depositFeeRate, withdrawalFeeRate: account.withdrawalFeeRate })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom du compte</label>
        <input type="text" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frais de dépôt (%)</label>
        <input type="number" value={formData.depositFeeRate} onChange={(e) => setFormData({...formData, depositFeeRate: parseFloat(e.target.value)})} step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Frais de retrait (%)</label>
        <input type="number" value={formData.withdrawalFeeRate} onChange={(e) => setFormData({...formData, withdrawalFeeRate: parseFloat(e.target.value)})} step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]" />
      </div>
      <button type="submit" className="w-full bg-[#8A56B2] text-white py-2 rounded-lg hover:bg-[#7a48a0] transition-colors font-medium">Enregistrer les modifications</button>
    </form>
  )
}

// Add Payment Method Form
function AddPaymentMethodForm({ onSubmit, onClose }: { onSubmit: (data: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({ type: 'bank_transfer', name: '', description: '' })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type de méthode</label>
        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]">
          <option value="bank_transfer">Virement bancaire</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="card">Carte bancaire</option>
          <option value="crypto">Crypto-monnaie</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nom de la méthode" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description (optionnel)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] resize-none" rows={3} />
      </div>
      <button type="submit" className="w-full bg-[#8A56B2] text-white py-2 rounded-lg hover:bg-[#7a48a0] transition-colors font-medium">Ajouter la méthode</button>
    </form>
  )
}

// Main Component
function AccountDetailContent() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'wallets' | 'methods' | 'webhooks' | 'security'>('overview')
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false)
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)

  useEffect(() => {
    if (accountId) loadAccountDetails()
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="bg-white rounded-2xl shadow-sm h-40"></div>
              <div className="bg-white rounded-2xl shadow-sm h-64"></div>
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
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
              </div>
              <p className="text-red-600 mb-4">{error || 'Compte non trouvé'}</p>
              <button onClick={() => router.back()} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Retour</button>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push('/payment?section=accounts')} className="p-2 hover:bg-white rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{account.accountName}</h1>
                <p className="text-gray-600 mt-1">Détails complets du compte</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => setShowEditModal(true)} className="flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                <Edit2 className="w-4 h-4" /> Modifier
              </button>
              <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                <Download className="w-4 h-4" /> Exporter
              </button>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-gradient-to-br from-[#8A56B2] to-[#6B3FA0] rounded-2xl p-8 text-white mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-white/70 text-sm mb-2">Statut</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${account.frozen ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-lg font-bold">{account.frozen ? 'Gelé' : 'Actif'}</span>
                </div>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Date de création</p>
                <p className="text-lg font-bold">{new Date(account.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Wallets</p>
                <p className="text-lg font-bold">{account.walletsCount}</p>
              </div>
              <div>
                <p className="text-white/70 text-sm mb-2">Pays</p>
                <p className="text-lg font-bold">{account.country.code}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm mb-8 border border-gray-100">
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-8 overflow-x-auto">
                {[{ id: 'overview', label: 'Aperçu', icon: '📊' }, { id: 'wallets', label: 'Wallets', icon: '💰' }, { id: 'methods', label: 'Méthodes de paiement', icon: '💳' }, { id: 'webhooks', label: 'Webhooks', icon: '🔗' }, { id: 'security', label: 'Sécurité', icon: '🔒' }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-[#8A56B2] text-[#8A56B2]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#8A56B2]" />
                      Informations générales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Identifiant</p>
                        <p className="font-mono text-sm text-gray-900">{account.id.slice(0, 16)}...</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Mode du compte</p>
                        <p className="font-semibold text-gray-900">{account.accountMode}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Pays</p>
                        <p className="font-semibold text-gray-900">{account.country.nameFr}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Code pays</p>
                        <p className="font-semibold text-gray-900">{account.country.code}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Date de création</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#8A56B2]" />
                          <p className="font-semibold text-gray-900">{new Date(account.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#8A56B2]" />
                      Frais et limites
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-amber-800 font-medium">Frais de dépôt</p>
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-3xl font-bold text-amber-900">{account.depositFeeRate}%</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-red-800 font-medium">Frais de retrait</p>
                          <TrendingUp className="w-5 h-5 text-red-600" />
                        </div>
                        <p className="text-3xl font-bold text-red-900">{account.withdrawalFeeRate}%</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-blue-800 font-medium">Montant maximum</p>
                          <Globe className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{AccountService.formatAmount(account.country.maxPaymentAmount)}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#8A56B2]" />
                      Statistiques
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-2">Total des wallets</p>
                        <p className="text-3xl font-bold text-gray-900">{account.walletsCount}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-2">Méthodes de paiement</p>
                        <p className="text-3xl font-bold text-gray-900">{account.accountPaymentMethodsCount}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-2">Webhooks configurés</p>
                        <p className="text-3xl font-bold text-gray-900">{account.webhooksCount}</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <p className="text-sm text-gray-600 mb-2">Clés API</p>
                        <p className="text-3xl font-bold text-gray-900">2</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Wallets Tab */}
              {activeTab === 'wallets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Wallets associés</h3>
                      <p className="text-sm text-gray-600 mt-1">{account.walletsCount} wallets configurés</p>
                    </div>
                    <button onClick={() => setShowCreateWalletModal(true)} className="flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                      <Plus className="w-4 h-4" /> Créer un wallet
                    </button>
                  </div>
                  {account.walletsCount > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(account.walletsCount)].map((_, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#8A56B2] rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Wallet {i + 1}</p>
                                <p className="text-xs text-gray-600">XOF</p>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600">Solde: <span className="font-semibold text-gray-900">0 XOF</span></p>
                            <p className="text-gray-600">Statut: <span className="font-semibold text-green-600">Actif</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucun wallet créé</p>
                      <button onClick={() => setShowCreateWalletModal(true)} className="inline-flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                        <Plus className="w-4 h-4" /> Créer le premier wallet
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'methods' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Méthodes de paiement</h3>
                      <p className="text-sm text-gray-600 mt-1">{account.accountPaymentMethodsCount} méthodes configurées</p>
                    </div>
                    <button onClick={() => setShowPaymentMethodModal(true)} className="flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                      <Plus className="w-4 h-4" /> Ajouter une méthode
                    </button>
                  </div>
                  {account.accountPaymentMethodsCount > 0 ? (
                    <div className="space-y-4">
                      {[...Array(account.accountPaymentMethodsCount)].map((_, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Méthode {i + 1}</p>
                              <p className="text-sm text-gray-600">Virement bancaire</p>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-white rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucune méthode de paiement</p>
                      <button onClick={() => setShowPaymentMethodModal(true)} className="inline-flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                        <Plus className="w-4 h-4" /> Ajouter la première méthode
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Webhooks Tab */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Webhooks</h3>
                      <p className="text-sm text-gray-600 mt-1">{account.webhooksCount} webhooks configurés</p>
                    </div>
                    <button onClick={() => setShowWebhookModal(true)} className="flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                      <Plus className="w-4 h-4" /> Configurer un webhook
                    </button>
                  </div>
                  {account.webhooksCount > 0 ? (
                    <div className="space-y-4">
                      {[...Array(account.webhooksCount)].map((_, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Webhook className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Webhook {i + 1}</p>
                                <p className="text-xs text-gray-600">https://example.com/webhook</p>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-white rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            Événements: payment.completed, payment.failed
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                      <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucun webhook configuré</p>
                      <button onClick={() => setShowWebhookModal(true)} className="inline-flex items-center gap-2 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors">
                        <Plus className="w-4 h-4" /> Configurer le premier webhook
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-[#8A56B2]" />
                      Paramètres de sécurité
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Authentification deux facteurs (2FA)</p>
                          <p className="text-sm text-gray-600">Renforcez la sécurité de votre compte</p>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Configurer
                        </button>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Clés API</p>
                          <p className="text-sm text-gray-600">Gérez vos clés d'accès API</p>
                        </div>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Gérer
                        </button>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">Adresses IP approuvées</p>
                          <p className="text-sm text-gray-600">Limitez l'accès à certaines adresses IP</p>
                        </div>
                        <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm">
                          Configurer
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#8A56B2]" />
                      Audit et journalisation
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">Dernières activités sur ce compte</p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Connexion réussie</span>
                          <span className="text-gray-500">Il y a 2 heures</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Wallet créé</span>
                          <span className="text-gray-500">Il y a 1 jour</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">Frais modifiés</span>
                          <span className="text-gray-500">Il y a 3 jours</span>
                        </div>
                      </div>
                      <button className="mt-4 text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium">
                        Voir l'historique complet →
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <FormModal isOpen={showCreateWalletModal} title="Créer un nouveau wallet" onClose={() => setShowCreateWalletModal(false)}>
        <CreateWalletForm onSubmit={(data) => console.log('Creating wallet:', data)} onClose={() => setShowCreateWalletModal(false)} />
      </FormModal>

      <FormModal isOpen={showWebhookModal} title="Configurer un webhook" onClose={() => setShowWebhookModal(false)}>
        <ConfigureWebhookForm onSubmit={(data) => console.log('Configuring webhook:', data)} onClose={() => setShowWebhookModal(false)} />
      </FormModal>

      <FormModal isOpen={showEditModal} title="Modifier le compte" onClose={() => setShowEditModal(false)}>
        <EditAccountForm account={account} onSubmit={(data) => console.log('Editing account:', data)} onClose={() => setShowEditModal(false)} />
      </FormModal>

      <FormModal isOpen={showPaymentMethodModal} title="Ajouter une méthode de paiement" onClose={() => setShowPaymentMethodModal(false)}>
        <AddPaymentMethodForm onSubmit={(data) => console.log('Adding payment method:', data)} onClose={() => setShowPaymentMethodModal(false)} />
      </FormModal>
    </div>
  )
}

export default function AccountDetailPage() {
  return <AccountDetailContent />
}
