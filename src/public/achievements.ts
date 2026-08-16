import type { PublicProgressSnapshot } from './types'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earned: boolean
  detail?: string
}

export interface BadgeTier {
  id: string
  level: 'bronze' | 'silver' | 'gold'
  title: string
  description: string
  icon: string
  earned: boolean
  progress: number
  target: number
  detail?: string
}

const ACHIEVEMENT_ICONS = {
  username: '👤',
  firstProject: '🏗️',
  streak: '🔥',
  allDays: '🎯',
  showcase: '📢',
  fiveProjects: '🏆',
  hundredDays: '🎓',
  tenShowcase: '⭐',
} as const

export function evaluateAchievements(snapshot: PublicProgressSnapshot): Achievement[] {
  const hasDisplayName = Boolean(snapshot.displayName && snapshot.displayName !== 'Guest Builder')
  const finishedCount = snapshot.finishedProjectIds.length
  const completedChallenges =
    snapshot.dailyProgress.python.length +
    snapshot.dailyProgress.react.length +
    snapshot.dailyProgress.javascript.length
  const publishedCount = snapshot.submissions.filter((item) => item.source === 'local').length

  const badges: Achievement[] = [
    {
      id: 'username',
      title: 'Builder Check-in',
      description: 'Choose a username to start learning.',
      icon: ACHIEVEMENT_ICONS.username,
      earned: hasDisplayName,
      detail: hasDisplayName ? `Welcome, ${snapshot.displayName}!` : undefined,
    },
    {
      id: 'firstProject',
      title: 'First Build',
      description: 'Complete your first Python project.',
      icon: ACHIEVEMENT_ICONS.firstProject,
      earned: finishedCount >= 1,
      detail: finishedCount >= 1 ? 'All checks passed on your first project.' : undefined,
    },
    {
      id: 'streak7',
      title: 'Week Warrior',
      description: 'Complete 7 daily challenges.',
      icon: ACHIEVEMENT_ICONS.streak,
      earned: completedChallenges >= 7,
      detail: completedChallenges >= 7 ? `You completed ${completedChallenges} challenges.` : undefined,
    },
    {
      id: 'streak30',
      title: 'Month of Code',
      description: 'Complete 30 daily challenges.',
      icon: ACHIEVEMENT_ICONS.streak,
      earned: completedChallenges >= 30,
      detail: completedChallenges >= 30 ? `You completed ${completedChallenges} challenges.` : undefined,
    },
    {
      id: 'allProjects',
      title: 'Collection Complete',
      description: 'Finish every Python project.',
      icon: ACHIEVEMENT_ICONS.allDays,
      earned: finishedCount >= 8,
      detail: finishedCount >= 8 ? `All ${finishedCount} projects finished.` : undefined,
    },
    {
      id: 'showcase',
      title: 'Shared with the Community',
      description: 'Publish your first build to the showcase.',
      icon: ACHIEVEMENT_ICONS.showcase,
      earned: publishedCount >= 1,
      detail: publishedCount >= 1 ? 'First build shared.' : undefined,
    },
    {
      id: 'fiveShowcase',
      title: 'Five Builds Shared',
      description: 'Publish five builds to the showcase.',
      icon: ACHIEVEMENT_ICONS.tenShowcase,
      earned: publishedCount >= 5,
      detail: publishedCount >= 5 ? `You shared ${publishedCount} builds.` : undefined,
    },
  ]

  return badges
}

export function evaluateBadges(snapshot: PublicProgressSnapshot): BadgeTier[] {
  const finishedCount = snapshot.finishedProjectIds.length
  const pythonDays = snapshot.dailyProgress.python.length
  const completedChallenges =
    snapshot.dailyProgress.python.length +
    snapshot.dailyProgress.react.length +
    snapshot.dailyProgress.javascript.length
  const publishedCount = snapshot.submissions.filter((item) => item.source === 'local').length
  const hasDisplayName = Boolean(snapshot.displayName && snapshot.displayName !== 'Guest Builder')

  const tiers: BadgeTier[] = [
    {
      id: 'badge-projects-bronze',
      level: 'bronze',
      title: 'Bronze Builder',
      description: 'Finish 3 Python projects.',
      icon: '🥉',
      earned: finishedCount >= 3,
      progress: finishedCount,
      target: 3,
    },
    {
      id: 'badge-projects-silver',
      level: 'silver',
      title: 'Silver Builder',
      description: 'Finish 5 Python projects.',
      icon: '🥈',
      earned: finishedCount >= 5,
      progress: finishedCount,
      target: 5,
    },
    {
      id: 'badge-projects-gold',
      level: 'gold',
      title: 'Gold Builder',
      description: 'Finish all 8 Python projects.',
      icon: '🥇',
      earned: finishedCount >= 8,
      progress: finishedCount,
      target: 8,
    },
    {
      id: 'badge-python-days-bronze',
      level: 'bronze',
      title: 'Python Pioneer',
      description: 'Complete 25 Python daily challenges.',
      icon: '🐍',
      earned: pythonDays >= 25,
      progress: pythonDays,
      target: 25,
    },
    {
      id: 'badge-python-days-silver',
      level: 'silver',
      title: 'Python Pro',
      description: 'Complete 50 Python daily challenges.',
      icon: '🐍',
      earned: pythonDays >= 50,
      progress: pythonDays,
      target: 50,
    },
    {
      id: 'badge-python-days-gold',
      level: 'gold',
      title: 'Python Master',
      description: 'Complete all 100 Python daily challenges.',
      icon: '🐍',
      earned: pythonDays >= 100,
      progress: pythonDays,
      target: 100,
    },
    {
      id: 'badge-challenges-bronze',
      level: 'bronze',
      title: 'Challenge Rookie',
      description: 'Complete 15 daily challenges across any track.',
      icon: '⚡',
      earned: completedChallenges >= 15,
      progress: completedChallenges,
      target: 15,
    },
    {
      id: 'badge-challenges-silver',
      level: 'silver',
      title: 'Challenge Veteran',
      description: 'Complete 50 daily challenges across any track.',
      icon: '⚡',
      earned: completedChallenges >= 50,
      progress: completedChallenges,
      target: 50,
    },
    {
      id: 'badge-showcase-bronze',
      level: 'bronze',
      title: 'First Share',
      description: 'Publish 1 build to the community showcase.',
      icon: '📢',
      earned: publishedCount >= 1,
      progress: publishedCount,
      target: 1,
    },
    {
      id: 'badge-showcase-silver',
      level: 'silver',
      title: 'Five Shares',
      description: 'Publish 5 builds to the community showcase.',
      icon: '📢',
      earned: publishedCount >= 5,
      progress: publishedCount,
      target: 5,
    },
    {
      id: 'badge-display-name',
      level: 'silver',
      title: 'Identity Set',
      description: 'Choose a username and begin your learning journey.',
      icon: '👤',
      earned: hasDisplayName,
      progress: hasDisplayName ? 1 : 0,
      target: 1,
    },
  ]

  return tiers
}
