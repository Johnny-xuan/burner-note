<p align="center">
  <img src="frontend/public/flame.svg" width="100" height="100" alt="BurnerNote Logo">
</p>

<h1 align="center">BurnerNote</h1>

<p align="center">
  <strong>Secure, End-to-End Encrypted, Self-Destructing Notes.</strong>
</p>

<p align="center">
  <a href="https://burnernote.j-o-x.tech">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#security-disclosure">Security</a>
</p>

---

End-to-end encrypted, self-destructing note service with zero-knowledge architecture. All encryption happens in your browser using the Web Crypto API.

## Features

- **End-to-End Encryption** - Uses AES-256-GCM, with all encryption performed in the browser.
- **Zero-Knowledge Architecture** - The server only stores ciphertexts; decryption keys are passed via URL fragments and never touch the server.
- **Self-Destructing** - Notes are immediately destroyed from the server after being read.
- **Password Protection** - Optional extra layer of security with password hashing.
- **Auto-Expiration** - Set an expiration time after which unread notes are automatically destroyed.
- **Encrypted Attachments** - Support for up to 5 encrypted file attachments (max 50MB per file).

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + Web Crypto API
- **Backend**: Node.js + Express + Redis + Multer
- **Infrastructure**: Docker Compose

## Quick Start

### Development

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Visit: [https://burnernote.j-o-x.tech](https://burnernote.j-o-x.tech)

### Production Deployment

```bash
docker-compose up -d --build
```

The service will be available at [https://burnernote.j-o-x.tech](https://burnernote.j-o-x.tech) (or your configured domain).

## How It Works

1. **Creating a Note**
   - The browser generates a 256-bit random key.
   - Note content and attachments are encrypted using AES-256-GCM.
   - The ciphertext is sent to the server, which returns a unique Note ID.
   - A shareable link is generated: `/note/{id}#{key}`. The key stays in the URL fragment and is never sent to the server.

2. **Reading a Note**
   - When the link is accessed, the browser extracts the key from the URL fragment.
   - It requests the ciphertext from the server.
   - The server returns the data and immediately deletes the record.
   - The browser decrypts the content locally and displays it to the user.

## API

### Create Note
```
POST /api/notes
Content-Type: multipart/form-data

ciphertext: string      # Encrypted content
iv: string             # Initialization vector
passwordHash?: string  # Optional password hash
expiresIn: number      # Expiration time in seconds
files?: File[]         # Encrypted files
fileMetadata?: string  # File metadata JSON
```

### Get Note Metadata
```
GET /api/notes/:id/meta

Response: { exists: boolean, requiresPassword: boolean }
```

### Read Note (Self-Destruct)
```
POST /api/notes/:id/read
Content-Type: application/json

{ passwordHash?: string }

Response: { ciphertext, iv, files, destroyed: true }
```

## Security Disclosure

- Encryption relies on the native Web Crypto API.
- Keys are never transmitted to or stored on the server.
- Once read, notes are purged from Redis and the filesystem permanently.
- It is recommended to share links via secure, E2E encrypted channels.

## License

MIT
