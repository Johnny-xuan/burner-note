// Web Crypto API 封装 - 端到端加密

// 生成随机密钥 (256-bit for AES-GCM)
export async function generateKey() {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  return key
}

// 导出密钥为 base64
export async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

// 从 base64 导入密钥
export async function importKey(keyBase64) {
  const keyBuffer = base64ToArrayBuffer(keyBase64)
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

// 加密文本
export async function encryptText(plaintext, key) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )
  
  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  }
}

// 解密文本
export async function decryptText(ciphertextBase64, ivBase64, key) {
  const ciphertext = base64ToArrayBuffer(ciphertextBase64)
  const iv = base64ToArrayBuffer(ivBase64)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}

// 加密文件
export async function encryptFile(file, key) {
  const arrayBuffer = await file.arrayBuffer()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  )
  
  // 将 IV 和密文合并
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)
  
  return new Blob([combined], { type: 'application/octet-stream' })
}

// 解密文件
export async function decryptFile(encryptedBase64, key, mimeType) {
  const combined = base64ToArrayBuffer(encryptedBase64)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )
  
  return new Blob([decrypted], { type: mimeType })
}

// 生成密码哈希 (用于验证，不是加密密钥)
export async function generatePasswordSalt() {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return arrayBufferToBase64(salt)
}

export async function hashPassword(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: base64ToArrayBuffer(salt), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return arrayBufferToBase64(bits)
}

// 工具函数
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const CHUNK = 8192
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
