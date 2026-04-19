// src/pages/MemberDashboard.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useNavigate } from 'react-router-dom'
import { createRecord, returnRecord, getRecordsByPrn } from '../lib/db'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['Tools & Equipment', 'Electronics & Components', 'Mechanical Parts', 'Other']

function nowStr() {
  return format(new Date(), 'dd MMM yyyy, hh:mm a')
}

export default function MemberDashboard() {
  const { memberUser } = useAuth()
  const nav = useNavigate()
  const [tab, setTab]     = useState('checkout')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!memberUser) { nav('/member/login'); return }
    loadRecords()
  }, [memberUser])

  async function loadRecords() {
    setLoading(true)
    try {
      const r = await getRecordsByPrn(memberUser.prn)
      setRecords(r)
    } catch(e) {
      toast.error('Failed to load records.')
    } finally {
      setLoading(false)
    }
  }

  const checkedOut = records.filter(r => r.status === 'Checked Out')

  return (
    <div>
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>Member Panel</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
          {memberUser?.name} · PRN: {memberUser?.prn}
        </div>
        <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 3, gap: 2, width: 'fit-content', marginBottom: 24 }}>
          {[['checkout','Check Out'],['return','Return Item'],['mylog','My Log']].map(([key,label]) => (
            <button
              key={key} onClick={() => setTab(key)}
              style={{ background: tab===key ? 'var(--orange)' : 'none', border: 'none', color: tab===key ? '#fff' : 'var(--muted)', padding: '7px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'all .2s' }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 40px' }}>
        {tab === 'checkout' && <CheckoutTab member={memberUser} onSuccess={loadRecords} />}
        {tab === 'return'   && <ReturnTab checkedOut={checkedOut} onSuccess={() => { loadRecords(); setTab('mylog') }} />}
        {tab === 'mylog'    && <MyLogTab records={records} loading={loading} />}
      </div>
    </div>
  )
}

// ── CHECKOUT ──────────────────────────────────────────────────
function CheckoutTab({ member, onSuccess }) {
  const [item, setItem]       = useState('')
  const [cat, setCat]         = useState('')
  const [qty, setQty]         = useState('1')
  const [remarks, setRemarks] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!item.trim()) return toast.error('Please enter item name.')
    if (!cat)         return toast.error('Please select a category.')
    setLoading(true)
    try {
      await createRecord({
        name: member.name, prn: member.prn,
        item: item.trim(), category: cat,
        quantity: parseInt(qty) || 1,
        checkoutTime: nowStr(),
        checkoutRemarks: remarks.trim() || '—'
      })
      toast.success(`${item} checked out successfully!`)
      setItem(''); setCat(''); setQty('1'); setRemarks('')
      onSuccess()
    } catch(e) {
      toast.error('Failed to check out. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--orange)', marginBottom: 20, letterSpacing: 1 }}>Check Out an Item</div>
      <form onSubmit={submit}>
        <div className="grid2">
          <div className="field"><label>Your Name</label><input value={member.name} readOnly /></div>
          <div className="field"><label>PRN</label><input value={member.prn} readOnly /></div>
        </div>
        <div className="field"><label>Item Name</label><input value={item} onChange={e=>setItem(e.target.value)} placeholder="e.g. Digital Caliper" autoFocus /></div>
        <div className="grid2">
          <div className="field">
            <label>Category</label>
            <select value={cat} onChange={e=>setCat(e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Quantity</label><input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} /></div>
        </div>
        <div className="field">
          <label>Date & Time (auto)</label>
          <input value={nowStr()} readOnly />
        </div>
        <div className="field"><label>Purpose / Remarks (optional)</label><input value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Brief reason" /></div>
        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : 'Confirm Check Out'}
        </button>
      </form>
    </div>
  )
}

// ── RETURN ────────────────────────────────────────────────────
function ReturnTab({ checkedOut, onSuccess }) {
  const [selected, setSelected]   = useState('')
  const [condition, setCondition] = useState('Good')
  const [remarks, setRemarks]     = useState('')
  const [loading, setLoading]     = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!selected) return toast.error('Please select an item to return.')
    setLoading(true)
    try {
      await returnRecord(selected, { returnCondition: condition, returnRemarks: remarks })
      toast.success('Item returned successfully!')
      setSelected(''); setRemarks(''); setCondition('Good')
      onSuccess()
    } catch(e) {
      toast.error('Failed to return. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkedOut.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="empty-state"><div className="es-icon">📦</div><p>You have no items currently checked out.</p></div>
      </div>
    )
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 600, color: 'var(--success)', marginBottom: 20, letterSpacing: 1 }}>Return an Item</div>
      <form onSubmit={submit}>
        <div className="field">
          <label>Select item to return</label>
          <select value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">-- Choose item --</option>
            {checkedOut.map(r=><option key={r.id} value={r.id}>{r.item} ({r.category}) — out since {r.checkoutTime}</option>)}
          </select>
        </div>
        <div className="field"><label>Return Date & Time (auto)</label><input value={nowStr()} readOnly /></div>
        <div className="field">
          <label>Condition on Return</label>
          <select value={condition} onChange={e=>setCondition(e.target.value)}>
            <option>Good</option><option>Minor wear</option><option>Damaged</option>
          </select>
        </div>
        <div className="field"><label>Return Remarks (optional)</label><input value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Optional notes" /></div>
        <button className="btn btn-success btn-full" type="submit" disabled={loading}>
          {loading ? <span className="spinner"/> : 'Confirm Return'}
        </button>
      </form>
    </div>
  )
}

// ── MY LOG ─────────────────────────────────────────────────────
function MyLogTab({ records, loading }) {
  if (loading) return <div className="page-loader"><div className="spinner"/></div>
  if (!records.length) return <div className="empty-state"><div className="es-icon">📋</div><p>No activity yet.</p></div>

  return (
    <div className="table-wrap" style={{ overflowX: 'auto' }}>
      <RecordsTable rows={records} adminView={false} />
    </div>
  )
}

export function RecordsTable({ rows, adminView }) {
  function catPill(c) {
    const m = { 'Tools & Equipment':'pill-tool','Electronics & Components':'pill-elec','Mechanical Parts':'pill-mech','Other':'pill-other' }
    return <span className={`pill ${m[c]||'pill-other'}`}>{c||'—'}</span>
  }
  function statusPill(s) {
    return <span className={`pill ${s==='Checked Out'?'pill-out':'pill-in'}`}>{s}</span>
  }
  return (
    <table>
      <thead><tr>
        {adminView && <><th>Name</th><th>PRN</th></>}
        <th>Item</th><th>Category</th><th>Qty</th><th>Checked Out</th><th>Returned</th><th>Condition</th><th>Status</th>
      </tr></thead>
      <tbody>
        {rows.map(r=>(
          <tr key={r.id}>
            {adminView && <><td style={{fontWeight:500}}>{r.name}</td><td style={{color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>{r.prn}</td></>}
            <td style={{fontWeight:500}}>{r.item}</td>
            <td>{catPill(r.category)}</td>
            <td style={{fontFamily:'var(--font-mono)',fontSize:12}}>{r.quantity}</td>
            <td style={{fontSize:12,color:'var(--muted)'}}>{r.checkoutTime}</td>
            <td style={{fontSize:12,color:'var(--muted)'}}>{r.returnTime||'—'}</td>
            <td style={{fontSize:12,color:r.returnCondition==='Damaged'?'var(--danger)':'inherit'}}>{r.returnCondition||'—'}</td>
            <td>{statusPill(r.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
