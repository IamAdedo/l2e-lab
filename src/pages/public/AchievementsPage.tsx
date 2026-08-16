import { useEffect } from 'react'
import { ArrowRight, Sparkles, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublicProgress } from '../../public/PublicProgressContext'
import { evaluateAchievements, evaluateBadges } from '../../public/achievements'
import '../../public/runtime.css'

export function AchievementsPage() {
  const progress = usePublicProgress()

  const achievements = evaluateAchievements(progress)
  const badges = evaluateBadges(progress)

  const earnedAchievements = achievements.filter((a) => a.earned)
  const earnedBadges = badges.filter((b) => b.earned)

  useEffect(() => {
    document.title = 'Achievements & Badges — L2E LAB'
  }, [])

  return (
    <div className="achievements-page">
      <div className="pl-container">
        <div className="achievements-hero">
          <span><Trophy size={14} /> YOUR PROGRESS</span>
          <h1>Every build earns a badge.</h1>
          <p>Track the milestones you've reached and the ones still ahead. Badges are saved on this device alongside your work.</p>
        </div>

        <div className="achievements-summary">
          <div className="achievement-stat">
            <strong>{earnedAchievements.length}</strong>
            <span>Achievements</span>
          </div>
          <div className="achievement-stat">
            <strong>{earnedBadges.length}</strong>
            <span>Badges earned</span>
          </div>
          <div className="achievement-stat">
            <strong>{progress.finishedProjectIds.length + progress.dailyProgress.python.length + progress.dailyProgress.javascript.length + progress.dailyProgress.react.length}</strong>
            <span>Total completions</span>
          </div>
        </div>

        <section className="badge-section">
          <div className="pl-section-heading pl-section-heading--split">
            <div><span className="pl-kicker"><Sparkles size={14} /> Earned badges</span><h2>Your rewards</h2></div>
          </div>
          {earnedBadges.length > 0 ? (
            <div className="badge-grid">
              {earnedBadges.map((badge) => (
                <article key={badge.id} className="badge-card">
                  <span className="badge-card__icon">{badge.icon}</span>
                  <h3 className="badge-card__title">{badge.title}</h3>
                  <p className="badge-card__desc">{badge.description}</p>
                  <div className="badge-card__tier badge-card__tier--{badge.level}">{badge.level}</div>
                </article>
              ))}
            </div>
          ) : (
            <div className="pl-empty-state">
              <span><Trophy size={27} /></span>
              <h2>No badges yet.</h2>
              <p>Complete your first project or daily challenge to start earning rewards.</p>
              <Link className="pl-button pl-button--primary" to="/projects">Choose a project <ArrowRight size={16} /></Link>
            </div>
          )}
        </section>

        <section className="badge-section">
          <div className="pl-section-heading pl-section-heading--split">
            <div><span className="pl-kicker"><Trophy size={14} /> Badge progress</span><h2>Earn your next tier</h2></div>
          </div>
          <div className="badge-grid">
            {badges.map((badge) => {
              const progressPercent = (badge.progress / badge.target) * 100
              return (
                <article key={badge.id} className={`badge-card ${badge.earned ? '' : 'is-locked'}`}>
                  <span className="badge-card__icon">{badge.icon}</span>
                  <h3 className="badge-card__title">{badge.title}</h3>
                  <p className="badge-card__desc">{badge.description}</p>
                  <div className="badge-card__progress">
                    <span style={{ width: `${Math.min(100, progressPercent)}%` }} />
                  </div>
                  <div className="badge-card__tier badge-card__tier--{badge.level}">
                    {badge.earned ? 'Earned' : `${badge.progress}/${badge.target}`}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
