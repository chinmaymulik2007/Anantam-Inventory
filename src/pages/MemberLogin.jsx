// src/pages/MemberLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import toast from 'react-hot-toast'
import logo from '/logo.png'
import { FloatingThemeToggle } from '../components/Header'

export default function MemberLogin() {
  const [name, setName]   = useState('')
  const [prn, setPrn]     = useState('')
  const [err, setErr]     = useState('')
  const { loginMember }   = useAuth()
  const nav               = useNavigate()

  function handleLogin(e) {
    e.preventDefault()
    setErr('')
    if (!name.trim()) return setErr('Please enter your full name.')
    if (!prn.trim())  return setErr('Please enter your PRN.')
    loginMember({ name: name.trim(), prn: prn.trim() })
    toast.success(`Welcome, ${name.trim()}!`)
    nav('/member')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <FloatingThemeToggle />
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, color: 'var(--muted)', textDecoration: 'none', fontSize: 13 }}>
          ← Back to home
        </Link>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <img src={logo} alt="logo" style={{ width: 40, height: 40, borderRadius: '50%' }} onError={e => e.target.style.display='none'}/>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>Member Login</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>Enter your name & PRN to continue</div>
            </div>
          </div>
          {err && <div className="alert alert-err">{err}</div>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>PRN</label>
              <input type="text" placeholder="e.g. 12345678" value={prn} onChange={e => setPrn(e.target.value)} />
            </div>
            <button className="btn btn-success btn-full" type="submit">Continue as Member</button>
          </form>
        </div>
      </div>
    </div>
  )
}
