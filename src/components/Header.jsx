// src/components/Header.jsx
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import logo from '/logo.png'

// Floating theme toggle shown on pages without the main header (login, landing)
export function FloatingThemeToggle() {
  const { theme, toggleTheme } = useAuth()
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{ position: 'fixed', top: 16, right: 16, zIndex: 200 }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default function Header() {
  const { adminUser, memberUser, logoutAdmin, logoutMember, theme, toggleTheme } = useAuth()
  const nav = useNavigate()

  const user = adminUser || memberUser
  const role = adminUser ? 'admin' : memberUser ? 'member' : null

  function handleLogout() {
    if (adminUser)  logoutAdmin()
    if (memberUser) logoutMember()
    nav('/')
  }

  if (!user) return null

  return (
    <header style={{
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: 'var(--shadow)'
    }}>
      <img
        src={logo} alt="Team Anantam"
        style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
        onError={e => e.target.style.display = 'none'}
      />
      <div>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, letterSpacing: 1 }}>
          TEAM <span style={{ color: 'var(--orange)' }}>ANANTAM</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          PCCOE Motorsports · Inventory
        </div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          background: 'var(--surface3)', border: `1px solid ${role === 'admin' ? 'var(--orange)' : 'var(--success)'}`,
          color: role === 'admin' ? 'var(--orange)' : 'var(--success)',
          padding: '3px 12px', borderRadius: 20, fontSize: 11, fontFamily: 'var(--font-mono)'
        }}>
          {role === 'admin' ? `Admin · ${user.name}` : `Member · ${user.name}`}
        </span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  )
}
