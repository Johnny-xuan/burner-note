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

- **End-to-End Encryption** - AES-256-GCM, all encryption performed in the browser.
- **Zero-Knowledge Architecture** - The server only stores ciphertexts; decryption keys travel in the URL fragment and never reach the server.
- **Self-Destructing** - Notes are atomically destroyed from the server after the first successful read.
- **Optional Password Gate** - A *server-side access check* (PBKDF2, 100k iterations, per-note random salt). The password does **not** participate in encryption — the actual decryption key is always in the URL fragment.
- **Auto-Expiration** - Set a TTL (up to 7 days) after which unread notes are automatically destroyed.
- **Encrypted Attachments** - Up to 5 encrypted file attachments (max 50MB per file).

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
   - Note content and attachments are encrypted with AES-256-GCM (random 12-byte IV per note).
   - The ciphertext is sent to the server, which returns a unique Note ID.
   - A shareable link is generated: `/note/{id}#{key}`. The key stays in the URL fragment — browsers never send fragments in HTTP requests.
   - If a password is set, the browser derives a verifier via PBKDF2 (100k iterations, random salt) and sends the verifier + salt. The password itself is never sent.

2. **Reading a Note**
   - The browser extracts the key from the URL fragment.
   - If the note is password-gated, the browser fetches the salt from `/meta`, recomputes the PBKDF2 verifier, and submits it.
   - The server compares verifiers in constant time. On match, it atomically claims the note (`DEL` race-guarded), returns the ciphertext, and purges the record.
   - The browser decrypts locally with the URL-fragment key and renders the content.

> The decryption key is **independent** of the password. An attacker with the password but not the URL fragment cannot decrypt; an attacker with the URL but not the password cannot reach the ciphertext (server rejects them at the gate).

## API

### Create Note
```
POST /api/notes
Content-Type: multipart/form-data

ciphertext: string       # Encrypted content (max 2MB)
iv: string               # Initialization vector
passwordHash?: string    # Optional PBKDF2 verifier (256-bit, base64)
passwordSalt?: string    # Required iff passwordHash is set; 16-byte salt, base64
expiresIn: number        # TTL in seconds (capped at 7 days)
files?: File[]           # Encrypted files (up to 5, 50MB each)
fileMetadata?: string    # File metadata JSON
```

### Get Note Metadata
```
GET /api/notes/:id/meta

Response: {
  exists: boolean,
  requiresPassword: boolean,
  passwordSalt?: string   # Returned iff password-gated; client uses it to recompute the verifier
}
```

### Read Note (Self-Destruct)
```
POST /api/notes/:id/read
Content-Type: application/json

{ passwordHash?: string }

Response: { ciphertext, iv, files, destroyed: true }
```

## Security

See [SECURITY.md](SECURITY.md) for the full threat model and design rationale.

Quick summary:

- AES-256-GCM via the native Web Crypto API
- Decryption keys live in URL fragments only — never sent to or stored on the server
- Password gate uses PBKDF2 (100k iterations, per-note random salt) — independent of encryption
- Atomic burn-after-read (race-guarded `DEL`) prevents double-reads on concurrent requests
- Notes purged from Redis and disk on first successful read
- Rate limiting on read endpoint defends the password gate against online brute force

Share links via E2E-encrypted channels (Signal, etc.). Do not paste them into systems that retain history (Slack, email).

## License

MIT
