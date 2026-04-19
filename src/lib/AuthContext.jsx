// src/lib/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser]   = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ta_admin') || 'null') } catch { return null }
  })
  const [memberUser, setMemberUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ta_member') || 'null') } catch { return null }
  })

  // Theme: 'light' is default, persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem('ta_theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ta_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }

  function loginAdmin(admin) {
    const safe = { id: admin.id, name: admin.name, email: admin.email }
    sessionStorage.setItem('ta_admin', JSON.stringify(safe))
    setAdminUser(safe)
  }

  function loginMember(member) {
    sessionStorage.setItem('ta_member', JSON.stringify(member))
    setMemberUser(member)
  }

  function logoutAdmin() {
    sessionStorage.removeItem('ta_admin')
    setAdminUser(null)
  }

  function logoutMember() {
    sessionStorage.removeItem('ta_member')
    setMemberUser(null)
  }

  return (
    <AuthContext.Provider value={{ adminUser, memberUser, loginAdmin, loginMember, logoutAdmin, logoutMember, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
