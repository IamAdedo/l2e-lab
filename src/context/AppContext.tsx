import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { assessments as seedAssessments } from '../data'
import type { Assessment, UserRole } from '../types'
import type { ToastKind } from '../components/UI'

type Session = { role: UserRole; username: string }
type ToastState = { id: number; kind: ToastKind; message: string }

type AppContextValue = {
  session: Session | null
  login: (username: string) => void
  logout: () => void
  assessments: Assessment[]
  saveAssessment: (assessment: Assessment) => void
  removeAssessment: (id: string) => void
  toast: ToastState | null
  notify: (message: string, kind?: ToastKind) => void
  dismissToast: () => void
}

const AppContext = createContext<AppContextValue | null>(null)
const SESSION_KEY = 'l2e-lab-session'
const EXAMS_KEY = 'l2e-lab-exams'

function loadSession(): Session | null {
  try {
    const value = localStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) as Session : null
  } catch { return null }
}

function loadAssessments(): Assessment[] {
  try {
    const value = localStorage.getItem(EXAMS_KEY)
    return value ? JSON.parse(value) as Assessment[] : seedAssessments
  } catch { return seedAssessments }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [assessments, setAssessments] = useState<Assessment[]>(loadAssessments)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => { localStorage.setItem(EXAMS_KEY, JSON.stringify(assessments)) }, [assessments])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const login = useCallback((username: string) => {
    const role: UserRole = username.toLowerCase().includes('admin') || username.toLowerCase().includes('ada.') ? 'admin' : 'student'
    const next = { role, username }
    localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
  }, [])

  const saveAssessment = useCallback((assessment: Assessment) => {
    setAssessments((items) => {
      const exists = items.some((item) => item.id === assessment.id)
      return exists ? items.map((item) => item.id === assessment.id ? assessment : item) : [assessment, ...items]
    })
  }, [])

  const removeAssessment = useCallback((id: string) => setAssessments((items) => items.filter((item) => item.id !== id)), [])
  const notify = useCallback((message: string, kind: ToastKind = 'success') => setToast({ id: Date.now(), message, kind }), [])
  const dismissToast = useCallback(() => setToast(null), [])

  const value = useMemo(() => ({ session, login, logout, assessments, saveAssessment, removeAssessment, toast, notify, dismissToast }), [session, login, logout, assessments, saveAssessment, removeAssessment, toast, notify, dismissToast])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
