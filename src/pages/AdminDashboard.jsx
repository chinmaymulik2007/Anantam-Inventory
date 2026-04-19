// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getAllRecords, getCheckedOutRecords, getAllAdmins, createAdmin, deleteAdmin } from '../lib/db'
import { hashPassword } from '../lib/crypto'
import { RecordsTable } from './MemberDashboard'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { adminUser } = useAuth()
  const nav           = useNavigate()
  const [tab, setTab] = useState('overview')

  useEffect(() => { if (!adminUser) nav('/admin/login') }, [adminUser])

  const TABS = [['overview','Overview'],['records','All Records'],['checkedout','Currently Out'],['admins','Admin Accounts']]

  return (
    <div>
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>Admin Dashboard</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Full inventory access · Team Anantam</div>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '16px 24px 0', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ background: 'none', border: 'none', color: tab===key ? 'var(--orange)' : 'var(--muted)', padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', borderBottom: `2px solid ${tab===key ? 'var(--orange)' : 'transparent'}`, marginBottom: -1, transition: 'all .2s' }}
          >{label}</button>
        ))}
      </div>
      <div style={{ padding: '0 24px 40px' }}>
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'records'     && <AllRecordsTab />}
        {tab === 'checkedout'  && <CheckedOutTab />}
        {tab === 'admins'      && <AdminsTab currentAdmin={adminUser} />}
      </div>
    </div>
  )
}

// ── OVERVIEW ──────────────────────────────────────────────────
function OverviewTab() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllRecords().then(r => { setRecords(r); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner"/></div>

  const out  = records.filter(r => r.status === 'Checked Out').length
  const ret  = records.filter(r => r.status === 'Returned').length

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          ['Total Transactions', records.length, 'var(--orange)'],
          ['Currently Out',      out,            'var(--danger)'],
          ['Returned',           ret,            'var(--success)']
        ].map(([label, val, color]) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', letterSpacing: 1, marginBottom: 14 }}>Recent Activity</div>
      {records.length === 0
        ? <div className="empty-state"><div className="es-icon">📦</div><p>No transactions yet.</p></div>
        : <div className="table-wrap" style={{ overflowX: 'auto' }}><RecordsTable rows={records.slice(0,10)} adminView={true} /></div>
      }
    </>
  )
}

// ── ALL RECORDS ───────────────────────────────────────────────
function AllRecordsTab() {
  const [records, setRecords]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading]   = useState(true)
  const [q, setQ]               = useState('')
  const [cat, setCat]           = useState('')
  const [status, setStatus]     = useState('')

  useEffect(() => {
    getAllRecords().then(r => { setRecords(r); setFiltered(r); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    setFiltered(records.filter(r => {
      const matchQ  = !q || (r.name+r.prn+r.item+r.checkoutRemarks).toLowerCase().includes(q.toLowerCase())
      const matchC  = !cat    || r.category === cat
      const matchS  = !status || r.status   === status
      return matchQ && matchC && matchS
    }))
  }, [q, cat, status, records])

  if (loading) return <div className="page-loader"><div className="spinner"/></div>

  return (
    <>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', letterSpacing: 1, marginBottom: 14 }}>All Records</div>
      <div className="table-wrap" style={{ overflowX: 'auto' }}>
        <div className="table-toolbar">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, PRN, item…" />
          <select value={cat} onChange={e=>setCat(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Categories</option>
            {['Tools & Equipment','Electronics & Components','Mechanical Parts','Other'].map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Status</option>
            <option>Checked Out</option>
            <option>Returned</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{filtered.length} record{filtered.length!==1?'s':''}</span>
        </div>
        {filtered.length === 0
          ? <div className="empty-state"><div className="es-icon">🔍</div><p>No records match your filters.</p></div>
          : <RecordsTable rows={filtered} adminView={true} />
        }
      </div>
    </>
  )
}

// ── CHECKED OUT ───────────────────────────────────────────────
function CheckedOutTab() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCheckedOutRecords().then(r => { setRecords(r); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner"/></div>

  return (
    <>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', letterSpacing: 1, marginBottom: 14 }}>
        Currently Checked Out
        {records.length > 0 && <span style={{ background: 'rgba(255,77,106,.12)', color: '#ff8fa0', border: '1px solid rgba(255,77,106,.2)', padding: '2px 10px', borderRadius: 20, fontSize: 12, marginLeft: 12 }}>{records.length} items</span>}
      </div>
      {records.length === 0
        ? <div className="empty-state"><div className="es-icon">✅</div><p>All items have been returned.</p></div>
        : <div className="table-wrap" style={{ overflowX: 'auto' }}><RecordsTable rows={records} adminView={true} /></div>
      }
    </>
  )
}

// ── ADMINS ────────────────────────────────────────────────────
function AdminsTab({ currentAdmin }) {
  const [admins, setAdmins]   = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [pass, setPass]       = useState('')
  const [adding, setAdding]   = useState(false)

  const load = () => getAllAdmins().then(a => { setAdmins(a); setLoading(false) }).catch(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function addAdmin(e) {
    e.preventDefault()
    if (!name||!email||!pass) return toast.error('All fields required.')
    if (pass.length < 6)      return toast.error('Password must be at least 6 characters.')
    if (admins.find(a => a.email === email.trim().toLowerCase())) return toast.error('Email already registered.')
    setAdding(true)
    try {
      const hashed = await hashPassword(pass)
      await createAdmin({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: hashed })
      toast.success(`Admin ${name} added!`)
      setName(''); setEmail(''); setPass('')
      load()
    } catch(e) {
      toast.error('Failed to add admin.')
    } finally {
      setAdding(false)
    }
  }

  async function removeAdm(id, adminEmail) {
    if (!confirm(`Remove admin ${adminEmail}?`)) return
    try {
      await deleteAdmin(id)
      toast.success('Admin removed.')
      load()
    } catch { toast.error('Failed to remove admin.') }
  }

  if (loading) return <div className="page-loader"><div className="spinner"/></div>

  return (
    <>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', letterSpacing: 1, marginBottom: 14 }}>Admin Accounts</div>
      <div className="table-wrap" style={{ marginBottom: 28 }}>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.name}</td>
                <td style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.email}</td>
                <td>
                  {a.email === currentAdmin.email
                    ? <span style={{ fontSize: 12, color: 'var(--muted)' }}>(you)</span>
                    : <button className="btn btn-danger btn-sm" onClick={() => removeAdm(a.id, a.email)}>Remove</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', letterSpacing: 1, marginBottom: 14 }}>Add New Admin</div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={addAdmin}>
          <div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Admin's full name" /></div>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@..." /></div>
          <div className="field"><label>Password</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 6 characters" /></div>
          <button className="btn btn-primary" type="submit" disabled={adding}>
            {adding ? <span className="spinner"/> : 'Add Admin'}
          </button>
        </form>
      </div>
    </>
  )
}
