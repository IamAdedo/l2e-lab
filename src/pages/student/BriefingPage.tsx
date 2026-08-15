import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Braces,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  FileCheck2,
  Gauge,
  Laptop2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  TimerReset,
  Wifi,
  XCircle,
} from 'lucide-react'
import { programmingLanguages, questions } from '../../data'
import { useApp } from '../../context/AppContext'
import { Button, Modal, StatusBadge } from '../../components/UI'

export function BriefingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { assessments } = useApp()
  const exam = assessments.find((item) => item.id === id)
  const [checked, setChecked] = useState(false)
  const [ready, setReady] = useState(false)
  const [checking, setChecking] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const examQuestions = useMemo(() => questions.filter((question) => exam?.questionIds.includes(question.id)), [exam])

  if (!exam) return <section className="panel not-found"><XCircle size={30} /><h2>Assessment not found</h2><p>This checkpoint may have been removed or archived.</p><Button onClick={() => navigate('/app/assessments')}>Back to assessments</Button></section>

  const checkSystem = () => {
    setChecking(true)
    window.setTimeout(() => { setChecking(false); setReady(true) }, 900)
  }

  return (
    <div className="briefing-page">
      <button className="back-link" onClick={() => navigate('/app/assessments')}><ArrowLeft size={17} />Back to assessments</button>
      <section className="briefing-hero">
        <div className="briefing-hero__icon"><BookOpenCheck /></div>
        <div className="briefing-hero__copy"><StatusBadge tone={exam.status === 'live' ? 'green' : 'blue'}>{exam.status === 'live' ? 'Open now' : exam.status}</StatusBadge><span className="eyebrow">{exam.eyebrow}</span><h2>{exam.title}</h2><p>{exam.description}</p></div>
        <div className="briefing-hero__time"><small>TIME LIMIT</small><strong>{exam.durationMinutes}</strong><span>minutes</span></div>
      </section>

      <div className="briefing-grid">
        <div className="briefing-main">
          <section className="panel briefing-section"><header><span>01</span><div><h3>What to expect</h3><p>Everything you need before the timer starts.</p></div></header><div className="exam-facts"><div><Clock3 /><span><strong>{exam.durationMinutes} minutes</strong><small>Timer cannot be paused</small></span></div><div><Braces /><span><strong>{exam.questionIds.length} coding questions</strong><small>{exam.totalPoints} points available</small></span></div><div><Gauge /><span><strong>{exam.passMark}% pass mark</strong><small>Automated test-based scoring</small></span></div><div><RotateCcw /><span><strong>{exam.attemptsAllowed} attempt</strong><small>Final submission is permanent</small></span></div></div></section>
          <section className="panel briefing-section"><header><span>02</span><div><h3>Challenge overview</h3><p>You can solve the questions in any order.</p></div></header><div className="question-preview-list">{examQuestions.map((question, index) => <div key={question.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{question.title}</strong><small>{question.category} · {question.estimatedMinutes} min</small></div><StatusBadge tone={question.difficulty === 'Easy' ? 'green' : question.difficulty === 'Medium' ? 'amber' : 'red'} dot={false}>{question.difficulty}</StatusBadge><b>{question.points} pts</b></div>)}</div></section>
          <section className="panel briefing-section"><header><span>03</span><div><h3>Rules of the lab</h3><p>Fair work protects the value of every result.</p></div></header><ul className="rules-list">{exam.instructions.map((instruction) => <li key={instruction}><Check size={15} />{instruction}</li>)}<li><Check size={15} />Do not refresh or close the browser while your assessment is active.</li><li><Check size={15} />All answers autosave locally while you work.</li></ul></section>
        </div>

        <aside className="briefing-side">
          <section className="panel environment-card"><div className="environment-card__head"><span><Laptop2 size={19} /></span><div><h3>Environment check</h3><p>Run this before you begin.</p></div></div><div className="environment-list"><div><span><Wifi />Internet connection</span><b className={ready ? 'ok' : ''}>{ready ? <><CheckCircle2 />Stable</> : 'Not checked'}</b></div><div><span><Code2 />Code runtime</span><b className={ready ? 'ok' : ''}>{ready ? <><CheckCircle2 />Ready</> : 'Not checked'}</b></div><div><span><FileCheck2 />Local storage</span><b className={ready ? 'ok' : ''}>{ready ? <><CheckCircle2 />Enabled</> : 'Not checked'}</b></div></div><Button variant={ready ? 'secondary' : 'primary'} onClick={checkSystem} disabled={checking}>{checking ? 'Checking environment…' : ready ? <><Check size={16} />All systems ready</> : 'Run system check'}</Button></section>
          <section className="panel language-card"><h3>Available languages</h3><p>Choose inside the code workspace.</p><div>{exam.allowedLanguages.map((id) => { const language = programmingLanguages.find((item) => item.id === id)!; return <span key={id}><b>{language.shortName}</b>{language.name}<small>{language.version}</small></span> })}</div></section>
          <label className={`integrity-check ${checked ? 'integrity-check--checked' : ''}`}><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>{checked && <Check size={14} />}</span><p><strong>I’ll submit only my own work.</strong>I understand that copied solutions may invalidate my result.</p></label>
          <Button className="begin-button" disabled={!ready || !checked || exam.status !== 'live'} onClick={() => setConfirmOpen(true)}>Begin assessment <ArrowRight size={17} /></Button>
          {(!ready || !checked) && <p className="begin-hint"><LockKeyhole size={13} />Complete the check and integrity pledge to continue.</p>}
        </aside>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Ready to enter the lab?" eyebrow="Final check" footer={<><Button variant="ghost" onClick={() => setConfirmOpen(false)}>Not yet</Button><Button onClick={() => navigate(`/workspace/${exam.id}`)}>Start {exam.durationMinutes}-minute timer <ArrowRight size={16} /></Button></>}>
        <div className="start-confirm"><span><TimerReset size={28} /></span><p>Your timer begins immediately and cannot be paused. Your work will autosave as you move between questions.</p><div><ShieldCheck size={17} /><span><strong>Integrity mode is active</strong><small>Keep this tab open until you submit.</small></span></div></div>
      </Modal>
    </div>
  )
}
