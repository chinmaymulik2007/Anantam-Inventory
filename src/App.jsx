// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Header from './components/Header'
import Landing from './pages/Landing'
import AdminLogin from './pages/AdminLogin'
import ForgotPassword from './pages/ForgotPassword'
import MemberLogin from './pages/MemberLogin'
import MemberDashboard from './pages/MemberDashboard'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedAdmin({ children }) {
  const { adminUser } = useAuth()
  return adminUser ? children : <Navigate to="/admin/login" replace />
}

function ProtectedMember({ children }) {
  const { memberUser } = useAuth()
  return memberUser ? children : <Navigate to="/member/login" replace />
}

function AppInner() {
  const { adminUser, memberUser } = useAuth()
  const showHeader = adminUser || memberUser

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/"                     element={<Landing />} />
        <Route path="/admin/login"          element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/member/login"         element={<MemberLogin />} />
        <Route path="/admin"                element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
        <Route path="/member"               element={<ProtectedMember><MemberDashboard /></ProtectedMember>} />
        <Route path="*"                     element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#13131a', color: '#F5F0E8', border: '1px solid #2a2a3a', fontFamily: 'Barlow, sans-serif', fontSize: 14 },
            success: { iconTheme: { primary: '#2dd4a0', secondary: '#0a0a0f' } },
            error:   { iconTheme: { primary: '#ff4d6a', secondary: '#0a0a0f' } }
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
