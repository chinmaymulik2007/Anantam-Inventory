// scripts/seed-admin.mjs
// Run ONCE to create your first admin account in Firebase
// Usage: node scripts/seed-admin.mjs
//
// BEFORE RUNNING:
//   1. npm install firebase
//   2. Fill in your Firebase config below (same as src/lib/firebase.js)
//   3. node scripts/seed-admin.mjs

import { initializeApp } from 'firebase/app'
import { getFirestore, addDoc, collection } from 'firebase/firestore'
import { createHash } from 'crypto'

// ── FILL IN YOUR FIREBASE CONFIG ──────────────────────────────
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
}

// ── SET YOUR FIRST ADMIN CREDENTIALS ─────────────────────────
const ADMIN_NAME     = "Head Admin"
const ADMIN_EMAIL    = "admin@pccoemotorsports.in"
const ADMIN_PASSWORD = "anantam2024"   // ← change this after first login!

// ─────────────────────────────────────────────────────────────

function sha256(text) {
  return createHash('sha256').update(text).digest('hex')
}

async function main() {
  const app = initializeApp(firebaseConfig)
  const db  = getFirestore(app)

  const passwordHash = sha256(ADMIN_PASSWORD)

  await addDoc(collection(db, 'admins'), {
    name:         ADMIN_NAME,
    email:        ADMIN_EMAIL.toLowerCase(),
    passwordHash,
    createdAt:    new Date()
  })

  console.log('✅ Admin created successfully!')
  console.log(`   Name:     ${ADMIN_NAME}`)
  console.log(`   Email:    ${ADMIN_EMAIL}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
  console.log('')
  console.log('⚠️  Change your password after first login!')
  process.exit(0)
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1) })
