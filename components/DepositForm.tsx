'use client'

import React, { useState } from 'react'
import { X, CreditCard, Building2, Smartphone, ArrowRight, CheckCircle } from 'lucide-react'
import { Wallet } from '@/lib/api-config-wallet'
import { WalletService } from '@/lib/wallet-service'

interface DepositFormProps {
  wallet: Wallet
  onSubmit: (data: DepositData) => void
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

interface DepositData {
  amount: number
  source: 'card' | 'bank' | 'mobile'
  paymentMethodId?: string
  reference?: string
}

export default function DepositForm({ wallet, onSubmit, onCancel, loading, error }: DepositFormProps) {
  const [formData, setFormData] = useState<DepositData>({
    amount: 0,
    source: 'card',
    reference: ''
  })

  const [showConfirmation, setShowConfirmation] = useState(false)

  const calculateFees = () => {
    const fee = formData.amount * (wallet.depositFeeRate / 100)
    return {
      amount: formData.amount,
      fees: fee,
      total: formData.amount + fee
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount <= 0) return
    setShowConfirmation(true)
  }

  const confirmDeposit = () => {
    onSubmit(formData)
  }

  const fees = calculateFees()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Dépôt sur {wallet.account?.accountName || 'Wallet'}</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        {!showConfirmation ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant à déposer ({wallet.currency.code})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 outline-none text-lg"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {wallet.currency.code}
                </span>
              </div>
            </div>

            {/* Source de fonds */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Source de fonds
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, source: 'card' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.source === 'card'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Carte</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, source: 'bank' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.source === 'bank'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Banque</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, source: 'mobile' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.source === 'mobile'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Smartphone className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Mobile</span>
                </button>
              </div>
            </div>

            {/* Référence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence (optionnel)
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 outline-none"
                placeholder="Numéro de référence..."
              />
            </div>

            {/* Affichage des frais */}
            {formData.amount > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-medium">{WalletService.formatAmount(fees.amount, wallet.currency.code)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600">Frais ({wallet.depositFeeRate}%):</span>
                  <span className="font-medium text-amber-700">{WalletService.formatAmount(fees.fees, wallet.currency.code)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-[#8A56B2]">{WalletService.formatAmount(fees.total, wallet.currency.code)}</span>
                </div>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={formData.amount <= 0 || loading}
                className="flex-1 bg-[#8A56B2] text-white px-4 py-3 rounded-xl hover:bg-[#7a48a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Confirmation */
          <div className="p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer le dépôt</h3>
              <p className="text-gray-600">Vérifiez les informations avant de confirmer</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Wallet:</span>
                <span className="font-medium">{wallet.account?.accountName || 'Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Montant:</span>
                <span className="font-medium">{WalletService.formatAmount(fees.amount, wallet.currency.code)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frais:</span>
                <span className="font-medium">{WalletService.formatAmount(fees.fees, wallet.currency.code)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                <span>Total à déposer:</span>
                <span className="text-[#8A56B2]">{WalletService.formatAmount(fees.total, wallet.currency.code)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={confirmDeposit}
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Confirmer le dépôt
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
