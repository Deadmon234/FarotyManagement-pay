'use client'

import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/topnav'
import { WalletService } from '@/lib/wallet-service'
import { Wallet } from '@/lib/api-config-wallet'
import { AccountService } from '@/lib/account-service'
import { Account } from '@/lib/api-config-wallet'
import { PaymentMethodService } from '@/lib/payment-method-service'
import { PaymentMethod } from '@/lib/api-config-wallet'
import { FarotyCountryService } from '@/lib/faroty-country-service'
import { Country } from '@/lib/api-config-wallet'
import { TransactionService } from '@/lib/transaction-service'
import { Transaction } from '@/lib/api-config-wallet'
import { UserService, User } from '@/lib/user-service'
import SearchableSelect from '@/components/SearchableSelect'
import AdminTransactionTable from '@/components/AdminTransactionTable'
import { LayoutGrid, Table, Search, CreditCard, CheckCircle } from 'lucide-react'

// Fonction utilitaire pour obtenir le nom d'un wallet
const getWalletName = (wallet: Wallet): string => {
  return wallet.refName || wallet.account.accountName || 'Wallet sans nom'
}

// Composant de formulaire pour créer un wallet
function CreateWalletForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  error 
}: {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    accountId: '',
    currencyCode: 'XAF',
    walletType: 'PERSONAL' as 'PERSONAL' | 'BUSINESS',
    legalIdentifier: '5bdf3222-fea0-4938-82a1-df2955516f25',
    refId: ''
  })

  const [accounts, setAccounts] = useState<Account[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [accountsError, setAccountsError] = useState<string | null>(null)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Charger les comptes et utilisateurs au montage du composant
  useEffect(() => {
    loadAccounts()
    loadUsers()
  }, [])

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true)
      setAccountsError(null)
      const accountsData = await AccountService.getAccounts()
      setAccounts(accountsData)
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err)
      setAccountsError('Impossible de charger les comptes')
    } finally {
      setAccountsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      setUsersError(null)
      const usersData = await UserService.getUsers()
      setUsers(usersData)
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      setUsersError('Impossible de charger les utilisateurs')
    } finally {
      setUsersLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAccountChange = (accountId: string) => {
    setFormData(prev => ({
      ...prev,
      accountId
    }))
  }

  const handleUserChange = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      refId: userId
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg sm:rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[95vh] shadow-2xl animate-slideUp flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#8A56B2] to-purple-700 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between gap-3 z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Créer un Wallet</h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 truncate">Configurez un nouveau portefeuille</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-shrink-0 text-white hover:text-purple-100 transition-colors p-1.5 sm:p-2 hover:bg-white/20 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-6 sm:h-6">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Section 1: Configuration de base */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-blue-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <span>Configuration de base</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type de Wallet *
                  </label>
                  <select
                    name="walletType"
                    value={formData.walletType}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="PERSONAL">🏠 Personnel</option>
                    <option value="BUSINESS">🏢 Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Devise *
                  </label>
                  <select
                    name="currencyCode"
                    value={formData.currencyCode}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="XAF">XAF (Franc CFA)</option>
                    <option value="XOF">XOF (Franc CFA BCEAO)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar américain)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Associations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-green-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-600 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <span>Associations</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compte associé *
                  </label>
                  <SearchableSelect<Account>
                    items={accounts}
                    value={formData.accountId}
                    onChange={handleAccountChange}
                    placeholder="Sélectionner un compte..."
                    displayField="accountName"
                    valueField="id"
                    searchFields={["accountName", "accountSubName"]}
                    loading={accountsLoading}
                    error={accountsError}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Utilisateur associé *
                  </label>
                  <SearchableSelect<User>
                    items={users}
                    value={formData.refId}
                    onChange={handleUserChange}
                    placeholder="Sélectionner un utilisateur..."
                    displayField="fullName"
                    valueField="id"
                    searchFields={["fullName", "email", "phoneNumber"]}
                    loading={usersLoading}
                    error={usersError}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Informations légales */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-amber-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                <span>Informations légales</span>
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Identifiant Légal *
                </label>
                <input
                  type="text"
                  name="legalIdentifier"
                  value={formData.legalIdentifier}
                  onChange={handleChange}
                  placeholder="Numéro d'identification fiscale..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                  required
                />
                <p className="text-xs text-gray-600 mt-2">ID unique pour les fins fiscales</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 text-sm sm:text-base"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#8A56B2] to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                disabled={loading || !formData.accountId || !formData.refId}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <span>Créer le Wallet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Composant de formulaire pour créer un compte
function CreateAccountForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  error 
}: {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    userId: '',
    accountName: '',
    countryId: '',
    depositFeeRate: '1.2',
    withdrawalFeeRate: '0.0',
    accountMode: 'LIVE' as 'LIVE' | 'TEST'
  })

  const [users, setUsers] = useState<User[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [countriesLoading, setCountriesLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [countriesError, setCountriesError] = useState<string | null>(null)

  // Charger les utilisateurs et pays au montage du composant
  useEffect(() => {
    loadUsers()
    loadCountries()
  }, [])

  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      setUsersError(null)
      const usersData = await UserService.getUsers()
      setUsers(usersData)
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err)
      setUsersError('Impossible de charger les utilisateurs')
    } finally {
      setUsersLoading(false)
    }
  }

  const loadCountries = async () => {
    try {
      setCountriesLoading(true)
      setCountriesError(null)
      const countriesData = await FarotyCountryService.getCountries()
      setCountries(countriesData)
    } catch (err) {
      console.error('Erreur lors du chargement des pays:', err)
      setCountriesError('Impossible de charger les pays')
    } finally {
      setCountriesLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleUserChange = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      userId
    }))
  }

  const handleCountryChange = (countryId: string) => {
    setFormData(prev => ({
      ...prev,
      countryId
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-lg sm:rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[95vh] shadow-2xl animate-slideUp flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#8A56B2] to-purple-700 px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex items-center justify-between gap-3 z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white truncate">Créer un Compte</h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 truncate">Ajouter un nouveau compte bancaire</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-shrink-0 text-white hover:text-purple-100 transition-colors p-1.5 sm:p-2 hover:bg-white/20 rounded-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-6 sm:h-6">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Informations générales */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du compte *
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleChange}
                    placeholder="Ex: Wave PayPal"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mode du compte *
                  </label>
                  <select
                    name="accountMode"
                    value={formData.accountMode}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="LIVE">🚀 Live (Production)</option>
                    <option value="TEST">🧪 Test (Développement)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Associations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-green-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-600 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Associations
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Utilisateur associé *
                  </label>
                  <SearchableSelect<User>
                    items={users}
                    value={formData.userId}
                    onChange={handleUserChange}
                    placeholder="Sélectionner un utilisateur..."
                    displayField="fullName"
                    valueField="id"
                    searchFields={["fullName", "email", "phoneNumber"]}
                    loading={usersLoading}
                    error={usersError}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pays associé *
                  </label>
                  <SearchableSelect<Country>
                    items={countries}
                    value={formData.countryId}
                    onChange={handleCountryChange}
                    placeholder="Sélectionner un pays..."
                    displayField="nameFr"
                    valueField="id"
                    searchFields={["nameFr", "nameEn", "code"]}
                    loading={countriesLoading}
                    error={countriesError}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Frais */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-amber-100">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Configuration des frais
              </h3>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais de dépôt (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="depositFeeRate"
                      value={formData.depositFeeRate}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                      required
                    />
                    <span className="text-base sm:text-lg font-semibold text-gray-700 flex-shrink-0">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais de retrait (%) *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="withdrawalFeeRate"
                      value={formData.withdrawalFeeRate}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all text-sm sm:text-base"
                      required
                    />
                    <span className="text-base sm:text-lg font-semibold text-gray-700 flex-shrink-0">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 sm:px-6 py-2 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 text-sm sm:text-base"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#8A56B2] to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                disabled={loading || !formData.accountName || !formData.userId || !formData.countryId}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <span>Créer le Compte</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Composant de formulaire pour créer un pays
function CreateCountryForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  error 
}: {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    code: '',
    nameFr: '',
    nameEn: '',
    maxPaymentAmount: '1000000',
    paymentValidationTime: '24',
    minTransactionFeeRate: '0.5',
    isUserPaysFees: true,
    maxWithdrawalAmount: '500000',
    withdrawalValidationThreshold: '100000',
    isAutoValidateWithdrawals: false,
    withdrawalValidationTime: '24',
    withdrawalCooldown: '0'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] shadow-2xl animate-slideUp flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#8A56B2] to-purple-700 px-6 md:px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Créer un Pays</h2>
            <p className="text-purple-100 text-sm mt-1">Ajouter un nouveau pays aux opérations</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-white hover:text-purple-100 transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Informations du pays */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code du pays *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Ex: FR, CM"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all uppercase"
                    required
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Code ISO à 2 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom français *
                  </label>
                  <input
                    type="text"
                    name="nameFr"
                    value={formData.nameFr}
                    onChange={handleChange}
                    placeholder="Ex: France"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom anglais *
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    value={formData.nameEn}
                    onChange={handleChange}
                    placeholder="Ex: France"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Limites de paiement */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Configuration des paiements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant max paiement (XOF)
                  </label>
                  <input
                    type="number"
                    name="maxPaymentAmount"
                    value={formData.maxPaymentAmount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temps validation (h)
                  </label>
                  <input
                    type="number"
                    name="paymentValidationTime"
                    value={formData.paymentValidationTime}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais min transaction (%)
                  </label>
                  <input
                    type="number"
                    name="minTransactionFeeRate"
                    value={formData.minTransactionFeeRate}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Limites de retrait */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Configuration des retraits
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant max retrait (XOF)
                  </label>
                  <input
                    type="number"
                    name="maxWithdrawalAmount"
                    value={formData.maxWithdrawalAmount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seuil validation (XOF)
                  </label>
                  <input
                    type="number"
                    name="withdrawalValidationThreshold"
                    value={formData.withdrawalValidationThreshold}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Temps validation (h)
                  </label>
                  <input
                    type="number"
                    name="withdrawalValidationTime"
                    value={formData.withdrawalValidationTime}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cooldown retrait (h)
                </label>
                <input
                  type="number"
                  name="withdrawalCooldown"
                  value={formData.withdrawalCooldown}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Section 4: Options */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Options avancées
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <input
                    type="checkbox"
                    name="isUserPaysFees"
                    checked={formData.isUserPaysFees}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#8A56B2] rounded cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">L'utilisateur paie les frais</p>
                    <p className="text-xs text-gray-600">Les frais seront déductibles du montant retrait</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/50 transition-colors border-t border-purple-200">
                  <input
                    type="checkbox"
                    name="isAutoValidateWithdrawals"
                    checked={formData.isAutoValidateWithdrawals}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#8A56B2] rounded cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Auto-valider les retraits</p>
                    <p className="text-xs text-gray-600">Les retraits seront automatiquement approuvés</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8A56B2] to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading || !formData.code || !formData.nameFr || !formData.nameEn}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Créer le Pays
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

// Composant de formulaire pour créer une méthode de paiement
function CreatePaymentMethodForm({ 
  onSubmit, 
  onCancel, 
  loading, 
  error 
}: {
  onSubmit: (data: any) => void
  onCancel: () => void
  loading: boolean
  error: string | null
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    technicalName: '',
    logoUrl: '',
    depositFeeRate: '1.0',
    withdrawalFeeRate: '1.0',
    maxTransactionAmount: '1000000',
    transactionCooldown: '0',
    txTva: '0',
    txPartner: '0',
    withdrawMode: '',
    useTieredFees: false,
    referenceCurrency: 'XOF',
    supportsMultiCurrency: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
      technicalName: generateSlug(name).toUpperCase()
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] shadow-2xl animate-slideUp flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#8A56B2] to-purple-700 px-6 md:px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Créer une Méthode de Paiement</h2>
            <p className="text-purple-100 text-sm mt-1">Ajouter une nouvelle méthode de paiement</p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-white hover:text-purple-100 transition-colors p-2 hover:bg-white/20 rounded-lg"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
              </svg>
              <div>
                <p className="font-semibold text-red-800">Erreur</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Informations générales */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la méthode *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Ex: Wave"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="Ex: wave"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-généré depuis le nom</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom technique
                  </label>
                  <input
                    type="text"
                    name="technicalName"
                    value={formData.technicalName}
                    onChange={handleChange}
                    placeholder="Ex: WAVE"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-généré depuis le nom</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL du logo
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Section 2: Frais et Devise */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Configuration des frais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Devise de référence *
                  </label>
                  <select
                    name="referenceCurrency"
                    value={formData.referenceCurrency}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  >
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="EUR">EUR (Euro)</option>
                    <option value="USD">USD (Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais de dépôt (%) *
                  </label>
                  <input
                    type="number"
                    name="depositFeeRate"
                    value={formData.depositFeeRate}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Frais de retrait (%) *
                  </label>
                  <input
                    type="number"
                    name="withdrawalFeeRate"
                    value={formData.withdrawalFeeRate}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Limites et Taxes */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Limites et configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Montant max transaction (XOF)
                  </label>
                  <input
                    type="number"
                    name="maxTransactionAmount"
                    value={formData.maxTransactionAmount}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cooldown transaction (s)
                  </label>
                  <input
                    type="number"
                    name="transactionCooldown"
                    value={formData.transactionCooldown}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mode de retrait
                  </label>
                  <input
                    type="text"
                    name="withdrawMode"
                    value={formData.withdrawMode}
                    onChange={handleChange}
                    placeholder="Ex: BANK_TRANSFER"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-amber-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    TVA (%)
                  </label>
                  <input
                    type="number"
                    name="txTva"
                    value={formData.txTva}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission partenaire (%)
                  </label>
                  <input
                    type="number"
                    name="txPartner"
                    value={formData.txPartner}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Options avancées */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-purple-600">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
                Options avancées
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/50 transition-colors">
                  <input
                    type="checkbox"
                    name="useTieredFees"
                    checked={formData.useTieredFees}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#8A56B2] rounded cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Utiliser des frais par paliers</p>
                    <p className="text-xs text-gray-600">Les frais varient selon le montant de la transaction</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-lg hover:bg-white/50 transition-colors border-t border-purple-200">
                  <input
                    type="checkbox"
                    name="supportsMultiCurrency"
                    checked={formData.supportsMultiCurrency}
                    onChange={handleChange}
                    className="w-5 h-5 accent-[#8A56B2] rounded cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Supporter les multi-devises</p>
                    <p className="text-xs text-gray-600">Permet les transactions dans plusieurs devises</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8A56B2] to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={loading || !formData.name}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Créer la Méthode
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

function PaymentPageContent({ section }: { section: string }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // États pour les wallets
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [walletLoading, setWalletLoading] = useState(true)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [walletStats, setWalletStats] = useState<any>(null)
  const [walletViewMode, setWalletViewMode] = useState<'table' | 'grid'>('table')
  const [walletSearchQuery, setWalletSearchQuery] = useState('')
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([])
  const [walletFilter, setWalletFilter] = useState<'all' | 'active' | 'frozen'>('all')

  // États pour les comptes
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountLoading, setAccountLoading] = useState(true)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountStats, setAccountStats] = useState<any>(null)
  const [accountViewMode, setAccountViewMode] = useState<'table' | 'grid'>('table')
  const [accountSearchQuery, setAccountSearchQuery] = useState('')
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([])
  const [accountFilter, setAccountFilter] = useState<'all' | 'active' | 'frozen'>('all')

  // États pour les méthodes de paiement
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodLoading, setPaymentMethodLoading] = useState(true)
  const [paymentMethodError, setPaymentMethodError] = useState<string | null>(null)
  const [paymentMethodStats, setPaymentMethodStats] = useState<any>(null)
  const [paymentMethodViewMode, setPaymentMethodViewMode] = useState<'table' | 'grid'>('table')
  const [paymentMethodSearchQuery, setPaymentMethodSearchQuery] = useState('')
  const [filteredPaymentMethods, setFilteredPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // États pour les pays
  const [countries, setCountries] = useState<Country[]>([])
  const [countryLoading, setCountryLoading] = useState(true)
  const [countryError, setCountryError] = useState<string | null>(null)
  const [countryStats, setCountryStats] = useState<any>(null)
  const [countryViewMode, setCountryViewMode] = useState<'table' | 'grid'>('table')
  const [countrySearchQuery, setCountrySearchQuery] = useState('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [countryFilter, setCountryFilter] = useState<'all' | 'active' | 'frozen'>('all')

  // États pour les transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionLoading, setTransactionLoading] = useState(true)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [transactionStats, setTransactionStats] = useState<any>(null)
  /** Total catalogue (champ `totalElements` API), toutes paginations confondues — voir bloc « Vue consolidée ». */
  const [transactionsTotalAllPages, setTransactionsTotalAllPages] = useState(0)
  const [adminTableRefreshSignal, setAdminTableRefreshSignal] = useState(0)

  // Fonction pour obtenir les 4 comptes les plus récents avec des transactions
  const getRecentAccountsWithTransactions = useCallback(() => {
    if (!transactions || transactions.length === 0 || !accounts || accounts.length === 0) {
      return []
    }

    // Créer un Map pour suivre la transaction la plus récente par compte
    const accountLatestTransaction = new Map<string, { account: Account; latestDate: string }>()

    transactions.forEach(transaction => {
      const senderAccountId = transaction.senderInfo?.id
      const receiverAccountId = transaction.receiverInfo?.id

      // Traiter le sender
      if (senderAccountId) {
        const account = accounts.find(acc => acc.id === senderAccountId)
        if (account && (!accountLatestTransaction.has(senderAccountId) || 
            new Date(transaction.createdAt) > new Date(accountLatestTransaction.get(senderAccountId)!.latestDate))) {
          accountLatestTransaction.set(senderAccountId, {
            account,
            latestDate: transaction.createdAt
          })
        }
      }

      // Traiter le receiver
      if (receiverAccountId) {
        const account = accounts.find(acc => acc.id === receiverAccountId)
        if (account && (!accountLatestTransaction.has(receiverAccountId) || 
            new Date(transaction.createdAt) > new Date(accountLatestTransaction.get(receiverAccountId)!.latestDate))) {
          accountLatestTransaction.set(receiverAccountId, {
            account,
            latestDate: transaction.createdAt
          })
        }
      }
    })

    // Trier par date décroissante et prendre les 4 premiers
    return Array.from(accountLatestTransaction.values())
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime())
      .slice(0, 4)
      .map(item => item.account)
  }, [transactions, accounts])

  // Fonction pour obtenir les 4 wallets les plus récents dont les comptes ont effectué des transactions
  const getRecentWalletsWithTransactions = useCallback(() => {
    if (!transactions || transactions.length === 0 || !wallets || wallets.length === 0 || !accounts || accounts.length === 0) {
      return []
    }

    // Créer un Map pour suivre la transaction la plus récente par wallet (via les comptes)
    const walletLatestTransaction = new Map<string, { wallet: Wallet; latestDate: string }>()

    transactions.forEach(transaction => {
      const senderAccountId = transaction.senderInfo?.id
      const receiverAccountId = transaction.receiverInfo?.id

      // Trouver les wallets associés au sender via ses comptes
      if (senderAccountId) {
        const senderAccount = accounts.find(acc => acc.id === senderAccountId)
        if (senderAccount) {
          // Chercher les wallets où ce compte est propriétaire
          const senderWallets = wallets.filter(w => 
            w.walletOwners?.some(owner => owner.userId === senderAccount.userId)
          )
          senderWallets.forEach(wallet => {
            if (!walletLatestTransaction.has(wallet.id) || 
                new Date(transaction.createdAt) > new Date(walletLatestTransaction.get(wallet.id)!.latestDate)) {
              walletLatestTransaction.set(wallet.id, {
                wallet,
                latestDate: transaction.createdAt
              })
            }
          })
        }
      }

      // Trouver les wallets associés au receiver via ses comptes
      if (receiverAccountId) {
        const receiverAccount = accounts.find(acc => acc.id === receiverAccountId)
        if (receiverAccount) {
          // Chercher les wallets où ce compte est propriétaire
          const receiverWallets = wallets.filter(w => 
            w.walletOwners?.some(owner => owner.userId === receiverAccount.userId)
          )
          receiverWallets.forEach(wallet => {
            if (!walletLatestTransaction.has(wallet.id) || 
                new Date(transaction.createdAt) > new Date(walletLatestTransaction.get(wallet.id)!.latestDate)) {
              walletLatestTransaction.set(wallet.id, {
                wallet,
                latestDate: transaction.createdAt
              })
            }
          })
        }
      }
    })

    // Trier par date décroissante et prendre les 4 premiers
    return Array.from(walletLatestTransaction.values())
      .sort((a, b) => new Date(b.latestDate).getTime() - new Date(a.latestDate).getTime())
      .slice(0, 4)
      .map(item => item.wallet)
  }, [transactions, accounts, wallets])

  // État pour le formulaire de création de wallet
  const [showCreateWalletForm, setShowCreateWalletForm] = useState(false)
  const [createWalletLoading, setCreateWalletLoading] = useState(false)
  const [createWalletError, setCreateWalletError] = useState<string | null>(null)

  // État pour le formulaire de création de compte
  const [showCreateAccountForm, setShowCreateAccountForm] = useState(false)
  const [createAccountLoading, setCreateAccountLoading] = useState(false)
  const [createAccountError, setCreateAccountError] = useState<string | null>(null)

  // État pour le formulaire de création de pays
  const [showCreateCountryForm, setShowCreateCountryForm] = useState(false)
  const [createCountryLoading, setCreateCountryLoading] = useState(false)
  const [createCountryError, setCreateCountryError] = useState<string | null>(null)

  // État pour le formulaire de création de méthode de paiement
  const [showCreatePaymentMethodForm, setShowCreatePaymentMethodForm] = useState(false)
  const [createPaymentMethodLoading, setCreatePaymentMethodLoading] = useState(false)
  const [createPaymentMethodError, setCreatePaymentMethodError] = useState<string | null>(null)

  // Memoizer les fonctions de chargement pour éviter les boucles infinies
  const loadWallets = useCallback(async () => {
    try {
      setWalletLoading(true)
      setWalletError(null)
      const [walletsData, statsData] = await Promise.all([
        WalletService.getWallets(),
        WalletService.getWalletStats()
      ])
      setWallets(walletsData)
      setWalletStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des wallets:', err)
      setWalletError('Impossible de charger les wallets. Veuillez réessayer.')
    } finally {
      setWalletLoading(false)
    }
  }, [])

  const loadAccounts = useCallback(async () => {
    try {
      setAccountLoading(true)
      setAccountError(null)
      const [accountsData, statsData] = await Promise.all([
        AccountService.getAccounts(),
        AccountService.getAccountStats()
      ])
      setAccounts(accountsData)
      setAccountStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des comptes:', err)
      setAccountError('Impossible de charger les comptes. Veuillez réessayer.')
    } finally {
      setAccountLoading(false)
    }
  }, [])

  const loadPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodLoading(true)
      setPaymentMethodError(null)
      const [paymentMethodsData, statsData] = await Promise.all([
        PaymentMethodService.getPaymentMethods(),
        PaymentMethodService.getPaymentMethodStats()
      ])
      setPaymentMethods(paymentMethodsData)
      setPaymentMethodStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des méthodes de paiement:', err)
      setPaymentMethodError('Impossible de charger les méthodes de paiement. Veuillez réessayer.')
    } finally {
      setPaymentMethodLoading(false)
    }
  }, [])

  const loadCountries = useCallback(async () => {
    try {
      setCountryLoading(true)
      setCountryError(null)
      const [countriesData, statsData] = await Promise.all([
        FarotyCountryService.getCountries(),
        FarotyCountryService.getCountryStats()
      ])
      setCountries(countriesData)
      setCountryStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des pays:', err)
      setCountryError('Impossible de charger les pays. Veuillez réessayer.')
    } finally {
      setCountryLoading(false)
    }
  }, [])

  const loadTransactions = useCallback(async () => {
    try {
      setTransactionLoading(true)
      setTransactionError(null)
      const transactionsData = await TransactionService.getTransactions()
      const safeTransactionsData = Array.isArray(transactionsData) ? transactionsData : []
      let statsData
      try {
        statsData = await TransactionService.getTransactionStats(safeTransactionsData)
      } catch {
        statsData = TransactionService.emptyTransactionStats()
      }
      if (!statsData || typeof statsData !== 'object') {
        statsData = TransactionService.emptyTransactionStats()
      }

      setTransactions(safeTransactionsData)
      setTransactionStats(statsData)
      setTransactionsTotalAllPages(TransactionService.getLastCatalogTotalElements())
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err)
      setTransactionError('Impossible de charger les transactions. Veuillez réessayer.')
      setTransactionsTotalAllPages(0)
    } finally {
      setTransactionLoading(false)
    }
  }, [])

  // Charger les wallets quand on est sur la section wallets
  useEffect(() => {
    if (section === 'wallets') {
      loadWallets()
    }
  }, [section, loadWallets])

  // Charger les comptes quand on est sur la section accounts
  useEffect(() => {
    if (section === 'accounts') {
      loadAccounts()
    }
  }, [section, loadAccounts])

  // Charger les méthodes de paiement quand on est sur la section methods
  useEffect(() => {
    if (section === 'methods') {
      loadPaymentMethods()
    }
  }, [section, loadPaymentMethods])

  // Charger les pays quand on est sur la section countries
  useEffect(() => {
    if (section === 'countries') {
      loadCountries()
    }
  }, [section, loadCountries])

  // Charger les transactions + données pour la vue consolidée (comptes, wallets)
  useEffect(() => {
    if (section === 'transactions') {
      loadTransactions()
      loadWallets()
      loadAccounts()
    }
  }, [section, loadTransactions, loadWallets, loadAccounts])

  // Filtrer les wallets en fonction de la recherche et du statut
  useEffect(() => {
    let filtered = wallets
    
    // Filtrer par statut
    if (walletFilter === 'active') {
      filtered = filtered.filter(wallet => !wallet.frozen)
    } else if (walletFilter === 'frozen') {
      filtered = filtered.filter(wallet => wallet.frozen)
    }
    
    // Filtrer par recherche
    if (walletSearchQuery.trim() !== '') {
      const searchQuery = walletSearchQuery.toLowerCase()
      filtered = filtered.filter(wallet => {
        const walletName = getWalletName(wallet).toLowerCase()
        if (walletName.includes(searchQuery)) return true
        const currencyName = wallet.currency.nameFr.toLowerCase()
        const currencyCode = wallet.currency.code.toLowerCase()
        if (currencyName.includes(searchQuery) || currencyCode.includes(searchQuery)) return true
        const accountName = wallet.account.accountName.toLowerCase()
        if (accountName.includes(searchQuery)) return true
        const walletType = wallet.walletType.toLowerCase()
        if (walletType.includes(searchQuery)) return true
        const walletId = wallet.id.toLowerCase()
        if (walletId.includes(searchQuery)) return true
        if (!isNaN(Number(searchQuery))) {
          const searchNumber = Number(searchQuery)
          const balance = Number(wallet.balance.totalBalance)
          if (balance >= searchNumber) return true
        }
        return false
      })
    }
    
    setFilteredWallets(filtered)
  }, [wallets, walletSearchQuery, walletFilter])

  // Filtrer les comptes en fonction de la recherche et du statut
  useEffect(() => {
    let filtered = accounts
    
    if (accountFilter === 'active') {
      filtered = filtered.filter(account => !account.frozen)
    } else if (accountFilter === 'frozen') {
      filtered = filtered.filter(account => account.frozen)
    }
    
    if (accountSearchQuery.trim() !== '') {
      filtered = filtered.filter(account =>
        account.accountName.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        account.accountSubName?.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
        account.accountMode.toLowerCase().includes(accountSearchQuery.toLowerCase())
      )
    }
    
    setFilteredAccounts(filtered)
  }, [accounts, accountSearchQuery, accountFilter])

  // Filtrer les méthodes de paiement en fonction de la recherche et du statut
  useEffect(() => {
    let filtered = paymentMethods
    
    if (paymentMethodFilter === 'active') {
      filtered = filtered.filter(method => method.active)
    } else if (paymentMethodFilter === 'inactive') {
      filtered = filtered.filter(method => !method.active)
    }
    
    if (paymentMethodSearchQuery.trim() !== '') {
      filtered = filtered.filter(method =>
        method.name.toLowerCase().includes(paymentMethodSearchQuery.toLowerCase()) ||
        method.technicalName.toLowerCase().includes(paymentMethodSearchQuery.toLowerCase()) ||
        method.referenceCurrency.toLowerCase().includes(paymentMethodSearchQuery.toLowerCase())
      )
    }
    
    setFilteredPaymentMethods(filtered)
  }, [paymentMethods, paymentMethodSearchQuery, paymentMethodFilter])

  // Filtrer les pays en fonction de la recherche et du statut
  useEffect(() => {
    let filtered = countries
    
    if (countryFilter === 'active') {
      filtered = filtered.filter(country => country.active)
    } else if (countryFilter === 'frozen') {
      filtered = filtered.filter(country => !country.active)
    }
    
    if (countrySearchQuery.trim() !== '') {
      filtered = filtered.filter(country =>
        country.nameFr.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
        country.nameEn.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
      )
    }
    
    setFilteredCountries(filtered)
  }, [countries, countrySearchQuery, countryFilter])

  const refreshWalletData = useCallback(async () => {
    try {
      setWalletLoading(true)
      setWalletError(null)
      const [walletsData, statsData] = await Promise.all([
        WalletService.getWallets(true),
        WalletService.getWalletStats()
      ])
      setWallets(walletsData)
      setWalletStats(statsData)
      console.log('Données wallets rafraîchies avec succès')
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des wallets:', err)
      setWalletError('Impossible de rafraîchir les wallets. Veuillez réessayer.')
    } finally {
      setWalletLoading(false)
    }
  }, [])

  const refreshAccountData = useCallback(async () => {
    try {
      setAccountLoading(true)
      setAccountError(null)
      const [accountsData, statsData] = await Promise.all([
        AccountService.getAccounts(true),
        AccountService.getAccountStats()
      ])
      setAccounts(accountsData)
      setAccountStats(statsData)
      console.log('Données comptes rafraîchies avec succès')
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des comptes:', err)
      setAccountError('Impossible de rafraîchir les comptes. Veuillez réessayer.')
    } finally {
      setAccountLoading(false)
    }
  }, [])

  const refreshPaymentMethodData = useCallback(() => {
    PaymentMethodService.clearCache()
    loadPaymentMethods()
  }, [loadPaymentMethods])

  const refreshCountryData = useCallback(() => {
    FarotyCountryService.clearCache()
    loadCountries()
  }, [loadCountries])

  const refreshTransactionData = useCallback(() => {
    TransactionService.clearCache()
    setAdminTableRefreshSignal((n) => n + 1)
    loadTransactions()
    loadWallets()
    loadAccounts()
  }, [loadTransactions, loadWallets, loadAccounts])

  /** Frais cumulés par méthode de paiement (données des transactions chargées sur cette page). */
  const transactionFeesByPaymentMethod = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      const label =
        (t.paymentMethod?.name && t.paymentMethod.name.trim()) ||
        t.paymentMethod?.technicalName ||
        'Non renseigné'
      map.set(label, (map.get(label) ?? 0) + (Number(t.fee) || 0))
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [transactions])

  // Fonction pour créer un nouveau wallet
  const handleCreateWallet = useCallback(async (walletData: any) => {
    try {
      setCreateWalletLoading(true)
      setCreateWalletError(null)
      await WalletService.createWallet(walletData)
      refreshWalletData()
      alert('Wallet créé avec succès!')
    } catch (error) {
      console.error('Erreur lors de la création du wallet:', error)
      setCreateWalletError(error instanceof Error ? error.message : 'Erreur lors de la création du wallet')
    } finally {
      setCreateWalletLoading(false)
    }
  }, [refreshWalletData])

  // Fonctions pour gérer les filtres
  const handleWalletFilterChange = useCallback((filter: 'all' | 'active' | 'frozen') => {
    setWalletFilter(filter)
  }, [])

  const handleAccountFilterChange = useCallback((filter: 'all' | 'active' | 'frozen') => {
    setAccountFilter(filter)
  }, [])

  const handleCountryFilterChange = useCallback((filter: 'all' | 'active' | 'frozen') => {
    setCountryFilter(filter)
  }, [])

  const handlePaymentMethodFilterChange = useCallback((filter: 'all' | 'active' | 'inactive') => {
    setPaymentMethodFilter(filter)
  }, [])

  // Fonction pour créer un nouveau compte
  const handleCreateAccount = useCallback(async (accountData: {
    userId: string
    accountName: string
    countryId: string
    depositFeeRate: string
    withdrawalFeeRate: string
    accountMode: string
  }) => {
    try {
      setCreateAccountLoading(true)
      setCreateAccountError(null)
      await AccountService.createAccount(accountData)
      setShowCreateAccountForm(false)
      refreshAccountData()
      alert('Compte créé avec succès!')
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
      setCreateAccountError(error instanceof Error ? error.message : 'Erreur lors de la création du compte')
    } finally {
      setCreateAccountLoading(false)
    }
  }, [refreshAccountData])

  // Fonction pour créer un nouveau pays
  const handleCreateCountry = useCallback(async (countryData: any) => {
    try {
      setCreateCountryLoading(true)
      setCreateCountryError(null)
      await FarotyCountryService.createCountry(countryData)
      setShowCreateCountryForm(false)
      refreshCountryData()
      alert('Pays créé avec succès!')
    } catch (error) {
      console.error('Erreur lors de la création du pays:', error)
      setCreateCountryError(error instanceof Error ? error.message : 'Erreur lors de la création du pays')
    } finally {
      setCreateCountryLoading(false)
    }
  }, [refreshCountryData])

  // Fonction pour créer une nouvelle méthode de paiement
  const handleCreatePaymentMethod = useCallback(async (paymentMethodData: any) => {
    try {
      setCreatePaymentMethodLoading(true)
      setCreatePaymentMethodError(null)
      await PaymentMethodService.createPaymentMethod(paymentMethodData)
      setShowCreatePaymentMethodForm(false)
      refreshPaymentMethodData()
      alert('Méthode de paiement créée avec succès!')
    } catch (error) {
      console.error('Erreur lors de la création de la méthode de paiement:', error)
      setCreatePaymentMethodError(error instanceof Error ? error.message : 'Erreur lors de la création de la méthode de paiement')
    } finally {
      setCreatePaymentMethodLoading(false)
    }
  }, [refreshPaymentMethodData])

  // Obtenir la couleur selon le statut
  const getStatusColor = (wallet: Wallet): string => {
    if (wallet.frozen) {
      return 'orange'
    } else {
      return 'green'
    }
  }

  // Obtenir le texte du statut
  const getStatusText = (wallet: Wallet): string => {
    if (wallet.frozen) {
      return 'Gelé'
    } else {
      return 'Actif'
    }
  }

  // Fonction pour rendre le contenu selon la section
  const renderContent = () => {
    switch (section) {
      case 'overview':
        // Charger les données pour les statistiques
        useEffect(() => {
          // Charger comptes, wallets et méthodes si on est en section overview
          if (section === 'overview') {
            loadAccounts()
            loadWallets()
            loadPaymentMethods()
          }
        }, [section, loadAccounts, loadWallets, loadPaymentMethods])

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Vue d'Ensemble</h1>
                  <p className="text-blue-100 text-lg">Tableau de bord complet de votre système de paiement</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-blue-200">Solde Total</span>
                      <p className="text-2xl font-bold text-white">{walletStats ? WalletService.formatAmountXOF(walletStats.totalBalance) : '0 XOF'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Wallets</span>
                      <p className="text-2xl font-bold text-emerald-300">{walletStats?.totalWallets || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Comptes</span>
                      <p className="text-2xl font-bold text-amber-300">{accountStats?.totalAccounts || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Méthodes</span>
                      <p className="text-2xl font-bold text-purple-300">{paymentMethodStats?.totalMethods || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      loadAccounts()
                      loadWallets()
                      loadPaymentMethods()
                    }}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Actualiser
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Balance */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Solde Total</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Solde de Tous les Wallets</p>
                  <p className="text-4xl font-bold text-blue-900">{walletStats ? WalletService.formatAmountXOF(walletStats.totalBalance) : 'Chargement...'}</p>
                  <p className="text-xs text-gray-500 mt-3">{walletStats?.totalWallets || 0} wallets</p>
                </div>
              </div>

              {/* Total Wallets */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-emerald-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Wallets</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Wallets (Tous)</p>
                  <p className="text-4xl font-bold text-emerald-900">{walletStats?.totalWallets || 0}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all" 
                      style={{
                        width: walletStats && walletStats.totalWallets > 0 
                          ? ((walletStats.activeWallets / walletStats.totalWallets) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{walletStats?.activeWallets || 0} actifs</p>
                </div>
              </div>

              {/* Total Accounts */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Comptes</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Comptes Bancaires (Tous)</p>
                  <p className="text-4xl font-bold text-purple-900">{accountStats?.totalAccounts || 0}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 rounded-full transition-all" 
                      style={{
                        width: accountStats && accountStats.totalAccounts > 0 
                          ? ((accountStats.activeAccounts / accountStats.totalAccounts) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{accountStats?.activeAccounts || 0} actifs</p>
                </div>
              </div>

              {/* Total Methods */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-orange-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Méthodes</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Méthodes de Paiement</p>
                  <p className="text-4xl font-bold text-orange-900">{paymentMethodStats?.totalMethods || 0}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all" 
                      style={{
                        width: paymentMethodStats && paymentMethodStats.totalMethods > 0 
                          ? ((paymentMethodStats.activeMethods / paymentMethodStats.totalMethods) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{paymentMethodStats?.activeMethods || 0} actives</p>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                <div className="space-y-3">
                  <Link href="/payment?section=wallets" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" style={{cursor: 'pointer'}}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Gérer les Wallets ({walletStats?.totalWallets || 0})</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <Link href="/payment?section=accounts" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" style={{cursor: 'pointer'}}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 011 0 7.75"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Comptes Bancaires ({accountStats?.totalAccounts || 0})</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  <Link href="/payment?section=methods" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" style={{cursor: 'pointer'}}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-900">Méthodes de Paiement ({paymentMethodStats?.totalMethods || 0})</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transactions Récentes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 000-7z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dépôt Orange Money</p>
                        <p className="text-xs text-gray-500">Il y a 2h</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">+50 000 XOF</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 000-7z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Retrait MTN</p>
                        <p className="text-xs text-gray-500">Il y a 5h</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-600">-25 000 XOF</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                          <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m16 0l-4-4m4 4l-4 4"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Transfert vers Paul</p>
                        <p className="text-xs text-gray-500">Il y a 8h</p>
                      </div>
                    </div>
                    <p className="font-semibold text-orange-600">75 000 XOF</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'wallets':
        // Affichage du loading
        if (walletLoading) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Wallets</h1>
                  <p className="text-gray-600 mt-1">Gérez vos wallets et soldes</p>
                </div>
              </div>
              
              {/* Skeleton loading */}
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        // Affichage de l'erreur
        if (walletError) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Wallets</h1>
                  <p className="text-gray-600 mt-1">Gérez vos wallets et soldes</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{walletError}</p>
                  </div>
                </div>
                <button 
                  onClick={refreshWalletData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  style={{cursor: 'pointer'}}
                >
                  Réessayer
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Gestion des Wallets</h1>
                  <p className="text-blue-100 text-lg">Gérez tous vos wallets et suivez vos soldes en temps réel</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-blue-200">Total</span>
                      <p className="text-2xl font-bold text-white">{walletStats ? walletStats.totalWallets : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Actifs</span>
                      <p className="text-2xl font-bold text-emerald-300">{walletStats ? walletStats.activeWallets : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Solde</span>
                      <p className="text-2xl font-bold text-amber-300">{walletStats ? WalletService.formatAmountXOF(walletStats.totalBalance) : '0 XOF'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={refreshWalletData}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Rafraîchir
                  </button>
                  <button 
                    onClick={() => setShowCreateWalletForm(true)}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Nouveau Wallet
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Balance */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Total</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Solde Total</p>
                  <p className="text-4xl font-bold text-blue-900">{walletStats ? WalletService.formatAmountXOF(walletStats.totalBalance) : '0 XOF'}</p>
                  <p className="text-xs text-gray-500 mt-3">Tous les wallets confondus</p>
                </div>
              </div>

              {/* Available Balance */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-emerald-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Disponible</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Solde Disponible</p>
                  <p className="text-4xl font-bold text-emerald-900">{walletStats ? WalletService.formatAmountXOF(walletStats.availableBalance) : '0 XOF'}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all" 
                      style={{
                        width: walletStats && walletStats.totalBalance > 0 
                          ? ((walletStats.availableBalance / walletStats.totalBalance) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Wallets */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Wallets</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Wallets</p>
                  <p className="text-4xl font-bold text-purple-900">{walletStats ? walletStats.totalWallets : '0'}</p>
                  <p className="text-xs text-gray-500 mt-3">Wallets configurés</p>
                </div>
              </div>

              {/* Active Wallets */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-orange-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Actifs</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Wallets Actifs</p>
                  <p className="text-4xl font-bold text-orange-900">{walletStats ? walletStats.activeWallets : '0'}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all" 
                      style={{
                        width: walletStats && walletStats.totalWallets > 0 
                          ? ((walletStats.activeWallets / walletStats.totalWallets) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation des wallets */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Vos Wallets</h2>
                <div className="flex items-center gap-2">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un wallet..."
                      value={walletSearchQuery}
                      onChange={(e) => setWalletSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleWalletFilterChange('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        walletFilter === 'all'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Tous
                    </button>
                    <button 
                      onClick={() => handleWalletFilterChange('active')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        walletFilter === 'active'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Actifs
                    </button>
                    <button 
                      onClick={() => handleWalletFilterChange('frozen')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        walletFilter === 'frozen'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Gelés
                    </button>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setWalletViewMode('table')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        walletViewMode === 'table'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setWalletViewMode('grid')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        walletViewMode === 'grid'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des wallets - selon le mode d'affichage */}
              {walletViewMode === 'grid' ? (
                // Mode Grille
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWallets.map((wallet) => (
                    <div 
                      key={wallet.id} 
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#8A56B2] hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => window.location.href = `/wallet/${wallet.id}`}
                    >
                      {/* Header avec icône et informations principales */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-md ${
                            wallet.frozen 
                              ? 'from-red-500 to-red-600' 
                              : wallet.balance.totalBalance > 0 
                              ? 'from-emerald-500 to-emerald-600' 
                              : 'from-gray-500 to-gray-600'
                          }`}>
                            <CreditCard size={28} className="text-inherit" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{getWalletName(wallet)}</h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {wallet.currency.nameFr} · {wallet.currency.code}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          wallet.frozen 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {wallet.frozen ? 'Gelé' : 'Actif'}
                        </span>
                      </div>

                      {/* Informations détaillées */}
                      <div className="space-y-3">
                        {/* Solde */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Solde Total</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {WalletService.formatAmount(wallet.balance.totalBalance, wallet.currency.code)}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-green-600">Disponible:</span>
                              <span className="font-medium text-green-700">
                                {WalletService.formatAmount(wallet.balance.balance, wallet.currency.code)}
                              </span>
                            </div>
                            {wallet.balance.frozenBalance > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-red-600">Gelé:</span>
                                <span className="font-medium text-red-700">
                                  {WalletService.formatAmount(wallet.balance.frozenBalance, wallet.currency.code)}
                                </span>
                              </div>
                            )}
                            {wallet.balance.pendingBalance > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-amber-600">En attente:</span>
                                <span className="font-medium text-amber-700">
                                  {WalletService.formatAmount(wallet.balance.pendingBalance, wallet.currency.code)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Métadonnées */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-600 font-medium mb-1">Type</p>
                            <p className="text-sm font-semibold text-blue-900">{wallet.walletType}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 font-medium mb-1">Transactions</p>
                            <p className="text-sm font-semibold text-purple-900">{wallet.transactionsCount}</p>
                          </div>
                        </div>

                        {/* Date et frais */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p>Créé le {WalletService.formatDate(wallet.createdAt)}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-600">·{wallet.depositFeeRate}%</span>
                            <span className="text-red-600">·{wallet.withdrawalFeeRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Indicateur de clic */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8A56B2]">
                          <path d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mode Tableau
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devise</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredWallets.map((wallet) => (
                          <tr 
                            key={wallet.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/wallet/${wallet.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm mr-3 ${
                                  wallet.frozen 
                                    ? 'from-red-500 to-red-600' 
                                    : wallet.balance.totalBalance > 0 
                                    ? 'from-emerald-500 to-emerald-600' 
                                    : 'from-gray-500 to-gray-600'
                                }`}>
                                  <CreditCard size={20} className="text-inherit" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{getWalletName(wallet)}</div>
                                  <div className="text-xs text-gray-500">ID: {wallet.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{wallet.currency.nameFr}</div>
                              <div className="text-xs text-gray-500">{wallet.currency.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {WalletService.formatAmount(wallet.balance.totalBalance, wallet.currency.code)}
                              </div>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div className="flex justify-between">
                                  <span>Disponible:</span>
                                  <span className="font-medium text-green-600">
                                    {WalletService.formatAmount(wallet.balance.balance, wallet.currency.code)}
                                  </span>
                                </div>
                                {wallet.balance.frozenBalance > 0 && (
                                  <div className="flex justify-between">
                                    <span>Gelé:</span>
                                    <span className="font-medium text-red-600">
                                      {WalletService.formatAmount(wallet.balance.frozenBalance, wallet.currency.code)}
                                    </span>
                                  </div>
                                )}
                                {wallet.balance.pendingBalance > 0 && (
                                  <div className="flex justify-between">
                                    <span>Attente:</span>
                                    <span className="font-medium text-amber-600">
                                      {WalletService.formatAmount(wallet.balance.pendingBalance, wallet.currency.code)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{wallet.walletType}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{wallet.transactionsCount}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                wallet.frozen 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {wallet.frozen ? 'Gelé' : 'Actif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {WalletService.formatDate(wallet.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{walletStats?.totalWallets || 0} wallets</span> • 
                    {walletStats?.activeWallets || 0} actifs • 
                    {walletStats?.frozenWallets || 0} gelés
                  </p>
                  <button className="text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium transition-colors" style={{cursor: 'pointer'}}>
                    Gérer les wallets →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Afficher le formulaire de création de wallet si nécessaire */}
            {showCreateWalletForm && (
              <CreateWalletForm
                onSubmit={handleCreateWallet}
                onCancel={() => {
                  setShowCreateWalletForm(false)
                  setCreateWalletError(null)
                }}
                loading={createWalletLoading}
                error={createWalletError}
              />
            )}
          </div>
        )
      case 'accounts':
        // Affichage du loading
        if (accountLoading) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Comptes</h1>
                  <p className="text-gray-600 mt-1">Gérez vos comptes bancaires</p>
                </div>
              </div>
              
              {/* Skeleton loading */}
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        // Affichage de l'erreur
        if (accountError) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Comptes</h1>
                  <p className="text-gray-600 mt-1">Gérez vos comptes bancaires</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{accountError}</p>
                  </div>
                </div>
                <button 
                  onClick={refreshAccountData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  style={{cursor: 'pointer'}}
                >
                  Réessayer
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Gestion des Comptes</h1>
                  <p className="text-blue-100 text-lg">Gérez tous vos comptes bancaires et suivez vos soldes en temps réel</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-blue-200">Total</span>
                      <p className="text-2xl font-bold text-white">{accountStats ? accountStats.totalAccounts : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Actifs</span>
                      <p className="text-2xl font-bold text-emerald-300">{accountStats ? accountStats.activeAccounts : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Solde</span>
                      <p className="text-2xl font-bold text-amber-300">{accountStats ? AccountService.formatAmount(accountStats.totalAvailable || 0) : '0 XOF'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={refreshAccountData}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Rafraîchir
                  </button>
                  <button 
                    onClick={() => setShowCreateAccountForm(true)}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Ajouter un Compte
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Accounts */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Total</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Comptes Bancaires</p>
                  <p className="text-4xl font-bold text-blue-900">{accountStats ? accountStats.totalAccounts : '0'}</p>
                  <p className="text-xs text-gray-500 mt-3">Tous les comptes configurés</p>
                </div>
              </div>

              {/* Active Accounts */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-emerald-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Actifs</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Comptes Actifs</p>
                  <p className="text-4xl font-bold text-emerald-900">{accountStats ? accountStats.activeAccounts : '0'}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all" 
                      style={{
                        width: accountStats && accountStats.totalAccounts > 0 
                          ? ((accountStats.activeAccounts / accountStats.totalAccounts) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Available Balance */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Solde</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Solde Disponible</p>
                  <p className="text-4xl font-bold text-purple-900">{accountStats ? AccountService.formatAmount(accountStats.totalAvailable || 0) : '0 XOF'}</p>
                  <p className="text-xs text-gray-500 mt-3">Total des soldes disponibles</p>
                </div>
              </div>

              {/* Accounts with Wallets */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-orange-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Wallets</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Comptes avec Wallets</p>
                  <p className="text-4xl font-bold text-orange-900">{accountStats ? accountStats.accountsWithWallets : '0'}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all" 
                      style={{
                        width: accountStats && accountStats.totalAccounts > 0 
                          ? ((accountStats.accountsWithWallets / accountStats.totalAccounts) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-purple-600 text-sm font-semibold mb-2">Total Wallets</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {accountStats ? accountStats.totalWallets : '0'}
                  </span>
                </p>
                <p className="text-xs text-purple-600 mt-auto">
                  {accountStats ? `${accountStats.averageWalletsPerAccount} moy/compte` : '0 moy/compte'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-orange-600 text-sm font-semibold mb-2">Frais Moyens</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {accountStats ? `${accountStats.avgDepositFee}%` : '0%'}
                  </span>
                </p>
                <p className="text-xs text-orange-600 mt-auto">
                  {accountStats ? `Retrait: ${accountStats.avgWithdrawalFee}%` : 'Retrait: 0%'}
                </p>
              </div>
            </div>

            {/* Formulaire de création de compte */}
            {showCreateAccountForm && (
              <CreateAccountForm
                onSubmit={handleCreateAccount}
                onCancel={() => {
                  setShowCreateAccountForm(false)
                  setCreateAccountError(null)
                }}
                loading={createAccountLoading}
                error={createAccountError}
              />
            )}

            {/* Navigation des comptes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Vos Comptes</h2>
                <div className="flex items-center gap-2">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un compte..."
                      value={accountSearchQuery}
                      onChange={(e) => setAccountSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAccountFilterChange('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        accountFilter === 'all'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Tous
                    </button>
                    <button 
                      onClick={() => handleAccountFilterChange('active')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        accountFilter === 'active'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Actifs
                    </button>
                    <button 
                      onClick={() => handleAccountFilterChange('frozen')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        accountFilter === 'frozen'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Gelés
                    </button>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setAccountViewMode('table')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        accountViewMode === 'table'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAccountViewMode('grid')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        accountViewMode === 'grid'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des comptes - selon le mode d'affichage */}
              {accountViewMode === 'grid' ? (
                // Mode Grille
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAccounts.map((account) => (
                    <div 
                      key={account.id} 
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#8A56B2] hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => window.location.href = `/compte/${account.id}`}
                    >
                      {/* Header avec icône et informations principales */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-md ${
                            account.frozen 
                              ? 'from-red-500 to-red-600' 
                              : account.walletsCount > 0 
                              ? 'from-green-500 to-green-600' 
                              : 'from-gray-500 to-gray-600'
                          }`}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 011 0 7.75"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{account.accountName}</h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {account.country.nameFr} · {account.country.code}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          account.frozen 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {account.frozen ? 'Gelé' : 'Actif'}
                        </span>
                      </div>

                      {/* Informations détaillées */}
                      <div className="space-y-3">
                        {/* Statistiques */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Wallets associés</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {account.walletsCount} wallet{account.walletsCount > 1 ? 's' : ''}
                          </p>
                          {account.accountPaymentMethodsCount > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              {account.accountPaymentMethodsCount} méthode{account.accountPaymentMethodsCount > 1 ? 's' : ''} de paiement
                            </p>
                          )}
                        </div>

                        {/* Métadonnées */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs text-amber-600 font-medium mb-1">Mode</p>
                            <p className="text-sm font-semibold text-amber-900">{account.accountMode}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 font-medium mb-1">Webhooks</p>
                            <p className="text-sm font-semibold text-purple-900">{account.webhooksCount}</p>
                          </div>
                        </div>

                        {/* Date et frais */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p>Ajouté le {AccountService.formatDate(account.createdAt)}</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-600">↓{account.depositFeeRate}%</span>
                            <span className="text-red-600">↑{account.withdrawalFeeRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Indicateur de clic */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8A56B2]">
                          <path d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mode Tableau
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallets</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthodes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAccounts.map((account) => (
                          <tr 
                            key={account.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/compte/${account.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm mr-3 ${
                                  account.frozen 
                                    ? 'from-red-500 to-red-600' 
                                    : account.walletsCount > 0 
                                    ? 'from-green-500 to-green-600' 
                                    : 'from-gray-500 to-gray-600'
                                }`}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 011 0 7.75"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{account.accountName}</div>
                                  <div className="text-xs text-gray-500">ID: {account.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{account.country.nameFr}</div>
                              <div className="text-xs text-gray-500">{account.country.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{account.walletsCount}</div>
                              {account.accountPaymentMethodsCount > 0 && (
                                <div className="text-xs text-blue-600">
                                  {account.accountPaymentMethodsCount} méthode{account.accountPaymentMethodsCount > 1 ? 's' : ''}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{account.accountMode}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{account.webhooksCount}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                account.frozen 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {account.frozen ? 'Gelé' : 'Actif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {AccountService.formatDate(account.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{accountStats?.totalAccounts || 0} comptes</span> • 
                    {accountStats?.verifiedAccounts || 0} vérifiés • 
                    {accountStats?.pendingAccounts || 0} en attente
                  </p>
                  <button className="text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium transition-colors" style={{cursor: 'pointer'}}>
                    Gérer les comptes →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'methods':
        // Affichage du loading
        if (paymentMethodLoading) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Méthodes de paiement</h1>
                  <p className="text-gray-600 mt-1">Configurez vos méthodes de paiement</p>
                </div>
              </div>
              
              {/* Skeleton loading */}
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        // Affichage de l'erreur
        if (paymentMethodError) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Méthodes de paiement</h1>
                  <p className="text-gray-600 mt-1">Configurez vos méthodes de paiement</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{paymentMethodError}</p>
                  </div>
                </div>
                <button 
                  onClick={refreshPaymentMethodData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  style={{cursor: 'pointer'}}
                >
                  Réessayer
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Méthodes de Paiement</h1>
                  <p className="text-blue-100 text-lg">Configurez et gérez toutes vos méthodes de paiement en un seul endroit</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-blue-200">Total</span>
                      <p className="text-2xl font-bold text-white">{paymentMethodStats ? paymentMethodStats.totalMethods : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Actives</span>
                      <p className="text-2xl font-bold text-emerald-300">{paymentMethodStats ? paymentMethodStats.activeMethods : '0'}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Mobile Money</span>
                      <p className="text-2xl font-bold text-amber-300">{paymentMethodStats ? paymentMethodStats.mobileMoneyMethods : '0'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={refreshPaymentMethodData}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    Rafraîchir
                  </button>
                  <button 
                    onClick={() => setShowCreatePaymentMethodForm(true)}
                    className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Ajouter une méthode
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Methods */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Total</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Méthodes de Paiement</p>
                  <p className="text-4xl font-bold text-blue-900">{paymentMethodStats ? paymentMethodStats.totalMethods : '0'}</p>
                  <p className="text-xs text-gray-500 mt-3">Toutes les méthodes configurées</p>
                </div>
              </div>

              {/* Active Methods */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-emerald-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">Actives</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Méthodes Actives</p>
                  <p className="text-4xl font-bold text-emerald-900">{paymentMethodStats ? paymentMethodStats.activeMethods : '0'}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-1 rounded-full transition-all" 
                      style={{
                        width: paymentMethodStats && paymentMethodStats.totalMethods > 0 
                          ? ((paymentMethodStats.activeMethods / paymentMethodStats.totalMethods) * 100) + '%'
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Money */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-purple-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">Mobile</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Mobile Money</p>
                  <p className="text-4xl font-bold text-purple-900">{paymentMethodStats ? paymentMethodStats.mobileMoneyMethods : '0'}</p>
                  <p className="text-xs text-gray-500 mt-3">Solutions mobiles disponibles</p>
                </div>
              </div>

              {/* Average Fees */}
              <div className="relative group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-orange-100 overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 opacity-10 rounded-full group-hover:opacity-20 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">Frais</div>
                  </div>
                  <p className="text-gray-600 text-sm font-medium mb-2">Frais Moyens</p>
                  <p className="text-4xl font-bold text-orange-900">{paymentMethodStats ? paymentMethodStats.averageFeeRate.toFixed(2) + '%' : '0%'}</p>
                  <p className="text-xs text-gray-500 mt-3">Par transaction en moyenne</p>
                </div>
              </div>
            </div>

            {/* Formulaire de création de méthode de paiement */}
            {showCreatePaymentMethodForm && (
              <CreatePaymentMethodForm
                onSubmit={handleCreatePaymentMethod}
                onCancel={() => {
                  setShowCreatePaymentMethodForm(false)
                  setCreatePaymentMethodError(null)
                }}
                loading={createPaymentMethodLoading}
                error={createPaymentMethodError}
              />
            )}

            {/* Navigation des méthodes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Méthodes Disponibles</h2>
                <div className="flex items-center gap-2">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une méthode..."
                      value={paymentMethodSearchQuery}
                      onChange={(e) => setPaymentMethodSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePaymentMethodFilterChange('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        paymentMethodFilter === 'all'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Toutes
                    </button>
                    <button 
                      onClick={() => handlePaymentMethodFilterChange('active')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        paymentMethodFilter === 'active'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Actives
                    </button>
                    <button 
                      onClick={() => handlePaymentMethodFilterChange('inactive')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        paymentMethodFilter === 'inactive'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Inactives
                    </button>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setPaymentMethodViewMode('table')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        paymentMethodViewMode === 'table'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPaymentMethodViewMode('grid')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        paymentMethodViewMode === 'grid'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des méthodes - selon le mode d'affichage */}
              {paymentMethodViewMode === 'grid' ? (
                // Mode Grille
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPaymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#8A56B2] hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => window.location.href = `/payment-methods/${method.id}`}
                    >
                      {/* Header avec icône et informations principales */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-md ${
                            method.active 
                              ? 'from-blue-500 to-blue-600' 
                              : method.transactionsCount > 0 
                              ? 'from-purple-500 to-purple-600' 
                              : 'from-gray-500 to-gray-600'
                          }`}>
                            {method.logoUrl ? (
                              <img 
                                src={method.logoUrl} 
                                alt={method.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {PaymentMethodService.getPaymentMethodIcon(method)}
                              </span>
                            )}
                            {!method.logoUrl && (
                              <span className="text-white font-bold text-lg hidden">
                                {PaymentMethodService.getPaymentMethodIcon(method)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{method.name}</h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {method.technicalName} • {method.referenceCurrency}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          method.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {method.active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {/* Informations détaillées */}
                      <div className="space-y-3">
                        {/* Frais */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Frais de transaction</p>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-xs text-amber-600 mb-1">Dépôt</p>
                              <p className="text-lg font-bold text-amber-900">↓{method.depositFeeRate}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-red-600 mb-1">Retrait</p>
                              <p className="text-lg font-bold text-red-900">↑{method.withdrawalFeeRate}%</p>
                            </div>
                          </div>
                          {(method.txTva > 0 || method.txPartner > 0) && (
                            <p className="text-xs text-gray-600 mt-2">
                              TVA: {method.txTva}% • Partenaire: {method.txPartner}%
                            </p>
                          )}
                        </div>

                        {/* Métadonnées */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-600 font-medium mb-1">Limite max</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {PaymentMethodService.formatMaxAmount(method.maxTransactionAmount, method.referenceCurrency)}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 font-medium mb-1">Cooldown</p>
                            <p className="text-sm font-semibold text-purple-900">{method.transactionCooldown} min</p>
                          </div>
                        </div>

                        {/* Transactions */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p>Total: {method.transactionsCount} transactions</p>
                          {method.activeTransactionsCount > 0 && (
                            <p className="text-green-600 font-medium">{method.activeTransactionsCount} actives</p>
                          )}
                        </div>
                      </div>

                      {/* Indicateur de clic */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8A56B2]">
                          <path d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mode Tableau
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frais Dépôt</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frais Retrait</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limite Max</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cooldown</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredPaymentMethods.map((method) => (
                          <tr 
                            key={method.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/payment-methods/${method.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm mr-3 ${
                                  method.active 
                                    ? 'from-blue-500 to-blue-600' 
                                    : method.transactionsCount > 0 
                                    ? 'from-purple-500 to-purple-600' 
                                    : 'from-gray-500 to-gray-600'
                                }`}>
                                  {method.logoUrl ? (
                                    <img 
                                      src={method.logoUrl} 
                                      alt={method.name}
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                      }}
                                    />
                                  ) : (
                                    <span className="text-white font-bold text-sm">
                                      {PaymentMethodService.getPaymentMethodIcon(method)}
                                    </span>
                                  )}
                                  {!method.logoUrl && (
                                    <span className="text-white font-bold text-sm hidden">
                                      {PaymentMethodService.getPaymentMethodIcon(method)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{method.name}</div>
                                  <div className="text-xs text-gray-500">{method.technicalName} • {method.referenceCurrency}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-amber-900">↓{method.depositFeeRate}%</div>
                              {(method.txTva > 0 || method.txPartner > 0) && (
                                <div className="text-xs text-gray-500">
                                  {method.txTva > 0 && `TVA: ${method.txTva}%`}
                                  {method.txTva > 0 && method.txPartner > 0 && ' • '}
                                  {method.txPartner > 0 && `Part: ${method.txPartner}%`}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-red-900">↑{method.withdrawalFeeRate}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {PaymentMethodService.formatMaxAmount(method.maxTransactionAmount, method.referenceCurrency)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{method.transactionCooldown} min</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{method.transactionsCount}</div>
                              {method.activeTransactionsCount > 0 && (
                                <div className="text-xs text-green-600">
                                  {method.activeTransactionsCount} actives
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                method.active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {method.active ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{paymentMethodStats?.totalMethods || 0} méthodes</span> • 
                    {paymentMethodStats?.activeMethods || 0} actives • 
                    {paymentMethodStats?.mobileMoneyMethods || 0} mobile money
                  </p>
                  <button className="text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium transition-colors" style={{cursor: 'pointer'}}>
                    Gérer les méthodes →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'countries':
        // Affichage du loading
        if (countryLoading) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Pays</h1>
                  <p className="text-gray-600 mt-1">Gérez les pays supportés</p>
                </div>
              </div>
              
              {/* Skeleton loading */}
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        // Affichage de l'erreur
        if (countryError) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Pays</h1>
                  <p className="text-gray-600 mt-1">Gérez les pays supportés</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{countryError}</p>
                  </div>
                </div>
                <button 
                  onClick={refreshCountryData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  style={{cursor: 'pointer'}}
                >
                  Réessayer
                </button>
              </div>
            </div>
          )
        }

        // Affichage principal des pays
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
            {/* Header Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
              
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Pays</h1>
                  <p className="text-blue-100 text-lg">Gérez les pays supportés par votre système</p>
                  <div className="flex gap-6 mt-4 text-sm">
                    <div>
                      <span className="text-blue-200">Total</span>
                      <p className="text-2xl font-bold text-white">{countryStats?.totalCountries || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Actifs</span>
                      <p className="text-2xl font-bold text-emerald-300">{countryStats?.activeCountries || 0}</p>
                    </div>
                    <div>
                      <span className="text-blue-200">Avec comptes</span>
                      <p className="text-2xl font-bold text-amber-300">{countryStats?.countriesWithAccounts || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateCountryForm(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg"
                    style={{cursor: 'pointer'}}
                  >
                    + Ajouter un pays
                  </button>
                </div>
              </div>
            </div>

            {/* Formulaire de création de pays */}
            {showCreateCountryForm && (
              <CreateCountryForm
                onSubmit={handleCreateCountry}
                onCancel={() => {
                  setShowCreateCountryForm(false)
                  setCreateCountryError(null)
                }}
                loading={createCountryLoading}
                error={createCountryError}
              />
            )}

            {/* Navigation des pays */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Pays Supportés</h2>
                <div className="flex items-center gap-2">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un pays..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 text-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent w-64"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCountryFilterChange('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        countryFilter === 'all'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Tous
                    </button>
                    <button 
                      onClick={() => handleCountryFilterChange('active')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        countryFilter === 'active'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Actifs
                    </button>
                    <button 
                      onClick={() => handleCountryFilterChange('frozen')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        countryFilter === 'frozen'
                          ? 'bg-[#8A56B2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      Inactifs
                    </button>
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg p-1">
                    <button
                      onClick={() => setCountryViewMode('table')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        countryViewMode === 'table'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <Table className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCountryViewMode('grid')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        countryViewMode === 'grid'
                          ? 'bg-[#8A56B2] text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      style={{cursor: 'pointer'}}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Liste des pays - selon le mode d'affichage */}
              {countryViewMode === 'grid' ? (
                // Mode Grille
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCountries.map((country) => (
                    <div 
                      key={country.id} 
                      className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#8A56B2] hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
                      onClick={() => window.location.href = `/countries/${country.id}`}
                    >
                      {/* Header avec drapeau et informations principales */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-md ${
                            country.active 
                              ? 'from-green-500 to-green-600' 
                              : country.accountsCount > 0 
                              ? 'from-blue-500 to-blue-600' 
                              : 'from-gray-500 to-gray-600'
                          }`}>
                            <div className="text-2xl">
                              {FarotyCountryService.getCountryFlag(country)}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{country.nameFr}</h3>
                            <p className="text-sm text-gray-600 font-medium">
                              {country.nameEn} • {country.code}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          country.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {country.active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      {/* Informations détaillées */}
                      <div className="space-y-3">
                        {/* Limites */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Limites de paiement</p>
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-xs text-blue-600 mb-1">Max paiement</p>
                              <p className="text-lg font-bold text-blue-900">
                                {FarotyCountryService.formatAmount(country.maxPaymentAmount)}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-indigo-600 mb-1">Max retrait</p>
                              <p className="text-lg font-bold text-indigo-900">
                                {country.maxWithdrawalAmount ? FarotyCountryService.formatAmount(country.maxWithdrawalAmount) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          {country.withdrawalValidationThreshold && (
                            <p className="text-xs text-gray-600 mt-2">
                              Seuil validation: {FarotyCountryService.formatAmount(country.withdrawalValidationThreshold)}
                            </p>
                          )}
                        </div>

                        {/* Métadonnées */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs text-amber-600 font-medium mb-1">Validation paiement</p>
                            <p className="text-sm font-semibold text-amber-900">{country.paymentValidationTime}h</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 font-medium mb-1">Validation retrait</p>
                            <p className="text-sm font-semibold text-purple-900">{country.withdrawalValidationTime}h</p>
                          </div>
                        </div>

                        {/* Statistiques */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <p>Comptes: {country.accountsCount}</p>
                          {country.paymentMethodsCount > 0 && (
                            <p className="text-blue-600 font-medium">{country.paymentMethodsCount} méthodes</p>
                          )}
                        </div>
                      </div>

                      {/* Indicateur de clic */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8A56B2]">
                          <path d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Mode Tableau
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Paiement</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Retrait</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comptes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCountries.map((country) => (
                          <tr 
                            key={country.id}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/countries/${country.id}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center shadow-sm mr-3 ${
                                  country.active 
                                    ? 'from-green-500 to-green-600' 
                                    : country.accountsCount > 0 
                                    ? 'from-blue-500 to-blue-600' 
                                    : 'from-gray-500 to-gray-600'
                                }`}>
                                  <div className="text-lg">
                                    {FarotyCountryService.getCountryFlag(country)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{country.nameFr}</div>
                                  <div className="text-xs text-gray-500">{country.nameEn}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{country.code}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {FarotyCountryService.formatAmount(country.maxPaymentAmount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {country.maxWithdrawalAmount ? FarotyCountryService.formatAmount(country.maxWithdrawalAmount) : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="text-xs text-gray-500">Paiement: {country.paymentValidationTime}h</div>
                                <div className="text-xs text-gray-500">Retrait: {country.withdrawalValidationTime}h</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{country.accountsCount}</div>
                              {country.paymentMethodsCount > 0 && (
                                <div className="text-xs text-blue-600">
                                  {country.paymentMethodsCount} méthodes
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                country.active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {country.active ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{countryStats?.totalCountries || 0} pays</span> • 
                    {countryStats?.activeCountries || 0} actifs • 
                    {countryStats?.countriesWithAccounts || 0} avec comptes
                  </p>
                  <button className="text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium transition-colors" style={{cursor: 'pointer'}}>
                    Gérer les pays →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'transactions':
        // Affichage du loading
        if (transactionLoading) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 md:p-8 space-y-6">
              {/* Header Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 pointer-events-none" />
              
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white overflow-hidden">
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-10 rounded-full" />
                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white opacity-10 rounded-full" />
                
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-clip-text text-white mb-2">Vue d'Ensemble des Transactions</h1>
                    <p className="text-blue-100 text-lg">Historique complet de toutes vos transactions</p>
                    <div className="flex gap-6 mt-4 text-sm">
                      <div>
                        <span className="text-blue-200">Total</span>
                        <p className="text-2xl font-bold text-white">0</p>
                      </div>
                      <div>
                        <span className="text-blue-200">Réussies</span>
                        <p className="text-2xl font-bold text-emerald-300">0</p>
                      </div>
                      <div>
                        <span className="text-blue-200">En attente</span>
                        <p className="text-2xl font-bold text-amber-300">0</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="relative inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Actualiser
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Skeleton loading */}
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 p-6 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="h-6 bg-gray-300 rounded mb-4 w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded mb-2 w-32"></div>
                            <div className="h-3 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        }

        // Affichage de l'erreur
        if (transactionError) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
                  <p className="text-gray-600 mt-1">Historique de toutes vos transactions</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{transactionError}</p>
                  </div>
                </div>
                <button 
                  onClick={refreshTransactionData}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  style={{cursor: 'pointer'}}
                >
                  Réessayer
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transactions</h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                  Statistiques sur l’historique consolidé (API locale), puis le tableau détaillé issu de l’API admin Faroty Pay.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refreshTransactionData()}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#8A56B2] hover:text-[#8A56B2]"
                style={{ cursor: 'pointer' }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Tout actualiser
              </button>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Vue consolidée
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Total transactions</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {transactionsTotalAllPages > 0
                      ? transactionsTotalAllPages
                      : (transactionStats?.totalTransactions ?? 0)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-gray-400">
                    {transactionsTotalAllPages > 0
                      ? 'Toutes les transactions enregistrées (toutes les pages, d’après l’API).'
                      : 'Total sur les lignes chargées si l’API ne renvoie pas le catalogue complet.'}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Comptes</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {accountStats?.totalAccounts ?? accounts.length}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">Total des comptes (103 premières pages, sans doublons).</p>
                  
                  {/* 4 comptes récents avec transactions */}
                  {getRecentAccountsWithTransactions().length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Comptes récents</p>
                      <div className="space-y-2">
                        {getRecentAccountsWithTransactions().map((account, index) => (
                          <div key={account.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 truncate" title={account.accountName}>
                              {account.accountName}
                            </span>
                            <span className="text-gray-500">
                              {account.accountMode}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Wallets</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900">
                    {walletStats?.totalWallets ?? wallets.length}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">Total des wallets (103 premières pages, sans doublons).</p>
                  
                  {/* 4 wallets récents avec transactions */}
                  {getRecentWalletsWithTransactions().length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Wallets récents</p>
                      <div className="space-y-2">
                        {getRecentWalletsWithTransactions().map((wallet, index) => (
                          <div key={wallet.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-700 truncate" title={wallet.refName || wallet.id}>
                              {wallet.refName || `Wallet ${index + 1}`}
                            </span>
                            <span className="text-gray-500">
                              {wallet.walletType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-gray-500">Frais des transactions par méthode de paiement</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-[#5c3d7d]">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF',
                      maximumFractionDigits: 0,
                    }).format(transactionStats?.totalFees ?? 0)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">Total des frais sur les transactions chargées.</p>
                  {transactionFeesByPaymentMethod.length > 0 ? (
                    <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto text-xs text-gray-700">
                      {transactionFeesByPaymentMethod.map(([method, amount]) => (
                        <li key={method} className="flex justify-between gap-2 border-b border-violet-100/80 pb-1 last:border-0">
                          <span className="truncate font-medium text-gray-800" title={method}>
                            {method}
                          </span>
                          <span className="shrink-0 tabular-nums text-[#5c3d7d]">
                            {new Intl.NumberFormat('fr-FR', {
                              style: 'currency',
                              currency: 'XAF',
                              maximumFractionDigits: 0,
                            }).format(amount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-xs text-gray-400">Aucune transaction chargée pour détailler les frais.</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Détail administrateur
              </h2>
              <AdminTransactionTable
                embedded
                showEmbeddedStats
                limit={20}
                autoRefresh={true}
                refreshInterval={60000}
                refreshSignal={adminTableRefreshSignal}
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// Composant wrapper qui gère les search params
function SearchParamsWrapper() {
  const searchParams = useSearchParams()
  const section = useMemo(() => searchParams.get('section') || 'overview', [searchParams])
  
  return <PaymentPageContent section={section} />
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8A56B2]"></div>
      </div>
    }>
      <SearchParamsWrapper />
    </Suspense>
  )
}
