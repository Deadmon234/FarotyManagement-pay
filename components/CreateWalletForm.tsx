'use client'

import React, { useState } from 'react'
import { WalletService } from '@/lib/wallet-service'
import { X, Plus, CreditCard, Globe, AlertCircle, CheckCircle, Users } from 'lucide-react'

interface CreateWalletFormProps {
  accountId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateWalletForm({ accountId, isOpen, onClose, onSuccess }: CreateWalletFormProps) {
  const [formData, setFormData] = useState({
    walletType: 'PERSONAL' as 'PERSONAL' | 'BUSINESS',
    currency: '',
    refName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const currencies = [
    { code: 'XOF', nameFr: 'Franc CFA', symbol: 'FCFA' },
    { code: 'EUR', nameFr: 'Euro', symbol: '€' },
    { code: 'USD', nameFr: 'Dollar Américain', symbol: '$' },
    { code: 'GBP', nameFr: 'Livre Sterling', symbol: '£' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // Validation
      if (!formData.walletType) {
        throw new Error('Le type de wallet est requis')
      }
      
      if (!formData.currency) {
        throw new Error('La devise est requise')
      }
      
      if (!formData.refName.trim()) {
        throw new Error('Le nom de référence est requis')
      }
      
      // Simuler l'appel API pour créer le wallet
      const walletData = {
        ...formData,
        accountId: accountId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 1500)
      
    } catch (err) {
      console.error('Erreur lors de la création du wallet:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      walletType: 'PERSONAL',
      currency: '',
      refName: ''
    })
    setError(null)
    setSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#8A56B2]" />
            Créer un wallet
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet créé avec succès</h3>
              <p className="text-gray-600">Le wallet a été créé et associé à votre compte.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type de wallet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de wallet
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, walletType: 'PERSONAL' })}
                    className={`p-3 border rounded-lg transition-colors ${
                      formData.walletType === 'PERSONAL'
                        ? 'border-[#8A56B2] bg-[#8A56B2] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto" />
                    <span className="text-sm font-medium">Personnel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, walletType: 'BUSINESS' })}
                    className={`p-3 border rounded-lg transition-colors ${
                      formData.walletType === 'BUSINESS'
                        ? 'border-[#8A56B2] bg-[#8A56B2] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto" />
                    <span className="text-sm font-medium">Professionnel</span>
                  </button>
                </div>
              </div>

              {/* Devise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                  required
                >
                  <option value="">Sélectionner une devise</option>
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.nameFr} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom de référence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de référence
                </label>
                <input
                  type="text"
                  value={formData.refName}
                  onChange={(e) => setFormData({ ...formData, refName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
                  placeholder="Nom optionnel pour identifier ce wallet"
                />
              </div>

              {/* Informations du compte associé */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ce wallet sera associé au compte actuel</span>
                </div>
                <p className="text-xs text-blue-700">
                  Le wallet sera automatiquement lié au compte que vous consultez actuellement.
                </p>
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
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Créer le wallet
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
