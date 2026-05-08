import { Router } from 'express'
import { nanoid } from 'nanoid'
import { timingSafeEqual } from 'crypto'
import multer from 'multer'
import { redisClient } from '../utils/redis.js'
import { saveFile, getFile, deleteNoteFiles } from '../utils/storage.js'
import { readLimiter, createLimiter } from '../middleware/rateLimiter.js'

function isValidId(id) {
  return /^[A-Za-z0-9_-]{1,32}$/.test(id)
}

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 增加到 50MB
})

// 时序安全的字符串比较（防止时序攻击）
function safeCompare(a, b) {
  if (!a || !b) return false
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b))
  } catch {
    return false
  }
}

// 创建笔记
router.post('/', createLimiter, upload.array('files', 5), async (req, res) => {
  try {
    const { ciphertext, iv, passwordHash, passwordSalt, expiresIn, fileMetadata } = req.body
    
    if (!ciphertext || !iv) {
      return res.status(400).json({ error: 'Missing ciphertext or iv' })
    }

    if (ciphertext.length > 2 * 1024 * 1024) {
      return res.status(413).json({ error: 'Note content too large' })
    }

    const noteId = nanoid(16)
    const ttl = Math.min(parseInt(expiresIn) || 86400, 604800) // 默认24小时，最长7天

    // 处理文件上传（文件已在前端加密）
    const files = []
    if (req.files && req.files.length > 0) {
      let metadata = []
      if (fileMetadata) {
        try {
          metadata = JSON.parse(fileMetadata)
        } catch {
          return res.status(400).json({ error: 'Invalid file metadata' })
        }
      }
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]
        const meta = metadata[i] || {}
        const filename = `${i}_${nanoid(8)}`
        await saveFile(noteId, filename, file.buffer)
        files.push({
          filename,
          originalName: String(meta.name || file.originalname || '').slice(0, 255),
          size: meta.size || file.size,
          type: /^[\w.+-]+\/[\w.+-]+$/.test(meta.type) ? meta.type : 'application/octet-stream'
        })
      }
    }

    // 存储到 Redis
    const noteData = {
      ciphertext,
      iv,
      files: JSON.stringify(files),
      createdAt: Date.now().toString()
    }
    if (passwordHash) {
      noteData.passwordHash = passwordHash
      if (passwordSalt) noteData.passwordSalt = passwordSalt
    }

    await redisClient.hSet(`note:${noteId}`, noteData)
    await redisClient.expire(`note:${noteId}`, ttl)
    
    res.json({ 
      id: noteId,
      expiresAt: Date.now() + ttl * 1000
    })
  } catch (err) {
    console.error('Create note error:', err)
    res.status(500).json({ error: 'Failed to create note' })
  }
})

// 获取笔记元信息（不返回内容，用于检查是否需要密码）
router.get('/:id/meta', async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid note ID' })
    const exists = await redisClient.exists(`note:${id}`)
    
    if (!exists) {
      return res.status(404).json({ error: 'Note not found or already destroyed' })
    }

    const [passwordHash, passwordSalt] = await Promise.all([
      redisClient.hGet(`note:${id}`, 'passwordHash'),
      redisClient.hGet(`note:${id}`, 'passwordSalt')
    ])

    res.json({
      exists: true,
      requiresPassword: !!passwordHash,
      ...(passwordHash && passwordSalt ? { passwordSalt } : {})
    })
  } catch (err) {
    console.error('Get note meta error:', err)
    res.status(500).json({ error: 'Failed to get note info' })
  }
})

// 获取笔记（阅后即焚）
router.post('/:id/read', readLimiter, async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid note ID' })
    const { passwordHash: providedHash } = req.body

    const noteData = await redisClient.hGetAll(`note:${id}`)
    
    if (!noteData || !noteData.ciphertext) {
      return res.status(404).json({ error: 'Note not found or already destroyed' })
    }

    // 验证密码（时序安全比较，防止时序攻击）
    if (noteData.passwordHash && !safeCompare(noteData.passwordHash, providedHash)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // 原子性抢占笔记 — 确保只有一个请求能读取（防止并发竞争）
    const claimed = await redisClient.del(`note:${id}`)
    if (claimed === 0) {
      return res.status(404).json({ error: 'Note not found or already destroyed' })
    }

    // 获取文件数据（笔记已从 Redis 删除，继续读取文件）
    const files = JSON.parse(noteData.files || '[]')
    const fileContents = []
    for (const file of files) {
      const content = await getFile(id, file.filename)
      if (content) {
        fileContents.push({
          ...file,
          data: content.toString('base64')
        })
      }
    }

    await deleteNoteFiles(id)

    res.json({
      ciphertext: noteData.ciphertext,
      iv: noteData.iv,
      files: fileContents,
      destroyed: true
    })
  } catch (err) {
    console.error('Read note error:', err)
    res.status(500).json({ error: 'Failed to read note' })
  }
})

export default router
