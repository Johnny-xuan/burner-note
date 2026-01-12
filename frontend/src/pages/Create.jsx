import { useState } from 'react'
import { Flame, Lock, Clock, Paperclip, Copy, Check, X, Loader2 } from 'lucide-react'
import { generateKey, exportKey, encryptText, encryptFile, hashPassword } from '../utils/crypto'
import { createNote } from '../utils/api'
import { useTranslation } from '../utils/LanguageContext'

const EXPIRE_OPTIONS = [
  { label: 'expire.1h', value: 3600 },
  { label: 'expire.24h', value: 86400 },
  { label: 'expire.3d', value: 259200 },
  { label: 'expire.7d', value: 604800 }
]

// 密码强度评估
function getPasswordStrength(password, t) {
  if (!password) return { score: 0, label: '', color: '' }
  
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  const levels = [
    { score: 0, label: '', color: '' },
    { score: 1, label: t('create.passwordStrength.weak'), color: 'bg-red-500' },
    { score: 2, label: t('create.passwordStrength.fair'), color: 'bg-orange-500' },
    { score: 3, label: t('create.passwordStrength.normal'), color: 'bg-yellow-500' },
    { score: 4, label: t('create.passwordStrength.strong'), color: 'bg-green-500' },
    { score: 5, label: t('create.passwordStrength.veryStrong'), color: 'bg-green-600' },
  ]
  
  return levels[Math.min(score, 5)]
}

export default function Create() {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [password, setPassword] = useState('')
  const [expiresIn, setExpiresIn] = useState(86400)
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles].slice(0, 5))
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError(t('create.errorEmpty'))
      return
    }

    setLoading(true)
    setError('')

    try {
      // 生成加密密钥
      const key = await generateKey()
      const keyBase64 = await exportKey(key)

      // 加密文本
      const encrypted = await encryptText(content, key)

      // 加密文件
      const encryptedFiles = []
      for (const file of files) {
        const encryptedBlob = await encryptFile(file, key)
        encryptedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          encrypted: encryptedBlob
        })
      }

      // 密码哈希（可选）
      const pwHash = password ? await hashPassword(password) : null

      // 创建笔记
      const result = await createNote({
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        passwordHash: pwHash,
        expiresIn
      }, encryptedFiles)

      // 生成分享链接
      const url = `${window.location.origin}/note/${result.id}#${keyBase64}`
      setShareUrl(url)
    } catch (err) {
      console.error(err)
      setError(err.message || t('create.errorFailed'))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reset = () => {
    setContent('')
    setPassword('')
    setFiles([])
    setShareUrl('')
    setError('')
  }

  // 解析分享链接，分离 URL 和密钥
  const parseShareUrl = () => {
    if (!shareUrl) return { url: '', key: '' }
    const [url, key] = shareUrl.split('#')
    return { url, key }
  }

  const { url: noteUrl, key: noteKey } = parseShareUrl()

  const copyUrl = async () => {
    await navigator.clipboard.writeText(noteUrl)
    setCopied('url')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyKey = async () => {
    await navigator.clipboard.writeText(noteKey)
    setCopied('key')
    setTimeout(() => setCopied(false), 2000)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied('all')
    setTimeout(() => setCopied(false), 2000)
  }

  if (shareUrl) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('create.successTitle')}</h1>
            <p className="text-gray-400">{t('create.successDesc')}</p>
          </div>

          {/* 完整链接 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-400">{t('create.labelFullLink')}</label>
              <button
                onClick={copyAll}
                className="flex items-center gap-1 text-xs text-burn-400 hover:text-burn-300"
              >
                {copied === 'all' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === 'all' ? t('create.copied') : t('create.copy')}
              </button>
            </div>
            <div className="bg-gray-950 rounded-lg p-3">
              <p className="text-xs text-burn-400 break-all font-mono">{shareUrl}</p>
            </div>
          </div>

          {/* 分离显示 - 防止链接截断 */}
          <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl mb-6">
            <p className="text-yellow-400 text-sm font-medium mb-4">
              {t('create.warningSplit')}
            </p>
            
            {/* 笔记链接 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">{t('create.labelNoteUrl')}</label>
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300"
                >
                  {copied === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'url' ? t('create.copied') : t('create.copy')}
                </button>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-gray-300 break-all font-mono">{noteUrl}</p>
              </div>
            </div>

            {/* 解密密钥 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-500">{t('create.labelNoteKey')}</label>
                <button
                  onClick={copyKey}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300"
                >
                  {copied === 'key' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'key' ? t('create.copied') : t('create.copy')}
                </button>
              </div>
              <div className="bg-gray-900 rounded p-2">
                <p className="text-xs text-green-400 break-all font-mono">{noteKey}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={copyAll}
              className="flex items-center gap-2 px-6 py-3 bg-burn-600 hover:bg-burn-700 rounded-lg font-medium transition"
            >
              {copied === 'all' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied === 'all' ? t('create.copied') : t('create.copyAll')}
            </button>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
            >
              {t('create.btnNew')}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500">
            {t('create.footerHint')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('create.title')}</h1>
        <p className="text-gray-400">{t('create.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 内容输入 */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('create.labelContent')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('create.placeholderContent')}
            rows={8}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:border-burn-500 focus:ring-1 focus:ring-burn-500 outline-none transition resize-none"
          />
        </div>

        {/* 密码保护 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Lock className="w-4 h-4" />
            {t('create.labelPassword')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('create.placeholderPassword')}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl focus:border-burn-500 focus:ring-1 focus:ring-burn-500 outline-none transition"
          />
          {/* 密码强度指示器 */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getPasswordStrength(password, t).color}`}
                    style={{ width: `${(getPasswordStrength(password, t).score / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs ${
                  getPasswordStrength(password, t).score <= 2 ? 'text-red-400' : 
                  getPasswordStrength(password, t).score <= 3 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {getPasswordStrength(password, t).label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('create.passwordStrength.hint')}
              </p>
            </div>
          )}
        </div>

        {/* 过期时间 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            {t('create.labelExpire')}
          </label>
          <div className="grid grid-cols-4 gap-3">
            {EXPIRE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setExpiresIn(opt.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  expiresIn === opt.value
                    ? 'bg-burn-600 border-burn-600 text-white'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                {t(opt.label)}
              </button>
            ))}
          </div>
        </div>

        {/* 文件附件 */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Paperclip className="w-4 h-4" />
            {t('create.labelFiles')}
          </label>
          <div className="border-2 border-dashed border-gray-800 rounded-xl p-6 text-center hover:border-gray-700 transition">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              disabled={files.length >= 5}
            />
            <label 
              htmlFor="file-input" 
              className={`cursor-pointer ${files.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Paperclip className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">{t('create.fileHint')}</p>
              <p className="text-gray-500 text-xs mt-1">{t('create.fileSizeLimit')}</p>
            </label>
          </div>
          
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 bg-gray-900/50 rounded-lg">
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-burn-600 hover:bg-burn-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('create.btnEncrypt')}
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              {t('create.btnCreate')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}
