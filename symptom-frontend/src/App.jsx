import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import AppLayout          from './components/layout/AppLayout'
import LoginPage          from './pages/LoginPage'
import RegisterPage       from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage  from './pages/ResetPasswordPage'
import VerifyEmailPage    from './pages/VerifyEmailPage'
import DashboardPage      from './pages/DashboardPage'
import SymptomCheckerPage from './pages/SymptomCheckerPage'
import DoctorFinderPage   from './pages/DoctorFinderPage'
import HistoryPage        from './pages/HistoryPage'
import BookingsPage       from './pages/BookingsPage'
import RemindersPage      from './pages/RemindersPage'
import ProfilePage        from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:32, height:32, border:'3px solid #6366f1', borderTopColor:'transparent', borderRadius:'50%' }} className="spin" />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      <Route path="/verify-email"    element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/symptoms"  element={<SymptomCheckerPage />} />
        <Route path="/doctors"   element={<DoctorFinderPage />} />
        <Route path="/history"   element={<HistoryPage />} />
        <Route path="/bookings"  element={<BookingsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background:'#1e293b', color:'#f1f5f9', border:'1px solid #334155', borderRadius:10, fontSize:13 },
            success: { iconTheme: { primary:'#10b981', secondary:'#0f172a' } },
            error:   { iconTheme: { primary:'#ef4444', secondary:'#0f172a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
