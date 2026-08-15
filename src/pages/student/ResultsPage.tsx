import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, BarChart3, CheckCircle2, Clock3, Medal, Sparkles, Target, TrendingUp } from 'lucide-react'
import { assessments, performanceByTopic, submissions } from '../../data'
import { Button, ProgressBar, StatusBadge } from '../../components/UI'

const resultRows = [
  { id: 'sub-1001', exam: 'JavaScript Foundations Check', date: '10 Aug 2026', score: 87, passed: 11, total: 12, duration: 52, status: 'Passed' },
  { id: 'sub-1002', exam: 'Campus Operations Logic Lab', date: '29 Jul 2026', score: 89, passed: 7, total: 8, duration: 67, status: 'Passed' },
  { id: 'sub-1005', exam: 'Data Structures Warm-up', date: '18 Jul 2026', score: 76, passed: 9, total: 12, duration: 44, status: 'Passed' },
  { id: 'sub-1006', exam: 'Git & CLI Essentials', date: '03 Jul 2026', score: 92, passed: 8, total: 8, duration: 38, status: 'Passed' },
]

export function ResultsPage() {
  const navigate = useNavigate()
  void assessments; void submissions
  return (
    <div className="content-stack">
      <section className="results-summary">
        <div className="results-summary__score"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" /><circle cx="60" cy="60" r="50" className="score-circle" /></svg><span><strong>88%</strong><small>average</small></span></div>
        <div className="results-summary__copy"><span className="eyebrow">Your performance</span><h2>You’re building serious momentum.</h2><p>Your average has climbed 12 points since your first checkpoint. Keep leaning into graphs and queues next.</p><div><StatusBadge tone="green"><TrendingUp size={12} /> Top 9% of cohort</StatusBadge><span><Medal size={15} />4 assessments passed</span></div></div>
        <div className="results-summary__rank"><span><Award size={22} /></span><small>COHORT RANK</small><strong>#1</strong><p>of 184 fellows</p></div>
      </section>

      <section className="results-layout">
        <article className="panel results-history"><header className="panel__header"><div><span className="eyebrow">History</span><h3>Assessment results</h3><p>Open any result for a full breakdown.</p></div><select><option>All time</option><option>This month</option></select></header><div className="results-table-wrap"><table className="data-table results-table"><thead><tr><th>Assessment</th><th>Score</th><th>Tests</th><th>Time</th><th>Status</th><th /></tr></thead><tbody>{resultRows.map((result) => <tr key={result.id} onClick={() => navigate(`/app/results/${result.id}`)}><td><span className="table-primary-icon"><BarChart3 size={17} /></span><div><strong>{result.exam}</strong><small>{result.date}</small></div></td><td><b className="score-cell">{result.score}%</b></td><td>{result.passed}/{result.total}</td><td><Clock3 size={13} />{result.duration}m</td><td><StatusBadge tone="green">{result.status}</StatusBadge></td><td><ArrowRight size={16} /></td></tr>)}</tbody></table></div></article>

        <aside className="panel skill-panel"><header><span className="eyebrow">Skill signal</span><h3>Topic mastery</h3><p>Based on all graded submissions.</p></header><div className="skill-list">{performanceByTopic.map((skill) => <div key={skill.skill}><div><strong>{skill.skill}</strong><span>{skill.score}%</span></div><ProgressBar value={skill.score} tone={skill.score >= 80 ? 'green' : skill.score >= 70 ? 'blue' : 'amber'} /><small>{skill.attempts} challenges attempted</small></div>)}</div><div className="skill-recommendation"><Sparkles size={18} /><div><strong>Next focus: Graphs</strong><p>Complete two graph warm-ups before your next DSA checkpoint.</p></div></div></aside>
      </section>

      <section className="panel achievement-row"><div className="achievement-row__icon"><CheckCircle2 /></div><div><span className="eyebrow">New achievement</span><h3>Consistency looks good on you.</h3><p>You passed four assessments in a row without using the full time limit.</p></div><Button variant="secondary">View achievements <ArrowRight size={16} /></Button></section>
    </div>
  )
}
