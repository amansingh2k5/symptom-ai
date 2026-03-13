import { Stethoscope } from 'lucide-react'

export default function AuthForm({ title, subtitle, children }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'24px 16px' }}>
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:600, borderRadius:'50%', background:'rgba(99,102,241,0.06)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div className="fade-up" style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32, justifyContent:'center' }}>
          <div style={{ width:42, height:42, borderRadius:12, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Stethoscope size={20} color="#fff" />
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:800, color:'var(--text)' }}>SymptomAI</span>
        </div>
        <div className="glass" style={{ padding:32 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:22, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{title}</h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:28 }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
