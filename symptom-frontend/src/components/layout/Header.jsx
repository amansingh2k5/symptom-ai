import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'

const TITLES = {
  '/dashboard': { title:'Dashboard',       sub:'Your health overview'      },
  '/symptoms':  { title:'Symptom Checker', sub:'AI-powered triage'         },
  '/doctors':   { title:'Find Doctors',    sub:'Nearby specialists'        },
  '/history':   { title:'My History',      sub:'Past symptom checks'       },
  '/bookings':  { title:'Appointments',    sub:'Upcoming & past visits'    },
  '/reminders': { title:'Reminders',       sub:'Medication schedule'       },
  '/profile':   { title:'Profile',         sub:'Account & health info'     },
}

export default function Header({ onSearchOpen }) {
  const { pathname } = useLocation()
  const { title, sub } = TITLES[pathname] || { title:'SymptomAI', sub:'' }

  return (
    <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 24px', borderBottom:'1px solid var(--border)', background:'rgba(15,23,42,0.85)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:10 }}>
      <div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--text)' }}>{title}</h1>
        {sub && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{sub}</p>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={onSearchOpen}
          style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 13px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)', cursor:'pointer', fontSize:13, transition:'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={13} />
          <span>Search</span>
          <kbd style={{ padding:'2px 5px', borderRadius:4, border:'1px solid var(--border)', fontSize:10, color:'var(--text-muted)' }}>⌘K</kbd>
        </button>
        <button style={{ position:'relative', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:8 }}>
          <Bell size={17} />
          <span style={{ position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--bg)' }} />
        </button>
      </div>
    </header>
  )
}
