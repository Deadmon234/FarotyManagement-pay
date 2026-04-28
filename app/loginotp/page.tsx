'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, CheckCircle, ChevronDown, Search } from 'lucide-react'
import { AuthService, ApiError } from '../../lib/api-service'
import { StorageService } from '../../lib/storage-service'
import { Country, CountryService } from '../../lib/country-service'

// ─── Inline phone field with integrated country selector ──────────────────────
interface InlinePhoneInputProps {
  value: string
  onChange: (raw: string, country: Country | null) => void
  disabled?: boolean
  autoFocus?: boolean
}

// Fonction pour obtenir le nombre de chiffres attendus selon le pays
const getExpectedDigits = (country: Country | null): number => {
  if (!country) return 9 // Valeur par défaut
  
  const phoneCode = country.phone_code.replace(/[^\d]/g, '')
  
  // Règles spécifiques par pays
  switch (phoneCode) {
    case '237': // Cameroun
      return 8 // 6XX XXX XX (8 chiffres après le code)
    case '33': // France
      return 9 // XX XX XX XX XX (9 chiffres)
    case '1': // USA/Canada
      return 10 // XXX XXX XXXX (10 chiffres)
    case '44': // Royaume-Uni
      return 10 // XXXX XXX XXX (10 chiffres)
    case '49': // Allemagne
      return 10 // XXX XXX XXXXX (10 chiffres)
    case '81': // Japon
      return 10 // XX XXXX XXXX (10 chiffres)
    case '86': // Chine
      return 11 // XXX XXXX XXXX (11 chiffres)
    case '91': // Inde
      return 10 // XXXXX XXXXXX (10 chiffres)
    case '212': // Maroc
      return 9 // XX XX XX XX X (9 chiffres)
    case '216': // Tunisie
      return 8 // XX XXX XXX (8 chiffres)
    default:
      return 9 // Valeur par défaut pour les autres pays
  }
}

// Fonction pour générer le placeholder selon le pays
const getPhonePlaceholder = (country: Country | null): string => {
  const digits = getExpectedDigits(country)
  const phoneCode = country?.phone_code.replace(/[^\d]/g, '')
  
  if (phoneCode === '237') {
    return '6 XX XX XX XX' // Format camerounais
  } else if (phoneCode === '33') {
    return 'XX XX XX XX XX' // Format français
  } else if (phoneCode === '1') {
    return 'XXX XXX XXXX' // Format américain
  } else if (phoneCode === '44') {
    return 'XXXX XXX XXX' // Format britannique
  } else if (phoneCode === '49') {
    return 'XXX XXX XXXXX' // Format allemand
  } else if (phoneCode === '81') {
    return 'XX XXXX XXXX' // Format japonais
  } else if (phoneCode === '86') {
    return 'XXX XXXX XXXX' // Format chinois
  } else if (phoneCode === '91') {
    return 'XXXXX XXXXXX' // Format indien
  } else if (phoneCode === '212') {
    return 'XX XX XX XX X' // Format marocain
  } else if (phoneCode === '216') {
    return 'XX XXX XXX' // Format tunisien
  } else {
    // Format générique basé sur le nombre de chiffres
    return Array(digits).fill('X').join(' ')
  }
}

