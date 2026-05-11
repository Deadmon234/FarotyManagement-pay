'use client'

import React, { useState } from 'react'
import { AccountService } from '@/lib/account-service'
import { WalletService } from '@/lib/wallet-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
import { X, Download, FileText, Database, FileSpreadsheet, CheckCircle, AlertCircle, Users, CreditCard, Shield, Globe } from 'lucide-react'

interface ExportAccountModalProps {
  account: any
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

interface ExportData {
  informations_generales: {
    id: string
    nom: any
    sous_nom: any
    mode: any
    statut: string
    date_creation: any
    date_mise_a_jour: any
    pays: any
    code_pays: any
  }
  securite: {
    cle_publique: string
    type_cryptage: string
    authentification_double_facteur: any
    dernier_acces: any
  }
  statistiques: {
    nombre_wallets: number
    nombre_transactions: number
    nombre_methodes_paiement: number
    nombre_webhooks: number
    activites_suspectes: number
  }
  webhooks: {
    url: string
    actif: boolean
    evenements: any
    dernier_envoi_reussi: string
  }
  wallets?: any[]
  transactions?: any[]
  erreur_wallets?: string
  erreur_transactions?: string
}

export default function ExportAccountModal({ account, isOpen, onClose }: ExportAccountModalProps) {
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
    const accountName = account.accountName || 'account-' + account.id.slice(0, 8)
    return accountName.replace(/[^a-zA-Z0-9]/g, '_') + '_export_' + timestamp + '.' + format
  }

  const prepareAccountData = (): ExportData => {
    const accountData: ExportData = {
      informations_generales: {
        id: formatSecureId(account.id),
        nom: account.accountName,
        sous_nom: account.accountSubName || 'Non défini',
        mode: account.accountMode,
        statut: account.frozen ? 'Gelé' : 'Actif',
        date_creation: account.createdAt,
        date_mise_a_jour: account.updatedAt,
        pays: account.country.nameFr,
        code_pays: account.country.code
      },
      securite: {
        cle_publique: maskSensitiveKey(account.publicKey, 20),
        type_cryptage: 'RSA-2048',
        authentification_double_facteur: account.twoFactorEnabled || false,
        dernier_acces: account.lastLogin || 'Jamais'
      },
      statistiques: {
        nombre_wallets: account.walletsCount || 0,
        nombre_transactions: account.transactionsCount || 0,
        nombre_methodes_paiement: account.accountPaymentMethodsCount || 0,
        nombre_webhooks: account.webhooksCount || 0,
        activites_suspectes: account.suspiciousActivitiesCount || 0
      },
      webhooks: {
        url: account.webhookUrl || 'Non configuré',
        actif: account.webhookActive || false,
        evenements: account.webhookEvents || [],
        dernier_envoi_reussi: account.lastWebhookSuccess || 'Jamais'
      }
    }

    return accountData
  }

  const exportToCSV = async (includeWallets: boolean, includeTransactions: boolean) => {
    let csvContent = ''

    // En-tête du compte
    csvContent += 'EXPORTATION DES DONNÉES DU COMPTE\n'
    csvContent += 'Généré le: ' + new Date().toLocaleString('fr-FR') + '\n'
    csvContent += 'Compte: ' + account.accountName + '\n\n'

    // Informations générales
    csvContent += 'INFORMATIONS GÉNÉRALES\n'
    csvContent += 'Champ,Valeur\n'
    csvContent += 'ID,' + formatSecureId(account.id) + '\n'
    csvContent += 'Nom,' + account.accountName + '\n'
    csvContent += 'Sous-nom,' + (account.accountSubName || 'Non défini') + '\n'
    csvContent += 'Mode,' + account.accountMode + '\n'
    csvContent += 'Pays,' + account.country.nameFr + '\n'
    csvContent += 'Statut,' + (account.frozen ? 'Gelé' : 'Actif') + '\n'
    csvContent += 'Date de création,' + account.createdAt + '\n'
    csvContent += 'Date de mise à jour,' + account.updatedAt + '\n\n'

    // Sécurité
    csvContent += 'SÉCURITÉ\n'
    csvContent += 'Champ,Valeur\n'
    csvContent += 'Clé publique,' + maskSensitiveKey(account.publicKey, 20) + '\n'
    csvContent += 'Authentification 2FA,' + (account.twoFactorEnabled ? 'Activée' : 'Désactivée') + '\n'
    csvContent += 'Dernier accès,' + (account.lastLogin || 'Jamais') + '\n\n'

    // Statistiques
    csvContent += 'STATISTIQUES\n'
    csvContent += 'Type,Valeur\n'
    csvContent += 'Wallets,' + (account.walletsCount || 0) + '\n'
    csvContent += 'Transactions,' + (account.transactionsCount || 0) + '\n'
    csvContent += 'Méthodes de paiement,' + (account.accountPaymentMethodsCount || 0) + '\n'
    csvContent += 'Webhooks,' + (account.webhooksCount || 0) + '\n'
    csvContent += 'Activités suspectes,' + (account.suspiciousActivitiesCount || 0) + '\n\n'

    // Webhooks
    csvContent += 'WEBHOOKS\n'
    csvContent += 'URL,Statut\n'
    csvContent += (account.webhookUrl || 'Non configuré') + ',' + (account.webhookActive ? 'Actif' : 'Inactif') + '\n'

    return csvContent
  }

