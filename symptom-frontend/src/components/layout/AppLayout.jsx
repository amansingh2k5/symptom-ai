// ─────────────────────────────────────────────────────────────────────────────
// components/layout/AppLayout.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header  from './Header'
import CommandSearch from '../ui/CommandSearch'

export default function AppLayout() {
  const [collapsed, setCollapsed]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleKey = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <Header onSearchOpen={() => setSearchOpen(true)} />
        <main style={{ flex:1, overflow:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
