// src/lib/crypto.js
// Uses the browser's built-in Web Crypto API — no extra packages needed

export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, hash) {
  const h = await hashPassword(password)
  return h === hash
}

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
