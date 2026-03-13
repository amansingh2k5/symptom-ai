import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, XCircle, Stethoscope } from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingAPI } from '../services/api'
import { GlassCard, Badge, EmptyState, PageLoader, SectionHeader } from '../components/ui'

export default function BookingsPage() {
  const [bookings, setBookings]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [cancelling, setCancelling] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await bookingAPI.getAll()
      setBookings(data.bookings || [])
    } catch { toast.error('Could not load bookings') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(id)
    try {
      await bookingAPI.cancel(id)
      toast.success('Appointment cancelled')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed')
    } finally { setCancelling(null) }
  }

  if (loading) return <PageLoader />

  const now      = new Date()
  const upcoming = bookings.filter(b => b.status !== 'cancelled' && new Date(b.appointmentDate) >= now)
  const past     = bookings.filter(b => b.status === 'cancelled' || new Date(b.appointmentDate) < now)

  const BookingCard = ({ b }) => (
    <GlassCard hover style={{ marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div style={{ display:'flex', gap:14, flex:1, minWidth:0 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Stethoscope size={18} style={{ color:'var(--accent)' }} />
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--font-display)', marginBottom:3 }}>{b.doctor?.name}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{b.doctor?.specialty} · {b.doctor?.hospital}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)' }}>
                <Calendar size={11} /> {new Date(b.appointmentDate).toDateString()}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)' }}>
                <Clock size={11} /> {b.appointmentTime}
              </span>
              {b.doctor?.address && (
                <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-muted)' }}>
                  <MapPin size={11} /> {b.doctor.address}
                </span>
              )}
            </div>
            {b.reason && (
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6, padding:'5px 9px', borderRadius:6, background:'var(--bg)' }}>
                Reason: {b.reason}
              </p>
            )}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
          <Badge type={b.status} label={b.status} />
          {b.status === 'confirmed' && new Date(b.appointmentDate) >= now && (
            <button onClick={() => handleCancel(b._id)} disabled={cancelling === b._id}
              style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, color:'var(--red)', fontSize:11, padding:'5px 10px', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <XCircle size={12} /> {cancelling === b._id ? '...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </GlassCard>
  )

  return (
    <div className="fade-up" style={{ padding:24, maxWidth:800, margin:'0 auto' }}>
      {bookings.length === 0
        ? <EmptyState icon={Calendar} title="No appointments yet" description="Book a doctor from the Doctor Finder page." />
        : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <SectionHeader title={`Upcoming (${upcoming.length})`} />
                {upcoming.map(b => <BookingCard key={b._id} b={b} />)}
              </div>
            )}
            {past.length > 0 && (
              <div>
                <SectionHeader title={`Past & Cancelled (${past.length})`} />
                {past.map(b => <BookingCard key={b._id} b={b} />)}
              </div>
            )}
          </>
        )
      }
    </div>
  )
}
