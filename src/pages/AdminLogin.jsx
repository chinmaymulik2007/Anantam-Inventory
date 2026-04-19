// src/pages/AdminLogin.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getAdminByEmail } from '../lib/db'
import { verifyPassword } from '../lib/crypto'
import toast from 'react-hot-toast'
import logo from '/logo.png'
import { FloatingThemeToggle } from '../components/Header'

export default function AdminLogin() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')
  const { loginAdmin }        = useAuth()
  const nav                   = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErr('')
    if (!email || !password) return setErr('Please enter email and password.')
    setLoading(true)
    try {
      const admin = await getAdminByEmail(email.trim().toLowerCase())
      if (!admin) { setErr('No admin account found with this email.'); return }
      const ok = await verifyPassword(password, admin.passwordHash)
      if (!ok) { setErr('Incorrect password.'); return }
      loginAdmin(admin)
      toast.success(`Welcome back, ${admin.name}!`)
      nav('/admin')
    } catch (e) {
      console.error(e)
      setErr('Login failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
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
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--orange)' }}>Admin Login</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>PCCOE Motorsports · Team Anantam</div>
            </div>
          </div>

          {err && <div className="alert alert-err">{err}</div>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="admin@pccoemotorsports.in" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="spinner"/> : 'Login as Admin'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/admin/forgot-password" style={{ color: 'var(--orange)', fontSize: 12, textDecoration: 'underline' }}>
              Forgot password / Reset password
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
