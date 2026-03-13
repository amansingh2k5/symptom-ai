// ─── LoginPage.jsx ────────────────────────────────────────────────────────────
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthForm from '../components/shared/AuthForm'
import { Spinner } from '../components/ui'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate      = useNavigate()
  const { login }     = useAuth()
  const [form, setForm] = useState({ email:'', password:'' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <AuthForm title="Welcome back" subtitle="Sign in to your SymptomAI account">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Email</label>
          <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="input" />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Password</label>
          <div style={{ position:'relative' }}>
            <input name="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={handleChange} placeholder="••••••••" className="input" style={{ paddingRight:44 }} />
            <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div style={{ textAlign:'right', marginTop:6 }}>
            <Link to="/forgot-password" style={{ fontSize:12, color:'var(--accent)', textDecoration:'none' }}>Forgot password?</Link>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:4 }} disabled={loading}>
          {loading ? <Spinner size={16} /> : <><LogIn size={15} /> Sign In</>}
        </button>
        <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign up</Link>
        </p>
      </form>
    </AuthForm>
  )
}
