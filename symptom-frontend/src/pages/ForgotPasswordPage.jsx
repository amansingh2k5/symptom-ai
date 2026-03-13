// ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthForm from '../components/shared/AuthForm'
import { Spinner } from '../components/ui'
import { authAPI } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try { await authAPI.forgotPassword(email); setSent(true) }
    catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  if (sent) return (
    <AuthForm title="Email sent!" subtitle="Check your inbox for the reset link">
      <div style={{ textAlign:'center', padding:'8px 0 16px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>Reset link sent if email is registered. Expires in 1 hour.</p>
        <Link to="/login" style={{ display:'inline-block', marginTop:24, color:'var(--accent)', fontSize:13, fontWeight:600, textDecoration:'none' }}>Back to Login →</Link>
      </div>
    </AuthForm>
  )

  return (
    <AuthForm title="Forgot password?" subtitle="We'll email you a reset link">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input" />
        </div>
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
          {loading ? <Spinner size={16} /> : <><Mail size={15} /> Send Reset Link</>}
        </button>
        <Link to="/login" style={{ textAlign:'center', color:'var(--text-muted)', fontSize:13, textDecoration:'none' }}>← Back to Login</Link>
      </form>
    </AuthForm>
  )
}
