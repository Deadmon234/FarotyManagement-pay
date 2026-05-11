'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AdminTransaction, AdminTransactionService, AdminTransactionResponse } from '@/lib/admin-transaction-service'
import {
  ArrowDown,
  ArrowUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  LayoutList,
  BarChart3,
  Landmark,
  TrendingUp,
} from 'lucide-react'

interface AdminTransactionTableProps {
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
  /** Si true : pas de fond plein écran ni bannière / cartes stats (utilisé dans la page Paiement). */
  embedded?: boolean
  /** Avec `embedded` : affiche une rangée de statistiques (page courante + total catalogue). */
  showEmbeddedStats?: boolean
  /** Chaque chargement réussi (changement de page, actualisation, auto-refresh). */
  onDataLoaded?: (response: AdminTransactionResponse) => void
  /** Incrémenter depuis le parent pour forcer un rechargement sans changer de page. */
  refreshSignal?: number
}

export default function AdminTransactionTable({ 
  limit = 30, 
  autoRefresh = false,
  refreshInterval = 30000,
  embedded = false,
  showEmbeddedStats = true,
  onDataLoaded,
  refreshSignal = 0,
}: AdminTransactionTableProps) {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')

  const onDataLoadedRef = React.useRef(onDataLoaded)
  React.useEffect(() => {
    onDataLoadedRef.current = onDataLoaded
  }, [onDataLoaded])

  const fetchPage = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await AdminTransactionService.getTransactions(page, limit)
      setTransactions(response.data.content)
      setTotalPages(response.data.totalPages)
      setTotalElements(response.data.totalElements)
      onDataLoadedRef.current?.(response)
    } catch (err) {
      console.error('Erreur lors du chargement des transactions admin:', err)
      setError(err instanceof Error ? err.message : 'Impossible de charger les transactions')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    void fetchPage()
  }, [fetchPage, refreshSignal])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      void fetchPage()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchPage])

  const handleRefresh = () => {
    void fetchPage()
  }

  const pageStats = useMemo(
    () => AdminTransactionService.getStatistics(transactions),
    [transactions]
  )

  const displayCurrency = transactions[0]?.transaction.currency ?? 'XAF'

  const filteredTransactions = (transactions || []).filter(t => {
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        t.transaction.reference.toLowerCase().includes(search) ||
        t.transaction.transactionId.toLowerCase().includes(search) ||
        t.account.accountName.toLowerCase().includes(search) ||
        t.transaction.payerId.includes(search)

      if (!matchesSearch) return false
    }

    // Filtre par statut
    if (filterStatus !== 'ALL' && t.transaction.status !== filterStatus) {
      return false
    }

    // Filtre par type
    if (filterType !== 'ALL' && t.transaction.type !== filterType) {
      return false
    }

    return true
  })

  const getStatusIcon = (status: AdminTransaction['transaction']['status']) => {
    switch (status) {
      case 'SUCCESSFUL':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-amber-600" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'REFUNDED':
        return <RefreshCw className="w-5 h-5 text-blue-600" />
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-gray-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: AdminTransaction['transaction']['status']) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'text-green-700 bg-green-100'
      case 'PENDING':
        return 'text-amber-700 bg-amber-100'
      case 'FAILED':
        return 'text-red-700 bg-red-100'
      case 'CANCELLED':
        return 'text-gray-700 bg-gray-100'
      case 'REFUNDED':
        return 'text-blue-700 bg-blue-100'
      default:
        return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusText = (status: AdminTransaction['transaction']['status']) => {
    switch (status) {
      case 'SUCCESSFUL':
        return 'Réussie'
      case 'PENDING':
        return 'En attente'
      case 'FAILED':
        return 'Échouée'
      case 'CANCELLED':
        return 'Annulée'
      case 'REFUNDED':
        return 'Remboursée'
      default:
        return 'Inconnue'
    }
  }

  const getTypeIcon = (type: AdminTransaction['transaction']['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDown className="w-4 h-4 text-green-600" />
      case 'WITHDRAWAL':
        return <ArrowUp className="w-4 h-4 text-red-600" />
      case 'TRANSFER':
        return <ArrowUp className="w-4 h-4 text-blue-600" />
      default:
        return null
    }
  }

  const getTypeText = (type: AdminTransaction['transaction']['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Dépôt'
      case 'WITHDRAWAL':
        return 'Retrait'
      case 'TRANSFER':
        return 'Transfert'
      default:
        return 'Inconnue'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'XAF',
    }).format(amount)
  }

  const outerClassName = embedded
    ? 'space-y-6'
    : 'min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8 space-y-6'

  const statCardClass =
    'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md'

  return (
    <div className={outerClassName}>
      {!embedded && (
        <>
          <div className="overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-br from-[#8A56B2] via-[#74489a] to-[#5c3d7d] p-8 text-white shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-violet-100">
                  <LayoutList className="h-3.5 w-3.5" />
                  Supervision Faroty Pay
                </div>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Transactions administrateur</h1>
                <p className="max-w-xl text-sm text-violet-100 md:text-base">
                  Liste paginée issue de l’API admin. Les indicateurs de statut ci‑dessous concernent la page affichée ; le total catalogue est indiqué à part.
                </p>
                <dl className="flex flex-wrap gap-6 pt-2 text-sm">
                  <div>
                    <dt className="text-violet-200">Catalogue</dt>
                    <dd className="text-2xl font-semibold tabular-nums">{totalElements}</dd>
                  </div>
                  <div>
                    <dt className="text-violet-200">Réussies (page)</dt>
                    <dd className="text-2xl font-semibold tabular-nums text-emerald-200">{pageStats.successful}</dd>
                  </div>
                  <div>
                    <dt className="text-violet-200">En attente (page)</dt>
                    <dd className="text-2xl font-semibold tabular-nums text-amber-200">{pageStats.pending}</dd>
                  </div>
                </dl>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#5c3d7d] shadow-md transition hover:bg-violet-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualisation…' : 'Actualiser'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={statCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total catalogue</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">{totalElements}</p>
                  <p className="mt-1 text-xs text-slate-500">Toutes pages confondues</p>
                </div>
                <div className="rounded-xl bg-violet-100 p-3 text-[#8A56B2]">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className={statCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Réussies (cette page)</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-700">{pageStats.successful}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width:
                          transactions.length > 0
                            ? `${(pageStats.successful / transactions.length) * 100}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className={statCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">En attente / échouées</p>
                  <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900">
                    <span className="text-amber-600">{pageStats.pending}</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="text-red-600">{pageStats.failed}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Sur les lignes chargées</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-700">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>
            <div className={statCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Volume page</p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                    {formatAmount(pageStats.totalAmount, displayCurrency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Frais : {formatAmount(pageStats.totalFees, displayCurrency)}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-100 p-3 text-[#8A56B2]">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Card */}
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
        {embedded && (
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Détail des opérations</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                Données issues de l’API admin Faroty Pay. Les filtres ci‑dessous s’appliquent aux lignes déjà chargées sur cette page.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8A56B2] to-[#6b4a8f] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Actualisation…' : 'Actualiser la liste'}
            </button>
          </div>
        )}

        {embedded && showEmbeddedStats && (
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Landmark className="h-4 w-4 text-[#8A56B2]" />
                Indicateurs
              </div>
              <p className="text-xs text-slate-500">
                Total catalogue :{' '}
                <span className="font-semibold text-slate-700 tabular-nums">{totalElements}</span>
                {' · '}
                Page {page + 1}/{Math.max(totalPages, 1)} · {transactions.length} ligne(s) chargée(s)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
              {[
                { label: 'Réussies', value: pageStats.successful, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                { label: 'En attente', value: pageStats.pending, tone: 'text-amber-800 bg-amber-50 border-amber-100' },
                { label: 'Échouées', value: pageStats.failed, tone: 'text-red-700 bg-red-50 border-red-100' },
                { label: 'Dépôts', value: pageStats.deposits, tone: 'text-slate-800 bg-slate-50 border-slate-200' },
                { label: 'Retraits', value: pageStats.withdrawals, tone: 'text-slate-800 bg-slate-50 border-slate-200' },
                {
                  label: 'Volume page',
                  value: formatAmount(pageStats.totalAmount, displayCurrency),
                  tone: 'text-[#5c3d7d] bg-violet-50 border-violet-100 col-span-2 lg:col-span-1',
                  small: true,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-3 py-3 ${item.tone}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{item.label}</p>
                  <p className={`mt-1 font-bold tabular-nums ${item.small ? 'text-base' : 'text-xl'}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-[#8A56B2] to-[#6b4a8f]" />
            <h2 className="text-lg font-bold text-slate-900">Filtres et recherche</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="group relative">
              <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#8A56B2]" />
              <input
                type="text"
                placeholder="Référence, ID transaction, compte…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(0)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#8A56B2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                setPage(0)
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-[#8A56B2] focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SUCCESSFUL">Réussie</option>
              <option value="PENDING">En attente</option>
              <option value="FAILED">Échouée</option>
              <option value="REFUNDED">Remboursée</option>
              <option value="CANCELLED">Annulée</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPage(0)
              }}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition focus:border-[#8A56B2] focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="ALL">Tous les types</option>
              <option value="DEPOSIT">Dépôt</option>
              <option value="WITHDRAWAL">Retrait</option>
              <option value="TRANSFER">Transfert</option>
            </select>
          </div>
        </div>

      {/* Error Section */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl flex gap-4 shadow-md">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-lg">Erreur</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-16 h-16 mb-4">
            <svg className="w-full h-full text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <span className="text-gray-600 font-semibold">Chargement des transactions...</span>
          <p className="text-gray-500 text-sm mt-2">Veuillez patienter</p>
        </div>
      )}

      {/* Table Section */}
      {!loading && filteredTransactions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded" />
            <h2 className="text-xl font-bold text-gray-900">Historique des Transactions ({filteredTransactions.length})</h2>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-900 text-left text-xs font-semibold uppercase tracking-wide text-slate-300">
                  <th className="px-4 py-3.5">Référence</th>
                  <th className="px-4 py-3.5">Compte</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5 text-right">Montant</th>
                  <th className="px-4 py-3.5 text-right">Frais</th>
                  <th className="px-4 py-3.5 text-center">Statut</th>
                  <th className="px-4 py-3.5">Méthode</th>
                  <th className="px-4 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.transaction.transactionId}
                    className="border-b border-slate-50 transition-colors hover:bg-violet-50/40"
                  >
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded-lg text-gray-700 max-w-xs truncate">{tx.transaction.reference}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-gray-900">{tx.account.accountName}</p>
                        <p className="text-xs text-gray-500 mt-1 bg-gray-100 w-fit px-2 py-1 rounded">{tx.account.countryCode}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 font-semibold">
                        {getTypeIcon(tx.transaction.type)}
                        <span className="bg-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wide text-center w-fit mx-auto px-3 py-1 rounded-lg">{getTypeText(tx.transaction.type)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <p className="font-bold text-gray-900 text-base">{formatAmount(tx.transaction.amount, tx.transaction.currency)}</p>
                        <p className="text-xs text-gray-600 mt-1">Net: {formatAmount(tx.transaction.netAmount, tx.transaction.currency)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div>
                        <p className="font-bold text-red-600">{formatAmount(tx.fees, tx.transaction.currency)}</p>
                        <p className="text-xs text-gray-600 mt-1">{tx.totalFeeRate.toFixed(2)}%</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(tx.transaction.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tx.transaction.status)} shadow-sm`}>
                          {getStatusText(tx.transaction.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img
                            src={tx.transaction.paymentMethodInfo.logoUrl}
                            alt={tx.transaction.paymentMethodInfo.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{tx.transaction.paymentMethodInfo.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-600 font-medium">
                      {formatDate(tx.transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTransactions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-900 font-bold text-lg">Aucune transaction trouvée</p>
          <p className="text-gray-600 text-sm mt-2">Ajustez vos filtres de recherche pour voir des résultats</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pt-6 border-t-2 border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg font-semibold">
            Page <span className="font-semibold text-[#8A56B2]">{page + 1}</span> sur{' '}
            <span className="font-semibold text-[#8A56B2]">{totalPages}</span> ·{' '}
            <span className="font-semibold text-slate-800">{totalElements}</span> transactions
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 px-5 py-2 border-2 border-gray-300 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-purple-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
