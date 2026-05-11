'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, ArrowDown, CreditCard, ArrowRight, CheckCircle, AlertCircle, Wallet as WalletIcon } from 'lucide-react'
import { Wallet } from '@/lib/api-config-wallet'
import { WalletService } from '@/lib/wallet-service'
import { PaymentMethodService } from '@/lib/payment-method-service'
import { PaymentMethod } from '@/lib/api-config-wallet'

interface WithdrawFormProps {
  wallet: Wallet
  onSubmit: (data: WithdrawData) => void
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

interface WithdrawData {
  amount: number
  paymentMethodId: string
  reason?: string
  reference?: string
}

// Composant PaymentMethodSelect personnalisé
interface PaymentMethodSelectProps {
  paymentMethods: PaymentMethod[]
  selectedPaymentMethodId: string
  onPaymentMethodSelect: (paymentMethodId: string) => void
  loading?: boolean
  error?: string | null
  disabled?: boolean
}

function PaymentMethodSelect({ 
  paymentMethods, 
  selectedPaymentMethodId, 
  onPaymentMethodSelect, 
  loading = false, 
  error = null, 
  disabled = false 
}: PaymentMethodSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Trouver la méthode de paiement sélectionnée
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId)

  // Filtrer les méthodes de paiement
  const filteredPaymentMethods = React.useMemo(() => {
    if (!searchQuery) return paymentMethods
    
    const query = searchQuery.toLowerCase()
    return paymentMethods.filter(method => {
      const name = method.name.toLowerCase()
      const type = (method as any).paymentMethodType?.toLowerCase() || method.technicalName?.toLowerCase() || method.name?.toLowerCase() || ''
      
      return name.includes(query) || type.includes(query)
    })
  }, [paymentMethods, searchQuery])

