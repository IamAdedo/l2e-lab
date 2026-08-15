import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Code2,
  Eye,
  FileCode2,
  Globe2,
  Heart,
  Info,
  MonitorPlay,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { usePublicProgress } from '../../public/PublicProgressContext'
import { TrackIcon, trackClass, trackName } from '../../public/PublicCards'

export function CommunityDetailPage() {
  const { id } = useParams()
  const { showcaseItems, toggleLike, isLiked } = usePublicProgress()
  const item = showcaseItems.find((candidate) => candidate.id === id)
  const [selectedPath, setSelectedPath] = useState(item?.files[0]?.path ?? '')
  const [view, setView] = useState<'preview' | 'code'>('preview')

  useEffect(() => {
    setSelectedPath(item?.files[0]?.path ?? '')
  }, [item])

  if (!item) {
    return (
      <section className="pl-container pl-not-found">
        <span><Code2 size={28} /></span><h1>We couldn&apos;t find that build.</h1><p>It may only exist in a different browser, or it may have been removed from local storage.</p><Link className="pl-button pl-button--primary" to="/community"><ArrowLeft size={16} /> Back to showcase</Link>
      </section>
    )
  }

  const selectedFile = item.files.find((file) => file.path === selectedPath) ?? item.files[0]
  const liked = isLiked(item.id)
  const date = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(new Date(item.submittedAt))
  const previewStyle = { '--showcase-accent': item.preview.accent } as CSSProperties

  return (
    <div className="pl-build-detail">
      <div className="pl-container">
        <nav className="pl-breadcrumb" aria-label="Breadcrumb"><Link to="/community">Community</Link><span>/</span><span>{item.title}</span></nav>

        <section className="pl-build-detail__heading">
          <div>
            <div className="pl-build-detail__labels"><span className={`pl-track ${trackClass[item.track]}`}><TrackIcon track={item.track} /> {trackName[item.track]}</span><span className={item.source === 'local' ? 'pl-origin pl-origin--local' : 'pl-origin'}>{item.source === 'local' ? <><Check size={11} /> On this device</> : 'Demo build'}</span></div>
            <span className="pl-build-detail__project">Built from <Link to={`/projects/${item.projectSlug}`}>{item.projectTitle}</Link></span>
            <h1>{item.title}</h1>
            <p>{item.description}</p>
          </div>
          <div className="pl-build-detail__creator"><span>{item.authorInitials}</span><div><small>Created by</small><b>{item.author}</b></div><button className={liked ? 'is-liked' : ''} type="button" onClick={() => toggleLike(item.id)}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {item.likes}</button></div>
        </section>

        <section className="pl-build-viewer">
          <header>
            <div className="pl-build-viewer__tabs"><button className={view === 'preview' ? 'is-active' : ''} type="button" onClick={() => setView('preview')}><Eye size={15} /> Preview</button><button className={view === 'code' ? 'is-active' : ''} type="button" onClick={() => setView('code')}><Code2 size={15} /> View code</button></div>
            <span><CalendarDays size={14} /> Published {date}</span>
          </header>

          {view === 'preview' ? (
            <div className="pl-build-preview" style={previewStyle}>
              <div className="pl-build-preview__browser">
                <header><div><i /><i /><i /></div><span>l2elab.local/preview/{item.projectSlug}</span><b><Globe2 size={12} /> Preview</b></header>
                <section><small>{item.preview.eyebrow}</small><h2>{item.preview.headline}</h2><p>{item.preview.body}</p><span><MonitorPlay size={16} /> Built in L2E LAB</span></section>
              </div>
            </div>
          ) : (
            <div className="pl-code-viewer">
              <aside>{item.files.map((file) => <button className={selectedFile?.path === file.path ? 'is-active' : ''} type="button" onClick={() => setSelectedPath(file.path)} key={file.path}><FileCode2 size={14} /><span>{file.path.replace(/^\//, '')}</span><small>{file.language}</small></button>)}</aside>
              <section>
                <header><span><FileCode2 size={14} /> {selectedFile?.path.replace(/^\//, '') ?? 'No file'}</span><small>Read-only · {selectedFile?.language ?? 'text'}</small></header>
                <pre>{(selectedFile?.code ?? '').split('\n').map((line, index) => <code key={`${index}-${line}`}><small>{index + 1}</small><span>{line || ' '}</span></code>)}</pre>
              </section>
            </div>
          )}
        </section>

        <div className="pl-build-detail__lower">
          <div className="pl-build-facts">
            <span><UserRound size={17} /><div><small>Builder</small><b>{item.author}</b></div></span><span><Code2 size={17} /><div><small>Track</small><b>{trackName[item.track]}</b></div></span><span><FileCode2 size={17} /><div><small>Source files</small><b>{item.files.length}</b></div></span>
          </div>
          <Link className="pl-button pl-button--primary" to={`/projects/${item.projectSlug}/build`}>Build your own version <ArrowRight size={16} /></Link>
        </div>

        <div className="pl-local-note pl-local-note--detail"><Info size={15} /><p>{item.source === 'local' ? <><b>Local publication:</b> this build is saved only in this browser. It is not visible to people on other devices yet.</> : <><b>Demo showcase item:</b> this example illustrates the future shared community. It is not a live student account.</>}</p></div>

        <section className="pl-build-next"><div><span className="pl-kicker"><Sparkles size={14} /> Inspired?</span><h2>Make your own take on <em>{item.projectTitle}.</em></h2><p>Open the same brief, change the idea, and see what only you would build.</p></div><Link className="pl-button pl-button--dark pl-button--large" to={`/projects/${item.projectSlug}`}>See project brief <ArrowRight size={17} /></Link></section>
      </div>
    </div>
  )
}
