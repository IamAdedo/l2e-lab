import type { Timestamp } from 'firebase/firestore'
import { bootstrapAnonymousLearner, getFirebaseClient, type LearnerSession } from './client'
import { FirebaseClientError, toFirebaseClientError } from './errors'

export const LEARNERS_COLLECTION = 'learners'
export const LEARNER_SCHEMA_VERSION = 1 as const

export type LearnerTrack = 'python' | 'react' | 'javascript'

export interface LearnerDailyProgress {
  python: number[]
  react: number[]
  javascript: number[]
}

export interface LearnerDocument {
  uid: string
  displayName: string
  displayNameLower: string
  schemaVersion: typeof LEARNER_SCHEMA_VERSION
  firstSeenAt: Timestamp
  lastSeenAt: Timestamp
  dailyProgress: LearnerDailyProgress
  finishedProjectIds: string[]
}

export interface LearnerSyncInput {
  displayName: string
  dailyProgress?: Partial<Record<LearnerTrack, readonly number[]>>
  finishedProjectIds?: readonly string[]
}

export interface HydratedLearnerProgress {
  displayName: string
  dailyProgress: LearnerDailyProgress
  finishedProjectIds: string[]
}

export interface LearnerSyncResult extends HydratedLearnerProgress {
  session: LearnerSession
  created: boolean
}

function cleanDisplayName(value: string): string {
  const displayName = value.trim().replace(/\s+/g, ' ').slice(0, 40)
  if (!displayName) {
    throw new FirebaseClientError('invalid-display-name', 'Enter a username before syncing progress.')
  }
  return displayName
}

function cleanDays(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter(
    (day): day is number => typeof day === 'number' && Number.isInteger(day) && day >= 1 && day <= 100,
  ))].sort((left, right) => left - right)
}

function cleanProjectIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim().slice(0, 120))
    .filter(Boolean))]
    .slice(0, 100)
    .sort()
}

function cleanDailyProgress(value: unknown): LearnerDailyProgress {
  const progress = value && typeof value === 'object'
    ? value as Partial<Record<LearnerTrack, unknown>>
    : {}
  return {
    python: cleanDays(progress.python),
    react: cleanDays(progress.react),
    javascript: cleanDays(progress.javascript),
  }
}

function mergeProgress(
  remote: LearnerDailyProgress,
  local?: LearnerSyncInput['dailyProgress'],
): LearnerDailyProgress {
  return {
    python: cleanDays([...remote.python, ...(local?.python ?? [])]),
    react: cleanDays([...remote.react, ...(local?.react ?? [])]),
    javascript: cleanDays([...remote.javascript, ...(local?.javascript ?? [])]),
  }
}

/**
 * Creates or updates the current learner and returns the union of local and
 * remote completion. The public app remains local-first; callers may use the
 * returned union for hydration without making the learner wait for the network.
 */
export async function syncLearnerProgress(input: LearnerSyncInput): Promise<LearnerSyncResult> {
  const displayName = cleanDisplayName(input.displayName)

  try {
    const [{ db }, session, firestoreSdk] = await Promise.all([
      getFirebaseClient(),
      bootstrapAnonymousLearner(),
      import('firebase/firestore'),
    ])
    const learnerRef = firestoreSdk.doc(db, LEARNERS_COLLECTION, session.uid)

    const merged = await firestoreSdk.runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(learnerRef)
      const remote = snapshot.exists()
        ? snapshot.data() as Partial<LearnerDocument>
        : undefined
      const dailyProgress = mergeProgress(
        cleanDailyProgress(remote?.dailyProgress),
        input.dailyProgress,
      )
      const finishedProjectIds = cleanProjectIds([
        ...cleanProjectIds(remote?.finishedProjectIds),
        ...(input.finishedProjectIds ?? []),
      ])
      const timestamp = firestoreSdk.serverTimestamp()

      if (snapshot.exists()) {
        transaction.update(learnerRef, {
          uid: session.uid,
          displayName,
          displayNameLower: displayName.toLowerCase(),
          schemaVersion: LEARNER_SCHEMA_VERSION,
          lastSeenAt: timestamp,
          dailyProgress,
          finishedProjectIds,
        })
      } else {
        transaction.set(learnerRef, {
          uid: session.uid,
          displayName,
          displayNameLower: displayName.toLowerCase(),
          schemaVersion: LEARNER_SCHEMA_VERSION,
          firstSeenAt: timestamp,
          lastSeenAt: timestamp,
          dailyProgress,
          finishedProjectIds,
        })
      }

      return { dailyProgress, finishedProjectIds, created: !snapshot.exists() }
    })

    return {
      session,
      displayName,
      dailyProgress: merged.dailyProgress,
      finishedProjectIds: merged.finishedProjectIds,
      created: merged.created,
    }
  } catch (error) {
    throw toFirebaseClientError(error)
  }
}

/** Upserts a learner visit without discarding any existing cloud progress. */
export async function upsertLearner(displayName: string): Promise<LearnerSyncResult> {
  return syncLearnerProgress({ displayName })
}
