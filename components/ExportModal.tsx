'use client'

import React, { useState } from 'react'
import { Wallet } from '@/lib/api-config-wallet'
import { TransactionService } from '@/lib/transaction-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
import { X, Download, FileText, Database, FileSpreadsheet, CheckCircle, AlertCircle, Calendar, Filter } from 'lucide-react'

interface ExportModalProps {
  wallet: Wallet
  isOpen: boolean
  onClose: () => void
}

interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  includeWallets: boolean
  includeTransactions: boolean
  dateRange: 'all' | 'last30days' | 'last90days' | 'custom'
  customStartDate?: string
  customEndDate?: string
}

export default function ExportModal({ wallet, isOpen, onClose }: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeWallets: true,
    includeTransactions: true,
    dateRange: 'all'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetState = () => {
    setExportOptions({
      format: 'csv',
      includeWallets: true,
      includeTransactions: true,
      dateRange: 'all'
    })
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const getFileName = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const walletName = wallet.refName || wallet.account.accountName || `wallet-${wallet.id.slice(0, 8)}`
    return `${walletName.replace(/[^a-zA-Z0-9]/g, '_')}_export_${timestamp}.${format}`
  }

  const prepareWalletData = () => {
    const walletData: any = {
      informations_generales: {
        id: formatSecureId(wallet.id),
        nom: wallet.refName || wallet.account.accountName,
        type: wallet.walletType,
        devise: wallet.currency.code,
        nom_devise: wallet.currency.nameFr,
        statut: wallet.frozen ? 'Gelé' : 'Actif',
        date_creation: wallet.createdAt,
        date_mise_a_jour: wallet.updatedAt,
        identifiant_legal: formatSecureId(wallet.legalIdentifier),
        reference_id: wallet.refId ? formatSecureId(wallet.refId) : 'Non défini'
      },
      compte_associe: {
        nom: wallet.account.accountName,
        sous_nom: wallet.account.accountSubName || 'Non défini',
        mode: wallet.account.accountMode,
        pays: wallet.account.country.nameFr,
        code_pays: wallet.account.country.code,
        cle_publique: maskSensitiveKey(wallet.account.publicKey, 16),
        statut: wallet.account.frozen ? 'Gelé' : 'Actif'
      },
      soldes: {
        total: wallet.balance.totalBalance,
        disponible: wallet.balance.balance,
        gelee: wallet.balance.frozenBalance,
        en_attente: wallet.balance.pendingBalance,
        devise: wallet.currency.code
      },
      frais_et_limites: {
        frais_depot: wallet.depositFeeRate,
        frais_retrait: wallet.withdrawalFeeRate,
        limite_max_transaction: wallet.maxTransactionAmount,
        devise: wallet.currency.code
      },
      statistiques: {
        nombre_transactions: wallet.transactionsCount,
        nombre_webhooks: wallet.webhooksCount,
        activites_suspectes: wallet.suspiciousActivitiesCount
      }
    }

    return walletData
  }

  const exportToCSV = async (data: any, includeTransactions: boolean) => {
    let csvContent = ''

    // En-tête du wallet
    csvContent += 'EXPORTATION DES DONNÉES DU WALLET\n'
    csvContent += `Généré le: ${new Date().toLocaleString('fr-FR')}\n`
    csvContent += `Wallet: ${wallet.refName || wallet.account.accountName}\n\n`

    // Informations générales
    csvContent += 'INFORMATIONS GÉNÉRALES\n'
    csvContent += 'Champ,Valeur\n'
    csvContent += `ID,${formatSecureId(wallet.id)}\n`
    csvContent += `Nom,${wallet.refName || wallet.account.accountName}\n`
    csvContent += `Type,${wallet.walletType}\n`
    csvContent += `Devise,${wallet.currency.code}\n`
    csvContent += `Statut,${wallet.frozen ? 'Gelé' : 'Actif'}\n`
    csvContent += `Date de création,${wallet.createdAt}\n`
    csvContent += `Date de mise à jour,${wallet.updatedAt}\n\n`

    // Soldes
    csvContent += 'SOLDES\n'
    csvContent += 'Type de solde,Montant,Devise\n'
    csvContent += `Total,${wallet.balance.totalBalance},${wallet.currency.code}\n`
    csvContent += `Disponible,${wallet.balance.balance},${wallet.currency.code}\n`
    csvContent += `Gelé,${wallet.balance.frozenBalance},${wallet.currency.code}\n`
    csvContent += `En attente,${wallet.balance.pendingBalance},${wallet.currency.code}\n\n`

    // Frais et limites
    csvContent += 'FRAIS ET LIMITES\n'
    csvContent += 'Type,Valeur\n'
    csvContent += `Frais de dépôt,${wallet.depositFeeRate}%\n`
    csvContent += `Frais de retrait,${wallet.withdrawalFeeRate}%\n`
    csvContent += `Limite max par transaction,${wallet.maxTransactionAmount} ${wallet.currency.code}\n\n`

    // Transactions si demandées
    if (includeTransactions) {
      try {
        const transactions = await TransactionService.getTransactions()
        const walletTransactions = transactions.filter(t => t.wallet.id === wallet.id)
        
        if (walletTransactions.length > 0) {
          csvContent += 'TRANSACTIONS\n'
          csvContent += 'Référence,Type,Montant,Devise,Statut,Date,Description\n'
          
          walletTransactions.forEach(transaction => {
            csvContent += `"${transaction.reference}",${transaction.type},${transaction.amount},${transaction.currency},${transaction.status},${transaction.createdAt},"${transaction.description}"\n`
          })
        } else {
          csvContent += 'TRANSACTIONS\n'
          csvContent += 'Aucune transaction trouvée\n'
        }
      } catch (error) {
        csvContent += 'TRANSACTIONS\n'
        csvContent += 'Erreur lors du chargement des transactions\n'
      }
    }

    return csvContent
  }

  const exportToJSON = async (includeTransactions: boolean) => {
    const data = prepareWalletData()
    
    if (includeTransactions) {
      try {
        const transactions = await TransactionService.getTransactions()
        const walletTransactions = transactions.filter(t => t.wallet.id === wallet.id)
        
        // Nettoyer les transactions pour l'export
        const cleanTransactions = walletTransactions.map(t => ({
          reference: t.reference,
          type: t.type,
          montant: t.amount,
          devise: t.currency,
          statut: t.status,
          date: t.createdAt,
          description: t.description,
          frais: t.fee,
          montant_net: t.netAmount
        }))
        
        data.transactions = cleanTransactions
      } catch (error) {
        data.transactions = []
        data.erreur_transactions = 'Erreur lors du chargement des transactions'
      }
    }

    return JSON.stringify(data, null, 2)
  }

  const exportToPDF = async (includeTransactions: boolean) => {
    // Pour le PDF, nous allons créer un contenu HTML simple
    // En production, utiliser une bibliothèque comme jsPDF ou Puppeteer
    const data = prepareWalletData()
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Export Wallet - ${wallet.refName || wallet.account.accountName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #8A56B2; }
          h2 { color: #333; border-bottom: 2px solid #8A56B2; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RAPPORT D'EXPORTATION</h1>
          <p>Wallet: ${wallet.refName || wallet.account.accountName}</p>
          <p>Généré le: ${new Date().toLocaleString('fr-FR')}</p>
        </div>
        
        <div class="section">
          <h2>Informations générales</h2>
          <table>
            <tr><th>Champ</th><th>Valeur</th></tr>
            <tr><td>ID</td><td>${formatSecureId(wallet.id)}</td></tr>
            <tr><td>Nom</td><td>${wallet.refName || wallet.account.accountName}</td></tr>
            <tr><td>Type</td><td>${wallet.walletType}</td></tr>
            <tr><td>Devise</td><td>${wallet.currency.code}</td></tr>
            <tr><td>Statut</td><td>${wallet.frozen ? 'Gelé' : 'Actif'}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Soldes</h2>
          <table>
            <tr><th>Type de solde</th><th>Montant</th></tr>
            <tr><td>Total</td><td>${wallet.balance.totalBalance} ${wallet.currency.code}</td></tr>
            <tr><td>Disponible</td><td>${wallet.balance.balance} ${wallet.currency.code}</td></tr>
            <tr><td>Gelé</td><td>${wallet.balance.frozenBalance} ${wallet.currency.code}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Frais et limites</h2>
          <table>
            <tr><th>Type</th><th>Valeur</th></tr>
            <tr><td>Frais de dépôt</td><td>${wallet.depositFeeRate}%</td></tr>
            <tr><td>Frais de retrait</td><td>${wallet.withdrawalFeeRate}%</td></tr>
            <tr><td>Limite max</td><td>${wallet.maxTransactionAmount} ${wallet.currency.code}</td></tr>
          </table>
        </div>
    `

    if (includeTransactions) {
      try {
        const transactions = await TransactionService.getTransactions()
        const walletTransactions = transactions.filter(t => t.wallet.id === wallet.id)
        
        htmlContent += `
          <div class="section">
            <h2>Transactions (${walletTransactions.length})</h2>
            <table>
              <tr><th>Référence</th><th>Type</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
        `
        
        walletTransactions.slice(0, 50).forEach(transaction => { // Limiter à 50 transactions pour le PDF
          htmlContent += `
            <tr>
              <td>${transaction.reference}</td>
              <td>${transaction.type}</td>
              <td>${transaction.amount} ${transaction.currency}</td>
              <td>${transaction.status}</td>
              <td>${new Date(transaction.createdAt).toLocaleDateString('fr-FR')}</td>
            </tr>
          `
        })
        
        htmlContent += `
            </table>
          </div>
        `
      } catch (error) {
        htmlContent += `
          <div class="section">
            <h2>Transactions</h2>
            <p>Erreur lors du chargement des transactions</p>
          </div>
        `
      }
    }

    htmlContent += `
      </body>
      </html>
    `

    return htmlContent
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      setError(null)

      let content: string
      let mimeType: string

      switch (exportOptions.format) {
        case 'csv':
          content = await exportToCSV(exportOptions.includeWallets, exportOptions.includeTransactions)
          mimeType = 'text/csv;charset=utf-8;'
          break
        case 'json':
          content = await exportToJSON(exportOptions.includeTransactions)
          mimeType = 'application/json;charset=utf-8;'
          break
        case 'pdf':
          content = await exportToPDF(exportOptions.includeTransactions)
          mimeType = 'text/html;charset=utf-8;' // HTML pour PDF (convertir côté client si nécessaire)
          break
        default:
          throw new Error('Format non supporté')
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getFileName(exportOptions.format)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (err) {
      console.error('Erreur lors de l\'exportation:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'exportation')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exporter les données
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportation réussie</h3>
              <p className="text-gray-600">Les données ont été exportées avec succès.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Format d'exportation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Format d'exportation
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, format: 'csv' })}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      exportOptions.format === 'csv'
                        ? 'border-[#8A56B2] bg-[#8A56B2] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    <span className="text-xs font-medium">CSV</span>
                  </button>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, format: 'json' })}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      exportOptions.format === 'json'
                        ? 'border-[#8A56B2] bg-[#8A56B2] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Database className="w-6 h-6" />
                    <span className="text-xs font-medium">JSON</span>
                  </button>
                  <button
                    onClick={() => setExportOptions({ ...exportOptions, format: 'pdf' })}
                    className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                      exportOptions.format === 'pdf'
                        ? 'border-[#8A56B2] bg-[#8A56B2] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-medium">PDF</span>
                  </button>
                </div>
              </div>

              {/* Options d'inclusion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Contenu à inclure
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTransactions}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeTransactions: e.target.checked })}
                      className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Inclure les transactions</span>
                      <p className="text-xs text-gray-500">Exporte également l'historique des transactions</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Aperçu des données */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu des données</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Informations générales du wallet</p>
                  <p>• Soldes et statistiques</p>
                  <p>• Frais et limites configurés</p>
                  <p>• Compte associé</p>
                  {exportOptions.includeTransactions && <p>• Historique des transactions</p>}
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="flex-1 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Exportation...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Exporter
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
