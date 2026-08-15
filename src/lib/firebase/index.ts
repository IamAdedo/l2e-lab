export { firebaseConfig, isFirebaseConfigured } from './config'
export {
  bootstrapAnonymousLearner,
  getFirebaseClient,
  type FirebaseClient,
  type LearnerSession,
} from './client'
export {
  FirebaseClientError,
  toFirebaseClientError,
  type FirebaseClientErrorCode,
} from './errors'
export {
  LEARNERS_COLLECTION,
  LEARNER_SCHEMA_VERSION,
  syncLearnerProgress,
  upsertLearner,
  type HydratedLearnerProgress,
  type LearnerDailyProgress,
  type LearnerDocument,
  type LearnerSyncInput,
  type LearnerSyncResult,
  type LearnerTrack,
} from './learners'
