# Security Model

## Zero-Knowledge Design

The decryption key is generated entirely in the browser and placed in the URL fragment
(the part after `#`). Fragment identifiers are never sent to the server in HTTP requests,
so the server has no access to the key at any point.

What the server stores per note (in Redis):
- `ciphertext` — AES-GCM encrypted content (base64)
- `iv` — 12-byte random IV (base64)
- `passwordHash` — PBKDF2-derived hash of the access password (base64), if set
- `passwordSalt` — random 16-byte salt used for that hash (base64), if set
- `files` — metadata + encrypted file blobs on disk
- `createdAt`, Redis TTL

The server never stores or logs the plaintext, the raw password, or the decryption key.

## Encryption Scheme

**Note content and files:**
- Algorithm: AES-GCM, 256-bit key
- IV: 12-byte cryptographically random value, unique per note (content) and per file
- For files, the IV is prepended to the ciphertext blob before upload
- Key derivation: none — the key is generated fresh via `crypto.subtle.generateKey` and
  exported raw to base64 for inclusion in the URL fragment

**Password gate (access control only, not encryption):**
- The optional password does not affect the encryption key
- Client derives: `PBKDF2(password, salt, 100_000 iterations, SHA-256, 256 bits)`
- Salt: 16 bytes cryptographically random, generated per note, stored server-side
- The server compares stored hash to submitted hash using `timingSafeEqual` to prevent
  timing side-channels
- Even a correct password reveals only the ciphertext; decryption still requires the
  URL fragment

**Base64 encoding:**
- Uses chunked processing (8192 bytes/chunk) to avoid stack overflow on large inputs

## Burn-After-Read

On the first successful read (`POST /:id/read`):
1. The note's Redis key is deleted (`DEL note:<id>`)
2. All associated files are deleted from disk (`deleteNoteFiles`)

Both deletions happen within the same request handler before the response is sent.
There is no deferred cleanup.

**Caveats:**
- Deletion is sequential, not atomic. A crash between Redis delete and file delete
  would leave orphaned files on disk (no ciphertext to pair them with, so they are
  inert but not automatically removed).
- There is no server-side copy, log, or cache of the returned ciphertext after deletion.

TTL is capped at 7 days (604800 s). Unread notes are automatically expired by Redis.

## Threat Model

### Protected against

| Threat | Mechanism |
|--------|-----------|
| Passive server compromise (read Redis/disk) | Server only holds ciphertext; key is never transmitted |
| Network eavesdropping on API traffic | Key lives in fragment, not transmitted; TLS covers ciphertext in transit |
| Link-only attacker who lacks the optional password | PBKDF2 gate with rate limiting blocks brute-force |
| Password brute-force via API | `readLimiter`: 5 attempts/minute/IP |
| Replay / second read of the same note | Note deleted on first successful read |
| Note ID enumeration / injection | IDs validated against `/^[A-Za-z0-9_-]{1,32}$/` |
| Oversized payload abuse | Ciphertext capped at 2 MB; JSON body limit 1 MB |
| Cross-origin API abuse | CORS restricted to `FRONTEND_URL` env var |

### Not protected against

- **Malicious server operator**: the operator controls the serving infrastructure and
  could modify the frontend JS to exfiltrate the key before encryption, log request
  bodies, or return a modified ciphertext. E2E encryption is not a substitute for
  trusting the host if you serve the client code from the same origin.
- **Attacker with the full URL**: the fragment is part of the URL. Anyone who obtains
  the full link (browser history, logs, share via an unencrypted channel, referrer
  headers) can decrypt the note.
- **Client-side malware**: a compromised browser or OS can read memory, intercept
  Web Crypto calls, or capture the URL before the note is opened.
- **Server-side TOCTOU on burn**: a race between two simultaneous read requests could
  theoretically return the ciphertext twice. Redis `DEL` is atomic, but the
  `hGetAll` → `DEL` sequence is not. A Lua script or `GETDEL`-style atomic operation
  would eliminate this window.
- **Metadata leakage**: IP addresses of creator and reader, note creation time, and
  file counts/sizes are observable by the server.
- **Password strength**: the PBKDF2 gate is only as strong as the chosen password.
  No server-side complexity policy is enforced.

## Rate Limiting

Three layers, all per-IP:

| Limiter | Window | Limit | Purpose |
|---------|--------|-------|---------|
| `globalLimiter` | 15 min | 100 req | Broad abuse prevention |
| `createLimiter` | 60 min | 20 req | Prevent storage exhaustion |
| `readLimiter` | 1 min | 5 req | Block password brute-force |

The backend sets `trust proxy 1` to read the real IP from `X-Forwarded-For` when
sitting behind a single reverse proxy (e.g., Nginx).

## Reporting Vulnerabilities

Open an issue at the project's GitHub repository. For sensitive disclosures, contact
the maintainer directly via the email listed on the GitHub profile before filing
a public issue.
