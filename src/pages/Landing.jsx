// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useEffect } from 'react'
import logo from '/logo.png'
import { FloatingThemeToggle } from '../components/Header'

export default function Landing() {
  const nav = useNavigate()
  const { adminUser, memberUser } = useAuth()

  useEffect(() => {
    if (adminUser)  nav('/admin')
    if (memberUser) nav('/member')
  }, [adminUser, memberUser])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(255,107,26,.07) 0%, transparent 60%)'
    }}>
      <FloatingThemeToggle />
      <img
        src={logo} alt="Team Anantam Logo"
        style={{ width: 110, height: 110, borderRadius: '50%', border: '2px solid var(--orange)', marginBottom: 24, objectFit: 'cover' }}
        onError={e => { e.target.style.display = 'none' }}
      />
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 42, fontWeight: 700, letterSpacing: 2, marginBottom: 4, textAlign: 'center' }}>
        TEAM <span style={{ color: 'var(--orange)' }}>ANANTAM</span>
      </h1>
      <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
        PCCOE Motorsports
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 52, letterSpacing: 1 }}>
        "Sky is the Lower Limit!"
      </p>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <PortalCard
          icon="🔐"
          label="Admin Portal"
          desc="Full access · Manage records · View all logs"
          color="var(--orange)"
          onClick={() => nav('/admin/login')}
        />
        <PortalCard
          icon="👤"
          label="Member Portal"
          desc="Check out & return items · View your activity"
          color="var(--success)"
          onClick={() => nav('/member/login')}
        />
      </div>
    </div>
  )
}

function PortalCard({ icon, label, desc, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
        padding: '32px 28px', width: 240, cursor: 'pointer', textAlign: 'center',
        transition: 'all .22s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.background = 'var(--surface2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.background = 'var(--surface)'
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
        fontSize: 24, background: `${color}18`, border: `1px solid ${color}44`
      }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700, letterSpacing: 1, color, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}
