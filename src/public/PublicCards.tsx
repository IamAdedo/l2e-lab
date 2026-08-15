import type { CSSProperties } from 'react'
import {
  ArrowRight,
  Braces,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Eye,
  Heart,
  LockKeyhole,
  MonitorPlay,
  Play,
  Sparkles,
  TerminalSquare,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { isTrackAvailable } from './availability'
import type { LearningTrack, PublicProject, ShowcaseItem } from './types'

export const trackName: Record<LearningTrack, string> = {
  python: 'Python',
  react: 'React',
  javascript: 'JavaScript',
}

export const trackClass: Record<LearningTrack, string> = {
  python: 'pl-track--python',
  react: 'pl-track--react',
  javascript: 'pl-track--javascript',
}

export function TrackIcon({ track, size = 15 }: { track: LearningTrack; size?: number }) {
  if (track === 'python') return <TerminalSquare size={size} />
  if (track === 'react') return <Code2 size={size} />
  return <Braces size={size} />
}

export function ProjectArtwork({ project, compact = false }: { project: PublicProject; compact?: boolean }) {
  const style = {
    '--project-accent': project.theme.accent,
    '--project-accent-soft': project.theme.accentSoft,
    '--project-surface': project.theme.surface,
  } as CSSProperties

  if (project.theme.illustration === 'dashboard' || project.theme.illustration === 'data') {
    return (
      <div className={`pl-project-art pl-project-art--${project.theme.illustration}${compact ? ' pl-project-art--compact' : ''}`} style={style}>
        <span className="pl-project-art__emoji">{project.theme.emoji}</span>
        <div className="pl-mini-window">
          <div className="pl-mini-window__top"><i /><i /><i /><b>{project.title}</b></div>
          <div className="pl-mini-dashboard">
            <span /><span /><span />
            <div><i style={{ height: '42%' }} /><i style={{ height: '78%' }} /><i style={{ height: '60%' }} /><i style={{ height: '92%' }} /></div>
          </div>
        </div>
      </div>
    )
  }

  if (project.theme.illustration === 'cards' || project.theme.illustration === 'game') {
    return (
      <div className={`pl-project-art pl-project-art--${project.theme.illustration}${compact ? ' pl-project-art--compact' : ''}`} style={style}>
        <span className="pl-project-art__emoji">{project.theme.emoji}</span>
        <div className="pl-mini-window">
          <div className="pl-mini-window__top"><i /><i /><i /><b>Live preview</b></div>
          <div className="pl-mini-cards">
            <span><Sparkles size={12} /></span><span /><span />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`pl-project-art pl-project-art--terminal${compact ? ' pl-project-art--compact' : ''}`} style={style}>
      <span className="pl-project-art__emoji">{project.theme.emoji}</span>
      <div className="pl-mini-window">
        <div className="pl-mini-window__top"><i /><i /><i /><b>{project.track === 'python' ? 'main.py' : 'App.jsx'}</b></div>
        <div className="pl-mini-code" aria-hidden="true">
          <span><b>def</b> <em>build</em>():</span>
          <span>&nbsp;&nbsp;project = <strong>&quot;{project.kicker}&quot;</strong></span>
          <span>&nbsp;&nbsp;<b>return</b> project</span>
          <span className="pl-mini-code__run"><Play size={9} fill="currentColor" /> Ready to run</span>
        </div>
      </div>
    </div>
  )
}

type ProjectCardProps = {
  project: PublicProject
  finished?: boolean
  inProgress?: boolean
  linkTo?: string
}

export function PublicProjectCard({ project, finished = false, inProgress = false, linkTo }: ProjectCardProps) {
  const available = isTrackAvailable(project.track)
  const destination = available ? (linkTo ?? `/projects/${project.slug}`) : `/projects/${project.slug}`
  return (
    <article className={`pl-project-card${available ? '' : ' is-locked'}`}>
      <Link to={destination} aria-label={`Open ${project.title}`}>
        <ProjectArtwork project={project} compact />
      </Link>
      <div className="pl-project-card__body">
        <div className="pl-project-card__meta">
          <span className={`pl-track ${trackClass[project.track]}`}><TrackIcon track={project.track} /> {trackName[project.track]}</span>
          {!available ? (
            <span className="pl-state pl-state--locked"><LockKeyhole size={13} /> Coming soon</span>
          ) : finished ? (
            <span className="pl-state pl-state--finished"><CheckCircle2 size={13} /> Finished</span>
          ) : inProgress ? (
            <span className="pl-state pl-state--progress"><Clock3 size={13} /> In progress</span>
          ) : (
            <span className="pl-difficulty">{project.difficulty}</span>
          )}
        </div>
        <div>
          <span className="pl-project-card__kicker">{project.kicker}</span>
          <h3><Link to={destination}>{project.title}</Link></h3>
          <p>{project.summary}</p>
        </div>
        <div className="pl-project-card__skills">
          {project.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
        </div>
        <footer>
          <span><Clock3 size={14} /> {project.durationMinutes} min</span>
          {available ? (
            <Link to={destination}>{finished ? 'Build again' : inProgress ? 'Continue' : 'View project'} <ArrowRight size={14} /></Link>
          ) : (
            <span className="pl-project-lock"><LockKeyhole size={13} /> Workspace locked</span>
          )}
        </footer>
      </div>
    </article>
  )
}

export function CommunityCard({ item, liked, onLike }: { item: ShowcaseItem; liked: boolean; onLike: () => void }) {
  const previewStyle = { '--showcase-accent': item.preview.accent } as CSSProperties
  return (
    <article className="pl-community-card">
      <Link className="pl-community-card__preview" style={previewStyle} to={`/community/${item.id}`}>
        <div className="pl-community-card__browser">
          <div><i /><i /><i /><span><Eye size={11} /> Preview</span></div>
          <section>
            <small>{item.preview.eyebrow}</small>
            <strong>{item.preview.headline}</strong>
            <p>{item.preview.body}</p>
            <span><MonitorPlay size={14} /> Built in L2E LAB</span>
          </section>
        </div>
      </Link>
      <div className="pl-community-card__body">
        <div className="pl-community-card__author">
          <span>{item.authorInitials}</span>
          <div><strong>{item.title}</strong><small>by {item.author}</small></div>
          <button type="button" className={liked ? 'is-liked' : ''} onClick={onLike} aria-label={liked ? 'Unlike build' : 'Like build'}>
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} /> {item.likes}
          </button>
        </div>
        <div className="pl-community-card__foot">
          <span className={`pl-track ${trackClass[item.track]}`}><TrackIcon track={item.track} /> {trackName[item.track]}</span>
          <span className={item.source === 'local' ? 'pl-origin pl-origin--local' : 'pl-origin'}>
            {item.source === 'local' ? <><Check size={11} /> On this device</> : 'Demo build'}
          </span>
        </div>
      </div>
    </article>
  )
}
