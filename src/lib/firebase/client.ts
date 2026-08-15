import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'
import { firebaseConfig, isFirebaseConfigured } from './config'
import { FirebaseClientError, toFirebaseClientError } from './errors'

const APP_NAME = 'l2e-lab-client'

export interface FirebaseClient {
  app: FirebaseApp
  auth: Auth
  db: Firestore
}
export interface LearnerSession {
  uid: string
  isAnonymous: boolean
}

let clientPromise: Promise<FirebaseClient> | null = null
let learnerSessionPromise: Promise<LearnerSession> | null = null

function assertBrowser() {
  if (typeof window === 'undefined') {
    throw new FirebaseClientError(
      'not-in-browser',
      'Firebase learner tracking is available only in the browser.',
    )
  }
}

async function createFirebaseClient(): Promise<FirebaseClient> {
  assertBrowser()
  if (!isFirebaseConfigured()) {
    throw new FirebaseClientError('not-configured', 'Firebase has not been configured for L2E LAB.')
  }

  const [appSdk, authSdk, firestoreSdk] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])
  const app = appSdk.getApps().find((candidate) => candidate.name === APP_NAME)
    ?? appSdk.initializeApp(firebaseConfig, APP_NAME)
  const auth = authSdk.getAuth(app)

  // Firebase Auth normally uses local persistence in a browser. Setting it
  // explicitly makes the anonymous UID survive refreshes and future visits.
  if (!auth.currentUser) await authSdk.setPersistence(auth, authSdk.browserLocalPersistence)

  return { app, auth, db: firestoreSdk.getFirestore(app) }
}

export async function getFirebaseClient(): Promise<FirebaseClient> {
  clientPromise ??= createFirebaseClient()
  try {
    return await clientPromise
  } catch (error) {
    clientPromise = null
    throw toFirebaseClientError(error)
  }
}

/**
 * Reuses any current Firebase user. If there is no session, Firebase creates
 * an anonymous account without showing the learner a login screen.
 */
export async function bootstrapAnonymousLearner(): Promise<LearnerSession> {
  if (learnerSessionPromise) return learnerSessionPromise

  learnerSessionPromise = (async () => {
    try {
      const { auth } = await getFirebaseClient()
      await auth.authStateReady()
      let user = auth.currentUser
      if (!user) {
        const { signInAnonymously } = await import('firebase/auth')
        user = (await signInAnonymously(auth)).user
      }
      return { uid: user.uid, isAnonymous: user.isAnonymous }
    } catch (error) {
      learnerSessionPromise = null
      throw toFirebaseClientError(error)
    }
  })()

  return learnerSessionPromise
}
