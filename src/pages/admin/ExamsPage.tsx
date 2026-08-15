import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Archive,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  Eye,
  FileCheck2,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Trash2,
  UsersRound,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button, Modal, ProgressBar, StatusBadge } from '../../components/UI'
import type { Assessment, AssessmentStatus } from '../../types'

const statusTone: Record<AssessmentStatus, 'blue' | 'green' | 'amber' | 'slate' | 'purple'> = { draft: 'slate', scheduled: 'blue', live: 'green', completed: 'purple', archived: 'slate' }

export function ExamsPage() {
  const { assessments, saveAssessment, removeAssessment, notify } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | AssessmentStatus>('all')
  const [query, setQuery] = useState('')
  const [menu, setMenu] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null)
  const filtered = useMemo(() => assessments.filter((exam) => (tab === 'all' || exam.status === tab) && exam.title.toLowerCase().includes(query.toLowerCase())), [assessments, query, tab])

  const duplicate = (exam: Assessment) => {
    const copy: Assessment = { ...exam, id: `exam-${Date.now()}`, slug: `${exam.slug}-copy`, title: `${exam.title} — Copy`, status: 'draft', participantsCount: 0, completedCount: 0, averageScore: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    saveAssessment(copy); notify('Examination duplicated as a new draft.'); setMenu(null)
  }

  const publish = (exam: Assessment) => {
    saveAssessment({ ...exam, status: 'scheduled', updatedAt: new Date().toISOString() }); notify('Examination scheduled successfully.'); setMenu(null)
  }

  return (
    <div className="content-stack">
      <section className="admin-page-actions"><div className="exam-overview-pills"><span><i className="pill-live" />{assessments.filter((exam) => exam.status === 'live').length} live</span><span><i className="pill-blue" />{assessments.filter((exam) => exam.status === 'scheduled').length} scheduled</span><span><i className="pill-slate" />{assessments.filter((exam) => exam.status === 'draft').length} drafts</span></div><Button onClick={() => navigate('/admin/exams/new')} icon={<Plus size={17} />}>Create examination</Button></section>
      <section className="panel table-panel">
        <div className="table-toolbar"><div className="tabs tabs--compact">{(['all', 'draft', 'scheduled', 'live', 'completed'] as const).map((item) => <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)}<span>{item === 'all' ? assessments.length : assessments.filter((exam) => exam.status === item).length}</span></button>)}</div><div className="toolbar-actions"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exams" /></label><button className="filter-button"><Filter size={16} />Filters <ChevronDown size={14} /></button></div></div>
        <div className="data-table-wrap"><table className="data-table exam-table"><thead><tr><th>Examination</th><th>Status</th><th>Audience</th><th>Schedule</th><th>Completion</th><th>Average</th><th /></tr></thead><tbody>{filtered.map((exam) => { const completion = Math.round((exam.completedCount / Math.max(1, exam.participantsCount)) * 100); return <tr key={exam.id}><td><span className={`table-primary-icon table-primary-icon--${exam.status}`}><FileCheck2 size={17} /></span><div><strong>{exam.title}</strong><small>{exam.questionIds.length} questions · {exam.durationMinutes} min · {exam.totalPoints} points</small></div></td><td><StatusBadge tone={statusTone[exam.status]}>{exam.status}</StatusBadge></td><td><UsersRound size={14} /><div><strong>{exam.cohort}</strong><small>{exam.campus}</small></div></td><td><CalendarClock size={14} /><div><strong>{new Date(exam.startsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</strong><small>{new Date(exam.startsAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</small></div></td><td>{exam.participantsCount ? <div className="table-progress"><span><b>{exam.completedCount}</b> / {exam.participantsCount}</span><ProgressBar value={completion} tone={completion > 75 ? 'green' : 'blue'} /></div> : <span className="muted-cell">Not assigned</span>}</td><td>{exam.averageScore !== null ? <strong>{exam.averageScore}%</strong> : <span className="muted-cell">—</span>}</td><td className="row-actions"><button className="icon-button" onClick={() => navigate(`/admin/exams/${exam.id}/edit`)} aria-label="Edit"><Edit3 size={16} /></button><div className="menu-wrap"><button className="icon-button" onClick={() => setMenu(menu === exam.id ? null : exam.id)} aria-label="More"><MoreHorizontal size={17} /></button>{menu === exam.id && <div className="row-menu"><button onClick={() => navigate(`/app/assessments/${exam.id}`)}><Eye size={16} />Preview</button>{exam.status === 'draft' && <button onClick={() => publish(exam)}><Send size={16} />Schedule</button>}<button onClick={() => duplicate(exam)}><Copy size={16} />Duplicate</button><button><Archive size={16} />Archive</button><hr /><button className="danger" onClick={() => { setDeleteTarget(exam); setMenu(null) }}><Trash2 size={16} />Delete</button></div>}</div></td></tr> })}</tbody></table></div>
        {!filtered.length && <div className="table-empty"><Search size={24} /><h3>No examinations match</h3><p>Try changing the status tab or search query.</p></div>}
        <footer className="table-footer"><span>Showing {filtered.length} of {assessments.length} examinations</span><div><button disabled>Previous</button><button className="active">1</button><button>2</button><button>Next</button></div></footer>
      </section>
      <section className="admin-tip"><span><CheckCircle2 size={18} /></span><div><strong>Ready to improve your completion rate?</strong><p>Exams with a 15-minute reminder have 11% fewer late submissions.</p></div><button>Configure reminders <ArrowUpRight size={15} /></button></section>

      <Modal open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Delete this examination?" eyebrow="Permanent action" width="sm" footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (deleteTarget) { removeAssessment(deleteTarget.id); notify('Examination deleted.', 'info') } setDeleteTarget(null) }}>Delete examination</Button></>}><div className="delete-confirm"><span><Trash2 /></span><p><strong>{deleteTarget?.title}</strong> and its configuration will be removed. Existing student submission records will not be affected.</p></div></Modal>
    </div>
  )
}
