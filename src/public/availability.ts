import type { LearningTrack } from './types'

export const activeLearningTrack: LearningTrack = 'python'

export function isTrackAvailable(track: LearningTrack): boolean {
  return track === activeLearningTrack
}
