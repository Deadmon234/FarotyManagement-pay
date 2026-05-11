'use client'

import React, { useState } from 'react'
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Users, 
  CreditCard, 
  Shield, 
  Globe, 
  Key,
  Webhook
} from 'lucide-react'

interface EditAccountModalProps {
  account: any
  section: 'basic' | 'security' | 'webhooks'
  isOpen: boolean
  onClose: () => void
  onSave: (updatedAccount: any) => void
}

export default function EditAccountModal({ account, section, isOpen, onClose, onSave }: EditAccountModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialiser les données du formulaire selon la section
  React.useEffect(() => {
    if (isOpen) {
      switch (section) {
        case 'basic':
          setFormData({
            accountName: account.accountName,
            accountSubName: account.accountSubName || '',
            accountMode: account.accountMode
          })
          break
        case 'security':
          setFormData({
            publicKey: account.publicKey,
            twoFactorEnabled: account.twoFactorEnabled || false
          })
          break
        case 'webhooks':
          setFormData({
            webhookUrl: account.webhookUrl || '',
            webhookActive: account.webhookActive || false,
            webhookEvents: account.webhookEvents || []
          })
          break
      }
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, section, account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)
      
      // Validation selon la section
      if (section === 'basic') {
        if (!formData.accountName?.trim()) {
          throw new Error('Le nom du compte est requis')
        }
      }
      
      if (section === 'security') {
        if (!formData.publicKey?.trim()) {
          throw new Error('La clé publique est requise')
        }
      }
      
      if (section === 'webhooks') {
        if (formData.webhookUrl && !isValidUrl(formData.webhookUrl)) {
          throw new Error('L\'URL du webhook est invalide')
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

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const renderBasicInfoForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du compte
        </label>
        <input
          type="text"
          value={formData.accountName || ''}
          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          placeholder="Nom du compte"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sous-nom
        </label>
        <input
          type="text"
          value={formData.accountSubName || ''}
          onChange={(e) => setFormData({ ...formData, accountSubName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          placeholder="Sous-nom optionnel"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mode du compte
        </label>
        <select
          value={formData.accountMode || 'LIVE'}
          onChange={(e) => setFormData({ ...formData, accountMode: e.target.value as 'LIVE' | 'TEST' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
        >
          <option value="LIVE">LIVE</option>
          <option value="TEST">TEST</option>
        </select>
      </div>
    </form>
  )

  const renderSecurityForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clé publique
        </label>
        <textarea
          value={formData.publicKey || ''}
          onChange={(e) => setFormData({ ...formData, publicKey: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent font-mono text-sm"
          rows={4}
          placeholder="Clé publique du compte"
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={formData.twoFactorEnabled || false}
            onChange={(e) => setFormData({ ...formData, twoFactorEnabled: e.target.checked })}
            className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
          />
          Authentification à deux facteurs
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Sécurité renforcée</p>
            <p className="text-xs mt-1">
              L'activation de l'authentification à deux facteurs et la gestion sécurisée des clés renforcent la protection de votre compte.
            </p>
          </div>
        </div>
      </div>
    </form>
  )

  const renderWebhooksForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL du webhook
        </label>
        <input
          type="url"
          value={formData.webhookUrl || ''}
          onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A56B2] focus:border-transparent"
          placeholder="https://example.com/webhook"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={formData.webhookActive || false}
            onChange={(e) => setFormData({ ...formData, webhookActive: e.target.checked })}
            className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
          />
          Activer le webhook
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Événements à notifier
        </label>
        <div className="space-y-2">
          {['payment.created', 'payment.completed', 'wallet.created', 'account.updated'].map((event) => (
            <label key={event} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.webhookEvents?.includes(event) || false}
                onChange={(e) => {
                  const events = formData.webhookEvents || []
                  if (e.target.checked) {
                    setFormData({ ...formData, webhookEvents: [...events, event] })
                  } else {
                    setFormData({ ...formData, webhookEvents: events.filter((ev: string) => ev !== event) })
                  }
                }}
                className="w-4 h-4 text-[#8A56B2] border-gray-300 rounded focus:ring-[#8A56B2]"
              />
              <span className="text-gray-700">{event}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Webhook className="w-4 h-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Configuration des webhooks</p>
            <p className="text-xs mt-1">
              Les webhooks permettent de recevoir des notifications en temps réel sur les événements de votre compte.
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
      case 'security':
        return 'Modifier la sécurité'
      case 'webhooks':
        return 'Modifier les webhooks'
      default:
        return 'Modifier'
    }
  }

  const getSectionIcon = () => {
    switch (section) {
      case 'basic':
        return <Users className="w-5 h-5" />
      case 'security':
        return <Shield className="w-5 h-5" />
      case 'webhooks':
        return <Webhook className="w-5 h-5" />
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
              {section === 'security' && renderSecurityForm()}
              {section === 'webhooks' && renderWebhooksForm()}
              
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
