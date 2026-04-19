// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAdminByEmail, saveOtp, getOtp, deleteOtp, updateAdminPassword } from '../lib/db'
import { generateOtp, hashPassword } from '../lib/crypto'
import toast from 'react-hot-toast'
import { FloatingThemeToggle } from '../components/Header'

export default function ForgotPassword() {
  const [step, setStep]       = useState(1) // 1=email, 2=otp+newpass
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [newPass, setNewPass] = useState('')
  const [confPass, setConfPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCd, setResendCd] = useState(0)
  const [err, setErr]         = useState('')
  const [msg, setMsg]         = useState('')
  const nav                   = useNavigate()

  async function sendOtp() {
    setErr(''); setMsg('')
    if (!email) return setErr('Please enter your email.')
    setLoading(true)
    try {
      const admin = await getAdminByEmail(email.trim().toLowerCase())
      if (!admin) { setErr('No admin account found with this email.'); return }

      const code      = generateOtp()
      const expiresAt = Date.now() + 5 * 60 * 1000
      await saveOtp(email.trim().toLowerCase(), code, expiresAt)

      // Call the Vercel serverless function to send real email
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: code, name: admin.name })
      })

      if (!res.ok) throw new Error('Email send failed')

      setMsg(`OTP sent to ${email}. Check your inbox (and spam folder).`)
      setStep(2)
      startResendCooldown()
    } catch (e) {
      console.error(e)
      setErr('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function startResendCooldown() {
    setResendCd(60)
    const interval = setInterval(() => {
      setResendCd(c => { if (c <= 1) { clearInterval(interval); return 0 } return c - 1 })
    }, 1000)
  }

  async function resendOtp() {
    if (resendCd > 0) return
    await sendOtp()
  }

  async function verifyAndReset() {
    setErr('')
    if (!otp)              return setErr('Please enter the OTP.')
    if (newPass.length < 6) return setErr('Password must be at least 6 characters.')
    if (newPass !== confPass) return setErr('Passwords do not match.')
    setLoading(true)
    try {
      const stored = await getOtp(email.trim().toLowerCase())
      if (!stored)              { setErr('OTP expired or not found. Please restart.'); return }
      if (Date.now() > stored.expiresAt) { setErr('OTP expired. Please request a new one.'); await deleteOtp(email); return }
      if (stored.otp !== otp.trim()) { setErr('Incorrect OTP. Please try again.'); return }

      const admin = await getAdminByEmail(email.trim().toLowerCase())
      const hashed = await hashPassword(newPass)
      await updateAdminPassword(admin.id, hashed)
      await deleteOtp(email.trim().toLowerCase())

      toast.success('Password reset successfully!')
      nav('/admin/login')
    } catch (e) {
      console.error(e)
      setErr('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <FloatingThemeToggle />
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>
          ← Back to login
        </Link>
        <div className="card">
          <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reset Password</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24, letterSpacing: 1 }}>
            {step === 1 ? 'Enter your registered admin email' : `OTP sent to ${email}`}
          </div>

          {err && <div className="alert alert-err">{err}</div>}
          {msg && <div className="alert alert-ok">{msg}</div>}

          {step === 1 && (
            <>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="admin@pccoemotorsports.in" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
              </div>
              <button className="btn btn-primary btn-full" onClick={sendOtp} disabled={loading}>
                {loading ? <span className="spinner"/> : 'Send OTP'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="field">
                <label>OTP (6-digit code from email)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} style={{ letterSpacing: 4, fontSize: 18 }} />
                  <button
                    onClick={resendOtp} disabled={resendCd > 0 || loading}
                    style={{ flexShrink: 0, padding: '10px 14px', background: 'var(--surface3)', border: '1px solid var(--border)', color: resendCd > 0 ? 'var(--muted)' : 'var(--cream)', borderRadius: 8, cursor: resendCd > 0 ? 'default' : 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
                  >
                    {resendCd > 0 ? `Resend (${resendCd}s)` : 'Resend'}
                  </button>
                </div>
              </div>
              <div className="field">
                <label>New Password</label>
                <input type="password" placeholder="Min 6 characters" value={newPass} onChange={e => setNewPass(e.target.value)} />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" placeholder="Repeat password" value={confPass} onChange={e => setConfPass(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" onClick={verifyAndReset} disabled={loading}>
                {loading ? <span className="spinner"/> : 'Verify OTP & Reset Password'}
              </button>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => { setStep(1); setMsg(''); setErr('') }}>
                Use different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
