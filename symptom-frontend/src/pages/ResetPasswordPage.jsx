import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthForm from '../components/shared/AuthForm'
import { Spinner } from '../components/ui'
import { authAPI } from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const token                 = searchParams.get('token')
  const [form, setForm]       = useState({ newPassword:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.newPassword.length < 6)       { toast.error('Minimum 6 characters'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, newPassword: form.newPassword })
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may be expired')
    } finally { setLoading(false) }
  }

  if (!token) return (
    <AuthForm title="Invalid link" subtitle="This reset link is missing or broken">
      <Link to="/forgot-password" style={{ display:'block', textAlign:'center', color:'var(--accent)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
        Request a new link →
      </Link>
    </AuthForm>
  )

  return (
    <AuthForm title="Reset password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>New Password</label>
          <input type="password" required value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword:e.target.value }))}
            placeholder="Min 6 characters" className="input" />
        </div>
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Confirm Password</label>
          <input type="password" required value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm:e.target.value }))}
            placeholder="Repeat password" className="input" />
        </div>
        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
          {loading ? <Spinner size={16} /> : <><Lock size={15} /> Reset Password</>}
        </button>
      </form>
    </AuthForm>
  )
}
