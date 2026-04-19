// src/lib/db.js
// All Firestore read/write operations in one place

import {
  collection, addDoc, updateDoc, doc,
  getDocs, query, where, orderBy,
  serverTimestamp, getDoc, setDoc, deleteDoc
} from 'firebase/firestore'
import { db } from './firebase'

// ── ADMINS ────────────────────────────────────────────────────
export async function getAdminByEmail(email) {
  const snap = await getDocs(query(collection(db, 'admins'), where('email', '==', email)))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function createAdmin({ name, email, passwordHash }) {
  return addDoc(collection(db, 'admins'), {
    name, email, passwordHash, createdAt: serverTimestamp()
  })
}

export async function deleteAdmin(id) {
  return deleteDoc(doc(db, 'admins', id))
}

export async function getAllAdmins() {
  const snap = await getDocs(query(collection(db, 'admins'), orderBy('createdAt', 'asc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateAdminPassword(id, passwordHash) {
  return updateDoc(doc(db, 'admins', id), { passwordHash })
}

// ── OTP STORE ─────────────────────────────────────────────────
export async function saveOtp(email, otp, expiresAt) {
  await setDoc(doc(db, 'otps', email), { otp, expiresAt, createdAt: serverTimestamp() })
}

export async function getOtp(email) {
  const snap = await getDoc(doc(db, 'otps', email))
  return snap.exists() ? snap.data() : null
}

export async function deleteOtp(email) {
  return deleteDoc(doc(db, 'otps', email))
}

// ── INVENTORY RECORDS ─────────────────────────────────────────
export async function createRecord(data) {
  return addDoc(collection(db, 'records'), {
    ...data,
    status: 'Checked Out',
    returnTime: null,
    returnCondition: null,
    returnRemarks: null,
    createdAt: serverTimestamp()
  })
}

export async function returnRecord(id, { returnCondition, returnRemarks }) {
  return updateDoc(doc(db, 'records', id), {
    status: 'Returned',
    returnTime: new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    returnCondition,
    returnRemarks: returnRemarks || '—'
  })
}

export async function getAllRecords() {
  const snap = await getDocs(query(collection(db, 'records'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getRecordsByPrn(prn) {
  const snap = await getDocs(query(
    collection(db, 'records'),
    where('prn', '==', prn),
    orderBy('createdAt', 'desc')
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getCheckedOutRecords() {
  const snap = await getDocs(query(
    collection(db, 'records'),
    where('status', '==', 'Checked Out'),
    orderBy('createdAt', 'desc')
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
