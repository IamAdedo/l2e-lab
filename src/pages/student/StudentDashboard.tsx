import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Braces,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { performanceTrend, studentDashboardStats } from '../../data'
import { useApp } from '../../context/AppContext'
import { Button, ProgressBar, StatusBadge } from '../../components/UI'

const statIcons = [Trophy, CheckCircle2, Target, Flame]

export function StudentDashboard() {
  const { assessments } = useApp()
  const navigate = useNavigate()
  const live = assessments.find((exam) => exam.status === 'live') || assessments[0]
  const upcoming = assessments.filter((exam) => exam.status === 'scheduled').slice(0, 3)

  return (
    <div className="dashboard-stack">
      <section className="student-hero">
        <div className="student-hero__noise" />
        <div className="student-hero__copy">
          <StatusBadge tone="green">Live checkpoint</StatusBadge>
          <span className="student-hero__eyebrow">{live.eyebrow}</span>
          <h2>{live.title}</h2>
          <p>{live.description}</p>
          <div className="student-hero__meta"><span><Clock3 size={16} />{live.durationMinutes} minutes</span><span><Braces size={16} />{live.questionIds.length} challenges</span><span><Target size={16} />{live.totalPoints} points</span></div>
          <Button onClick={() => navigate(`/app/assessments/${live.id}`)} variant="secondary">View checkpoint <ArrowRight size={17} /></Button>
        </div>
        <div className="student-hero__visual">
          <div className="countdown-card">
            <span>Assessment closes in</span>
            <div><b>01</b><i>:</i><b>08</b><i>:</i><b>42</b></div>
            <p><span>days</span><span>hours</span><span>mins</span></p>
          </div>
          <div className="hero-code-window"><div><i /><i /><i /><span>solution.js</span></div><pre><small>01</small> <b>function</b> <em>buildFuture</em>(talent) {'{'}<br /><small>02</small> &nbsp; <b>return</b> talent<br /><small>03</small> &nbsp;&nbsp;&nbsp; .learn()<br /><small>04</small> &nbsp;&nbsp;&nbsp; .build()<br /><small>05</small> &nbsp;&nbsp;&nbsp; .ship();<br /><small>06</small> {'}'}</pre></div>
        </div>
      </section>

      <section className="stat-grid student-stat-grid">
        {studentDashboardStats.map((stat, index) => {
          const Icon = statIcons[index]
          return <article className="stat-card" key={stat.id}><div className={`stat-card__icon stat-card__icon--${index + 1}`}><Icon size={20} /></div><div className="stat-card__value"><strong>{stat.value}</strong><span><TrendingUp size={13} />{stat.change}</span></div><h3>{stat.label}</h3><p>{stat.helper}</p></article>
        })}
      </section>

      <section className="dashboard-grid dashboard-grid--student">
        <article className="panel performance-panel">
          <header className="panel__header"><div><span className="eyebrow">Growth</span><h3>Your performance</h3><p>Assessment scores across the last six months.</p></div><select aria-label="Chart period"><option>Last 6 months</option><option>This year</option></select></header>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={performanceTrend} margin={{ top: 14, right: 8, left: -22, bottom: 0 }}>
                <defs><linearGradient id="studentScore" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1268f2" stopOpacity={0.25} /><stop offset="100%" stopColor="#1268f2" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8eef7" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8a98ad', fontSize: 12 }} dy={10} />
                <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{ fill: '#8a98ad', fontSize: 12 }} />
                <Tooltip contentStyle={{ border: '1px solid #dbe6f5', borderRadius: 12, boxShadow: '0 12px 30px rgba(12,40,80,.12)' }} />
                <Area type="monotone" dataKey="value" stroke="#1268f2" strokeWidth={3} fill="url(#studentScore)" dot={{ fill: '#fff', stroke: '#1268f2', strokeWidth: 3, r: 4 }} activeDot={{ r: 6 }} name="Your score" />
                <Area type="monotone" dataKey="secondaryValue" stroke="#b8c3d4" strokeWidth={2} strokeDasharray="5 5" fill="transparent" dot={false} name="Cohort average" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend"><span><i className="legend-blue" />Your score <b>88%</b></span><span><i className="legend-dash" />Cohort average <b>75%</b></span></div>
        </article>

        <article className="panel next-up-panel">
          <header className="panel__header panel__header--row"><div><span className="eyebrow">Schedule</span><h3>Coming up</h3></div><button className="link-button" onClick={() => navigate('/app/assessments')}>View all <ChevronRight size={15} /></button></header>
          <div className="upcoming-list">
            {upcoming.length ? upcoming.map((exam, index) => (
              <button key={exam.id} className="upcoming-item" onClick={() => navigate(`/app/assessments/${exam.id}`)}>
                <span className={`upcoming-item__date upcoming-item__date--${index + 1}`}><b>{new Date(exam.startsAt).getDate()}</b><small>AUG</small></span>
                <span className="upcoming-item__copy"><strong>{exam.title}</strong><small><CalendarClock size={13} />{new Date(exam.startsAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })} · {exam.durationMinutes} min</small></span>
                <ChevronRight size={17} />
              </button>
            )) : <div className="mini-empty"><CalendarClock size={22} /><span>No scheduled assessments yet.</span></div>}
          </div>
          <div className="weekly-goal"><div className="weekly-goal__top"><span><Award size={17} />Weekly goal</span><b>4 / 5 days</b></div><ProgressBar value={80} tone="green" /><p>One more active day unlocks your Momentum badge.</p></div>
        </article>
      </section>

      <section className="panel continue-panel">
        <div className="continue-panel__icon"><Code2 size={24} /></div>
        <div className="continue-panel__copy"><span className="eyebrow">Continue learning</span><h3>JavaScript Foundations · Quest 12</h3><p>Higher-order functions and array transformations</p></div>
        <div className="continue-panel__progress"><div><span>Path progress</span><b>68%</b></div><ProgressBar value={68} /></div>
        <Button variant="secondary" icon={<Play size={16} fill="currentColor" />}>Resume quest</Button>
      </section>

      <section className="motivation-strip"><div><span><Sparkles size={20} /></span><p><strong>Small wins compound.</strong> You’ve solved 43 challenges this month—more than 91% of your cohort.</p></div><span><CircleDot size={15} />Synced just now</span></section>
    </div>
  )
}
