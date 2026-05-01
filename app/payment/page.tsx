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
import { LayoutGrid, Table, Search } from 'lucide-react'

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
      const [transactionsData, statsData] = await Promise.all([
        TransactionService.getTransactions(),
        TransactionService.getTransactionStats()
      ])
      setTransactions(transactionsData)
      setTransactionStats(statsData)
    } catch (err) {
      console.error('Erreur lors du chargement des transactions:', err)
      setTransactionError('Impossible de charger les transactions. Veuillez réessayer.')
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

  // Charger les transactions quand on est sur la section transactions
  useEffect(() => {
    if (section === 'transactions') {
      loadTransactions()
    }
  }, [section, loadTransactions])

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
    loadTransactions()
  }, [loadTransactions])

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
        return (
          <div className="space-y-6">
            {/* Vue d'ensemble */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-blue-600 text-sm font-semibold mb-2">Solde Total</p>
                <p className="text-3xl font-bold text-blue-900">2 450 000 XOF</p>
                <p className="text-xs text-blue-600 mt-2">11 wallets actifs</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                <p className="text-green-600 text-sm font-semibold mb-2">Transactions</p>
                <p className="text-3xl font-bold text-green-900">1 214</p>
                <p className="text-xs text-green-600 mt-2">Ce mois-ci</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                <p className="text-purple-600 text-sm font-semibold mb-2">Méthodes Actives</p>
                <p className="text-3xl font-bold text-purple-900">6</p>
                <p className="text-xs text-purple-600 mt-2">Sur 8 disponibles</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                <p className="text-orange-600 text-sm font-semibold mb-2">Taux de Succès</p>
                <p className="text-3xl font-bold text-orange-900">98.5%</p>
                <p className="text-xs text-orange-600 mt-2">Transactions réussies</p>
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
                      <span className="text-sm font-medium text-gray-900">Gérer les Wallets</span>
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
                      <span className="text-sm font-medium text-gray-900">Comptes Bancaires</span>
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
                      <span className="text-sm font-medium text-gray-900">Méthodes de Paiement</span>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Wallets</h1>
                <p className="text-gray-600 mt-1">Gérez vos wallets et soldes</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshWalletData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rafraîchir
                </button>
                <button 
                  onClick={() => setShowCreateWalletForm(true)}
                  className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2" 
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Nouveau Wallet
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-blue-600 text-sm font-semibold mb-2">Solde Total</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {walletStats ? WalletService.formatAmountXOF(walletStats.totalBalance) : '0 XOF'}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-auto">
                  {walletStats ? `${walletStats.totalWallets} wallets` : '0 wallets'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-green-600 text-sm font-semibold mb-2">Disponible</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {walletStats ? WalletService.formatAmountXOF(walletStats.totalAvailable || 0) : '0 XOF'}
                  </span>
                </p>
                <p className="text-xs text-green-600 mt-auto">
                  {walletStats ? `${walletStats.activeWallets} actifs` : '0 actifs'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-purple-600 text-sm font-semibold mb-2">Transactions</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {walletStats ? walletStats.totalTransactions : '0'}
                  </span>
                </p>
                <p className="text-xs text-purple-600 mt-auto">Total</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-orange-600 text-sm font-semibold mb-2">En Attente</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {walletStats ? WalletService.formatAmountXOF(walletStats.totalPending) : '0 XOF'}
                  </span>
                </p>
                <p className="text-xs text-orange-600 mt-auto">
                  {walletStats ? `${walletStats.frozenWallets} gelés` : '0 gelés'}
                </p>
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
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                            </svg>
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
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                                  </svg>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Comptes</h1>
                <p className="text-gray-600 mt-1">Gérez vos comptes bancaires</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshAccountData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rafraîchir
                </button>
                <button 
                  onClick={() => setShowCreateAccountForm(true)}
                  className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2" 
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Ajouter un Compte
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-blue-600 text-sm font-semibold mb-2">Total Comptes</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {accountStats ? accountStats.totalAccounts : '0'}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-auto">
                  {accountStats ? `${accountStats.activeAccounts} actifs` : '0 actifs'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-green-600 text-sm font-semibold mb-2">Solde Disponible</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {accountStats ? AccountService.formatAmount(accountStats.totalAvailable || 0) : '0 XOF'}
                  </span>
                </p>
                <p className="text-xs text-green-600 mt-auto">
                  {accountStats ? `${accountStats.accountsWithWallets} avec wallets` : '0 avec wallets'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-purple-600 text-sm font-semibold mb-2">Wallets Totaux</p>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Méthodes de paiement</h1>
                <p className="text-gray-600 mt-1">Configurez vos méthodes de paiement</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshPaymentMethodData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rafraîchir
                </button>
                <button 
                  onClick={() => setShowCreatePaymentMethodForm(true)}
                  className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2" 
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Ajouter une méthode
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-blue-600 text-sm font-semibold mb-2">Total Méthodes</p>
                <p className="text-3xl font-bold text-blue-900">
                  {paymentMethodStats ? paymentMethodStats.totalMethods : '0'}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  {paymentMethodStats ? `${paymentMethodStats.activeMethods} actives` : '0 actives'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                <p className="text-green-600 text-sm font-semibold mb-2">Transactions</p>
                <p className="text-3xl font-bold text-green-900">
                  {paymentMethodStats ? paymentMethodStats.totalTransactions : '0'}
                </p>
                <p className="text-xs text-green-600 mt-2">Total</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                <p className="text-purple-600 text-sm font-semibold mb-2">Mobile Money</p>
                <p className="text-3xl font-bold text-purple-900">
                  {paymentMethodStats ? paymentMethodStats.mobileMoneyMethods : '0'}
                </p>
                <p className="text-xs text-purple-600 mt-2">Disponibles</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                <p className="text-orange-600 text-sm font-semibold mb-2">Frais Moyens</p>
                <p className="text-3xl font-bold text-orange-900">
                  {paymentMethodStats ? paymentMethodStats.averageFeeRate.toFixed(2) + '%' : '0%'}
                </p>
                <p className="text-xs text-orange-600 mt-2">Par transaction</p>
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

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Pays</h1>
                <p className="text-gray-600 mt-1">Gérez les pays supportés</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshCountryData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rafraîchir
                </button>
                <button 
                  onClick={() => setShowCreateCountryForm(true)}
                  className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2" 
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Ajouter un pays
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-blue-600 text-sm font-semibold mb-2">Pays Actifs</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {countryStats ? countryStats.activeCountries : '0'}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-auto">
                  {countryStats ? `sur ${countryStats.totalCountries} totaux` : 'sur 0 totaux'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-green-600 text-sm font-semibold mb-2">Comptes Totaux</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {countryStats ? countryStats.totalAccounts : '0'}
                  </span>
                </p>
                <p className="text-xs text-green-600 mt-auto">
                  {countryStats ? `${countryStats.countriesWithAccounts} pays avec comptes` : '0 pays avec comptes'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-purple-600 text-sm font-semibold mb-2">Méthodes</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-purple-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {countryStats ? countryStats.totalPaymentMethods : '0'}
                  </span>
                </p>
                <p className="text-xs text-purple-600 mt-auto">
                  {countryStats ? `${countryStats.countriesWithPaymentMethods} pays avec méthodes` : '0 pays avec méthodes'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm min-h-[140px] flex flex-col">
                <p className="text-orange-600 text-sm font-semibold mb-2">Limites Moyennes</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-orange-900 leading-tight break-words min-h-[3rem] flex items-center">
                  <span className="truncate w-full">
                    {countryStats ? FarotyCountryService.formatAmount(countryStats.averagePaymentAmount) : '0 XOF'}
                  </span>
                </p>
                <p className="text-xs text-orange-600 mt-auto">Paiement moyen</p>
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
                  <p className="text-gray-600 mt-1">Historique de toutes vos transactions</p>
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
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600 mt-1">Historique de toutes vos transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshTransactionData}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  style={{cursor: 'pointer'}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Rafraîchir
                </button>
                <button className="bg-[#8A56B2] text-white px-4 py-2 rounded-lg hover:bg-[#7a48a0] transition-colors flex items-center gap-2" style={{cursor: 'pointer'}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7v10h18M7 3l10 4-10 4"/>
                  </svg>
                  Exporter
                </button>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-blue-600 text-sm font-semibold mb-2">Total Transactions</p>
                <p className="text-3xl font-bold text-blue-900">
                  {transactionStats ? transactionStats.totalTransactions : '0'}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  {transactionStats ? `${transactionStats.successRate}% de succès` : '0% de succès'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                <p className="text-green-600 text-sm font-semibold mb-2">Montant Total</p>
                <p className="text-3xl font-bold text-green-900">
                  {transactionStats ? TransactionService.formatAmount(transactionStats.totalAmount, 'XOF') : '0 XOF'}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {transactionStats ? TransactionService.formatAmount(transactionStats.totalFees, 'XOF') + ' de frais' : '0 XOF de frais'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                <p className="text-purple-600 text-sm font-semibold mb-2">Complétées</p>
                <p className="text-3xl font-bold text-purple-900">
                  {transactionStats ? transactionStats.completedTransactions : '0'}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  {transactionStats ? `${transactionStats.pendingTransactions} en attente` : '0 en attente'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                <p className="text-orange-600 text-sm font-semibold mb-2">Moyenne</p>
                <p className="text-3xl font-bold text-orange-900">
                  {transactionStats ? TransactionService.formatAmount(transactionStats.averageAmount, 'XOF') : '0 XOF'}
                </p>
                <p className="text-xs text-orange-600 mt-2">Par transaction</p>
              </div>
            </div>

            {/* Filtres et navigation */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Historique des Transactions</h2>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" style={{cursor: 'pointer'}}>
                    Toutes
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-[#8A56B2] text-white rounded-lg hover:bg-[#7a48a0] transition-colors" style={{cursor: 'pointer'}}>
                    Complétées
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" style={{cursor: 'pointer'}}>
                    En attente
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" style={{cursor: 'pointer'}}>
                    Échouées
                  </button>
                </div>
              </div>

              {/* Liste des transactions */}
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#8A56B2] transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center ${
                          TransactionService.getTransactionTypeColor(transaction.type) === 'green' 
                            ? 'from-green-500 to-green-600' 
                            : TransactionService.getTransactionTypeColor(transaction.type) === 'red'
                            ? 'from-red-500 to-red-600'
                            : TransactionService.getTransactionTypeColor(transaction.type) === 'blue'
                            ? 'from-blue-500 to-blue-600'
                            : 'from-purple-500 to-purple-600'
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {TransactionService.getTransactionTypeIcon(transaction.type)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {TransactionService.getTransactionTypeText(transaction.type)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {TransactionService.formatReference(transaction.reference)} • {transaction.paymentMethod.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {TransactionService.formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {TransactionService.formatAmount(transaction.amount, transaction.currency)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full mt-1 ${
                          TransactionService.getTransactionStatusColor(transaction.status) === 'green' 
                            ? 'bg-green-100 text-green-700'
                            : TransactionService.getTransactionStatusColor(transaction.status) === 'red'
                            ? 'bg-red-100 text-red-700'
                            : TransactionService.getTransactionStatusColor(transaction.status) === 'orange'
                            ? 'bg-orange-100 text-orange-700'
                            : TransactionService.getTransactionStatusColor(transaction.status) === 'blue'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {TransactionService.getTransactionStatusText(transaction.status)}
                        </span>
                        {transaction.fee > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Frais: {TransactionService.formatAmount(transaction.fee, transaction.currency)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions rapides */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{transactionStats?.totalTransactions || 0} transactions</span> • 
                    {transactionStats?.completedTransactions || 0} complétées • 
                    {transactionStats?.pendingTransactions || 0} en attente
                  </p>
                  <button className="text-[#8A56B2] hover:text-[#7a48a0] text-sm font-medium transition-colors" style={{cursor: 'pointer'}}>
                    Voir tout l'historique →
                  </button>
                </div>
              </div>
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