function InlinePhoneInput({ value, onChange, disabled, autoFocus }: InlinePhoneInputProps) {
  const [countries,      setCountries]      = useState<Country[]>([])
  const [common,         setCommon]         = useState<Country[]>([])
  const [country,        setCountry]        = useState<Country | null>(null)
  const [dropOpen,       setDropOpen]       = useState(false)
  const [search,         setSearch]         = useState('')
  const [filtered,       setFiltered]       = useState<Country[]>([])
  const [loadingCountry, setLoadingCountry] = useState(true)
  const [localNumber,    setLocalNumber]    = useState('')   // digits after dial code

  const dropRef    = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)

  // Load countries + default Cameroon
  useEffect(() => {
    const init = async () => {
      try {
        await CountryService.initialize()
        const all  = CountryService.getAllCountries()
        const comm = CountryService.getCommonCountries()
        setCountries(all)
        setCommon(comm)
        setFiltered(comm)
        const cm = CountryService.getCountryByPhoneCode('237')
        if (cm) {
          setCountry(cm)
          onChange(`+237`, cm)
        }
      } finally {
        setLoadingCountry(false)
      }
    }
    init()
  }, [])

  // Filter countries by search
  useEffect(() => {
    setFiltered(
      search.trim() === ''
        ? common
        : CountryService.searchCountries(search)
    )
  }, [search, common])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // When dropdown opens, auto-focus the search input
  useEffect(() => {
    if (dropOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [dropOpen])

  const dialCode = country
    ? (country.phone_code.startsWith('+') ? country.phone_code : `+${country.phone_code}`)
    : ''

  const selectCountry = (c: Country) => {
    setCountry(c)
    setDropOpen(false)
    setSearch('')
    const dial = c.phone_code.startsWith('+') ? c.phone_code : `+${c.phone_code}`
    onChange(`${dial}${localNumber}`, c)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only digits, spaces and hyphens
    const raw = e.target.value.replace(/[^\d\s\-]/g, '')
    
    // Limiter le nombre de chiffres selon le pays
    const expectedDigits = getExpectedDigits(country)
    const digitsOnly = raw.replace(/\s/g, '')
    if (digitsOnly.length > expectedDigits) {
      return // Ne pas permettre plus de chiffres que prévu
    }
    
    setLocalNumber(raw)
    onChange(`${dialCode}${raw}`, country)
  }

  return (
    <div ref={dropRef} className="relative">
      {/* Combined field: flag button + number input */}
      <div className={`flex items-stretch border-2 rounded-xl overflow-visible transition-all duration-200
        ${dropOpen ? 'border-[#8A56B2] ring-2 ring-[#8A56B2]/20' : 'border-gray-200 hover:border-gray-300'}
        focus-within:border-[#8A56B2] focus-within:ring-2 focus-within:ring-[#8A56B2]/20
        ${disabled ? 'opacity-50 pointer-events-none bg-gray-50' : 'bg-white'}
      `}>
        {/* Country button */}
        <button
          type="button"
          onClick={() => !disabled && setDropOpen(v => !v)}
          disabled={disabled}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          className="flex items-center gap-1.5 pl-3 pr-2.5 py-3 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors shrink-0 rounded-l-xl"
        >
          {loadingCountry ? (
            <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" />
          ) : (
            <span className="text-xl leading-none text-[#8A56B2]">{country?.emoji ?? '🌍'}</span>
          )}
          <span className="text-sm font-semibold text-gray-700 min-w-[36px]">
            {loadingCountry ? '…' : dialCode}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Phone number input */}
        <input
          ref={inputRef}
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={getPhonePlaceholder(country)}
          disabled={disabled}
          autoFocus={autoFocus}
          className="flex-1 px-4 py-3 text-gray-800 text-sm placeholder-gray-400 bg-transparent outline-none rounded-r-xl"
        />
      </div>

      {/* Dropdown */}
      {dropOpen && (
        <div className="absolute z-[9999] left-0 right-0 w-full min-w-[280px] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
             style={{ 
               bottom: 'calc(100% + 8px)',
               maxHeight: '60vh',
               overflowY: 'auto'
             }}>
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher un pays..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-gray-800 placeholder-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20"
              />
            </div>
          </div>

          {/* Section label */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {search.trim() ? 'Résultats' : 'Pays courants'}
            </span>
          </div>

          {/* Country list */}
          <div className="overflow-y-auto max-h-56">
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">Aucun pays trouvé</p>
            ) : (
              filtered.map(c => {
                const code = c.phone_code.startsWith('+') ? c.phone_code : `+${c.phone_code}`
                const selected = country?.id === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCountry(c)}
                    style={{ cursor: 'pointer' }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                      ${selected ? 'bg-[#8A56B2]/8 text-[#8A56B2]' : 'hover:bg-gray-50 text-gray-800'}
                    `}
                  >
                    <span className="text-xl leading-none">{c.emoji}</span>
                    <span className="flex-1 text-sm font-medium truncate">{c.name}</span>
                    <span className="text-xs font-semibold text-gray-400 shrink-0">{code}</span>
                    {selected && (
                      <span className="w-4 h-4 rounded-full bg-[#8A56B2] flex items-center justify-center shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Login page ──────────────────────────────────────────────────────────
export default function LoginOTP() {
  const [step,      setStep]      = useState(1)
  const [loginMode, setLoginMode] = useState<'email' | 'telephone'>('email')

  const [email,         setEmail]         = useState('')
  const [telephone,     setTelephone]     = useState('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [emailLoading,  setEmailLoading]  = useState(false)
  const [emailError,    setEmailError]    = useState('')
  const [tempToken,     setTempToken]     = useState<string | null>(null)

  const [otp,        setOtp]        = useState(['', '', '', '', ''])
  const [otpLoading, setOtpLoading] = useState(false)
  const [timeLeft,   setTimeLeft]   = useState(180)
  const [canResend,  setCanResend]  = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [otpError,   setOtpError]   = useState('')

  const inputRefs    = useRef<(HTMLInputElement | null)[]>([])
  const emailInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (step === 2 && timeLeft > 0 && !canResend) {
      const t = setTimeout(() => setTimeLeft(v => v - 1), 1000)
      return () => clearTimeout(t)
    }
    if (timeLeft === 0) setCanResend(true)
  }, [timeLeft, canResend, step])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const validateTelephone = (v: string) => {
    const clean = v.replace(/\s/g, '')
    
    if (!selectedCountry) {
      return /^\+[\d]{1,4}[\d]{6,14}$/.test(clean)
    }
    
    const phoneCode = selectedCountry.phone_code.replace(/[^\d]/g, '')
    const expectedDigits = getExpectedDigits(selectedCountry)
    
    // Validation spécifique pour chaque pays
    switch (phoneCode) {
      case '237': // Cameroun
        return /^\+237[67]\d{7}$/.test(clean) // 8 chiffres après +237
      case '33': // France
        return /^\+33[\d]{9}$/.test(clean) // 9 chiffres après +33
      case '1': // USA/Canada
        return /^\+1[\d]{10}$/.test(clean) // 10 chiffres après +1
      case '44': // Royaume-Uni
        return /^\+44[\d]{10}$/.test(clean) // 10 chiffres après +44
      case '49': // Allemagne
        return /^\+49[\d]{10}$/.test(clean) // 10 chiffres après +49
      case '81': // Japon
        return /^\+81[\d]{10}$/.test(clean) // 10 chiffres après +81
      case '86': // Chine
        return /^\+86[\d]{11}$/.test(clean) // 11 chiffres après +86
      case '91': // Inde
        return /^\+91[\d]{10}$/.test(clean) // 10 chiffres après +91
      case '212': // Maroc
        return /^\+212[\d]{9}$/.test(clean) // 9 chiffres après +212
      case '216': // Tunisie
        return /^\+216[\d]{8}$/.test(clean) // 8 chiffres après +216
      default:
        // Validation générique basée sur le nombre de chiffres attendus
        const phoneRegex = new RegExp(`^\\+${phoneCode}[\\d]{${expectedDigits}}$`)
        return phoneRegex.test(clean)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const contact = loginMode === 'email' ? email.trim() : telephone.trim()

    if (!contact) { setEmailError(loginMode === 'email' ? 'Veuillez entrer votre adresse email' : 'Veuillez entrer votre numéro de téléphone'); return }
    if (loginMode === 'email' && !validateEmail(contact))     { setEmailError('Adresse email invalide'); return }
    if (loginMode === 'telephone' && !validateTelephone(contact)) { setEmailError('Numéro de téléphone invalide'); return }

    setEmailLoading(true); setEmailError('')
    try {
      const res = await AuthService.sendOtp(contact)
      if (res.success) {
        setTempToken(res.data.tempToken)
        StorageService.saveTempToken(res.data.tempToken)
        setStep(2); setTimeLeft(180); setCanResend(false)
        setOtp(['', '', '', '', '']); setOtpError('')
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else {
        setEmailError(res.message || 'Erreur lors de l\'envoi du code')
      }
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : 'Une erreur est survenue.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    const next = [...otp]; next[index] = value; setOtp(next)
    if (value && index < 4) inputRefs.current[index + 1]?.focus()
    if (otpError) setOtpError('')
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').trim()
    if (/^\d{5}$/.test(p)) { setOtp(p.split('')); inputRefs.current[4]?.focus() }
  }

  const handleOtpVerify = async () => {
    const otpVal = otp.join('')
    if (otpVal.length !== 5) { setOtpError('Veuillez entrer les 5 chiffres'); return }
    const token = tempToken || StorageService.getTempToken()
    if (!token) { setOtpError('Session expirée. Veuillez recommencer.'); return }
    setOtpLoading(true); setOtpError('')
    try {
      const res = await AuthService.verifyOtp(otpVal, token)
      if (res.success) {
        StorageService.saveAuthData(res.data)
        setIsVerified(true)
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setOtpError(res.message || 'Code incorrect.'); setOtp(['', '', '', '', '']); inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Une erreur est survenue.')
      setOtp(['', '', '', '', '']); inputRefs.current[0]?.focus()
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!canResend) return
    const contact = loginMode === 'email' ? email.trim() : telephone.trim()
    setOtpLoading(true); setCanResend(false); setTimeLeft(180); setOtp(['', '', '', '', '']); setOtpError('')
    inputRefs.current[0]?.focus()
    try {
      const res = await AuthService.sendOtp(contact)
      if (res.success) {
        setTempToken(res.data.tempToken); StorageService.saveTempToken(res.data.tempToken)
      } else {
        setOtpError(res.message || 'Erreur lors du renvoi du code')
      }
    } catch (err) {
      setOtpError(err instanceof ApiError ? err.message : 'Une erreur est survenue.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep(1); setEmail(''); setTelephone(''); setEmailError('')
    setOtp(['', '', '', '', '']); setOtpError(''); setTimeLeft(180); setCanResend(false)
    setTempToken(null); StorageService.clearTempToken()
    setTimeout(() => emailInputRef.current?.focus(), 100)
  }

  return (
    <div className="min-h-screen bg-purple-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-4xl shadow-lg border border-gray-200 overflow-hidden">

          {/* Logo + title */}
          <div className="p-8 text-center">
            <img src="/logo_empty.png" alt="Faroty" className="w-32 h-auto mx-auto mb-4 object-contain" />
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion</h2>
                <p className="text-gray-600 text-sm">Choisissez votre mode de connexion</p>
              </>
            )}
          </div>

          <div className="px-8 pb-8">
            {isVerified ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Connexion réussie !</h2>
                <p className="text-gray-600">Redirection en cours…</p>
              </div>

            ) : step === 1 ? (
              <div>
                {/* Mode toggle */}
                <div className="flex mb-6 bg-gray-100 rounded-2xl p-1">
                  {(['email', 'telephone'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setLoginMode(mode); setEmailError('') }}
                      style={{ cursor: 'pointer' }}
                      className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                        loginMode === mode
                          ? 'bg-white text-[#8A56B2] shadow-sm font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {mode === 'email' ? 'Email' : 'Téléphone'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleEmailSubmit}>
                  <div className="mb-5">
                    {loginMode === 'email' ? (
                      /* ── Email input ── */
                      <input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (emailError) setEmailError('') }}
                        placeholder="votre-email@domaine.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 text-gray-800 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 transition-all outline-none text-sm"
                        disabled={emailLoading}
                        autoFocus
                      />
                    ) : (
                      /* ── Integrated phone input ── */
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600">
                          Numéro de téléphone
                        </label>
                        <InlinePhoneInput
                          value={telephone}
                          onChange={(raw, c) => {
                            setTelephone(raw)
                            setSelectedCountry(c)
                            if (emailError) setEmailError('')
                          }}
                          disabled={emailLoading}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {emailError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{emailError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      emailLoading ||
                      !(loginMode === 'email'
                        ? email.trim() && validateEmail(email.trim())
                        : telephone.trim() && validateTelephone(telephone.trim()))
                    }
                    className="w-full bg-[#8A56B2] text-white py-3 rounded-xl font-semibold hover:bg-[#7a48a0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ cursor: 'pointer' }}
                  >
                    {emailLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Envoi…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Connexion
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    )}
                  </button>
                </form>
              </div>

            ) : (
              /* ── Step 2 : OTP ── */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Vérification</h3>
                  <p className="text-sm text-gray-500">
                    Un code à 5 chiffres a été envoyé à{' '}
                    <span className="font-semibold text-gray-700">
                      {loginMode === 'email' ? email : telephone}
                    </span>
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-600 text-center">
                    Saisissez le code reçu
                  </label>
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { inputRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="w-14 h-14 text-center text-gray-800 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#8A56B2] focus:ring-2 focus:ring-[#8A56B2]/20 transition-all outline-none"
                        disabled={otpLoading}
                      />
                    ))}
                  </div>
                </div>

                {otpError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 text-center">{otpError}</p>
                  </div>
                )}

                <div className="text-center">
                  {!canResend ? (
                    <p className="text-sm text-gray-500">
                      Renvoyer le code dans{' '}
                      <span className="font-semibold text-[#8A56B2]">{formatTime(timeLeft)}</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="text-[#8A56B2] hover:text-[#7a48a0] font-medium text-sm transition-colors"
                      style={{ cursor: 'pointer' }}
                    >
                      Renvoyer le code
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleBackToEmail}
                    disabled={otpLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center"
                    style={{ cursor: 'pointer' }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </button>
                  <button
                    onClick={handleOtpVerify}
                    disabled={otpLoading || otp.join('').length !== 5}
                    className="flex-1 bg-[#8A56B2] text-white py-3 rounded-xl font-semibold hover:bg-[#7a48a0] transition-all disabled:opacity-50 flex items-center justify-center"
                    style={{ cursor: 'pointer' }}
                  >
                    {otpLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Vérification…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Vérifier
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400 flex items-center justify-center gap-2 flex-wrap">
          <span className="cursor-pointer hover:text-gray-600 transition-colors">Conditions d'utilisation</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-gray-600 transition-colors">Politique de confidentialité</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-gray-600 transition-colors">Centre d'assistance</span>
        </div>
      </div>
    </div>
  )
}
