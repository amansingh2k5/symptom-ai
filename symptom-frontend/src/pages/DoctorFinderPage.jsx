import { useState, useEffect } from 'react'
import { MapPin, Star, Phone, Calendar, Search, X, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { doctorAPI, bookingAPI } from '../services/api'
import { GlassCard, EmptyState, PageLoader, Spinner } from '../components/ui'

const SPECIALTIES = ['All','General Physician','Cardiologist','Neurologist','Pulmonologist','ENT Specialist']

const getSavedDoctors = () => {
  try { return JSON.parse(localStorage.getItem('savedDoctors') || '[]') } catch { return [] }
}
const setSavedDoctorsStorage = (docs) => {
  localStorage.setItem('savedDoctors', JSON.stringify(docs))
}

function BookingModal({ doctor, onClose }) {
  const [form, setForm]       = useState({ appointmentDate:'', appointmentTime:'', reason:'' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      await bookingAPI.create({ doctor, ...form })
      toast.success('Appointment booked! Confirmation email sent.')
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} className="glass" style={{ width:'100%', maxWidth:460, padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)' }}>Book Appointment</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{doctor.name} · {doctor.specialty || 'Doctor'}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Date</label>
            <input type="date" required min={new Date().toISOString().split('T')[0]}
              value={form.appointmentDate} onChange={e => setForm(f => ({ ...f, appointmentDate:e.target.value }))} className="input" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Time</label>
            <input type="time" required value={form.appointmentTime} onChange={e => setForm(f => ({ ...f, appointmentTime:e.target.value }))} className="input" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Reason (optional)</label>
            <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason:e.target.value }))}
              placeholder="Brief description of your concern..." className="input" rows={2} style={{ resize:'vertical' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? <Spinner size={16} /> : <><Calendar size={14} /> Confirm Booking</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function DoctorCard({ doctor, onBook, saved, onToggleSave }) {
  const initials = (doctor.name || 'DR').split(' ').filter(w => /^[A-Z]/.test(w)).map(w => w[0]).slice(0,2).join('')

  return (
    <GlassCard hover>
      <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
        <div style={{ width:46, height:46, borderRadius:12, background:'rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'var(--accent)', flexShrink:0 }}>
          {initials}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
            <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--font-display)' }}>{doctor.name}</p>
            <span style={{ fontSize:11, padding:'3px 8px', borderRadius:99, flexShrink:0, fontWeight:600,
              background: doctor.open ? 'rgba(16,185,129,0.12)' : doctor.open === false ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)',
              color:       doctor.open ? 'var(--green)'          : doctor.open === false ? 'var(--red)'           : 'var(--text-muted)' }}>
              {doctor.open === null ? 'N/A' : doctor.open ? 'Open' : 'Closed'}
            </span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{doctor.specialty || 'General Physician'}</p>
          <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{doctor.address}</p>
        </div>
      </div>

      {(doctor.rating || doctor.distance) && (
        <div style={{ display:'flex', gap:16, marginBottom:14 }}>
          {doctor.rating && (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Star size={12} fill="var(--yellow)" style={{ color:'var(--yellow)' }} />
              <span style={{ fontSize:12, color:'var(--text)', fontWeight:600 }}>{doctor.rating}</span>
              <span style={{ fontSize:11, color:'var(--text-muted)' }}>({doctor.reviews})</span>
            </div>
          )}
          {doctor.distance && (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <MapPin size={11} style={{ color:'var(--text-muted)' }} />
              <span style={{ fontSize:12, color:'var(--text-muted)' }}>{doctor.distance}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ display:'flex', gap:8 }}>
        <button className="btn-primary" onClick={() => onBook(doctor)} style={{ flex:1, justifyContent:'center', padding:'8px 12px', fontSize:12 }}>
          <Calendar size={13} /> Book
        </button>
        <button
          onClick={() => onToggleSave(doctor)}
          title={saved ? 'Unsave doctor' : 'Save doctor'}
          style={{
            padding:'8px 14px', borderRadius:8, cursor:'pointer', border:'1px solid',
            borderColor: saved ? 'rgba(239,68,68,0.4)' : 'var(--border)',
            background:  saved ? 'rgba(239,68,68,0.1)' : 'transparent',
            color:       saved ? 'var(--red)'           : 'var(--text-muted)',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {doctor.phone && (
          <a href={`tel:${doctor.phone}`} className="btn-ghost" style={{ padding:'8px 14px', textDecoration:'none', fontSize:12 }}>
            <Phone size={13} />
          </a>
        )}
      </div>
    </GlassCard>
  )
}

export default function DoctorFinderPage() {
  const [doctors, setDoctors]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [locErr, setLocErr]         = useState('')
  const [search, setSearch]         = useState('')
  const [specialty, setSpecialty]   = useState('All')
  const [bookingDoc, setBookingDoc] = useState(null)
  const [savedDoctors, setSavedDoctors] = useState(getSavedDoctors)

  const toggleSave = (doctor) => {
    const id = doctor.placeId || doctor.name
    const isAlreadySaved = savedDoctors.some(d => (d.placeId || d.name) === id)
    const updated = isAlreadySaved
      ? savedDoctors.filter(d => (d.placeId || d.name) !== id)
      : [...savedDoctors, doctor]
    setSavedDoctors(updated)
    setSavedDoctorsStorage(updated)
    toast.success(isAlreadySaved ? 'Doctor removed from saved' : 'Doctor saved!')
  }

  const isSaved = (doctor) => {
    const id = doctor.placeId || doctor.name
    return savedDoctors.some(d => (d.placeId || d.name) === id)
  }

  const fetchDoctors = (spec = specialty) => {
    setLoading(true); setLocErr('')
    if (!navigator.geolocation) { setLocErr('Geolocation is not supported by your browser.'); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await doctorAPI.getNearby({
            lat: coords.latitude, lng: coords.longitude,
            specialty: spec !== 'All' ? spec : 'doctor', radius: 5000,
          })
          setDoctors(data.doctors || [])
        } catch { toast.error('Could not load doctors') }
        finally { setLoading(false) }
      },
      () => { setLocErr('Location access denied. Please enable location in your browser settings.'); setLoading(false) }
    )
  }

  useEffect(() => { fetchDoctors(specialty) }, [specialty])

  const filtered = doctors.filter(d =>
    !search || d.name?.toLowerCase().includes(search.toLowerCase()) || d.address?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-up" style={{ padding:24, maxWidth:1100, margin:'0 auto' }}>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
        <div style={{ position:'relative', flex:'1 1 220px' }}>
          <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or address..." className="input" style={{ paddingLeft:34 }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {SPECIALTIES.map(s => (
            <button key={s} onClick={() => setSpecialty(s)} style={{
              padding:'8px 14px', borderRadius:99, cursor:'pointer', fontSize:12, fontWeight:500, transition:'all 0.15s',
              border:`1px solid ${specialty === s ? 'var(--accent)' : 'var(--border)'}`,
              background: specialty === s ? 'var(--accent)' : 'transparent',
              color:       specialty === s ? '#fff'          : 'var(--text-muted)',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {locErr && (
        <div style={{ padding:'13px 16px', borderRadius:10, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', color:'var(--red)', fontSize:13, marginBottom:16 }}>
          {locErr}
        </div>
      )}

      {loading
        ? <PageLoader />
        : filtered.length === 0
          ? <EmptyState icon={MapPin} title="No doctors found" description="Try a different search term or specialty."
              action={<button className="btn-primary" onClick={() => fetchDoctors()}>Retry</button>} />
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
              {filtered.map((doc, i) => (
                <DoctorCard
                  key={doc.placeId || i}
                  doctor={doc}
                  onBook={setBookingDoc}
                  saved={isSaved(doc)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
      }

      {bookingDoc && <BookingModal doctor={bookingDoc} onClose={() => setBookingDoc(null)} />}
    </div>
  )
}