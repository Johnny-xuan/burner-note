import rateLimit from 'express-rate-limit'

// 全局速率限制
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每 IP 最多 100 请求
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
})

// 笔记读取的严格速率限制（防暴力破解密码）
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 5, // 每分钟最多 5 次尝试
  message: { error: 'Too many attempts, please wait a minute' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
})

// 创建笔记的速率限制
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 20, // 每小时最多创建 20 个笔记
  message: { error: 'Too many notes created, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
})
