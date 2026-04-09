import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity, Heart, Calendar, Shield, ArrowRight,
  ChevronRight, AlertTriangle, Clock, MapPin, Phone
} from "lucide-react"
import { symptomAPI, bookingAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { GlassCard, Badge, StatCard, PageLoader, SectionHeader } from "../components/ui"

const calcHealthScore = (logs) => {
  if (!logs.length) return 100
  const today = new Date().toDateString()
  const todayLogs = logs.filter(l => new Date(l.createdAt).toDateString() === today)
  let score = 100
  todayLogs.forEach(log => {
    const sev = log.aiResult?.severity?.toLowerCase()
    if      (sev === "high")     score -= 30
    else if (sev === "moderate") score -= 20
    else if (sev === "low")      score -= 10
  })
  return Math.max(0, score)
}

const getHealthAdvice = (score) => {
  if (score < 70) return { emoji: "🏥", color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   title: "Visit a Clinic",   message: "Your health score is critically low. Please visit a clinic or consult a doctor today." }
  if (score < 80) return { emoji: "🏠", color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  title: "Stay Home & Rest", message: "Your health score is low. Stay home, rest well, drink fluids and avoid strenuous activity." }
  if (score < 90) return { emoji: "⚠️", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", title: "Take Precautions", message: "Your health score could be better. Take precautions, stay hydrated and monitor your symptoms." }
  return null
}

const getScoreColor = (score) => {
  if (score < 70) return "#ef4444"
  if (score < 80) return "#f59e0b"
  if (score < 90) return "#a78bfa"
  return "var(--green)"
}

export default function DashboardPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [logs,         setLogs]         = useState([])
  const [totalChecks,  setTotalChecks]  = useState(0)
  const [bookings,     setBookings]     = useState([])
  const [healthScore,  setHealthScore]  = useState(100)
  const [loading,      setLoading]      = useState(true)
  const [savedDoctors, setSavedDoctors] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("savedDoctors") || "[]")
      setSavedDoctors(saved)
    } catch { setSavedDoctors([]) }

    const loadDashboard = async () => {
      try {
        const [logsRes, bookRes] = await Promise.all([
          symptomAPI.getHistory({ page: 1, limit: 10 }),
          bookingAPI.getAll()
        ])
        const history = logsRes.data.logs || []
        setLogs(history.slice(0, 3))
        setTotalChecks(logsRes.data.pagination?.total || history.length)
        const confirmed = (bookRes.data.bookings || [])
          .filter(b => b.status === "confirmed")
          .slice(0, 3)
        setBookings(confirmed)
        setHealthScore(calcHealthScore(history))
      } catch (err) {
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  if (loading) return <PageLoader />

  const firstName  = user?.name?.split(" ")[0] || "there"
  const advice     = getHealthAdvice(healthScore)
  const scoreColor = getScoreColor(healthScore)

  return (
    <div className="fade-up" style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Hero ── */}
      <GlassCard style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(99,102,241,0.06)", pointerEvents: "none" }} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Good day 👋</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", marginBottom: 8 }}>
          How are you feeling, {firstName}?
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
          Describe your symptoms and let AI guide you to the right care.
        </p>
        <button className="btn-primary" onClick={() => navigate("/symptoms")} style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow: "0 0 20px rgba(99,102,241,0.4)",
        }}>
          Start Symptom Check <ArrowRight size={15} />
        </button>
      </GlassCard>

      {/* ── Quick Actions ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <button className="btn-primary" onClick={() => navigate("/symptoms")}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
          Check Symptoms
        </button>
        <button className="btn-ghost" onClick={() => navigate("/doctors")}>Find Doctor</button>
        <button className="btn-ghost" onClick={() => navigate("/bookings")}>Book Appointment</button>
      </div>

      {/* ── Health Advice Banner ── */}
      {advice && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 14,
          padding: "16px 18px", borderRadius: 14, marginBottom: 20,
          background: advice.bg, border: `1.5px solid ${advice.border}`,
        }}>
          <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{advice.emoji}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: advice.color, marginBottom: 3 }}>{advice.title}</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{advice.message}</p>
          </div>
        </div>
      )}

      {/* ── Health Tip ── */}
      <GlassCard style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>💡 Health Tip</p>
        <p style={{ fontSize: 13, lineHeight: 1.6 }}>
          Staying hydrated, getting enough sleep, and managing stress can significantly improve your immune system and overall health.
        </p>
      </GlassCard>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 20 }}>
        <StatCard label="Total Checks"  value={totalChecks}         icon={Activity} color="var(--accent)" />
        <StatCard label="Appointments"  value={bookings.length}     icon={Calendar} color="var(--green)"  />
        <StatCard label="Saved Doctors" value={savedDoctors.length} icon={Heart}    color="#f472b6"       />
        <StatCard label="Health Score"  value={`${healthScore}%`}   icon={Shield}   color={scoreColor}    />
      </div>

      {/* ── Main Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 16 }}>

        {/* Recent Checks */}
        <GlassCard>
          <SectionHeader title="Recent Checks" action={
            <button onClick={() => navigate("/history")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ChevronRight size={12} />
            </button>
          } />
          {logs.length === 0
            ? <p style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
                No checks yet.{" "}
                <button onClick={() => navigate("/symptoms")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>Check now →</button>
              </p>
            : logs.map(log => (
              <div key={log._id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>
                    {log.aiResult?.conditions?.[0]?.name || "Health Check"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={10} /> {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge type={log.aiResult?.severity} label={log.aiResult?.severity || "N/A"} />
              </div>
            ))
          }
        </GlassCard>

        {/* Upcoming Appointments */}
        <GlassCard>
          <SectionHeader title="Upcoming Appointments" action={
            <button onClick={() => navigate("/bookings")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
              View all <ChevronRight size={12} />
            </button>
          } />
          {bookings.length === 0
            ? <p style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
                No appointments.{" "}
                <button onClick={() => navigate("/doctors")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>Find a doctor →</button>
              </p>
            : bookings.map(b => (
              <div key={b._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={14} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{b.doctor?.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(b.appointmentDate).toDateString()} · {b.appointmentTime}
                  </p>
                </div>
                <Badge type={b.status} label={b.status} />
              </div>
            ))
          }
        </GlassCard>
      </div>

      {/* ── Saved Doctors ── */}
      {savedDoctors.length > 0 && (
        <GlassCard style={{ marginBottom: 16 }}>
          <SectionHeader title="Saved Doctors" action={
            <button onClick={() => navigate("/doctors")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}>
              Find more <ChevronRight size={12} />
            </button>
          } />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10, marginTop: 4 }}>
            {savedDoctors.slice(0, 4).map((doc, i) => {
              const initials = (doc.name || "DR").split(" ").filter(w => /^[A-Z]/.test(w)).map(w => w[0]).slice(0, 2).join("")
              return (
                <div key={doc.placeId || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(244,114,182,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#f472b6", flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{doc.specialty || "General Physician"}</p>
                    {doc.address && doc.address !== "Address not available" && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 3, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <MapPin size={9} /> {doc.address}
                      </p>
                    )}
                  </div>
                  {doc.phone && (
                    <a href={`tel:${doc.phone}`} style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                      <Phone size={14} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
          {savedDoctors.length > 4 && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 10 }}>
              +{savedDoctors.length - 4} more saved doctors
            </p>
          )}
        </GlassCard>
      )}

      {/* ── Disclaimer ── */}
      <div style={{ display: "flex", gap: 10, padding: "12px 16px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
        <AlertTriangle size={13} style={{ color: "var(--yellow)" }} />
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          SymptomAI is for informational purposes only and is <strong>not a substitute for professional medical advice</strong>. Always consult a qualified healthcare provider.
        </p>
      </div>

    </div>
  )
}