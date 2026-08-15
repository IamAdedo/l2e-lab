import type { FirebaseOptions } from 'firebase/app'

/**
 * Firebase's web configuration is public application metadata, not a secret.
 * Environment variables take precedence so deployments can be moved without
 * changing source, while these supplied values keep local previews working.
 */
const suppliedConfig = {
  apiKey: 'AIzaSyAKR5H3gvKF3ckhmJiiPzwFc0OuXdpLKeY',
  authDomain: 'l2e-lab.firebaseapp.com',
  projectId: 'l2e-lab',
  storageBucket: 'l2e-lab.firebasestorage.app',
  messagingSenderId: '585041920837',
  appId: '1:585041920837:web:f2ba331a5297118b25742c',
  measurementId: 'G-E4MP2JDVRB',
} satisfies FirebaseOptions

function envValue(name: keyof ImportMetaEnv): string | undefined {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}
export const firebaseConfig: FirebaseOptions = Object.freeze({
  apiKey: envValue('VITE_FIREBASE_API_KEY') ?? suppliedConfig.apiKey,
  authDomain: envValue('VITE_FIREBASE_AUTH_DOMAIN') ?? suppliedConfig.authDomain,
  projectId: envValue('VITE_FIREBASE_PROJECT_ID') ?? suppliedConfig.projectId,
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET') ?? suppliedConfig.storageBucket,
  messagingSenderId: envValue('VITE_FIREBASE_MESSAGING_SENDER_ID') ?? suppliedConfig.messagingSenderId,
  appId: envValue('VITE_FIREBASE_APP_ID') ?? suppliedConfig.appId,
  measurementId: envValue('VITE_FIREBASE_MEASUREMENT_ID') ?? suppliedConfig.measurementId,
})

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey
    && firebaseConfig.authDomain
    && firebaseConfig.projectId
    && firebaseConfig.appId,
  )
}
