'use client'

import React, { useState } from 'react'
import { Wallet } from '@/lib/api-config-wallet'
import { WalletService } from '@/lib/wallet-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
import EditWalletModal from '@/components/EditWalletModal'
import ExportModal from '@/components/ExportModal'
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
  Download
} from 'lucide-react'

interface WalletSettingsProps {
  wallet: Wallet
}

export default function WalletSettings({ wallet }: WalletSettingsProps) {
  const [editModal, setEditModal] = useState<{ section: 'basic' | 'fees' | 'limits'; isOpen: boolean }>({
    section: 'basic',
    isOpen: false
  })
  const [exportModal, setExportModal] = useState(false)

  const handleEdit = (section: 'basic' | 'fees' | 'limits') => {
    setEditModal({ section, isOpen: true })
  }

  const handleCloseModal = () => {
    setEditModal({ section: 'basic', isOpen: false })
  }

  const handleSave = (updatedData: Partial<Wallet>) => {
    // Mettre à jour le wallet avec les nouvelles données
    // En production, ceci appellerait une API pour sauvegarder
    console.log('Wallet updated:', updatedData)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
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
              {formatSecureId(wallet.id)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Type de wallet</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{wallet.walletType}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Devise</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Globe className="w-4 h-4 text-green-600" />
              <span className="font-medium">{wallet.currency.nameFr} ({wallet.currency.code})</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-1">Statut</p>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              wallet.frozen 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              {wallet.frozen ? (
                <Lock className="w-4 h-4 text-red-600" />
              ) : (
                <Unlock className="w-4 h-4 text-green-600" />
              )}
              <span className={`font-medium ${
                wallet.frozen ? 'text-red-700' : 'text-green-700'
              }`}>
                {getStatusText(wallet)}
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Date de création</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="font-medium">{formatDate(wallet.createdAt)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Dernière mise à jour</p>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
              <Activity className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{formatDate(wallet.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {wallet.frozen && wallet.frozenReason && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Raison du gel</p>
              <p className="text-sm text-red-600">{wallet.frozenReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const AccountSection = () => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Compte associé
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nom du compte</p>
              <p className="font-medium text-gray-900">{wallet.account.accountName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">Sous-nom</p>
              <p className="font-medium text-gray-900">
                {wallet.account.accountSubName || 'Non défini'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Mode</p>
              <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                wallet.account.accountMode === 'LIVE' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {wallet.account.accountMode}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Pays</p>
              <p className="font-medium text-gray-900">
                {wallet.account.country.nameFr} ({wallet.account.country.code})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-600 mb-1">Clé publique</p>
            <p className="font-mono text-xs text-gray-900 truncate">{maskSensitiveKey(wallet.account.publicKey, 16)}</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
            <p className="text-xs text-gray-600 mb-1">Statut</p>
            <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              wallet.account.frozen 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {wallet.account.frozen ? 'Gelé' : 'Actif'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const FeesSection = () => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600" />
          Configuration des frais
        </h3>
        <button
          onClick={() => handleEdit('fees')}
          className="text-amber-600 hover:text-amber-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Frais de dépôt</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{wallet.depositFeeRate}%</span>
          </div>
          <p className="text-xs text-gray-500">Appliqué sur tous les dépôts</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Frais de retrait</span>
            </div>
            <span className="text-2xl font-bold text-red-600">{wallet.withdrawalFeeRate}%</span>
          </div>
          <p className="text-xs text-gray-500">Appliqué sur tous les retraits</p>
        </div>
      </div>
    </div>
  )

  const LimitsSection = () => (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Limites et restrictions
        </h3>
        <button
          onClick={() => handleEdit('limits')}
          className="text-purple-600 hover:text-purple-700 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Limite maximale par transaction</span>
            </div>
            <span className="text-xl font-bold text-blue-600">
              {formatAmount(wallet.maxTransactionAmount, wallet.currency.code)}
            </span>
          </div>
          <p className="text-xs text-gray-500">Montant maximum autorisé pour une seule transaction</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Pays de rattachement</span>
          </div>
          <p className="text-xs text-gray-500">
            {wallet.account.country.nameFr} ({wallet.account.country.code})
          </p>
        </div>
      </div>
    </div>
  )

  const LegalSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600" />
          Informations légales
        </h3>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Identifiant légal</p>
            <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {formatSecureId(wallet.legalIdentifier)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">ID de référence</p>
            <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {wallet.refId ? formatSecureId(wallet.refId) : 'Non défini'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nom de référence</p>
            <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {wallet.refName || 'Non défini'}
            </p>
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
          Paramètres du wallet
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
            wallet.frozen 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {getStatusText(wallet)}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <BasicInfoSection />
        <AccountSection />
        <FeesSection />
        <LimitsSection />
        <LegalSection />
      </div>

      {/* Modal d'édition */}
      <EditWalletModal
        wallet={wallet}
        section={editModal.section}
        isOpen={editModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {/* Modal d'exportation */}
      <ExportModal
        wallet={wallet}
        isOpen={exportModal}
        onClose={() => setExportModal(false)}
      />
    </div>
  )
}
