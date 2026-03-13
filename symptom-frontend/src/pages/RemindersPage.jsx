import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { reminderAPI } from '../services/api'
import { GlassCard, EmptyState, PageLoader, SectionHeader, Spinner } from '../components/ui'

function AddReminderModal({ onClose, onAdded }) {
  const [form, setForm]       = useState({ medicationName:'', dosage:'', notes:'' })
  const [times, setTimes]     = useState(['08:00'])
  const [loading, setLoading] = useState(false)

  const addTime    = () => setTimes(t => [...t, '12:00'])
  const removeTime = (i) => setTimes(t => t.filter((_, idx) => idx !== i))
  const setTime    = (i, v) => setTimes(t => t.map((val, idx) => idx === i ? v : val))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!times.length) { toast.error('Add at least one time'); return }
    setLoading(true)
    try {
      await reminderAPI.create({ ...form, times })
      toast.success('Reminder created!')
      onAdded(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} className="glass" style={{ width:'100%', maxWidth:460, padding:28 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text)' }}>New Reminder</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Medication Name *</label>
            <input required value={form.medicationName} onChange={e => setForm(f => ({ ...f, medicationName:e.target.value }))} placeholder="e.g. Paracetamol" className="input" />
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Dosage *</label>
            <input required value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage:e.target.value }))} placeholder="e.g. 500mg" className="input" />
          </div>
          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)' }}>Reminder Times *</label>
              <button type="button" onClick={addTime} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--accent)', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                <Plus size={12} /> Add time
              </button>
            </div>
            {times.map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <input type="time" value={t} onChange={e => setTime(i, e.target.value)} className="input" style={{ flex:1 }} />
                {times.length > 1 && (
                  <button type="button" onClick={() => removeTime(i)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--red)' }}><X size={14} /></button>
                )}
              </div>
            ))}
          </div>
          <div>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes:e.target.value }))} placeholder="e.g. Take after meals" className="input" />
          </div>
          <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
            {loading ? <Spinner size={16} /> : <><Bell size={14} /> Create Reminder</>}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchReminders = async () => {
    setLoading(true)
    try {
      const { data } = await reminderAPI.getAll()
      setReminders(data.reminders || [])
    } catch { toast.error('Could not load reminders') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchReminders() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return
    try { await reminderAPI.delete(id); toast.success('Deleted'); fetchReminders() }
    catch { toast.error('Delete failed') }
  }

  const handleToggle = async (id, isActive) => {
    try {
      await reminderAPI.update(id, { isActive: !isActive })
      toast.success(isActive ? 'Reminder paused' : 'Reminder resumed')
      fetchReminders()
    } catch { toast.error('Update failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="fade-up" style={{ padding:24, maxWidth:700, margin:'0 auto' }}>
      <SectionHeader title="Medication Reminders" action={
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ padding:'8px 16px', fontSize:13 }}>
          <Plus size={13} /> New Reminder
        </button>
      } />

      <div style={{ padding:'10px 16px', borderRadius:10, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', fontSize:12, color:'var(--text-muted)', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
        <Bell size={13} style={{ color:'var(--accent)', flexShrink:0 }} />
        Email reminders are sent automatically at your scheduled times via our backend cron job.
      </div>

      {reminders.length === 0
        ? <EmptyState icon={Bell} title="No reminders set" description="Create a reminder and we'll email you at the scheduled time."
            action={<button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={13} /> Add First Reminder</button>} />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {reminders.map(r => (
              <GlassCard key={r._id} hover style={{ opacity: r.isActive ? 1 : 0.6 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0 }}>
                    <div style={{ padding:10, borderRadius:10, background: r.isActive ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.1)', flexShrink:0 }}>
                      {r.isActive ? <Bell size={16} style={{ color:'var(--accent)' }} /> : <BellOff size={16} style={{ color:'var(--text-muted)' }} />}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--font-display)' }}>{r.medicationName}</p>
                      <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Dosage: {r.dosage}</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:8 }}>
                        {r.times?.map((t, i) => (
                          <span key={i} style={{ fontSize:11, padding:'3px 8px', borderRadius:99, background:'var(--bg)', border:'1px solid var(--border)', color:'var(--text-muted)' }}>
                            ⏰ {t}
                          </span>
                        ))}
                      </div>
                      {r.notes && <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>{r.notes}</p>}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                    <button onClick={() => handleToggle(r._id, r.isActive)} className="btn-ghost" style={{ padding:'6px 12px', fontSize:11 }} title={r.isActive ? 'Pause' : 'Resume'}>
                      {r.isActive ? <BellOff size={13} /> : <Bell size={13} />}
                    </button>
                    <button onClick={() => handleDelete(r._id)}
                      style={{ background:'none', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, color:'var(--red)', cursor:'pointer', padding:'6px 10px', transition:'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      }

      {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdded={fetchReminders} />}
    </div>
  )
}
