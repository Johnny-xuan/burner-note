const API_BASE = '/api'

export async function createNote(data, files = []) {
  const formData = new FormData()
  formData.append('ciphertext', data.ciphertext)
  formData.append('iv', data.iv)
  formData.append('expiresIn', data.expiresIn.toString())
  
  if (data.passwordHash) {
    formData.append('passwordHash', data.passwordHash)
  }
  
  if (files.length > 0) {
    const fileMetadata = []
    for (const file of files) {
      formData.append('files', file.encrypted, file.name)
      fileMetadata.push({
        name: file.name,
        size: file.size,
        type: file.type
      })
    }
    formData.append('fileMetadata', JSON.stringify(fileMetadata))
  }
  
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    body: formData
  })
  
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to create note')
  }
  
  return res.json()
}

export async function getNoteMeta(id) {
  const res = await fetch(`${API_BASE}/notes/${id}/meta`)
  
  if (!res.ok) {
    if (res.status === 404) {
      return { exists: false }
    }
    throw new Error('Failed to get note info')
  }
  
  return res.json()
}

export async function readNote(id, passwordHash = null) {
  const res = await fetch(`${API_BASE}/notes/${id}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passwordHash })
  })
  
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to read note')
  }
  
  return res.json()
}
