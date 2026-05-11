'use client'

import React, { useState } from 'react'
import { AccountService } from '@/lib/account-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
// import EditAccountModal from '@/components/EditAccountModal'
// import ExportAccountModal from '@/components/ExportAccountModal'
import { 
  Settings, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertCircle, 
  Shield, 
  Globe, 
  Clock,
  DollarSign,
  Activity,
  Info,
  Edit,
  Lock,
  Unlock,
  Download,
  Webhook,
  Key
} from 'lucide-react'
import EditAccountModal from './EditAccountModal'
import ExportAccountModal from './ExportAccountModal'

interface AccountSettingsProps {
  account: any
}

export default function AccountSettings({ account }: AccountSettingsProps) {
  const [editModal, setEditModal] = useState<{ section: 'basic' | 'security' | 'webhooks'; isOpen: boolean }>({
    section: 'basic',
    isOpen: false
  })
  const [exportModal, setExportModal] = useState(false)

  const handleEdit = (section: 'basic' | 'security' | 'webhooks') => {
    setEditModal({ section, isOpen: true })
  }

  const handleCloseModal = () => {
    setEditModal({ section: 'basic', isOpen: false })
  }

  const handleSave = (updatedData: any) => {
    // Mettre à jour le compte avec les nouvelles données
    // En production, ceci appellerait une API pour sauvegarder
    console.log('Account updated:', updatedData)
  }

  const getStatusColor = (account: any) => {
    if (account.frozen) return 'red'
    return 'green'
  }

  const getStatusText = (account: any) => {
    if (account.frozen) return 'Gelé'
    return 'Actif'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const BasicInfoSection = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          Informations générales
        </h3>
        <button
          onClick={() => handleEdit('basic')}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Identifiant unique</p>
            <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border border-gray-200">
              {formatSecureId(account.id)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Nom du compte</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{account.accountName}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Sous-nom</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{account.accountSubName || 'Non défini'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Mode du compte</p>
            <div className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
              account.accountMode === 'LIVE' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {account.accountMode}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Statut</p>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              account.frozen 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              {account.frozen ? (
                <Lock className="w-4 h-4 text-red-600" />
              ) : (
                <Unlock className="w-4 h-4 text-green-600" />
              )}
              <span className={`font-medium ${
                account.frozen ? 'text-red-700' : 'text-green-700'
              }`}>
                {getStatusText(account)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Pays</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="font-medium">{account.country.nameFr} ({account.country.code})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const SecuritySection = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          Sécurité
        </h3>
        <button
          onClick={() => handleEdit('security')}
          className="text-green-600 hover:text-green-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clé publique</p>
              <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200 truncate">
                {maskSensitiveKey(account.publicKey, 20)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Type de cryptage</p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                RSA-2048
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Authentification à 2 facteurs</p>
              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                account.twoFactorEnabled 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {account.twoFactorEnabled ? 'Activé' : 'Désactivé'}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Dernière connexion</p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                {account.lastLogin ? formatDate(account.lastLogin) : 'Jamais'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Clés API</span>
            </div>
            <p className="text-xs text-gray-500">
              {account.apiKeysCount || 0} clé(s) active(s)
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Webhook className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Webhooks</span>
            </div>
            <p className="text-xs text-gray-500">
              {account.webhooksCount || 0} webhook(s) configuré(s)
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const StatisticsSection = () => (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Statistiques
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Wallets</p>
          <p className="text-2xl font-bold text-purple-600">{account.walletsCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-blue-600">{account.transactionsCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Méthodes de paiement</p>
          <p className="text-2xl font-bold text-green-600">{account.accountPaymentMethodsCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-xs text-gray-600 mb-1">Activités suspectes</p>
          <p className="text-2xl font-bold text-red-600">{account.suspiciousActivitiesCount || 0}</p>
        </div>
      </div>
    </div>
  )

  const WebhooksSection = () => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-amber-600" />
          Webhooks
        </h3>
        <button
          onClick={() => handleEdit('webhooks')}
          className="text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">URL du webhook principal</p>
              <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200 truncate">
                {account.webhookUrl || 'Non configuré'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Statut du webhook</p>
              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                account.webhookActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {account.webhookActive ? 'Actif' : 'Inactif'}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Événements configurés</p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                {account.webhookEvents?.join(', ') || 'Aucun'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Dernier envoi réussi</p>
              <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                {account.lastWebhookSuccess ? formatDate(account.lastWebhookSuccess) : 'Jamais'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Configuration des webhooks</p>
              <p className="text-xs mt-1">
                Les webhooks permettent de recevoir des notifications en temps réel sur les événements de votre compte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Paramètres du compte
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportModal(true)}
            className="px-4 py-2 bg-[#8A56B2] text-white rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            account.frozen 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {getStatusText(account)}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <BasicInfoSection />
        <SecuritySection />
        <StatisticsSection />
        <WebhooksSection />
      </div>

      {/* Modal d'édition */}
      <EditAccountModal
        account={account}
        section={editModal.section}
        isOpen={editModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Modal d'exportation */}
      <ExportAccountModal
        account={account}
        isOpen={exportModal}
        onClose={() => setExportModal(false)}
      />
    </div>
  )
}
