import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Code2,
  FileCheck2,
  MoreHorizontal,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { activityFeed, adminDashboardStats, campusPerformance, weeklyParticipation } from '../../data'
import { useApp } from '../../context/AppContext'
import { Avatar, Button, ProgressBar, StatusBadge } from '../../components/UI'

const statIcons = [UsersRound, FileCheck2, CheckCircle2, BarChart3]
const activityIcons = { submission: Code2, assessment: FileCheck2, student: UsersRound, result: BarChart3, system: Radio }

export function AdminDashboard() {
  const { assessments } = useApp()
  const navigate = useNavigate()
  const live = assessments.filter((exam) => exam.status === 'live')
  return (
    <div className="dashboard-stack">
      <section className="admin-welcome">
        <div><span className="eyebrow">Saturday, 15 August</span><h2>Build the room where talent proves itself.</h2><p>Four assessments are active today, with 113 fellows currently in the lab.</p></div>
        <div><Button variant="secondary" icon={<UserRoundPlus size={17} />} onClick={() => navigate('/admin/students')}>Add students</Button><Button icon={<Plus size={17} />} onClick={() => navigate('/admin/exams/new')}>Create examination</Button></div>
      </section>

      <section className="stat-grid admin-stat-grid">{adminDashboardStats.map((stat, index) => { const Icon = statIcons[index]; return <article className="stat-card admin-stat-card" key={stat.id}><div className="admin-stat-card__top"><span className={`stat-card__icon stat-card__icon--${index + 1}`}><Icon size={20} /></span><span className="trend-pill"><TrendingUp size={13} />{stat.change}</span></div><strong>{stat.value}</strong><h3>{stat.label}</h3><p>{stat.helper}</p></article> })}</section>

      <section className="dashboard-grid admin-dashboard-grid">
        <article className="panel participation-panel"><header className="panel__header"><div><span className="eyebrow">Participation</span><h3>Assessment activity</h3><p>Starts and submissions across the last seven days.</p></div><select><option>All campuses</option><option>Lagos</option><option>Abuja</option></select></header><div className="chart-wrap"><ResponsiveContainer width="100%" height={285}><AreaChart data={weeklyParticipation} margin={{ top: 12, right: 5, left: -24, bottom: 0 }}><defs><linearGradient id="started" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1268f2" stopOpacity={0.22} /><stop offset="100%" stopColor="#1268f2" stopOpacity={0} /></linearGradient><linearGradient id="submitted" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c6a3" stopOpacity={0.15} /><stop offset="100%" stopColor="#22c6a3" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e8eef7" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#8795aa', fontSize: 12 }} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8795aa', fontSize: 12 }} /><Tooltip contentStyle={{ border: '1px solid #dbe6f5', borderRadius: 12 }} /><Area type="monotone" dataKey="value" name="Started" stroke="#1268f2" strokeWidth={2.5} fill="url(#started)" /><Area type="monotone" dataKey="secondaryValue" name="Submitted" stroke="#18aa8a" strokeWidth={2.5} fill="url(#submitted)" /></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-blue" />Assessments started</span><span><i className="legend-green" />Submitted</span></div></article>

        <article className="panel live-panel"><header className="panel__header panel__header--row"><div><span className="eyebrow eyebrow--live"><Radio size={12} />Live now</span><h3>Active examinations</h3></div><button className="link-button" onClick={() => navigate('/admin/exams')}>View all <ChevronRight size={15} /></button></header><div className="live-exam-list">{(live.length ? live : assessments.slice(0, 2)).map((exam, index) => <button key={exam.id} onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}><span className={`live-exam-list__icon live-exam-list__icon--${index + 1}`}><Code2 /></span><div><strong>{exam.title}</strong><small>{exam.cohort} · {exam.campus}</small><ProgressBar value={(exam.completedCount / Math.max(1, exam.participantsCount)) * 100} /></div><span><b>{exam.completedCount}/{exam.participantsCount}</b><small>submitted</small></span><ChevronRight size={16} /></button>)}</div><div className="live-summary"><span><i />113 currently coding</span><span><Clock3 size={14} />Next closes in 8h 42m</span></div></article>
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <article className="panel activity-panel"><header className="panel__header panel__header--row"><div><span className="eyebrow">Live feed</span><h3>Recent activity</h3></div><button className="icon-button"><MoreHorizontal /></button></header><div className="activity-list">{activityFeed.slice(0, 5).map((item) => { const Icon = activityIcons[item.type]; return <div key={item.id} className="activity-item"><span className={`activity-item__icon activity-item__icon--${item.tone}`}><Icon size={16} /></span><div><strong>{item.title}</strong><p>{item.description}</p></div><time>{item.relativeTime}</time></div> })}</div><button className="panel-link">View all activity <ArrowRight size={15} /></button></article>

        <article className="panel campus-panel"><header className="panel__header panel__header--row"><div><span className="eyebrow">Network</span><h3>Campus pulse</h3></div><StatusBadge tone="green">All healthy</StatusBadge></header><div className="campus-list">{campusPerformance.slice(0, 5).map((campus) => <div key={campus.campus}><span><Avatar size="sm" name={campus.campus} /><strong>{campus.campus}</strong></span><div><ProgressBar value={campus.completionRate} /><small>{campus.completionRate}% completion</small></div><b>{campus.averageScore}%</b></div>)}</div><button className="panel-link" onClick={() => navigate('/admin/analytics')}>Open campus analytics <ArrowRight size={15} /></button></article>

        <article className="panel quick-insight"><div className="quick-insight__glow" /><span><Sparkles /></span><div><small>LAB INSIGHT</small><h3>Array challenges are your strongest performers.</h3><p>92% of fellows pass them on the first attempt. Graph questions are creating the most drop-off.</p></div><Button variant="secondary" onClick={() => navigate('/admin/analytics')}>Explore insight <ArrowRight size={15} /></Button><div className="quick-insight__alert"><CircleAlert size={15} />3 fellows may need support</div></article>
      </section>
    </div>
  )
}
