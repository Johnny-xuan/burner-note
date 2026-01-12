import { Link } from 'react-router-dom'
import { Flame, Languages } from 'lucide-react'
import { useTranslation } from '../utils/LanguageContext'

export default function Layout({ children }) {
  const { lang, setLang, t } = useTranslation()

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Flame className="w-8 h-8 text-burn-500" />
            <span className="text-xl font-bold">BurnerNote</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-400 flex items-center gap-1"
              title={lang === 'zh' ? 'Switch to English' : '切换至中文'}
            >
              <Languages className="w-5 h-5" />
              <span className="text-xs uppercase font-medium">{lang === 'zh' ? 'EN' : 'CN'}</span>
            </button>
            <Link 
              to="/create"
              className="px-4 py-2 bg-burn-600 hover:bg-burn-700 rounded-lg text-sm font-medium transition"
            >
              {t('nav.create')}
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>{t('footer.tagline')}</p>
        </div>
      </footer>
    </div>
  )
}