  // Gérer le clic en dehors du dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (paymentMethod: PaymentMethod) => {
    onPaymentMethodSelect(paymentMethod.id)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onPaymentMethodSelect("")
    setSearchQuery("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Champ de sélection */}
      <div className="relative">
        <div
          className={`
            w-full px-4 py-3 pr-10 border rounded-xl cursor-pointer
            flex items-center justify-between
            ${disabled ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'bg-white border-gray-300 hover:border-[#8A56B2]'}
            ${error ? 'border-red-500' : ''}
            ${isOpen ? 'ring-2 ring-[#8A56B2] border-[#8A56B2]' : ''}
            transition-colors duration-200
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={selectedPaymentMethod ? 'text-gray-900' : 'text-gray-500'}>
            {selectedPaymentMethod ? selectedPaymentMethod.name : 'Sélectionner une méthode de retrait...'}
          </span>
          <div className="flex items-center space-x-2">
            {selectedPaymentMethod && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#8A56B2] border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-hidden">
          {/* Champ de recherche */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Rechercher une méthode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]"
              autoFocus
            />
          </div>

          {/* Liste des options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredPaymentMethods.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchQuery ? 'Aucune méthode trouvée' : 'Aucune méthode disponible'}
              </div>
            ) : (
              filteredPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors duration-150
                    ${method.id === selectedPaymentMethodId ? 'bg-[#8A56B2] text-white' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => handleSelect(method)}
                >
                  <div className="font-medium flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {method.name}
                  </div>
                  <div className={`text-sm ${method.id === selectedPaymentMethodId ? 'text-gray-200' : 'text-gray-500'}`}>
                    {(method as any).paymentMethodType || method.technicalName || method.name}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}

export default function WithdrawForm({ wallet, onSubmit, onCancel, loading, error }: WithdrawFormProps) {
  const [formData, setFormData] = useState<WithdrawData>({
    amount: 0,
    paymentMethodId: '',
    reason: '',
    reference: ''
  })

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false)
  const [paymentMethodsError, setPaymentMethodsError] = useState<string | null>(null)

  // Charger les méthodes de paiement au montage du composant
  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setPaymentMethodsLoading(true)
      setPaymentMethodsError(null)
      const methodsData = await PaymentMethodService.getPaymentMethods()
      setPaymentMethods(methodsData)
    } catch (err) {
      console.error('Erreur lors du chargement des méthodes de paiement:', err)
      setPaymentMethodsError('Impossible de charger les méthodes de paiement')
    } finally {
      setPaymentMethodsLoading(false)
    }
  }

  const calculateFees = () => {
    const fee = formData.amount * (wallet.withdrawalFeeRate / 100)
    return {
      amount: formData.amount,
      fees: fee,
      total: formData.amount - fee
    }
  }

  const validateWithdrawal = () => {
    if (formData.amount <= 0) return false
    if (formData.amount > wallet.balance.balance) return false
    if (formData.amount > wallet.maxTransactionAmount) return false
    if (!formData.paymentMethodId) return false
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateWithdrawal()) return
    setShowConfirmation(true)
  }

  const confirmWithdrawal = () => {
    onSubmit(formData)
  }

  const fees = calculateFees()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Retrait depuis {wallet.account?.accountName || 'Wallet'}</h2>
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
                Montant à retirer ({wallet.currency.code})
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 outline-none text-lg"
                  placeholder="0.00"
                  min="0"
                  max={wallet.balance.balance}
                  step="0.01"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {wallet.currency.code}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Solde disponible: {WalletService.formatAmount(wallet.balance.balance, wallet.currency.code)}
              </p>
              {formData.amount > wallet.balance.balance && (
                <p className="text-xs text-red-600 mt-1">Montant supérieur au solde disponible</p>
              )}
              {formData.amount > wallet.maxTransactionAmount && (
                <p className="text-xs text-red-600 mt-1">
                  Montant supérieur à la limite maximale ({WalletService.formatAmount(wallet.maxTransactionAmount, wallet.currency.code)})
                </p>
              )}
            </div>

            {/* Méthode de retrait */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de retrait
              </label>
              <PaymentMethodSelect
                paymentMethods={paymentMethods}
                selectedPaymentMethodId={formData.paymentMethodId}
                onPaymentMethodSelect={(paymentMethodId) => setFormData({ ...formData, paymentMethodId })}
                loading={paymentMethodsLoading}
                error={paymentMethodsError}
                disabled={loading}
              />
            </div>

            {/* Motif */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif (optionnel)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 outline-none"
                placeholder="Raison du retrait..."
              />
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
                  <span className="text-amber-600">Frais ({wallet.withdrawalFeeRate}%):</span>
                  <span className="font-medium text-amber-700">{WalletService.formatAmount(fees.fees, wallet.currency.code)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                  <span>Net à recevoir:</span>
                  <span className="text-[#8A56B2]">{WalletService.formatAmount(fees.total, wallet.currency.code)}</span>
                </div>
              </div>
            )}

            {/* Avertissement */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Informations importantes</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Les retraits peuvent prendre jusqu'à 24h pour être traités. Des frais de {wallet.withdrawalFeeRate}% seront appliqués.
                  </p>
                </div>
              </div>
            </div>

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
                disabled={!validateWithdrawal() || loading}
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDown className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer le retrait</h3>
              <p className="text-gray-600">Vérifiez les informations avant de confirmer</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">De:</span>
                <span className="font-medium">{wallet.account?.accountName || 'Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Méthode:</span>
                <span className="font-medium">
                  {paymentMethods.find(pm => pm.id === formData.paymentMethodId)?.name || 'Méthode inconnue'}
                </span>
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
                <span>Net à recevoir:</span>
                <span className="text-[#8A56B2]">{WalletService.formatAmount(fees.total, wallet.currency.code)}</span>
              </div>
              {formData.reason && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Motif:</span>
                  <span className="font-medium">{formData.reason}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={confirmWithdrawal}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    Confirmer le retrait
                    <ArrowDown className="w-4 h-4" />
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
