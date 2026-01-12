import { Link } from 'react-router-dom'
import { Flame, Lock, Clock, FileText, Shield, Eye } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Lock,
      title: '端到端加密',
      desc: '所有加密操作在浏览器本地完成，服务器永远无法读取你的内容'
    },
    {
      icon: Eye,
      title: '阅后即焚',
      desc: '笔记被阅读后立即销毁，无法再次访问'
    },
    {
      icon: Shield,
      title: '零知识架构',
      desc: '密钥通过 URL 片段传递，服务器从不接收密钥'
    },
    {
      icon: Clock,
      title: '自动过期',
      desc: '设置过期时间，即使未被阅读也会自动销毁'
    },
    {
      icon: Lock,
      title: '密码保护',
      desc: '可选添加密码，双重保护你的敏感信息'
    },
    {
      icon: FileText,
      title: '文件附件',
      desc: '支持上传加密文件，一同阅后即焚'
    }
  ]

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
          发送<span className="text-burn-500">阅后即焚</span>的加密笔记
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          端到端加密，零知识架构，无追踪。
          <br />
          你的秘密，只有收件人能看到。
        </p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-burn-600 hover:bg-burn-700 rounded-xl text-lg font-semibold transition shadow-lg shadow-burn-600/30"
        >
          <Flame className="w-5 h-5" />
          创建加密笔记
        </Link>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-center mb-8">核心特性</h2>
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
