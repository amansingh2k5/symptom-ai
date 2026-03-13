import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Activity, MapPin, Clock, Calendar, Bell, User, LogOut, Stethoscope, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',       icon: Home      },
  { to: '/symptoms',  label: 'Symptom Checker', icon: Activity  },
  { to: '/doctors',   label: 'Find Doctors',    icon: MapPin    },
  { to: '/history',   label: 'My History',      icon: Clock     },
  { to: '/bookings',  label: 'Appointments',    icon: Calendar  },
  { to: '/reminders', label: 'Reminders',       icon: Bell      },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <aside style={{ width: collapsed ? 68 : 232, minHeight:'100vh', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', transition:'width 0.25s ease', flexShrink:0, overflow:'hidden' }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 14px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Stethoscope size={17} color="#fff" />
        </div>
        {!collapsed && <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text)' }}>SymptomAI</p>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>Health Assistant</p>
        </div>}
        <button onClick={onToggle} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4, flexShrink:0 }}>
          <Menu size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} title={collapsed ? label : undefined}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10, padding:'9px 10px',
              borderRadius:'var(--radius-sm)', textDecoration:'none', fontSize:13, fontWeight:500,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              transition:'all 0.15s', whiteSpace:'nowrap',
            })}>
            <Icon size={16} style={{ flexShrink:0 }} />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop:'1px solid var(--border)', padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
        <NavLink to="/profile" title={collapsed ? 'Profile' : undefined}
          style={({ isActive }) => ({ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:'var(--radius-sm)', textDecoration:'none', fontSize:13, fontWeight:500, color: isActive ? 'var(--accent)' : 'var(--text-muted)', background: isActive ? 'var(--accent-glow)' : 'transparent', borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent' })}>
          <User size={16} style={{ flexShrink:0 }} />
          {!collapsed && 'Profile'}
        </NavLink>

        <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:'var(--radius-sm)', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:500, color:'var(--text-muted)', width:'100%', textAlign:'left', transition:'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <LogOut size={16} style={{ flexShrink:0 }} />
          {!collapsed && 'Logout'}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 10px', marginTop:4 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
          {!collapsed && <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>}
        </div>
      </div>
    </aside>
  )
}
