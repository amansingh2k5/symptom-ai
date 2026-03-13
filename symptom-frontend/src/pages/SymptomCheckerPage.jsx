import { useState } from 'react'
import {
  Stethoscope,
  Thermometer,
  Brain,
  Wind,
  Heart,
  Zap,
  Eye,
  Bone,
  Pill,
  AlertTriangle,
  RotateCcw,
  ChevronRight
} from 'lucide-react'

import toast from 'react-hot-toast'
import { symptomAPI } from '../services/api'
import { GlassCard, Badge, Spinner } from '../components/ui'

const TAGS = [
  { label: 'Fever', icon: Thermometer },
  { label: 'Headache', icon: Brain },
  { label: 'Cough', icon: Wind },
  { label: 'Chest Pain', icon: Heart },
  { label: 'Fatigue', icon: Zap },
  { label: 'Eye Pain', icon: Eye },
  { label: 'Bone Pain', icon: Bone },
  { label: 'Nausea', icon: Pill },
]

const PROB_C = { High: 'var(--red)', Moderate: 'var(--yellow)', Low: 'var(--green)' }

const PROB_B = {
  High: 'rgba(239,68,68,0.1)',
  Moderate: 'rgba(245,158,11,0.1)',
  Low: 'rgba(16,185,129,0.1)',
}

const SEV_BORDER = {
  low: 'rgba(16,185,129,0.3)',
  moderate: 'rgba(245,158,11,0.3)',
  high: 'rgba(239,68,68,0.3)',
}

export default function SymptomCheckerPage() {

  const [selected, setSelected] = useState([])
  const [customText, setCustomText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const toggleTag = (label) =>
    setSelected((prev) =>
      prev.includes(label)
        ? prev.filter((s) => s !== label)
        : [...prev, label]
    )

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
      })

      setResult(data.result)

    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setSelected([])
    setCustomText('')
    setResult(null)
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>

      {/* Symptom Selector */}
      <GlassCard style={{ marginBottom: 16 }}>

        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          Select Your Symptoms
        </h3>

        <p style={{ fontSize: 12, marginBottom: 16 }}>
          Choose all that apply
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {TAGS.map(({ label, icon: Icon }) => {

            const active = selected.includes(label)

            return (
              <button
                key={label}
                onClick={() => toggleTag(label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 99,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-glow)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>

        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Describe other symptoms..."
          className="input"
          rows={3}
        />

      </GlassCard>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>

        <button
          className="btn-primary"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={handleCheck}
          disabled={loading}
        >
          {loading
            ? <><Spinner size={16} /> Analyzing...</>
            : <><Stethoscope size={15} /> Analyze Symptoms</>
          }
        </button>

        <button className="btn-ghost" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>

      </div>

      {/* AI RESULT */}
      {result && (

        <GlassCard style={{ borderColor: SEV_BORDER[result.severity] || 'var(--border)' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>AI Analysis</h3>

            <Badge
              type={result.severity}
              label={`${result.severity} Risk`}
            />
          </div>

          {/* Conditions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

            {result.conditions?.map((c, i) => (

              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '11px 13px',
                  borderRadius: 10,
                  background: 'var(--bg)',
                }}
              >
                <div>
                  <p style={{ fontWeight: 600 }}>{c.name}</p>

                  <p style={{ fontSize: 11, opacity: 0.7 }}>
                    <ChevronRight size={10} /> See: {c.specialist}
                  </p>
                </div>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    color: PROB_C[c.probability],
                    background: PROB_B[c.probability],
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {c.probability}
                </span>

              </div>
            ))}

          </div>

          <hr style={{ margin: '18px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Medicines */}
          {result.medications?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                💊 Suggested Medicines
              </h4>

              {result.medications.map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong>{m.name}</strong>
                  <div style={{ fontSize: 13 }}>{m.usage}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{m.note}</div>
                </div>
              ))}
            </div>
          )}

          {/* Home Remedies */}
          {result.homeRemedies?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                🏠 Home Remedies
              </h4>

              <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                {result.homeRemedies.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Precautions */}
          {result.precautions?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                ⚠️ Precautions
              </h4>

              <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                {result.precautions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Doctor Warning */}
          {result.seeDoctorIf?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>
                🚨 See Doctor If
              </h4>

              <ul style={{ paddingLeft: 18, lineHeight: 1.8 }}>
                {result.seeDoctorIf.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{ display: 'flex', gap: 8 }}>
            <AlertTriangle size={12} style={{ color: 'var(--yellow)' }} />
            <p style={{ fontSize: 11 }}>{result.disclaimer}</p>
          </div>

        </GlassCard>
      )}

    </div>
  )
}