import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthForm from '../components/shared/AuthForm'
import { Spinner } from '../components/ui'
import { authAPI } from '../services/api'

export default function RegisterPage() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6)       { toast.error('Minimum 6 characters'); return }
    setLoading(true)
    try {
      await authAPI.register({ name:form.name, email:form.email, password:form.password })
      setDone(true)
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed') }
    finally { setLoading(false) }
  }

  if (done) return (
    <AuthForm title="You're all set! 🎉" subtitle="Welcome to SymptomAI">
      <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>
          Your account has been created successfully.<br/>
          Start checking symptoms, finding doctors, and managing your health — all in one place.
        </p>
        <Link to="/login" style={{ display:'inline-block', marginTop:24, color:'var(--accent)', fontSize:13, fontWeight:600, textDecoration:'none' }}>Go to Login →</Link>
      </div>
    </AuthForm>
  )

  return (
    <AuthForm title="Create account" subtitle="Join SymptomAI — it's free">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {[
          { name:'name',  type:'text',  label:'Full Name',  placeholder:'John Doe'         },
          { name:'email', type:'email', label:'Email',      placeholder:'you@example.com'  },
        ].map(f => (
          <div key={f.name}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>{f.label}</label>
            <input name={f.name} type={f.type} required value={form[f.name]} onChange={e => setForm(p => ({ ...p, [e.target.name]:e.target.value }))} placeholder={f.placeholder} className="input" />
          </div>
        ))}
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Password</label>
          <div style={{ position:'relative' }}>
            <input name="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({ ...p, password:e.target.value }))} placeholder="Min 6 characters" className="input" style={{ paddingRight:44 }} />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Confirm Password</label>
          <input name="confirm" type="password" required value={form.confirm} onChange={e => setForm(p => ({ ...p, confirm:e.target.value }))} placeholder="Repeat password" className="input" />
        </div>
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:6 }} disabled={loading}>
          {loading ? <Spinner size={16} /> : <><UserPlus size={15} /> Create Account</>}
        </button>
        <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
          Have an account? <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
        </p>
      </form>
    </AuthForm>
  )
}