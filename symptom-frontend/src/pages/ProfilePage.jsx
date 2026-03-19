import { useState } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { GlassCard, Spinner, SectionHeader } from '../components/ui'

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']

export default function ProfilePage() {
  const { user, updateUser }  = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({
    name:               user?.name || '',
    age:                user?.healthProfile?.age || '',
    gender:             user?.healthProfile?.gender || '',
    bloodGroup:         user?.healthProfile?.bloodGroup || '',
    allergies:          (user?.healthProfile?.allergies || []).join(', '),
    existingConditions: (user?.healthProfile?.existingConditions || []).join(', '),
  })

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await authAPI.updateProfile({
        name: form.name,
        healthProfile: {
          age:        Number(form.age) || undefined,
          gender:     form.gender     || undefined,
          bloodGroup: form.bloodGroup || undefined,
          allergies:           form.allergies           ? form.allergies.split(',').map(s => s.trim()).filter(Boolean)           : [],
          existingConditions:  form.existingConditions  ? form.existingConditions.split(',').map(s => s.trim()).filter(Boolean)  : [],
        },
      })
      updateUser(data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally { setLoading(false) }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <div className="fade-up" style={{ padding:24, maxWidth:640, margin:'0 auto' }}>

      
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, fontFamily:'var(--font-display)', color:'#fff', flexShrink:0 }}>
          {initials}
        </div>
        <div>
          <p style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, color:'var(--text)' }}>{user?.name}</p>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{user?.email}</p>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--accent-glow)', color:'var(--accent)', marginTop:6, display:'inline-block' }}>
            {user?.role === 'admin' ? '👑 Admin' : '✅ Verified'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        <GlassCard style={{ marginBottom:16 }}>
          <SectionHeader title="Account Info" />
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Email</label>
              <input value={user?.email} disabled className="input" style={{ opacity:0.5, cursor:'not-allowed' }} />
              <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Email cannot be changed.</p>
            </div>
          </div>
        </GlassCard>

        
        <GlassCard style={{ marginBottom:20 }}>
          <SectionHeader title="Health Profile" />
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16, marginTop:-8 }}>
            Helps the AI give more personalised recommendations.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Age</label>
              <input name="age" type="number" min="1" max="120" value={form.age} onChange={handleChange} placeholder="e.g. 25" className="input" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="input">
                <option value="">Select</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Allergies</label>
              <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Penicillin, Peanuts..." className="input" />
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text-muted)', marginBottom:6 }}>Existing Conditions</label>
            <input name="existingConditions" value={form.existingConditions} onChange={handleChange} placeholder="Diabetes, Hypertension... (comma separated)" className="input" />
          </div>
        </GlassCard>

        <button type="submit" className="btn-primary" style={{ width:'100%', justifyContent:'center' }} disabled={loading}>
          {loading ? <Spinner size={16} /> : <><Save size={14} /> Save Changes</>}
        </button>
      </form>
    </div>
  )
}
