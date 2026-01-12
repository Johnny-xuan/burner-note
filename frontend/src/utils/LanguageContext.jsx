import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './i18n'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  // Try to get language from localStorage or browser settings
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('language')
    if (saved && (saved === 'zh' || saved === 'en')) return saved
    
    const browserLang = navigator.language.split('-')[0]
    return browserLang === 'zh' ? 'zh' : 'en'
  }

  const [lang, setLang] = useState(getInitialLanguage())

  useEffect(() => {
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = (path) => {
    const keys = path.split('.')
    let current = translations[lang]
    for (const key of keys) {
      if (current[key] === undefined) return path
      current = current[key]
    }
    return current
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
