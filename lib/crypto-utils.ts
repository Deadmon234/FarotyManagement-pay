// Utilitaires de cryptage pour les identifiants sensibles

// Clé de cryptage simple (en production, utiliser une clé plus sécurisée et la stocker de manière sécurisée)
const CRYPTO_KEY = 'Faroty2024SecureKey!@#$'

// Fonction simple de cryptage (XOR-based pour le développement)
// En production, utiliser des algorithmes plus robustes comme AES
export function encryptId(id: string): string {
  if (!id) return ''
  
  let encrypted = ''
  for (let i = 0; i < id.length; i++) {
    const charCode = id.charCodeAt(i)
    const keyChar = CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length)
    encrypted += String.fromCharCode(charCode ^ keyChar)
  }
  
  // Convertir en base64 pour l'affichage
  return btoa(encrypted)
}

// Fonction de décryptage
export function decryptId(encryptedId: string): string {
  if (!encryptedId) return ''
  
  try {
    const encrypted = atob(encryptedId)
    let decrypted = ''
    
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i)
      const keyChar = CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length)
      decrypted += String.fromCharCode(charCode ^ keyChar)
    }
    
    return decrypted
  } catch (error) {
    console.error('Erreur lors du décryptage:', error)
    return ''
  }
}

// Fonction pour masquer partiellement un identifiant (alternative au cryptage)
export function maskId(id: string, visibleChars: number = 8): string {
  if (!id) return ''
  
  if (id.length <= visibleChars) {
    return id
  }
  
  return id.substring(0, visibleChars) + '...'
}

// Fonction pour masquer une clé publique ou un token sensible
export function maskSensitiveKey(key: string, visibleChars: number = 12): string {
  if (!key) return ''
  
  if (key.length <= visibleChars + 4) {
    return maskId(key, visibleChars)
  }
  
  return key.substring(0, visibleChars) + '...' + key.substring(key.length - 4)
}

// Fonction pour formater l'affichage d'un identifiant avec option de cryptage
export function formatSecureId(
  id: string, 
  options: {
    method?: 'mask' | 'encrypt' | 'full'
    visibleChars?: number
    showTooltip?: boolean
  } = {}
): string {
  const { method = 'mask', visibleChars = 8, showTooltip = true } = options
  
  if (!id) return ''
  
  switch (method) {
    case 'mask':
      return maskId(id, visibleChars)
    case 'encrypt':
      return encryptId(id).substring(0, visibleChars) + '...'
    case 'full':
      return id
    default:
      return maskId(id, visibleChars)
  }
}

// Fonction pour vérifier si un identifiant est valide (non crypté)
export function isValidId(id: string): boolean {
  if (!id) return false
  
  // Vérifier si c'est un UUID ou un identifiant standard
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const standardIdRegex = /^[a-zA-Z0-9_-]+$/
  
  return uuidRegex.test(id) || standardIdRegex.test(id)
}

// Fonction pour sécuriser l'affichage des identifiants dans les logs
export function secureLog(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }
  
  const secured = { ...data }
  
  // Liste des champs sensibles à masquer
  const sensitiveFields = [
    'id',
    'userId', 
    'accountId',
    'walletId',
    'publicKey',
    'privateKey',
    'token',
    'apiKey',
    'secret'
  ]
  
  sensitiveFields.forEach(field => {
    if (secured[field]) {
      secured[field] = formatSecureId(secured[field], { method: 'mask', visibleChars: 8 })
    }
  })
  
  return secured
}
