import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Flame className="w-8 h-8 text-burn-500" />
            <span className="text-xl font-bold">BurnerNote</span>
          </Link>
          <Link 
            to="/create"
            className="px-4 py-2 bg-burn-600 hover:bg-burn-700 rounded-lg text-sm font-medium transition"
          >
            创建笔记
          </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-800 mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>端到端加密 · 零知识架构 · 阅后即焚</p>
        </div>
      </footer>
    </div>
  )
}
