import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'

export async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function saveFile(noteId, filename, buffer) {
  await ensureUploadDir()
  const noteDir = path.join(UPLOAD_DIR, noteId)
  await fs.mkdir(noteDir, { recursive: true })
  const filePath = path.join(noteDir, filename)
  await fs.writeFile(filePath, buffer)
  return filePath
}

export async function getFile(noteId, filename) {
  const filePath = path.join(UPLOAD_DIR, noteId, filename)
  try {
    return await fs.readFile(filePath)
  } catch {
    return null
  }
}

export async function deleteNoteFiles(noteId) {
  const noteDir = path.join(UPLOAD_DIR, noteId)
  try {
    await fs.rm(noteDir, { recursive: true, force: true })
  } catch (err) {
    console.error('Failed to delete note files:', err)
  }
}
