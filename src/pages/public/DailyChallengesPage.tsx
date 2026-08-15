import { useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Flame,
  LockKeyhole,
  Play,
  Route,
  TerminalSquare,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getDailyChallenges } from '../../public/data'
import { usePublicProgress } from '../../public/PublicProgressContext'
import '../../public/runtime.css'
import '../../public/course-playground.css'

type CourseCard = {
  track: 'python' | 'react' | 'javascript'
  name: string
  description: string
  accent: string
  icon: typeof TerminalSquare
  topics: string[]
  unlocked: boolean
}

const courses: CourseCard[] = [
  {
    track: 'python',
    name: '100 Days of Python',
    description: 'Build your Python foundation one working program at a time, from variables to practical data tools.',
    accent: '#1777e5',
    icon: TerminalSquare,
    topics: ['Python basics', 'Functions', 'Data structures', 'Real projects'],
    unlocked: true,
  },
  {
    track: 'react',
    name: '100 Days of React',
    description: 'Learn components, state, effects, and modern interface patterns by shipping one small build each day.',
    accent: '#08a5ca',
    icon: Code2,
    topics: ['Components', 'State', 'Hooks', 'Interfaces'],
    unlocked: false,
  },
  {
    track: 'javascript',
    name: '100 Days of JavaScript',
    description: 'Strengthen core JavaScript with browser exercises, algorithms, and interactive mini applications.',
    accent: '#d89a00',
    icon: BookOpen,
    topics: ['Language basics', 'Arrays', 'The DOM', 'Async code'],
    unlocked: false,
  },
]

const coursePhases = [
  { from: 1, to: 25, label: 'Foundations' },
  { from: 26, to: 50, label: 'Core skills' },
  { from: 51, to: 75, label: 'Problem solving' },
  { from: 76, to: 100, label: 'Build and ship' },
]

function CourseLibrary() {
  const progress = usePublicProgress()
  const pythonDone = progress.dailyProgress.python.length

  useEffect(() => { document.title = '100 Day Courses — L2E LAB' }, [])

  return (
    <div className="cp-course-page cp-course-library">
      <header className="cp-page-heading">
        <div>
          <span><Route size={14} /> COURSE LIBRARY</span>
          <h1>Choose what you want to practise.</h1>
          <p>Each course has 100 practical challenges. Open a course, pick any day, and start coding.</p>
        </div>
        <aside>
          <strong>{pythonDone}</strong>
          <span>challenges finished</span>
        </aside>
      </header>

      <main className="cp-course-grid" aria-label="Available 100 day courses">
        {courses.map(({ track, name, description, accent, icon: Icon, topics, unlocked }) => (
          <article
            className={`cp-course-card cp-course-card--${track}${unlocked ? '' : ' is-locked'}`}
            key={track}
            style={{ '--course-accent': accent } as React.CSSProperties}
          >
            <header>
              <span className="cp-course-icon"><Icon size={24} /></span>
              <span className={`cp-course-state${unlocked ? ' is-open' : ''}`}>
                {unlocked ? <><span /> AVAILABLE NOW</> : <><LockKeyhole size={12} /> COMING SOON</>}
              </span>
            </header>
            <div className="cp-course-card__body">
              <span className="cp-course-number">100</span>
              <div>
                <small>{track.toUpperCase()} COURSE</small>
                <h2>{name}</h2>
                <p>{description}</p>
              </div>
            </div>
            <ul>
              {topics.map((topic) => <li key={topic}><Check size={12} /> {topic}</li>)}
            </ul>
            {unlocked ? (
              <footer>
                <div>
                  <span><i style={{ width: `${pythonDone}%` }} /></span>
                  <small>{pythonDone}/100 complete</small>
                </div>
                <Link to="/daily/python">
                  {pythonDone ? 'Open course' : 'Start course'} <ArrowRight size={15} />
                </Link>
              </footer>
            ) : (
              <footer className="cp-course-card__locked-footer">
                <span><LockKeyhole size={14} /> This course is being prepared</span>
                <button type="button" disabled>Coming soon</button>
              </footer>
            )}
          </article>
        ))}
      </main>
    </div>
  )
}

function PythonCourse() {
  const progress = usePublicProgress()
  const challenges = useMemo(() => getDailyChallenges('python'), [])
  const completed = progress.dailyProgress.python
  const completedSet = useMemo(() => new Set(completed), [completed])
  const nextDay = challenges.find((challenge) => !completedSet.has(challenge.day))?.day ?? 100

  useEffect(() => { document.title = '100 Days of Python — L2E LAB' }, [])

  return (
    <div className="cp-course-page cp-curriculum-page">
      <header className="cp-curriculum-header">
        <Link to="/daily"><ArrowLeft size={15} /> Back to courses</Link>
        <div className="cp-curriculum-title">
          <span className="cp-course-icon"><TerminalSquare size={23} /></span>
          <div>
            <small>PYTHON COURSE</small>
            <h1>100 Days of Python</h1>
          </div>
        </div>
        <div className="cp-curriculum-progress">
          <div><strong>{completed.length}</strong><span>/ 100 finished</span></div>
          <span><i style={{ width: `${completed.length}%` }} /></span>
        </div>
      </header>

      <div className="cp-curriculum-tools">
        <div>
          <Flame size={16} />
          <p><strong>Every day is open.</strong> Start at day 1 or jump straight to the skill you need.</p>
        </div>
        <Link to={`/daily/python/${nextDay}`}><Play size={14} fill="currentColor" /> {completed.length ? `Continue day ${nextDay}` : 'Start day 1'}</Link>
      </div>

      <main className="cp-phase-list">
        {coursePhases.map((phase) => {
          const phaseChallenges = challenges.filter((challenge) => challenge.day >= phase.from && challenge.day <= phase.to)
          const phaseComplete = phaseChallenges.filter((challenge) => completedSet.has(challenge.day)).length
          return (
            <section className="cp-phase" key={phase.from}>
              <header>
                <div><span>PHASE {coursePhases.indexOf(phase) + 1}</span><h2>{phase.label}</h2></div>
                <p>Days {phase.from}–{phase.to} <i /> {phaseComplete}/25 finished</p>
              </header>
              <div className="cp-day-grid">
                {phaseChallenges.map((challenge) => {
                  const isFinished = completedSet.has(challenge.day)
                  const isNext = challenge.day === nextDay && !isFinished
                  return (
                    <Link
                      className={`${isFinished ? 'is-finished' : ''}${isNext ? ' is-next' : ''}`}
                      key={challenge.id}
                      to={`/daily/python/${challenge.day}`}
                    >
                      <header>
                        <span>DAY {String(challenge.day).padStart(3, '0')}</span>
                        {isFinished ? <strong><CheckCircle2 size={13} /> COMPLETED</strong> : isNext ? <strong>UP NEXT</strong> : <ArrowRight size={14} />}
                      </header>
                      <h3>{challenge.title}</h3>
                      <p>{challenge.concept}</p>
                      <footer>
                        <span><Clock3 size={12} /> {challenge.estimatedMinutes} min</span>
                        <span>{isFinished ? 'Review' : 'Start'} <ArrowRight size={12} /></span>
                      </footer>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

export function DailyChallengesPage() {
  const { track } = useParams<{ track?: string }>()
  return track === 'python' ? <PythonCourse /> : <CourseLibrary />
}
