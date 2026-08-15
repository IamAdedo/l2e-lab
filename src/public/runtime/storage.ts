import type { LearningTrack, StarterFile } from '../types'

export const PROJECT_DRAFTS_KEY = 'l2e-public-project-drafts-v1'
export const DAILY_DRAFTS_KEY = 'l2e-public-daily-drafts-v2'

export type SavedDraft = { files: StarterFile[]; updatedAt: string }

function readDrafts(key: string): Record<string, SavedDraft> {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '{}') as Record<string, SavedDraft>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeDraft(key: string, id: string, files: StarterFile[]) {
  const drafts = readDrafts(key)
  drafts[id] = { files, updatedAt: new Date().toISOString() }
  window.localStorage.setItem(key, JSON.stringify(drafts))
}

function removeDraft(key: string, id: string) {
  const drafts = readDrafts(key)
  delete drafts[id]
  window.localStorage.setItem(key, JSON.stringify(drafts))
}

export function getProjectDraft(projectId: string) {
  return readDrafts(PROJECT_DRAFTS_KEY)[projectId]
}

export function saveProjectDraft(projectId: string, files: StarterFile[]) {
  writeDraft(PROJECT_DRAFTS_KEY, projectId, files)
}

export function clearProjectDraft(projectId: string) {
  removeDraft(PROJECT_DRAFTS_KEY, projectId)
}

export function hasProjectDraft(projectId: string) {
  return Boolean(getProjectDraft(projectId)?.files.length)
}

function dailyDraftId(track: LearningTrack, day: number) {
  return `${track}:${day}`
}

export function getDailyDraft(track: LearningTrack, day: number) {
  return readDrafts(DAILY_DRAFTS_KEY)[dailyDraftId(track, day)]
}

export function saveDailyDraft(track: LearningTrack, day: number, files: StarterFile[]) {
  writeDraft(DAILY_DRAFTS_KEY, dailyDraftId(track, day), files)
}

export function clearDailyDraft(track: LearningTrack, day: number) {
  removeDraft(DAILY_DRAFTS_KEY, dailyDraftId(track, day))
}

export function hasDailyDraft(track: LearningTrack, day: number) {
  return Boolean(getDailyDraft(track, day)?.files.length)
}
