'use client'

import React, { useState, useEffect } from 'react'
import { Transaction } from '@/lib/api-config-wallet'
import { TransactionService } from '@/lib/transaction-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
import { ArrowUp, ArrowDown, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

interface TransactionTableProps {
  walletId?: string
  limit?: number
}

export default function TransactionTable({ walletId, limit = 10 }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    loadTransactions()
  }, [walletId, page])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const allTransactions = await TransactionService.getTransactions()
      
      // Filtrer par walletId si spécifié
      const filteredTransactions = walletId 
        ? allTransactions.filter(t => t.wallet.id === walletId)
        : allTransactions
      
      // Pagination simple côté client
      const startIndex = page * limit
      const endIndex = startIndex + limit
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)
      
      setTransactions(paginatedTransactions)
      setTotalPages(Math.ceil(filteredTransactions.length / limit))
      setTotalElements(filteredTransactions.length)
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err)
      setError('Impossible de charger les transactions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-amber-600" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-gray-600" />
      case 'REFUNDED':
        return <RefreshCw className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
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

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Complétée'
      case 'PENDING':
        return 'En attente'
      case 'FAILED':
        return 'Échouée'
      case 'CANCELLED':
        return 'Annulée'
      case 'REFUNDED':
        return 'Remboursée'
      default:
        return status
    }
  }

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDown className="w-4 h-4 text-green-600" />
      case 'WITHDRAWAL':
        return <ArrowUp className="w-4 h-4 text-red-600" />
      case 'TRANSFER':
        return <ArrowRight className="w-4 h-4 text-blue-600" />
      case 'PAYMENT':
        return <ArrowRight className="w-4 h-4 text-purple-600" />
      default:
        return <ArrowRight className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeText = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Dépôt'
      case 'WITHDRAWAL':
        return 'Retrait'
      case 'TRANSFER':
        return 'Transfert'
      case 'PAYMENT':
        return 'Paiement'
      default:
        return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'XAF' ? 'XAF' : currency === 'XOF' ? 'XOF' : 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('XAF', 'FCFA').replace('XOF', 'FCFA')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadTransactions}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune transaction trouvée</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Historique des transactions
        </h3>
        <div className="text-sm text-gray-600">
          {totalElements} transaction{totalElements > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  De/À
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.reference}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {formatSecureId(transaction.id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="text-sm text-gray-900">
                        {getTypeText(transaction.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </div>
                    {transaction.fee > 0 && (
                      <div className="text-xs text-gray-500">
                        Frais: {formatAmount(transaction.fee, transaction.currency)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {transaction.type === 'DEPOSIT' || transaction.type === 'PAYMENT' ? (
                        <>
                          <div className="font-medium">De: {transaction.senderInfo.name}</div>
                          <div className="text-xs text-gray-500">
                            {transaction.senderInfo.email ? 
                              maskSensitiveKey(transaction.senderInfo.email, 12) : 
                              transaction.senderInfo.phone ? 
                                maskSensitiveKey(transaction.senderInfo.phone, 8) : 
                                'N/A'
                            }
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-medium">À: {transaction.receiverInfo.name}</div>
                          <div className="text-xs text-gray-500">
                            {transaction.receiverInfo.email ? 
                              maskSensitiveKey(transaction.receiverInfo.email, 12) : 
                              transaction.receiverInfo.phone ? 
                                maskSensitiveKey(transaction.receiverInfo.phone, 8) : 
                                'N/A'
                            }
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page + 1} sur {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
