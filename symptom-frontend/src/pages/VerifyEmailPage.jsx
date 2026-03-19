import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import AuthForm from '../components/shared/AuthForm'
import { Spinner } from '../components/ui'
import { authAPI } from '../services/api'

export default function VerifyEmailPage() {
  const [searchParams]          = useSearchParams()
  const token                   = searchParams.get('token')
  const [status, setStatus]     = useState('loading') 
  const [message, setMessage]   = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('No token found in URL.'); return }
    authAPI.verifyEmail(token)
      .then(({ data }) => { setStatus('success'); setMessage(data.message) })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.') })
  }, [token])

  return (
    <AuthForm title="Email Verification" subtitle="Confirming your account...">
      <div style={{ textAlign:'center', padding:'16px 0' }}>
        {status === 'loading' && <Spinner size={40} />}

        {status === 'success' && (
          <>
            <CheckCircle size={52} style={{ color:'var(--green)', margin:'0 auto 16px', display:'block' }} />
            <p style={{ fontSize:15, color:'var(--text)', fontWeight:600, marginBottom:8 }}>Email Verified!</p>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>{message}</p>
            <Link to="/login" className="btn-primary" style={{ textDecoration:'none', justifyContent:'center' }}>
              Go to Login →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={52} style={{ color:'var(--red)', margin:'0 auto 16px', display:'block' }} />
            <p style={{ fontSize:15, color:'var(--text)', fontWeight:600, marginBottom:8 }}>Verification Failed</p>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>{message}</p>
            <Link to="/register" style={{ color:'var(--accent)', fontSize:13, fontWeight:600, textDecoration:'none' }}>
              Register again →
            </Link>
          </>
        )}
      </div>
    </AuthForm>
  )
}
