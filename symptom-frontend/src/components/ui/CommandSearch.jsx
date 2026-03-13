import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Activity, MapPin, Clock, Calendar, Bell, User } from 'lucide-react'

const LINKS = [
  { label:'Check Symptoms',       to:'/symptoms',  icon:Activity },
  { label:'Find Doctors',         to:'/doctors',   icon:MapPin   },
  { label:'My History',           to:'/history',   icon:Clock    },
  { label:'Appointments',         to:'/bookings',  icon:Calendar },
  { label:'Medication Reminders', to:'/reminders', icon:Bell     },
  { label:'My Profile',           to:'/profile',   icon:User     },
]

export default function CommandSearch({ open, onClose }) {
  const [query, setQuery]   = useState('')
  const [active, setActive] = useState(0)
  const inputRef            = useRef(null)
  const navigate            = useNavigate()

  useEffect(() => {
    if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 40) }
  }, [open])

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const results = LINKS.filter(l => !query || l.label.toLowerCase().includes(query.toLowerCase()))
  const go = (to) => { navigate(to); onClose() }

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') setActive(a => Math.min(a+1, results.length-1))
    if (e.key === 'ArrowUp')   setActive(a => Math.max(a-1, 0))
    if (e.key === 'Enter' && results[active]) go(results[active].to)
  }

  if (!open) return null

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:100 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:520, margin:'0 16px', background:'var(--surface)', borderRadius:16, border:'1px solid var(--accent)', overflow:'hidden', boxShadow:'0 24px 48px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'15px 18px', borderBottom:'1px solid var(--border)' }}>
          <Search size={15} style={{ color:'var(--accent)', flexShrink:0 }} />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setActive(0) }} onKeyDown={handleKey}
            placeholder="Search pages, symptoms, doctors..."
            style={{ flex:1, background:'transparent', border:'none', outline:'none', color:'var(--text)', fontSize:15 }} />
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={14} /></button>
        </div>
        <div style={{ padding:8, maxHeight:300, overflowY:'auto' }}>
          {results.length === 0
            ? <p style={{ textAlign:'center', padding:'24px 0', color:'var(--text-muted)', fontSize:13 }}>No results</p>
            : results.map((item, i) => {
                const Icon = item.icon
                return (
                  <button key={item.to} onClick={() => go(item.to)} onMouseEnter={() => setActive(i)}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 12px', borderRadius:8, border:'none', background: i===active ? 'var(--accent-glow)' : 'transparent', cursor:'pointer', textAlign:'left', color: i===active ? 'var(--accent)' : 'var(--text-muted)', transition:'background 0.1s' }}>
                    <Icon size={14} style={{ flexShrink:0 }} />
                    <span style={{ fontSize:13, fontWeight:500 }}>{item.label}</span>
                  </button>
                )
              })
          }
        </div>
        <div style={{ padding:'8px 18px', borderTop:'1px solid var(--border)', display:'flex', gap:16, fontSize:11, color:'var(--text-muted)' }}>
          <span>↵ Open</span><span>↑↓ Navigate</span><span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
