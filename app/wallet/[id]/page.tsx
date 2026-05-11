'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  WalletIcon,
  CreditCard,
  TrendingUp,
  ArrowUpDown,
  Download,
  Send,
  Plus,
  Settings,
  AlertCircle,
} from 'lucide-react'

import { WalletService } from '@/lib/wallet-service'
import { Wallet } from '@/lib/api-config-wallet'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import DepositForm from '@/components/DepositForm'
import TransferForm from '@/components/TransferForm'
import WithdrawForm from '@/components/WithdrawForm'
import TransactionTable from '@/components/TransactionTable'
import WalletSettings from '@/components/WalletSettings'
import CreateWalletForm from '@/components/CreateWalletForm'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ActiveTab = 'overview' | 'transactions' | 'settings'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const getStatusText = (wallet: Wallet): string => {
  if (wallet.frozen) return 'Gelé'
  if (wallet.balance.totalBalance > 0) return 'Actif'
  return 'Inactif'
}

const formatWalletName = (wallet: Wallet): string =>
  wallet.account?.accountName || `Wallet ${wallet.currency.code}`

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function LoadingSkeleton({ isSidebarCollapsed, onToggleSidebar }: {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={onToggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={onToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6" />
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="h-32 bg-gray-300 rounded mb-6" />
              <div className="grid grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-300 rounded" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ErrorState({ error, isSidebarCollapsed, onToggleSidebar, onBack }: {
  error: string
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  onBack: () => void
}) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={onToggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={onToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={onBack}
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

function WalletHeroCard({ wallet }: { wallet: Wallet }) {
  return (
    <div className="bg-gradient-to-br from-[#8A56B2] to-[#6B3F8A] rounded-2xl p-8 text-white mb-8 shadow-xl">
      {/* Header */}
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

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Solde total', value: wallet.balance.totalBalance, size: 'text-3xl font-bold' },
          { label: 'Solde disponible', value: wallet.balance.balance, size: 'text-2xl font-semibold' },
          { label: 'En attente', value: wallet.balance.pendingBalance, size: 'text-2xl font-semibold' },
        ].map(({ label, value, size }) => (
          <div key={label} className="bg-white/10 backdrop-blur rounded-xl p-4">
            <p className="text-white/70 text-sm mb-1">{label}</p>
            <p className={size}>
              {WalletService.formatAmount(value, wallet.currency.code)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OverviewTab({ wallet, onCreateWallet, onTransfer, onWithdraw }: {
  wallet: Wallet
  onCreateWallet: () => void
  onTransfer: () => void
  onWithdraw: () => void
}) {
  const feeCards = [
    {
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
      label: 'Frais de dépôt',
      value: `${wallet.depositFeeRate}%`,
      style: 'bg-amber-50 border-amber-200 text-amber-800 text-amber-900',
    },
    {
      icon: <ArrowUpDown className="w-5 h-5 text-red-600" />,
      label: 'Frais de retrait',
      value: `${wallet.withdrawalFeeRate}%`,
      style: 'bg-red-50 border-red-200 text-red-800 text-red-900',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      label: 'Limite max',
      value: WalletService.formatAmount(wallet.maxTransactionAmount, wallet.currency.code),
      style: 'bg-blue-50 border-blue-200 text-blue-800 text-blue-900',
    },
  ]

  const infoFields = [
    { label: 'Type de wallet', value: wallet.walletType },
    { label: 'Compte associé', value: wallet.account?.accountName },
    { label: 'Date de création', value: WalletService.formatDate(wallet.createdAt) },
    { label: 'Identifiant', value: `${wallet.id.slice(0, 8)}...`, mono: true },
  ]

  const actions = [
    { label: 'Créer un wallet', icon: <Plus className="w-5 h-5" />, color: 'bg-emerald-500 hover:bg-emerald-600', onClick: onCreateWallet },
    { label: 'Transférer', icon: <Send className="w-5 h-5" />, color: 'bg-blue-500 hover:bg-blue-600', onClick: onTransfer },
    { label: 'Retirer', icon: <Download className="w-5 h-5" />, color: 'bg-gray-500 hover:bg-gray-600', onClick: onWithdraw },
  ]

  return (
    <div className="space-y-8">
      {/* Informations générales */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {infoFields.map(({ label, value, mono }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">{label}</p>
              <p className={`font-semibold text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frais et limites */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Frais et limites</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feeCards.map(({ icon, label, value, style }) => {
            const [bg, border, labelColor, valueColor] = style.split(' ')
            return (
              <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
                <div className="flex items-center space-x-2 mb-2">
                  {icon}
                  <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
                </div>
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Actions rapides */}
      {/* <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map(({ label, icon, color, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={`${color} text-white px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </section> */}
    </div>
  )
}

function TabNav({ activeTab, onChange }: {
  activeTab: ActiveTab
  onChange: (tab: ActiveTab) => void
}) {
  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'overview', label: 'Aperçu' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'settings', label: 'Paramètres' },
  ]

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-8 px-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === key
                ? 'border-[#8A56B2] text-[#8A56B2]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

function WalletDetailContent() {
  const params = useParams()
  const router = useRouter()
  const walletId = params.id as string

  // ── UI state ──
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // ── Data state ──
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Modal visibility ──
  const [showDepositForm, setShowDepositForm] = useState(false)
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [showCreateWalletForm, setShowCreateWalletForm] = useState(false)

  // ─────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────

  const loadWalletDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await WalletService.getWalletById(walletId)
      setWallet(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du wallet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (walletId) loadWalletDetails()
  }, [walletId])

  // ─────────────────────────────────────────
  // Shared layout helpers
  // ─────────────────────────────────────────

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev)

  // ─────────────────────────────────────────
  // Early returns: loading / error
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <LoadingSkeleton
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />
    )
  }

  if (error || !wallet) {
    return (
      <ErrorState
        error={error || 'Wallet non trouvé'}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onBack={() => router.back()}
      />
    )
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto">
          {/* Page Header */}
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Retour"
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

          {/* Content */}
          <div className="p-8">
            <WalletHeroCard wallet={wallet} />

            <div className="bg-white rounded-2xl shadow-sm mb-8">
              <TabNav activeTab={activeTab} onChange={setActiveTab} />

              <div className="p-8">
                {activeTab === 'overview' && (
                  <OverviewTab
                    wallet={wallet}
                    onCreateWallet={() => setShowCreateWalletForm(true)}
                    onTransfer={() => setShowTransferForm(true)}
                    onWithdraw={() => setShowWithdrawForm(true)}
                  />
                )}
                {activeTab === 'transactions' && (
                  <TransactionTable walletId={walletId} limit={20} />
                )}
                {activeTab === 'settings' && (
                  <WalletSettings wallet={wallet} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}

      {showDepositForm && (
        <DepositForm
          wallet={wallet}
          onSubmit={(data) => {
            console.log('Deposit data:', data)
            setShowDepositForm(false)
          }}
          onCancel={() => setShowDepositForm(false)}
          loading={false}
          error={null}
        />
      )}

      {showTransferForm && (
        <TransferForm
          wallet={wallet}
          onSubmit={(data) => {
            console.log('Transfer data:', data)
            setShowTransferForm(false)
          }}
          onCancel={() => setShowTransferForm(false)}
          loading={false}
          error={null}
        />
      )}

      {showWithdrawForm && (
        <WithdrawForm
          wallet={wallet}
          onSubmit={(data) => {
            console.log('Withdraw data:', data)
            setShowWithdrawForm(false)
          }}
          onCancel={() => setShowWithdrawForm(false)}
          loading={false}
          error={null}
        />
      )}

      {showCreateWalletForm && (
        <CreateWalletForm
          accountId={wallet.account.id}
          isOpen={showCreateWalletForm}
          onClose={() => setShowCreateWalletForm(false)}
          onSuccess={loadWalletDetails}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Page export
// ─────────────────────────────────────────────

export default function WalletDetailPage() {
  return <WalletDetailContent />
}