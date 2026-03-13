import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import {
  Activity,
  Heart,
  Calendar,
  Shield,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Clock
} from "lucide-react"

import { symptomAPI, bookingAPI } from "../services/api"
import { useAuth } from "../context/AuthContext"

import {
  GlassCard,
  Badge,
  StatCard,
  PageLoader,
  SectionHeader
} from "../components/ui"

export default function DashboardPage() {

  const { user } = useAuth()
  const navigate = useNavigate()

  const [logs,setLogs] = useState([])
  const [totalChecks,setTotalChecks] = useState(0)
  const [bookings,setBookings] = useState([])
  const [healthScore,setHealthScore] = useState(100)
  const [loading,setLoading] = useState(true)

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const [logsRes,bookRes] = await Promise.all([
          symptomAPI.getHistory({ page:1, limit:3 }),
          bookingAPI.getAll()
        ])

        const history = logsRes.data.logs || []

        setLogs(history)
        setTotalChecks(logsRes.data.pagination?.total || history.length)

        const confirmed =
          (bookRes.data.bookings || [])
          .filter(b => b.status === "confirmed")
          .slice(0,3)

        setBookings(confirmed)

        // health score logic
        const severeCount =
          history.filter(l => l.aiResult?.severity === "high").length

        const score = Math.max(60,100 - severeCount * 10)

        setHealthScore(score)

      } catch(err) {
        console.error("Dashboard error:",err)
      } finally {
        setLoading(false)
      }

    }

    loadDashboard()

  },[])

  if(loading) return <PageLoader />

  const firstName = user?.name?.split(" ")[0] || "there"

  return (
    <div className="fade-up" style={{ padding:24,maxWidth:1100,margin:"0 auto" }}>

      {/* Welcome Banner */}

      <GlassCard style={{ marginBottom:20,position:"relative",overflow:"hidden" }}>

        <p style={{ fontSize:13,color:"var(--text-muted)",marginBottom:4 }}>
          Good day 👋
        </p>

        <h2 style={{
          fontFamily:"var(--font-display)",
          fontSize:26,
          fontWeight:800,
          color:"var(--text)",
          marginBottom:8
        }}>
          How are you feeling, {firstName}?
        </h2>

        <p style={{ fontSize:13,color:"var(--text-muted)",marginBottom:18 }}>
          Describe your symptoms and let AI guide you to the right care.
        </p>

        <button
          className="btn-primary"
          onClick={()=>navigate("/symptoms")}
        >
          Start Symptom Check
          <ArrowRight size={15}/>
        </button>

      </GlassCard>

      {/* Quick Actions */}

      <div style={{
        display:"flex",
        gap:10,
        flexWrap:"wrap",
        marginBottom:20
      }}>
        <button className="btn-primary" onClick={()=>navigate("/symptoms")}>
          Check Symptoms
        </button>

        <button className="btn-ghost" onClick={()=>navigate("/doctors")}>
          Find Doctor
        </button>

        <button className="btn-ghost" onClick={()=>navigate("/bookings")}>
          Book Appointment
        </button>
      </div>

      {/* Health Tip */}

      <GlassCard style={{ marginBottom:20 }}>
        <p style={{ fontSize:12,color:"var(--text-muted)",marginBottom:6 }}>
          💡 Health Tip
        </p>

        <p style={{ fontSize:13,lineHeight:1.6 }}>
          Staying hydrated, getting enough sleep, and managing stress can
          significantly improve your immune system and overall health.
        </p>
      </GlassCard>

      {/* Stats */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",
        gap:14,
        marginBottom:20
      }}>

        <StatCard
          label="Total Checks"
          value={totalChecks}
          icon={Activity}
          color="var(--accent)"
        />

        <StatCard
          label="Appointments"
          value={bookings.length}
          icon={Calendar}
          color="var(--green)"
        />

        <StatCard
          label="Saved Doctors"
          value="—"
          icon={Heart}
          color="#f472b6"
        />

        <StatCard
          label="Health Score"
          value={`${healthScore}%`}
          icon={Shield}
          color="#a78bfa"
        />

      </div>

      {/* Two Column Layout */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
        gap:16
      }}>

        {/* Recent Checks */}

        <GlassCard>

          <SectionHeader
            title="Recent Checks"
            action={
              <button
                onClick={()=>navigate("/history")}
                style={{
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  fontSize:12,
                  color:"var(--accent)",
                  display:"flex",
                  alignItems:"center",
                  gap:4
                }}
              >
                View all
                <ChevronRight size={12}/>
              </button>
            }
          />

          {logs.length === 0 ? (

            <p style={{
              textAlign:"center",
              padding:"24px 0",
              color:"var(--text-muted)",
              fontSize:13
            }}>
              No checks yet.
              <button
                onClick={()=>navigate("/symptoms")}
                style={{
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  color:"var(--accent)"
                }}
              >
                Check now →
              </button>
            </p>

          ) : (

            logs.map(log => (

              <div
                key={log._id}
                style={{
                  display:"flex",
                  justifyContent:"space-between",
                  padding:"12px 0",
                  borderBottom:"1px solid var(--border)"
                }}
              >

                <div>

                  <p style={{
                    fontSize:13,
                    fontWeight:600,
                    color:"var(--text)",
                    marginBottom:3
                  }}>
                    {log.aiResult?.conditions?.[0]?.name || "Health Check"}
                  </p>

                  <p style={{
                    fontSize:11,
                    color:"var(--text-muted)",
                    display:"flex",
                    alignItems:"center",
                    gap:4
                  }}>
                    <Clock size={10}/>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>

                </div>

                <Badge
                  type={log.aiResult?.severity}
                  label={log.aiResult?.severity || "N/A"}
                />

              </div>

            ))

          )}

        </GlassCard>

        {/* Upcoming Appointments */}

        <GlassCard>

          <SectionHeader
            title="Upcoming Appointments"
            action={
              <button
                onClick={()=>navigate("/bookings")}
                style={{
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  fontSize:12,
                  color:"var(--accent)",
                  display:"flex",
                  alignItems:"center",
                  gap:4
                }}
              >
                View all
                <ChevronRight size={12}/>
              </button>
            }
          />

          {bookings.length === 0 ? (

            <p style={{
              textAlign:"center",
              padding:"24px 0",
              color:"var(--text-muted)",
              fontSize:13
            }}>
              No appointments.
              <button
                onClick={()=>navigate("/doctors")}
                style={{
                  background:"none",
                  border:"none",
                  cursor:"pointer",
                  color:"var(--accent)"
                }}
              >
                Find a doctor →
              </button>
            </p>

          ) : (

            bookings.map(b => (

              <div
                key={b._id}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:12,
                  padding:"12px 0",
                  borderBottom:"1px solid var(--border)"
                }}
              >

                <div style={{
                  width:36,
                  height:36,
                  borderRadius:10,
                  background:"var(--accent-glow)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center"
                }}>
                  <Calendar size={14} style={{ color:"var(--accent)" }}/>
                </div>

                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13,fontWeight:600 }}>
                    {b.doctor?.name}
                  </p>

                  <p style={{ fontSize:11,color:"var(--text-muted)" }}>
                    {new Date(b.appointmentDate).toDateString()}
                    {" · "}
                    {b.appointmentTime}
                  </p>
                </div>

                <Badge type={b.status} label={b.status}/>

              </div>

            ))

          )}

        </GlassCard>

      </div>

      {/* Disclaimer */}

      <div style={{
        display:"flex",
        gap:10,
        marginTop:20,
        padding:"12px 16px",
        borderRadius:10,
        background:"rgba(245,158,11,0.08)",
        border:"1px solid rgba(245,158,11,0.2)"
      }}>

        <AlertTriangle size={13} style={{ color:"var(--yellow)" }}/>

        <p style={{ fontSize:12,color:"var(--text-muted)" }}>
          SymptomAI is for informational purposes only and is
          <strong> not a substitute for professional medical advice</strong>.
          Always consult a qualified healthcare provider.
        </p>

      </div>

    </div>
  )
}