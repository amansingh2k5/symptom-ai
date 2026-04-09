import { useState } from 'react'
import {
  Stethoscope, Thermometer, Brain, Wind, Heart,
  Zap, Eye, Bone, Pill, AlertTriangle, RotateCcw, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { symptomAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { GlassCard, Badge, Spinner } from '../components/ui'

const TAGS = [
  { label: 'Fever',      icon: Thermometer },
  { label: 'Headache',   icon: Brain       },
  { label: 'Cough',      icon: Wind        },
  { label: 'Chest Pain', icon: Heart       },
  { label: 'Fatigue',    icon: Zap         },
  { label: 'Eye Pain',   icon: Eye         },
  { label: 'Bone Pain',  icon: Bone        },
  { label: 'Nausea',     icon: Pill        },
]

const PROB_C = { High: '#ef4444', Moderate: '#f59e0b', Low: '#10b981' }
const PROB_B = { High: 'rgba(239,68,68,0.12)', Moderate: 'rgba(245,158,11,0.12)', Low: 'rgba(16,185,129,0.12)' }
const SEV_GLOW   = { low: 'rgba(16,185,129,0.25)', moderate: 'rgba(245,158,11,0.25)', high: 'rgba(239,68,68,0.25)' }
const SEV_BORDER = { low: 'rgba(16,185,129,0.35)', moderate: 'rgba(245,158,11,0.35)', high: 'rgba(239,68,68,0.35)' }

export default function SymptomCheckerPage() {
  const { user } = useAuth()
  const [selected,   setSelected]   = useState([])
  const [customText, setCustomText] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [result,     setResult]     = useState(null)

  const toggleTag = (label) =>
    setSelected(prev => prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label])

  const handleCheck = async () => {
    if (!selected.length && !customText.trim()) {
      toast.error('Select or describe at least one symptom')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await symptomAPI.check({
        tags: selected,
        customText,
        userProfile: {
          age:                user?.healthProfile?.age,
          gender:             user?.healthProfile?.gender,
          bloodGroup:         user?.healthProfile?.bloodGroup,
          allergies:          user?.healthProfile?.allergies,
          existingConditions: user?.healthProfile?.existingConditions,
        },
      })
      setResult(data.result)
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setSelected([]); setCustomText(''); setResult(null) }

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Tag Selector ── */}
      <GlassCard>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Select Your Symptoms</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Choose all that apply</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {TAGS.map(({ label, icon: Icon }) => {
            const on = selected.includes(label)
            return (
              <button key={label} onClick={() => toggleTag(label)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 15px', borderRadius: 99, cursor: 'pointer',
                border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.28),rgba(139,92,246,0.18))'
                  : 'rgba(255,255,255,0.03)',
                color: on ? 'var(--accent)' : 'var(--text-muted)',
                fontWeight: on ? 700 : 400, fontSize: 13,
                boxShadow: on ? '0 0 14px rgba(99,102,241,0.3)' : 'none',
                transform: on ? 'translateY(-1px)' : 'none',
                transition: 'all 0.15s ease',
              }}>
                <Icon size={13} style={{ color: on ? 'var(--accent)' : 'var(--text-muted)' }} />
                {label}
              </button>
            )
          })}
        </div>

        <textarea
          value={customText}
          onChange={e => setCustomText(e.target.value)}
          placeholder="Describe other symptoms in detail..."
          className="input" rows={3}
          style={{ resize: 'vertical', fontSize: 13, width: '100%', boxSizing: 'border-box' }}
        />
      </GlassCard>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleCheck} disabled={loading} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 20px', borderRadius: 12, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff',
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          boxShadow: loading ? 'none' : '0 0 28px rgba(99,102,241,0.5)',
          opacity: loading ? 0.8 : 1,
          transition: 'all 0.2s ease',
        }}>
          {loading ? <><Spinner size={16} /> Analyzing...</> : <><Stethoscope size={16} /> Analyze Symptoms</>}
        </button>

        <button className="btn-ghost" onClick={reset} style={{ padding: '13px 20px', fontSize: 13, borderRadius: 12, whiteSpace: 'nowrap' }}>
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* ── Result ── */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Header */}
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: `linear-gradient(135deg,${SEV_GLOW[result.severity] || 'rgba(99,102,241,0.1)'},rgba(0,0,0,0))`,
            border: `1.5px solid ${SEV_BORDER[result.severity] || 'var(--border)'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>AI ANALYSIS RESULT</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                Possible Conditions
              </p>
            </div>
            <Badge type={result.severity} label={`${result.severity} Risk`} />
          </div>

          {/* Conditions */}
          <GlassCard style={{ padding: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Diagnosis
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.conditions?.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ChevronRight size={10} /> See: {c.specialist}
                    </p>
                  </div>
                  <span style={{
                    flexShrink: 0, padding: '4px 12px', borderRadius: 8,
                    color: PROB_C[c.probability], background: PROB_B[c.probability],
                    fontSize: 12, fontWeight: 700,
                    border: `1px solid ${PROB_C[c.probability]}44`,
                  }}>
                    {c.probability}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Medicines */}
          {result.medications?.length > 0 && (
            <GlassCard style={{ padding: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                💊 Suggested Medicines
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.medications.map((m, i) => (
                  <div key={i} style={{
                    padding: '13px 14px', borderRadius: 10,
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                      <strong style={{ fontSize: 14, color: 'var(--text)' }}>{m.name}</strong>
                      {m.dose && (
                        <span style={{
                          flexShrink: 0, fontSize: 11, fontWeight: 700,
                          padding: '3px 10px', borderRadius: 99,
                          background: 'rgba(99,102,241,0.2)', color: 'var(--accent)',
                          border: '1px solid rgba(99,102,241,0.35)',
                          whiteSpace: 'nowrap',
                        }}>
                          {m.dose}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: m.note ? 4 : 0 }}>{m.usage}</p>
                    {m.note && <p style={{ fontSize: 11, color: 'var(--text-muted)', opacity: 0.65 }}>{m.note}</p>}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Home Remedies + Precautions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>

            {result.homeRemedies?.length > 0 && (
              <GlassCard style={{ padding: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  🏠 Home Remedies
                </p>
                <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.homeRemedies.map((r, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {result.precautions?.length > 0 && (
              <GlassCard style={{ padding: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  ⚠️ Precautions
                </p>
                <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.precautions.map((p, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p}</li>
                  ))}
                </ul>
              </GlassCard>
            )}
          </div>

          {/* See Doctor If */}
          {result.seeDoctorIf?.length > 0 && (
            <div style={{
              padding: '14px 16px', borderRadius: 12,
              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.22)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                🚨 See Doctor If
              </p>
              <ul style={{ paddingLeft: 16, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.seeDoctorIf.map((s, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            display: 'flex', gap: 10, padding: '11px 14px', borderRadius: 10,
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
          }}>
            <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{result.disclaimer}</p>
          </div>

        </div>
      )}
    </div>
  )
}