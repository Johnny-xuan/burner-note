import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { Flame, Lock, Loader2, AlertTriangle, Download, FileText, Key } from 'lucide-react'
import { importKey, decryptText, decryptFile, hashPassword } from '../utils/crypto'
import { getNoteMeta, readNote } from '../utils/api'
import { useTranslation } from '../utils/LanguageContext'

export default function View() {
  const { id } = useParams()
  const location = useLocation()
  const { t } = useTranslation()
  
  const [status, setStatus] = useState('loading') // loading, needKey, password, ready, destroyed, error
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [manualKey, setManualKey] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [decrypting, setDecrypting] = useState(false)

  // 从 URL hash 获取密钥，或使用手动输入的密钥
  const keyBase64 = location.hash.slice(1) || manualKey.trim()

  useEffect(() => {
    checkNote()
  }, [id])

  const checkNote = async () => {
    try {
      const meta = await getNoteMeta(id)
      if (!meta.exists) {
        setStatus('destroyed')
        return
      }

      // 如果 URL 中没有密钥，让用户手动输入
      if (!location.hash.slice(1)) {
        setStatus('needKey')
        setRequiresPassword(meta.requiresPassword)
        return
      }
      
      if (meta.requiresPassword) {
        setRequiresPassword(true)
        setStatus('password')
      } else {
        setStatus('ready')
      }
    } catch (err) {
      setStatus('error')
      setError(t('view.errorNotFound'))
    }
  }

  const handleKeySubmit = () => {
    if (!manualKey.trim()) {
      setError(t('view.keyError'))
      return
    }
    setError('')
    if (requiresPassword) {
      setStatus('password')
    } else {
      setStatus('ready')
    }
  }

  const handleRead = async () => {
    setDecrypting(true)
    setError('')

    try {
      // 导入密钥
      const key = await importKey(keyBase64)

      // 获取密码哈希
      const pwHash = password ? await hashPassword(password) : null

      // 读取笔记（服务器将立即删除）
      const data = await readNote(id, pwHash)

      // 解密文本
      const decrypted = await decryptText(data.ciphertext, data.iv, key)
      setContent(decrypted)

      // 解密文件
      if (data.files && data.files.length > 0) {
        const decryptedFiles = []
        for (const file of data.files) {
          try {
            const blob = await decryptFile(file.data, key, file.type)
            decryptedFiles.push({
              name: file.originalName,
              type: file.type,
              size: file.size,
              blob,
              url: URL.createObjectURL(blob)
            })
          } catch (err) {
            console.error('Failed to decrypt file:', file.originalName, err)
          }
        }
        setFiles(decryptedFiles)
      }

      setStatus('success')
    } catch (err) {
      console.error('Decrypt error:', err)
      if (err.message === 'Invalid password') {
        setError(t('view.errorInvalidPassword'))
      } else {
        setError(t('view.errorDecryptFailed'))
        setStatus('error')
      }
    } finally {
      setDecrypting(false)
    }
  }

  const downloadFile = (file) => {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    a.click()
  }

  // Loading
  if (status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Loader2 className="w-12 h-12 animate-spin text-burn-500 mx-auto mb-4" />
        <p className="text-gray-400">{t('view.checking')}</p>
      </div>
    )
  }

  // Need Key - 链接被截断，需要手动输入密钥
  if (status === 'needKey') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-yellow-500/30 p-8 text-center">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('view.needKeyTitle')}</h1>
          <p className="text-gray-400 mb-6">
            {t('view.needKeyDesc')}
          </p>

          <div className="mb-6">
            <input
              type="text"
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder={t('view.placeholderKey')}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition text-center font-mono text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleKeySubmit()}
            />
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleKeySubmit}
            disabled={!manualKey.trim()}
            className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition"
          >
            <Key className="w-5 h-5" />
            {t('view.btnContinue')}
          </button>

          <p className="mt-6 text-xs text-gray-500">
            {t('view.keyHint')}
          </p>
        </div>
      </div>
    )
  }

  // Destroyed
  if (status === 'destroyed') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="w-8 h-8 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('view.destroyedTitle')}</h1>
          <p className="text-gray-400 mb-6">{t('view.destroyedDesc')}</p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-burn-600 hover:bg-burn-700 rounded-lg font-medium transition"
          >
            <Flame className="w-5 h-5" />
            {t('view.btnNew')}
          </Link>
        </div>
      </div>
    )
  }

  // Error
  if (status === 'error') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-red-500/30 p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('view.errorTitle')}</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition"
          >
            {t('view.btnBack')}
          </Link>
        </div>
      </div>
    )
  }

  // Success - 显示解密后的内容
  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 rounded-2xl border border-burn-500/30 p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
            <div className="w-10 h-10 bg-burn-500/20 rounded-full flex items-center justify-center">
              <Flame className="w-5 h-5 text-burn-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('view.decryptedTitle')}</h1>
              <p className="text-sm text-burn-400">{t('view.decryptedDesc')}</p>
            </div>
          </div>

          {/* 笔记内容 */}
          <div className="bg-gray-950 rounded-xl p-6 mb-6">
            <pre className="whitespace-pre-wrap break-words text-gray-100 font-sans">
              {content}
            </pre>
          </div>

          {/* 文件附件 */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400">{t('view.labelFiles')}</h3>
              {files.map((file, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between px-4 py-3 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(file)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    {t('view.btnDownload')}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              {t('view.warningDestroyed')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Ready / Password required
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-8 text-center">
        <div className="w-16 h-16 bg-burn-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          {requiresPassword ? (
            <Lock className="w-8 h-8 text-burn-500" />
          ) : (
            <Flame className="w-8 h-8 text-burn-500" />
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-2">
          {requiresPassword ? t('view.passwordTitle') : t('view.decryptedTitle')}
        </h1>
        <p className="text-gray-400 mb-6">
          {requiresPassword 
            ? t('view.passwordDesc')
            : t('view.hintDestroy')
          }
        </p>

        {requiresPassword && (
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('view.placeholderPassword')}
              className="w-full max-w-xs px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:border-burn-500 focus:ring-1 focus:ring-burn-500 outline-none transition text-center"
              onKeyDown={(e) => e.key === 'Enter' && handleRead()}
            />
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleRead}
          disabled={decrypting || (requiresPassword && !password)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-burn-600 hover:bg-burn-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg font-semibold transition"
        >
          {decrypting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('view.btnReading')}
            </>
          ) : (
            <>
              <Flame className="w-5 h-5" />
              {t('view.btnRead')}
            </>
          )}
        </button>

        <p className="mt-6 text-sm text-gray-500">
          {t('view.hintDestroy')}
        </p>
      </div>
    </div>
  )
}
