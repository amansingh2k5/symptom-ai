import { useLocation } from 'react-router-dom'

const TITLES = {
  '/dashboard': { title: 'Dashboard',       sub: 'Your health overview'   },
  '/symptoms':  { title: 'Symptom Checker', sub: 'AI-powered triage'      },
  '/doctors':   { title: 'Find Doctors',    sub: 'Nearby specialists'     },
  '/history':   { title: 'My History',      sub: 'Past symptom checks'    },
  '/bookings':  { title: 'Appointments',    sub: 'Upcoming & past visits' },
  '/reminders': { title: 'Reminders',       sub: 'Medication schedule'    },
  '/profile':   { title: 'Profile',         sub: 'Account & health info'  },
}

export default function Header() {
  const { pathname } = useLocation()
  const { title, sub } = TITLES[pathname] || { title: 'SymptomAI', sub: '' }

  return (
    <header style={{ display: 'flex', alignItems: 'center', padding: '13px 24px', borderBottom: '1px solid var(--border)', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h1>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
      </div>
    </header>
  )
}