  const exportToJSON = async (includeWallets: boolean, includeTransactions: boolean) => {
    const data = prepareAccountData()
    
    // Ajouter les wallets si demandé
    if (includeWallets) {
      try {
        const wallets = await WalletService.getWalletsByAccountId(account.id)
        data.wallets = wallets.map((w: any) => ({
          id: formatSecureId(w.id),
          nom: w.refName || w.account.accountName,
          devise: w.currency.code,
          solde_total: w.balance.totalBalance,
          solde_disponible: w.balance.balance,
          statut: w.frozen ? 'Gelé' : 'Actif',
          date_creation: w.createdAt
        }))
      } catch (error) {
        data.erreur_wallets = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement des wallets'
      }
    }

    // Ajouter les transactions si demandé
    if (includeTransactions) {
      try {
        const transactions = await WalletService.getTransactionsByAccountId(account.id)
        data.transactions = transactions.map((t: any) => ({
          reference: t.reference,
          type: t.type,
          montant: t.amount,
          devise: t.currency,
          statut: t.status,
          date: t.createdAt,
          description: t.description
        }))
      } catch (error) {
        data.erreur_transactions = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement des transactions'
      }
    }

    return JSON.stringify(data, null, 2)
  }

  const exportToPDF = async (includeWallets: boolean, includeTransactions: boolean) => {
    const data: ExportData = prepareAccountData()
    
    let htmlContent: string = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
          <title>Export Compte - ' + account.accountName + '</title>
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
          <p>Compte: ' + account.accountName + '</p>\n' +
          '          <p>Généré le: ' + new Date().toLocaleString('fr-FR') + '</p>'
        </div>
        
        <div class="section">
          <h2>Informations générales</h2>
          <table>
            <tr><th>Champ</th><th>Valeur</th></tr>
            <tr><td>ID</td><td>' + formatSecureId(account.id) + '</td></tr>\n' +
            '            <tr><td>Nom</td><td>' + account.accountName + '</td></tr>'
            <tr><td>Mode</td><td>' + account.accountMode + '</td></tr>\n' +
            '            <tr><td>Pays</td><td>' + account.country.nameFr + '</td></tr>\n' +
            '            <tr><td>Statut</td><td>' + (account.frozen ? 'Gelé' : 'Actif') + '</td></tr>'
          </table>
        </div>
        
        <div class="section">
          <h2>Sécurité</h2>
          <table>
            <tr><th>Champ</th><th>Valeur</th></tr>
            <tr><td>Clé publique</td><td>' + maskSensitiveKey(account.publicKey, 20) + '</td></tr>\n' +
            '            <tr><td>Authentification 2FA</td><td>' + (account.twoFactorEnabled ? 'Activée' : 'Désactivée') + '</td></tr>'
          </table>
        </div>
        
        <div class="section">
          <h2>Statistiques</h2>
          <table>
            <tr><th>Type</th><th>Valeur</th></tr>
            <tr><td>Wallets</td><td>' + (account.walletsCount || 0) + '</td></tr>\n' +
            '            <tr><td>Transactions</td><td>' + (account.transactionsCount || 0) + '</td></tr>'
          </table>
        </div>
    `

    if (includeWallets && data.wallets) {
      htmlContent += '\n        <div class="section">\n' +
        '          <h2>Wallets associés (' + data.wallets.length + ')</h2>\n' +
        '          <table>\n' +
        '            <tr><th>Nom</th><th>Devise</th><th>Solde</th><th>Statut</th></tr>\n' +
      
      (data.wallets || []).forEach((wallet: any) => {
        htmlContent += '\n            <tr>\n' +
          '              <td>' + wallet.nom + '</td>\n' +
          '              <td>' + wallet.devise + '</td>\n' +
          '              <td>' + wallet.solde_total + '</td>\n' +
          '              <td>' + wallet.statut + '</td>\n' +
          '            </tr>\n'
      })
      
      htmlContent += '\n          </table>\n' +
        '        </div>\n'
    }

    htmlContent += '\n      </body>\n' +
      '      </html>\n'

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
          content = await exportToJSON(exportOptions.includeWallets, exportOptions.includeTransactions)
          mimeType = 'application/json;charset=utf-8;'
          break
        case 'pdf':
          content = await exportToPDF(exportOptions.includeWallets, exportOptions.includeTransactions)
          mimeType = 'text/html;charset=utf-8;'
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
            Exporter les données du compte
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
                      checked={exportOptions.includeWallets}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeWallets: e.target.checked })}
                      className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Inclure les wallets associés</span>
                      <p className="text-xs text-gray-500">Exporte tous les wallets liés à ce compte</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTransactions}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeTransactions: e.target.checked })}
                      className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Inclure les transactions</span>
                      <p className="text-xs text-gray-500">Exporte l'historique des transactions du compte</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Aperçu des données */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Aperçu des données</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Informations générales du compte</p>
                  <p>• Configuration de sécurité</p>
                  <p>• Statistiques d'utilisation</p>
                  <p>• Configuration des webhooks</p>
                  {exportOptions.includeWallets && <p>• Wallets associés</p>}
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
