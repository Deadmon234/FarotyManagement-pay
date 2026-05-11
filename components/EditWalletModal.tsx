'use client'

import React, { useState } from 'react'
import { Wallet } from '@/lib/api-config-wallet'
import { WalletService } from '@/lib/wallet-service'
import { X, Save, AlertCircle, CheckCircle, Settings, DollarSign, Shield } from 'lucide-react'

interface EditWalletModalProps {
  wallet: Wallet
  section: 'basic' | 'fees' | 'limits'
  isOpen: boolean
  onClose: () => void
  onSave: (updatedWallet: Partial<Wallet>) => void
}

export default function EditWalletModal({ wallet, section, isOpen, onClose, onSave }: EditWalletModalProps) {
  const [formData, setFormData] = useState<Partial<Wallet>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialiser les données du formulaire selon la section
  React.useEffect(() => {
    if (isOpen) {
      switch (section) {
        case 'basic':
          setFormData({
            refName: wallet.refName || ''
          })
          break
        case 'fees':
          setFormData({
            depositFeeRate: wallet.depositFeeRate,
            withdrawalFeeRate: wallet.withdrawalFeeRate
          })
          break
        case 'limits':
          setFormData({
            maxTransactionAmount: wallet.maxTransactionAmount
          })
          break
      }
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, section, wallet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // Validation selon la section
      if (section === 'fees') {
        if (formData.depositFeeRate! < 0 || formData.depositFeeRate! > 100) {
          throw new Error('Le taux de frais de dépôt doit être entre 0 et 100%')
        }
        if (formData.withdrawalFeeRate! < 0 || formData.withdrawalFeeRate! > 100) {
          throw new Error('Le taux de frais de retrait doit être entre 0 et 100%')
        }
      }
      
      if (section === 'limits') {
        if (formData.maxTransactionAmount! <= 0) {
          throw new Error('La limite maximale doit être supérieure à 0')
        }
      }
      
      // Simuler l'appel API pour la mise à jour
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onSave(formData)
      setSuccess(true)
      
      // Fermer le modal après succès
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfoForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de référence
        </label>
        <input
          type="text"
          value={formData.refName || ''}
          onChange={(e) => setFormData({ ...formData, refName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          placeholder="Nom personnalisé pour ce wallet"
        />
        <p className="text-xs text-gray-500 mt-1">
          Ce nom sera utilisé pour identifier facilement ce wallet
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Informations non modifiables</p>
            <p className="text-xs mt-1">
              Le type de wallet, la devise et l'identifiant légal ne peuvent pas être modifiés pour des raisons de sécurité.
            </p>
          </div>
        </div>
      </div>
    </form>
  )

  const renderFeesForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frais de dépôt (%)
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.depositFeeRate || ''}
            onChange={(e) => setFormData({ ...formData, depositFeeRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
            min="0"
            max="100"
            step="0.1"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Appliqué sur tous les dépôts entrants
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Frais de retrait (%)
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.withdrawalFeeRate || ''}
            onChange={(e) => setFormData({ ...formData, withdrawalFeeRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
            min="0"
            max="100"
            step="0.1"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Appliqué sur tous les retraits sortants
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Frais actuels</p>
          <p className="font-semibold text-gray-900">{wallet.depositFeeRate}% / {wallet.withdrawalFeeRate}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Nouveaux frais</p>
          <p className="font-semibold text-green-600">{formData.depositFeeRate}% / {formData.withdrawalFeeRate}%</p>
        </div>
      </div>
    </form>
  )

  const renderLimitsForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Limite maximale par transaction ({wallet.currency.code})
        </label>
        <input
          type="number"
          value={formData.maxTransactionAmount || ''}
          onChange={(e) => setFormData({ ...formData, maxTransactionAmount: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          min="0"
          step="0.01"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Montant maximum autorisé pour une seule transaction
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Limite actuelle</p>
          <p className="font-semibold text-gray-900">
            {WalletService.formatAmount(wallet.maxTransactionAmount, wallet.currency.code)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Nouvelle limite</p>
          <p className="font-semibold text-green-600">
            {WalletService.formatAmount(formData.maxTransactionAmount || 0, wallet.currency.code)}
          </p>
        </div>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Attention</p>
            <p className="text-xs mt-1">
              La modification de cette limite affectera immédiatement toutes les nouvelles transactions.
            </p>
          </div>
        </div>
      </div>
    </form>
  )

  const getSectionTitle = () => {
    switch (section) {
      case 'basic':
        return 'Modifier les informations générales'
      case 'fees':
        return 'Modifier les frais'
      case 'limits':
        return 'Modifier les limites'
      default:
        return 'Modifier'
    }
  }

  const getSectionIcon = () => {
    switch (section) {
      case 'basic':
        return <Settings className="w-5 h-5" />
      case 'fees':
        return <DollarSign className="w-5 h-5" />
      case 'limits':
        return <Shield className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {getSectionIcon()}
            {getSectionTitle()}
          </h2>
          <button
            onClick={onClose}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Modifications enregistrées</h3>
              <p className="text-gray-600">Les informations ont été mises à jour avec succès.</p>
            </div>
          ) : (
            <>
              {section === 'basic' && renderBasicInfoForm()}
              {section === 'fees' && renderFeesForm()}
              {section === 'limits' && renderLimitsForm()}
              
              {/* Erreur */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

