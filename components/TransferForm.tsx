'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Wallet as WalletIcon, Mail, Phone, ArrowRight, CheckCircle, Search } from 'lucide-react'
import { Wallet } from '@/lib/api-config-wallet'
import { WalletService } from '@/lib/wallet-service'
import { formatSecureId, maskSensitiveKey } from '@/lib/crypto-utils'
import SearchableSelect from '@/components/SearchableSelect'

// Composant WalletSelect personnalisé
interface WalletSelectProps {
  wallets: Wallet[]
  selectedWalletId: string
  onWalletSelect: (walletId: string) => void
  loading?: boolean
  error?: string | null
  disabled?: boolean
}

function WalletSelect({ wallets, selectedWalletId, onWalletSelect, loading = false, error = null, disabled = false }: WalletSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Trouver le wallet sélectionné
  const selectedWallet = wallets.find(w => w.id === selectedWalletId)

  // Filtrer les wallets
  const filteredWallets = React.useMemo(() => {
    if (!searchQuery) return wallets
    
    const query = searchQuery.toLowerCase()
    return wallets.filter(wallet => {
      const name = (wallet.refName || wallet.account.accountName || `Wallet ${wallet.currency.code}`).toLowerCase()
      const currencyCode = wallet.currency.code.toLowerCase()
      const currencyName = wallet.currency.nameFr.toLowerCase()
      const accountName = wallet.account.accountName.toLowerCase()
      
      return name.includes(query) || 
             currencyCode.includes(query) || 
             currencyName.includes(query) || 
             accountName.includes(query)
    })
  }, [wallets, searchQuery])

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

  const handleSelect = (wallet: Wallet) => {
    onWalletSelect(wallet.id)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    onWalletSelect("")
    setSearchQuery("")
  }

  const getWalletName = (wallet: Wallet): string => {
    const name = wallet.refName || wallet.account.accountName || `Wallet ${wallet.currency.code}`
    return name
  }

  const getSecureWalletInfo = (wallet: Wallet): { name: string; id: string } => {
    return {
      name: getWalletName(wallet),
      id: formatSecureId(wallet.id)
    }
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
          <span className={selectedWallet ? 'text-gray-900' : 'text-gray-500'}>
            {selectedWallet ? getWalletName(selectedWallet) : 'Sélectionner un wallet destinataire...'}
          </span>
          <div className="flex items-center space-x-2">
            {selectedWallet && !disabled && (
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
              placeholder="Rechercher un wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2]"
              autoFocus
            />
          </div>

          {/* Liste des options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredWallets.length === 0 ? (
              <div className="px-3 py-4 text-center text-gray-500">
                {searchQuery ? 'Aucun wallet trouvé' : 'Aucun wallet disponible'}
              </div>
            ) : (
              filteredWallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors duration-150
                    ${wallet.id === selectedWalletId ? 'bg-[#8A56B2] text-white' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => handleSelect(wallet)}
                >
                  <div className="font-medium">
                    {getSecureWalletInfo(wallet).name}
                  </div>
                  <div className={`text-sm flex items-center justify-between ${wallet.id === selectedWalletId ? 'text-gray-200' : 'text-gray-500'}`}>
                    <span>{getSecureWalletInfo(wallet).id}</span>
                    <span>{wallet.currency.code}</span>
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

interface TransferFormProps {
  wallet: Wallet
  onSubmit: (data: TransferData) => void
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

interface TransferData {
  amount: number
  recipientType: 'wallet' | 'email' | 'phone'
  recipient: string
  reason?: string
  reference?: string
}

export default function TransferForm({ wallet, onSubmit, onCancel, loading, error }: TransferFormProps) {
  const [formData, setFormData] = useState<TransferData>({
    amount: 0,
    recipientType: 'wallet',
    recipient: '',
    reason: '',
    reference: ''
  })

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [walletsLoading, setWalletsLoading] = useState(false)
  const [walletsError, setWalletsError] = useState<string | null>(null)

  // Fonction utilitaire pour obtenir le nom d'un wallet
  const getWalletName = (wallet: Wallet): string => {
    return wallet.refName || wallet.account.accountName || `Wallet ${wallet.currency.code}`
  }

  // Fonction pour filtrer les wallets selon plusieurs critères
  const filterWallets = (wallets: Wallet[], searchQuery: string): Wallet[] => {
    if (!searchQuery) return wallets
    
    const query = searchQuery.toLowerCase()
    return wallets.filter(wallet => {
      const name = getWalletName(wallet).toLowerCase()
      const currencyCode = wallet.currency.code.toLowerCase()
      const currencyName = wallet.currency.nameFr.toLowerCase()
      const accountName = wallet.account.accountName.toLowerCase()
      
      return name.includes(query) || 
             currencyCode.includes(query) || 
             currencyName.includes(query) || 
             accountName.includes(query)
    })
  }

  // Charger les wallets au montage du composant
  useEffect(() => {
    loadWallets()
  }, [])

  const loadWallets = async () => {
    try {
      setWalletsLoading(true)
      setWalletsError(null)
      const walletsData = await WalletService.getWallets()
      setWallets(walletsData)
    } catch (err) {
      console.error('Erreur lors du chargement des wallets:', err)
      setWalletsError('Impossible de charger les wallets')
    } finally {
      setWalletsLoading(false)
    }
  }

  const calculateFees = () => {
    const fee = formData.amount * 0.02 // 2% de frais de transfert
    return {
      amount: formData.amount,
      fees: fee,
      total: formData.amount + fee
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount <= 0) return
    if (!formData.recipient) return
    setShowConfirmation(true)
  }

  const confirmTransfer = () => {
    onSubmit(formData)
  }

  const filteredWallets = wallets.filter(w => w.id !== wallet.id)

  const fees = calculateFees()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transfert depuis {wallet.account?.accountName || 'Wallet'}</h2>
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
                Montant à transférer ({wallet.currency.code})
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
              <p className="text-xs text-gray-500 mt-1">
                Solde disponible: {WalletService.formatAmount(wallet.balance.balance, wallet.currency.code)}
              </p>
            </div>

            {/* Type de destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de destinataire
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, recipientType: 'wallet' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.recipientType === 'wallet'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <WalletIcon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, recipientType: 'email' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.recipientType === 'email'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Mail className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, recipientType: 'phone' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.recipientType === 'phone'
                      ? 'border-[#8A56B2] bg-[#8A56B2]/10 text-[#8A56B2]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Phone className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">Téléphone</span>
                </button>
              </div>
            </div>

            {/* Destinataire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.recipientType === 'wallet' ? 'Wallet destinataire' : 
                 formData.recipientType === 'email' ? 'Email du destinataire' : 'Téléphone du destinataire'}
              </label>
              {formData.recipientType === 'wallet' ? (
                <WalletSelect
                  wallets={filteredWallets}
                  selectedWalletId={formData.recipient}
                  onWalletSelect={(walletId) => setFormData({ ...formData, recipient: walletId })}
                  loading={walletsLoading}
                  error={walletsError}
                  disabled={loading}
                />
              ) : (
                <input
                  type={formData.recipientType === 'email' ? 'email' : 'tel'}
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 outline-none"
                  placeholder={formData.recipientType === 'email' ? 'email@exemple.com' : '+237 XXX XXX XXX'}
                  required
                />
              )}
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
                placeholder="Raison du transfert..."
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
                  <span className="text-amber-600">Frais (2%):</span>
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
                disabled={formData.amount <= 0 || !formData.recipient || loading}
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
                <Send className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer le transfert</h3>
              <p className="text-gray-600">Vérifiez les informations avant de confirmer</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">De:</span>
                <span className="font-medium">{wallet.account?.accountName || 'Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vers:</span>
                <span className="font-medium">
                  {formData.recipientType === 'wallet' ? `Wallet ${formData.recipient}` : formData.recipient}
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
                <span>Total à transférer:</span>
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
                onClick={confirmTransfer}
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
                    Confirmer le transfert
                    <Send className="w-4 h-4" />
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
