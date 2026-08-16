import { useEffect, useRef } from 'react'
import { evaluateAchievements } from '../public/achievements'
import { usePublicProgress } from '../public/PublicProgressContext'
import { useToasts } from '../context/ToastContext'

const ACHIEVEMENT_TITLES: Record<string, string> = {
  username: 'Name saved — every build now counts!',
  firstProject: 'First project complete — check your badge!',
  streak7: 'Week Warrior unlocked — 7 days of code!',
  streak30: 'Month of Code unlocked — impressive consistency!',
  allProjects: 'Collection Complete — every project finished!',
  showcase: 'Shared with the community — nice!',
  fiveShowcase: 'Five Builds Shared — you\'re on fire!',
}

export function useAchievementNotifications() {
  const { notify } = useToasts()
  const progress = usePublicProgress()
  const prevEarnedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const achievements = evaluateAchievements(progress)
    const newlyEarned: string[] = []

    for (const achievement of achievements) {
      if (achievement.earned && !prevEarnedRef.current.has(achievement.id)) {
        newlyEarned.push(achievement.id)
      }
    }

    for (const id of newlyEarned) {
      prevEarnedRef.current.add(id)
      const title = ACHIEVEMENT_TITLES[id]
      if (title) {
        notify(title, 'success', 5200)
      }
    }
  }, [progress, notify])
}
