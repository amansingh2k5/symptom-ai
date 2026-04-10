import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header  from './Header'
import { useAuth } from '../../context/AuthContext'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  const { user }     = useAuth()
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  // ── Redirect new users to profile if health info incomplete ──
  useEffect(() => {
    if (!user) return
    const isComplete = user?.healthProfile?.age && user?.healthProfile?.gender
    if (!isComplete && pathname !== '/profile') {
      navigate('/profile', { state: { newUser: true } })
    }
  }, [user, pathname])

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <Header />
        <main style={{ flex:1, overflow:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}