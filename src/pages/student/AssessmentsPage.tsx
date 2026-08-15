import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Braces,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  Filter,
  Hourglass,
  LockKeyhole,
  Search,
  Sparkles,
  Target,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button, ProgressBar, StatusBadge } from '../../components/UI'
import type { Assessment, AssessmentStatus } from '../../types'

type Tab = 'available' | 'upcoming' | 'completed'

const toneByStatus: Record<AssessmentStatus, 'blue' | 'green' | 'amber' | 'slate' | 'purple'> = {
  live: 'green', scheduled: 'blue', completed: 'purple', draft: 'slate', archived: 'slate',
}

function AssessmentCard({ exam }: { exam: Assessment }) {
  const navigate = useNavigate()
  const completed = exam.status === 'completed'
  const scheduled = exam.status === 'scheduled'
  const percentage = exam.averageScore || 0
  return (
    <article className={`assessment-card assessment-card--${exam.status}`}>
      <div className="assessment-card__accent" />
      <header>
        <StatusBadge tone={toneByStatus[exam.status]}>{exam.status === 'live' ? 'Open now' : exam.status}</StatusBadge>
        <span className="assessment-card__menu">•••</span>
      </header>
      <div className="assessment-card__title"><span className="assessment-card__icon">{completed ? <CheckCircle2 /> : scheduled ? <CalendarClock /> : <Braces />}</span><div><small>{exam.eyebrow}</small><h3>{exam.title}</h3></div></div>
      <p>{exam.description}</p>
      <div className="assessment-card__meta"><span><Clock3 size={15} />{exam.durationMinutes} min</span><span><Braces size={15} />{exam.questionIds.length} questions</span><span><Target size={15} />{exam.totalPoints} pts</span></div>
      {completed ? (
        <div className="result-snapshot"><div><span>Result</span><strong>{percentage}%</strong></div><div className="result-snapshot__bar"><ProgressBar value={percentage} tone={percentage >= exam.passMark ? 'green' : 'amber'} /><small>{percentage >= exam.passMark ? 'Passed' : 'Keep practicing'} · Pass mark {exam.passMark}%</small></div></div>
      ) : scheduled ? (
        <div className="availability-row"><span><LockKeyhole size={15} />Opens {new Date(exam.startsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span><strong>{new Date(exam.startsAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</strong></div>
      ) : (
        <div className="availability-row availability-row--live"><span><Hourglass size={15} />Closes tomorrow</span><strong>1d 08h left</strong></div>
      )}
      <Button variant={exam.status === 'live' ? 'primary' : 'secondary'} onClick={() => completed ? navigate('/app/results/sub-1001') : navigate(`/app/assessments/${exam.id}`)}>{completed ? <>Review result <BarChart3 size={16} /></> : scheduled ? <>View details <ArrowRight size={16} /></> : <>View assessment <ArrowRight size={16} /></>}</Button>
    </article>
  )
}

export function AssessmentsPage() {
  const { assessments } = useApp()
  const [tab, setTab] = useState<Tab>('available')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => assessments.filter((exam) => {
    const tabMatch = tab === 'available' ? exam.status === 'live' : tab === 'upcoming' ? exam.status === 'scheduled' : exam.status === 'completed'
    return tabMatch && exam.title.toLowerCase().includes(query.toLowerCase())
  }), [assessments, query, tab])

  const counts = {
    available: assessments.filter((exam) => exam.status === 'live').length,
    upcoming: assessments.filter((exam) => exam.status === 'scheduled').length,
    completed: assessments.filter((exam) => exam.status === 'completed').length,
  }

  return (
    <div className="content-stack">
      <section className="page-callout">
        <div className="page-callout__icon"><Sparkles /></div>
        <div><strong>Your next checkpoint is ready.</strong><p>Use a stable connection, find a quiet space and give it your best thinking.</p></div>
        <span><Check size={15} />Environment healthy</span>
      </section>
      <section className="toolbar-row">
        <div className="tabs" role="tablist">{(['available', 'upcoming', 'completed'] as Tab[]).map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>{item[0].toUpperCase() + item.slice(1)} <span>{counts[item]}</span></button>)}</div>
        <div className="toolbar-actions"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assessments" /></label><button className="filter-button"><Filter size={17} />Filter</button></div>
      </section>
      {filtered.length ? <section className="assessment-grid">{filtered.map((exam) => <AssessmentCard key={exam.id} exam={exam} />)}</section> : <section className="panel no-results"><Search size={25} /><h3>No assessments found</h3><p>Try another search or switch to a different tab.</p></section>}
      <section className="integrity-note"><LockKeyhole size={19} /><div><strong>Assessment integrity matters</strong><p>Your work should be your own. L2E LAB records execution and submission activity to keep every checkpoint fair.</p></div></section>
    </div>
  )
}
