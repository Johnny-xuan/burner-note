import { Link } from 'react-router-dom'
import { Flame, Lock, Clock, FileText, Shield, Eye } from 'lucide-react'
import { useTranslation } from '../utils/LanguageContext'

export default function Home() {
  const { t } = useTranslation()
  
  const featureIcons = [Lock, Eye, Shield, Clock, Lock, FileText]
  const features = t('home.features').map((f, i) => ({
    ...f,
    icon: featureIcons[i]
  }))

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-burn-600/20 rounded-full">
            <Flame className="w-16 h-16 text-burn-500" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {t('home.heroTitle')}<span className="text-burn-500">{t('home.heroTitleHighlight')}</span>{t('home.heroTitleEnd')}
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          {t('home.heroDesc')}
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-burn-600 hover:bg-burn-700 rounded-xl text-lg font-semibold transition shadow-lg shadow-burn-600/30"
        >
          <Flame className="w-5 h-5" />
          {t('home.btnCreate')}
        </Link>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">{t('home.featuresTitle')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-burn-600/50 transition">
              <f.icon className="w-10 h-10 text-burn-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
