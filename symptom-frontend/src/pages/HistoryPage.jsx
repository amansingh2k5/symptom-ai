import { useState, useEffect, useCallback } from 'react'
import { Clock, Trash2, ChevronRight, ChevronLeft, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { symptomAPI } from '../services/api'
import { GlassCard, Badge, EmptyState, PageLoader, SectionHeader } from '../components/ui'

export default function HistoryPage() {
  const [logs, setLogs]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expanded, setExpanded]   = useState(null)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await symptomAPI.getHistory({ page, limit: 8 })
      setLogs(data.logs || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch { toast.error('Could not load history') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return
    try {
      await symptomAPI.deleteLog(id)
      toast.success('Record deleted')
      fetchHistory()
    } catch { toast.error('Delete failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="fade-up" style={{ padding:24, maxWidth:800, margin:'0 auto' }}>
      <SectionHeader title="Symptom History" action={
        <span style={{ fontSize:12, color:'var(--text-muted)' }}>{logs.length} records</span>
      } />

      {logs.length === 0
        ? <EmptyState icon={Activity} title="No symptom checks yet" description="Use the Symptom Checker to get your first AI analysis." />
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {logs.map(log => {
              const isOpen = expanded === log._id
              return (
                <GlassCard key={log._id} hover style={{ cursor:'pointer' }} onClick={() => setExpanded(isOpen ? null : log._id)}>
                  {/* Summary row */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                      <div style={{ padding:8, borderRadius:8, background:'var(--accent-glow)', flexShrink:0 }}>
                        <Activity size={14} style={{ color:'var(--accent)' }} />
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {log.aiResult?.conditions?.[0]?.name || 'Unknown condition'}
                        </p>
                        <p style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
                          <Clock size={10} />
                          {new Date(log.createdAt).toLocaleString()}
                          {log.symptoms?.tags?.length > 0 && ` · ${log.symptoms.tags.slice(0,3).join(', ')}`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, marginLeft:12 }}>
                      <Badge type={log.aiResult?.severity} label={log.aiResult?.severity || 'N/A'} />
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(log._id) }}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:4 }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                      <p style={{ fontSize:11, fontWeight:600, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>Possible Conditions</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
                        {log.aiResult?.conditions?.map((c, i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, background:'var(--bg)' }}>
                            <div>
                              <p style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{c.name}</p>
                              <p style={{ fontSize:11, color:'var(--text-muted)' }}>Refer to: {c.specialist}</p>
                            </div>
                            <Badge type={c.probability} label={c.probability} />
                          </div>
                        ))}
                      </div>
                      {log.aiResult?.advice && (
                        <p style={{ fontSize:12, color:'var(--text-muted)', padding:'10px 13px', borderRadius:8, background:'var(--accent-glow)', lineHeight:1.6 }}>
                          💡 {log.aiResult.advice}
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>
              )
            })}
          </div>
        )
      }

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:24 }}>
          <button className="btn-ghost" onClick={() => setPage(p => p-1)} disabled={page === 1} style={{ padding:'8px 14px' }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize:13, color:'var(--text-muted)' }}>Page {page} of {totalPages}</span>
          <button className="btn-ghost" onClick={() => setPage(p => p+1)} disabled={page === totalPages} style={{ padding:'8px 14px' }}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
