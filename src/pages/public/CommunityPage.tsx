import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Code2,
  Globe2,
  Info,
  Search,
  Sparkles,
  UploadCloud,
  UsersRound,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublicProgress } from '../../public/PublicProgressContext'
import { CommunityCard, TrackIcon, trackName } from '../../public/PublicCards'
import type { LearningTrack } from '../../public/types'

type CommunityTrack = LearningTrack | 'all'
const filters: CommunityTrack[] = ['all', 'python', 'react', 'javascript']

export function CommunityPage() {
  const { showcaseItems, submissions, toggleLike, isLiked } = usePublicProgress()
  const [query, setQuery] = useState('')
  const [track, setTrack] = useState<CommunityTrack>('all')

  const items = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return showcaseItems.filter((item) => {
      const matchesTrack = track === 'all' || item.track === track
      const matchesQuery = !needle || [item.title, item.author, item.projectTitle, item.description]
        .some((value) => value.toLowerCase().includes(needle))
      return matchesTrack && matchesQuery
    })
  }, [query, showcaseItems, track])

  return (
    <div className="pl-showcase">
      <section className="pl-showcase-hero">
        <div className="pl-container pl-showcase-hero__inner">
          <div>
            <span className="pl-kicker"><UsersRound size={14} /> The builder showcase</span>
            <h1>Every learner has a<br /><em>build worth sharing.</em></h1>
            <p>Explore demo projects from the L2E LAB community and the projects published in this browser.</p>
            <div><Link className="pl-button pl-button--light pl-button--large" to="/projects">Build something to share <ArrowRight size={17} /></Link><span><Sparkles size={14} /> No perfect code required</span></div>
          </div>
          <div className="pl-showcase-hero__mosaic" aria-hidden="true">
            <span className="pl-mosaic-card pl-mosaic-card--one"><i>PY</i><b>Gradebook</b><small>Average: 76.4</small></span>
            <span className="pl-mosaic-card pl-mosaic-card--two"><i>RX</i><b>Focus timer</b><strong>24:18</strong></span>
            <span className="pl-mosaic-card pl-mosaic-card--three"><i>JS</i><b>Colour lab</b><small><em /><em /><em /><em /></small></span>
          </div>
        </div>
      </section>

      <section className="pl-container pl-showcase__body">
        <div className="pl-prototype-banner">
          <span><Info size={19} /></span>
          <div><b>This is a browser-local community prototype</b><p>The example builds below are demo content. Projects you publish appear only on this device until a shared school backend is connected.</p></div>
          <span><Globe2 size={15} /> Shared publishing: coming next</span>
        </div>

        <div className="pl-showcase-heading">
          <div><span className="pl-kicker"><Sparkles size={14} /> Explore builds</span><h2>Made while <em>learning.</em></h2><p>{showcaseItems.length} builds here · {submissions.length} published on this device</p></div>
          <label className="pl-search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search builds or builders..." />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label>
        </div>

        <div className="pl-showcase-filters">
          {filters.map((item) => (
            <button className={track === item ? 'is-active' : ''} type="button" onClick={() => setTrack(item)} key={item}>
              {item === 'all' ? <Code2 size={15} /> : <TrackIcon track={item} />}{item === 'all' ? 'Everything' : trackName[item]}
            </button>
          ))}
        </div>

        {items.length > 0 ? (
          <div className="pl-community-grid pl-community-grid--showcase">
            {items.map((item) => <CommunityCard item={item} liked={isLiked(item.id)} onLike={() => toggleLike(item.id)} key={item.id} />)}
          </div>
        ) : (
          <div className="pl-empty-state"><span><Search size={27} /></span><h2>No builds found.</h2><p>Try another search, another track, or publish the first one from a project workspace.</p><button className="pl-button pl-button--primary" type="button" onClick={() => { setQuery(''); setTrack('all') }}>Reset filters</button></div>
        )}

        <div className="pl-publish-callout">
          <div><span><UploadCloud size={22} /></span><div><small>Your turn</small><h2>Make the next showcase card yours.</h2><p>Finish any project, then choose “Publish to showcase.” It will live safely in this browser.</p></div></div>
          <Link className="pl-button pl-button--primary" to="/projects">Choose a project <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  )
}
