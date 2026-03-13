// ── GlassCard ─────────────────────────────────────────────────────────────────
export function GlassCard({ children, style={}, hover=false, onClick }) {
  return <div className={`glass${hover?' glass-hover':''}`} style={{ padding:20,...style }} onClick={onClick}>{children}</div>
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BS = {
  low:       { c:'#10b981', b:'rgba(16,185,129,0.12)'  },
  moderate:  { c:'#f59e0b', b:'rgba(245,158,11,0.12)' },
  high:      { c:'#ef4444', b:'rgba(239,68,68,0.12)'  },
  confirmed: { c:'#10b981', b:'rgba(16,185,129,0.12)' },
  pending:   { c:'#f59e0b', b:'rgba(245,158,11,0.12)' },
  cancelled: { c:'#ef4444', b:'rgba(239,68,68,0.12)'  },
  High:      { c:'#ef4444', b:'rgba(239,68,68,0.1)'   },
  Moderate:  { c:'#f59e0b', b:'rgba(245,158,11,0.1)'  },
  Low:       { c:'#10b981', b:'rgba(16,185,129,0.1)'  },
}
export function Badge({ type, label }) {
  const s = BS[type] || { c:'#94a3b8', b:'rgba(148,163,184,0.12)' }
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600, color:s.c, background:s.b }}>{label}</span>
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size=24 }) {
  return <div style={{ width:size, height:size, border:'2.5px solid var(--surface-hi)', borderTopColor:'var(--accent)', borderRadius:'50%' }} className="spin" />
}

export function PageLoader() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 0' }}><Spinner size={32} /></div>
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon:Icon, title, description, action }) {
  return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      {Icon && <Icon size={44} style={{ color:'var(--text-muted)', margin:'0 auto 16px', display:'block', opacity:0.4 }} />}
      <p style={{ fontFamily:'var(--font-display)', fontSize:16, color:'var(--text)', marginBottom:8 }}>{title}</p>
      {description && <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>{description}</p>}
      {action}
    </div>
  )
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:700, color:'var(--text)' }}>{title}</h2>
      {action}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon:Icon, color='var(--accent)' }) {
  return (
    <div className="glass" style={{ padding:18 }}>
      <div style={{ padding:8, borderRadius:8, background:`${color}20`, display:'inline-flex', marginBottom:12 }}>
        <Icon size={16} style={{ color }} />
      </div>
      <p style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:800, color:'var(--text)', marginBottom:4 }}>{value}</p>
      <p style={{ fontSize:12, color:'var(--text-muted)' }}>{label}</p>
    </div>
  )
}
