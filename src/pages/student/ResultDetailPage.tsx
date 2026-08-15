import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Award, Check, CheckCircle2, Clock3, Code2, Gauge, RotateCcw, Sparkles, Target, X } from 'lucide-react'
import { getQuestionById, submissions } from '../../data'
import { Button, ProgressBar, StatusBadge } from '../../components/UI'

export function ResultDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const submission = submissions.find((item) => item.id === id) || submissions[0]
  const percentage = submission.percentage || 87
  return (
    <div className="result-detail">
      <button className="back-link" onClick={() => navigate('/app/results')}><ArrowLeft size={17} />Back to results</button>
      <section className="result-hero">
        <div className="result-hero__confetti"><i /><i /><i /><i /><i /></div>
        <div className="result-hero__score"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" /><circle className="result-ring" cx="75" cy="75" r="62" /></svg><span><strong>{percentage}%</strong><small>Excellent</small></span></div>
        <div className="result-hero__copy"><StatusBadge tone="green">Passed</StatusBadge><h2>Strong work, Amara.</h2><p>You passed <strong>JavaScript Foundations Check</strong> and demonstrated confident fundamentals across every question.</p><div><span><Award size={16} />Top 12% of cohort</span><span><Sparkles size={16} />Personal best</span></div></div>
        <Button variant="secondary" onClick={() => navigate('/app/assessments')}>Next assessment <ArrowRight size={16} /></Button>
      </section>

      <section className="result-stat-grid"><article><span><Target /></span><div><strong>{submission.score || 61}<small> / {submission.maxScore}</small></strong><p>Points earned</p></div></article><article><span><CheckCircle2 /></span><div><strong>11<small> / 12</small></strong><p>Tests passed</p></div></article><article><span><Clock3 /></span><div><strong>{submission.durationMinutes || 52}<small> min</small></strong><p>Time used</p></div></article><article><span><Gauge /></span><div><strong>O(n)</strong><p>Best complexity</p></div></article></section>

      <div className="result-breakdown-grid">
        <section className="panel question-breakdown"><header className="panel__header"><div><span className="eyebrow">Breakdown</span><h3>Question performance</h3><p>See exactly where your points came from.</p></div></header><div>{submission.questionResults.map((result, index) => { const question = getQuestionById(result.questionId); const pct = Math.round((result.score / result.maxScore) * 100); return <article className="breakdown-row" key={result.questionId}><span className="breakdown-row__number">{String(index + 1).padStart(2, '0')}</span><div className="breakdown-row__main"><div><strong>{question?.title || 'Coding challenge'}</strong><StatusBadge tone={pct >= 80 ? 'green' : 'amber'}>{result.testsPassed}/{result.testsTotal} tests</StatusBadge></div><small>{question?.category} · {result.language}</small><ProgressBar value={pct} tone={pct >= 80 ? 'green' : 'amber'} /></div><div className="breakdown-row__score"><strong>{result.score}</strong><span>/{result.maxScore}</span></div><button className="icon-button"><Code2 size={17} /></button></article> })}</div></section>

        <aside className="panel feedback-card"><header><span><Sparkles size={18} /></span><div><span className="eyebrow">Evaluator note</span><h3>Thoughtful, readable work.</h3></div></header><p>“{submission.feedback || 'Clear, readable solutions. Great use of small helper functions.'}”</p><div className="feedback-list"><div><Check size={16} /><span><strong>Strong</strong>Iteration and state tracking</span></div><div><Check size={16} /><span><strong>Strong</strong>Readable naming and structure</span></div><div className="improve"><RotateCcw size={16} /><span><strong>Review</strong>Unicode string normalization</span></div></div><Button variant="secondary">Practice weak areas <ArrowRight size={16} /></Button></aside>
      </div>

      <section className="panel test-detail-panel"><header className="panel__header panel__header--row"><div><span className="eyebrow">Test report</span><h3>Execution results</h3></div><StatusBadge tone="green">11 of 12 passed</StatusBadge></header><div className="test-detail-grid">{[true, true, true, false].map((passed, index) => <div key={index} className={passed ? 'passed' : 'failed'}><span>{passed ? <Check size={15} /> : <X size={15} />}</span><div><strong>{index < 2 ? `Sample test ${index + 1}` : `Hidden test ${index - 1}`}</strong><small>{passed ? `Passed in ${31 + index * 18}ms` : 'Edge case failed'}</small></div><b>{passed ? '+5 pts' : '0 pts'}</b></div>)}</div></section>
    </div>
  )
}
