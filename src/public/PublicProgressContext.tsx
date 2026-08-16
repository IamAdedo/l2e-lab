import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getProjectBySlug, seedShowcaseItems } from './data'
import { UsernameGate } from './UsernameGate'
import type {
  DailyProgress,
  LearningTrack,
  ProjectSubmissionInput,
  PublicProgressSnapshot,
  ShowcaseItem,
} from './types'

const STORAGE_KEY = 'l2e-lab-public-progress-v1'
const DISPLAY_NAME_SET_KEY = 'l2e-lab-display-name-set-v1'

const emptyDailyProgress = (): DailyProgress => ({
  python: [],
  react: [],
  javascript: [],
})

const initialSnapshot = (): PublicProgressSnapshot => ({
  displayName: 'Guest Builder',
  finishedProjectIds: [],
  dailyProgress: emptyDailyProgress(),
  submissions: [],
  likedShowcaseIds: [],
})

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is string => typeof item === 'string'))]
}

function dayArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((item): item is number => Number.isInteger(item) && item >= 1 && item <= 100))]
    .sort((left, right) => left - right)
}

function loadSnapshot(): PublicProgressSnapshot {
  if (typeof window === 'undefined') return initialSnapshot()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialSnapshot()
    const parsed = JSON.parse(raw) as Partial<PublicProgressSnapshot>
    const progress = parsed.dailyProgress as Partial<DailyProgress> | undefined
    return {
      displayName: typeof parsed.displayName === 'string' && parsed.displayName.trim()
        ? parsed.displayName.trim().slice(0, 40)
        : 'Guest Builder',
      finishedProjectIds: stringArray(parsed.finishedProjectIds),
      dailyProgress: {
        python: dayArray(progress?.python),
        react: dayArray(progress?.react),
        javascript: dayArray(progress?.javascript),
      },
      submissions: Array.isArray(parsed.submissions)
        ? parsed.submissions.filter((item): item is ShowcaseItem => Boolean(
          item
          && typeof item === 'object'
          && 'id' in item
          && typeof item.id === 'string'
          && 'source' in item
          && item.source === 'local',
        ))
        : [],
      likedShowcaseIds: stringArray(parsed.likedShowcaseIds),
    }
  } catch {
    return initialSnapshot()
  }
}

function loadDisplayNameState(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<PublicProgressSnapshot>
    return typeof parsed.displayName === 'string'
      && parsed.displayName.trim().length > 0
      && parsed.displayName.trim().toLowerCase() !== 'guest builder'
  } catch {
    return false
  }
}

type NameGateRoute = {
  destinationLabel: string
  cancelTo: string
}

function decodeURIComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

function nameGateForPath(pathname: string): NameGateRoute | null {
  const cleanPath = pathname.replace(/\/+$/, '') || '/'
  if (cleanPath === '/daily/python' || cleanPath.startsWith('/daily/python/')) {
    return { destinationLabel: 'the 100 Days of Python course', cancelTo: '/daily' }
  }
  if (cleanPath === '/playground') {
    return { destinationLabel: 'the code playground', cancelTo: '/' }
  }

  const projectBuildMatch = cleanPath.match(/^\/projects\/([^/]+)\/build$/)
  if (!projectBuildMatch) return null
  const rawSlug = projectBuildMatch[1]
  const slug = decodeURIComponentSafe(rawSlug)
  const project = getProjectBySlug(slug) ?? getProjectBySlug(rawSlug)
  if (project?.track !== 'python') return null
  return { destinationLabel: `${project.title} workspace`, cancelTo: `/projects/${project.slug}` }
}

function initialsFor(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return initials || 'GB'
}

function newSubmissionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `showcase-${crypto.randomUUID()}`
  }
  return `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface PublicProgressContextValue extends PublicProgressSnapshot {
  hasDisplayName: boolean
  showcaseItems: ShowcaseItem[]
  setDisplayName: (name: string) => void
  markProjectFinished: (projectId: string) => void
  isProjectFinished: (projectId: string) => boolean
  finishChallenge: (track: LearningTrack, day: number) => void
  isChallengeFinished: (track: LearningTrack, day: number) => boolean
  submitProject: (input: ProjectSubmissionInput) => ShowcaseItem
  toggleLike: (showcaseId: string) => void
  isLiked: (showcaseId: string) => boolean
  resetProgress: () => void
}

const PublicProgressContext = createContext<PublicProgressContextValue | null>(null)

export function PublicProgressProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<PublicProgressSnapshot>(loadSnapshot)
  const [hasDisplayName, setHasDisplayName] = useState(loadDisplayNameState)
  const latestSnapshotRef = useRef(snapshot)
  const hasDisplayNameRef = useRef(hasDisplayName)
  const cloudSyncChainRef = useRef<Promise<void>>(Promise.resolve())
  const lastCloudFingerprintRef = useRef('')
  const location = useLocation()
  const navigate = useNavigate()
  const gateRoute = hasDisplayName ? null : nameGateForPath(location.pathname)

  latestSnapshotRef.current = snapshot
  hasDisplayNameRef.current = hasDisplayName

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  }, [snapshot])

  useEffect(() => {
    if (hasDisplayName) window.localStorage.setItem(DISPLAY_NAME_SET_KEY, 'true')
    else window.localStorage.removeItem(DISPLAY_NAME_SET_KEY)
  }, [hasDisplayName])

  const queueCloudSync = useCallback((force = false) => {
    if (!hasDisplayNameRef.current) return
    const current = latestSnapshotRef.current
    const payload = {
      displayName: current.displayName,
      dailyProgress: {
        python: [...current.dailyProgress.python],
        react: [...current.dailyProgress.react],
        javascript: [...current.dailyProgress.javascript],
      },
      finishedProjectIds: [...current.finishedProjectIds],
    }
    const fingerprint = JSON.stringify(payload)
    if (!force && fingerprint === lastCloudFingerprintRef.current) return
    lastCloudFingerprintRef.current = fingerprint

    cloudSyncChainRef.current = cloudSyncChainRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          const { syncLearnerProgress } = await import('../lib/firebase')
          await syncLearnerProgress(payload)
        } catch (error) {
          if (lastCloudFingerprintRef.current === fingerprint) lastCloudFingerprintRef.current = ''
          console.warn('[L2E LAB] Learner progress is still local because Firebase sync failed.', error)
        }
      })
  }, [])

  useEffect(() => {
    if (!hasDisplayName) return
    const timeout = window.setTimeout(() => queueCloudSync(), 700)
    return () => window.clearTimeout(timeout)
  }, [
    hasDisplayName,
    snapshot.displayName,
    snapshot.dailyProgress,
    snapshot.finishedProjectIds,
    queueCloudSync,
  ])

  useEffect(() => {
    const syncWhenOnline = () => queueCloudSync(true)
    window.addEventListener('online', syncWhenOnline)
    return () => window.removeEventListener('online', syncWhenOnline)
  }, [queueCloudSync])

  const setDisplayName = useCallback((name: string) => {
    const cleaned = name.trim().replace(/\s+/g, ' ').slice(0, 40)
    setSnapshot((current) => ({ ...current, displayName: cleaned || 'Guest Builder' }))
    if (cleaned) setHasDisplayName(true)
  }, [])

  const markProjectFinished = useCallback((projectId: string) => {
    if (!projectId) return
    setSnapshot((current) => current.finishedProjectIds.includes(projectId)
      ? current
      : { ...current, finishedProjectIds: [...current.finishedProjectIds, projectId] })
  }, [])

  const isProjectFinished = useCallback(
    (projectId: string) => snapshot.finishedProjectIds.includes(projectId),
    [snapshot.finishedProjectIds],
  )

  const finishChallenge = useCallback((track: LearningTrack, day: number) => {
    if (!Number.isInteger(day) || day < 1 || day > 100) return
    setSnapshot((current) => {
      const completedDays = current.dailyProgress[track]
      if (completedDays.includes(day)) return current
      return {
        ...current,
        dailyProgress: {
          ...current.dailyProgress,
          [track]: [...completedDays, day].sort((left, right) => left - right),
        },
      }
    })
  }, [])

  const isChallengeFinished = useCallback(
    (track: LearningTrack, day: number) => snapshot.dailyProgress[track].includes(day),
    [snapshot.dailyProgress],
  )

  const submitProject = useCallback((input: ProjectSubmissionInput): ShowcaseItem => {
    const author = (input.author?.trim() || snapshot.displayName || 'Guest Builder').slice(0, 40)
    const item: ShowcaseItem = {
      id: newSubmissionId(),
      projectId: input.project.id,
      projectSlug: input.project.slug,
      projectTitle: input.project.title,
      track: input.project.track,
      author,
      authorInitials: initialsFor(author),
      title: input.title?.trim().slice(0, 80) || `${author}'s ${input.project.title}`,
      description: input.description?.trim().slice(0, 240) || `My take on ${input.project.title}, built in L2E LAB.`,
      files: input.files.map((file) => ({ ...file })),
      submittedAt: new Date().toISOString(),
      likes: 0,
      preview: {
        accent: input.preview?.accent || input.project.theme.accent,
        eyebrow: input.preview?.eyebrow || `${input.project.track.toUpperCase()} BUILD`,
        headline: input.preview?.headline || input.title?.trim().slice(0, 80) || input.project.title,
        body: input.preview?.body || input.description?.trim().slice(0, 160) || input.project.summary,
      },
      source: 'local',
    }

    setSnapshot((current) => ({
      ...current,
      displayName: author,
      submissions: [item, ...current.submissions],
    }))
    if (author.toLowerCase() !== 'guest builder') setHasDisplayName(true)
    return item
  }, [snapshot.displayName])

  const toggleLike = useCallback((showcaseId: string) => {
    setSnapshot((current) => ({
      ...current,
      likedShowcaseIds: current.likedShowcaseIds.includes(showcaseId)
        ? current.likedShowcaseIds.filter((id) => id !== showcaseId)
        : [...current.likedShowcaseIds, showcaseId],
    }))
  }, [])

  const isLiked = useCallback(
    (showcaseId: string) => snapshot.likedShowcaseIds.includes(showcaseId),
    [snapshot.likedShowcaseIds],
  )

  const resetProgress = useCallback(() => {
    setSnapshot(initialSnapshot())
    setHasDisplayName(false)
  }, [])

  const showcaseItems = useMemo(() => {
    const items = [...snapshot.submissions, ...seedShowcaseItems]
    return items.map((item) => ({
      ...item,
      likes: item.likes + (snapshot.likedShowcaseIds.includes(item.id) ? 1 : 0),
    }))
  }, [snapshot.submissions, snapshot.likedShowcaseIds])

  const value = useMemo<PublicProgressContextValue>(() => ({
    ...snapshot,
    hasDisplayName,
    showcaseItems,
    setDisplayName,
    markProjectFinished,
    isProjectFinished,
    finishChallenge,
    isChallengeFinished,
    submitProject,
    toggleLike,
    isLiked,
    resetProgress,
  }), [
    snapshot,
    hasDisplayName,
    showcaseItems,
    setDisplayName,
    markProjectFinished,
    isProjectFinished,
    finishChallenge,
    isChallengeFinished,
    submitProject,
    toggleLike,
    isLiked,
    resetProgress,
  ])

  return (
    <PublicProgressContext.Provider value={value}>
      {gateRoute ? (
        <UsernameGate
          key={location.pathname}
          destinationLabel={gateRoute.destinationLabel}
          onConfirm={setDisplayName}
          onCancel={() => navigate(gateRoute.cancelTo, { replace: true })}
        />
      ) : children}
    </PublicProgressContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePublicProgress(): PublicProgressContextValue {
  const value = useContext(PublicProgressContext)
  if (!value) throw new Error('usePublicProgress must be used inside PublicProgressProvider')
  return value
}
