import { Router } from 'express'
import { nanoid } from 'nanoid'
import { timingSafeEqual } from 'crypto'
import multer from 'multer'
import { redisClient } from '../utils/redis.js'
import { saveFile, getFile, deleteNoteFiles } from '../utils/storage.js'
import { readLimiter, createLimiter } from '../middleware/rateLimiter.js'

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
    const { ciphertext, iv, passwordHash, expiresIn, fileMetadata } = req.body
    
    if (!ciphertext || !iv) {
      return res.status(400).json({ error: 'Missing ciphertext or iv' })
    }

    const noteId = nanoid(16)
    const ttl = Math.min(parseInt(expiresIn) || 86400, 604800) // 默认24小时，最长7天

    // 处理文件上传（文件已在前端加密）
    const files = []
    if (req.files && req.files.length > 0) {
      const metadata = fileMetadata ? JSON.parse(fileMetadata) : []
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i]
        const meta = metadata[i] || {}
        const filename = `${i}_${nanoid(8)}`
        await saveFile(noteId, filename, file.buffer)
        files.push({
          filename,
          originalName: meta.name || file.originalname,
          size: meta.size || file.size,
          type: meta.type || file.mimetype
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
    const exists = await redisClient.exists(`note:${id}`)
    
    if (!exists) {
      return res.status(404).json({ error: 'Note not found or already destroyed' })
    }

    const passwordHash = await redisClient.hGet(`note:${id}`, 'passwordHash')
    
    res.json({
      exists: true,
      requiresPassword: !!passwordHash
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
    const { passwordHash: providedHash } = req.body

    const noteData = await redisClient.hGetAll(`note:${id}`)
    
    if (!noteData || !noteData.ciphertext) {
      return res.status(404).json({ error: 'Note not found or already destroyed' })
    }

    // 验证密码（时序安全比较，防止时序攻击）
    if (noteData.passwordHash && !safeCompare(noteData.passwordHash, providedHash)) {
      return res.status(401).json({ error: 'Invalid password' })
    }

    // 获取文件数据
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

    // 立即删除笔记和文件
    await redisClient.del(`note:${id}`)
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
