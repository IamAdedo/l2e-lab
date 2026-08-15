export type UserRole = 'admin' | 'student'

export type Campus =
  | 'Aba'
  | 'Abuja'
  | 'Asaba'
  | 'Benin'
  | 'Enugu'
  | 'Lagos'
  | 'Osogbo'
  | 'Remote'

export type StudentStatus = 'active' | 'at-risk' | 'paused' | 'graduated'
export type AssessmentStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'archived'
export type SubmissionStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded'
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard'
export type ProgrammingLanguageId = 'javascript' | 'typescript' | 'python' | 'go'
export type ActivityTone = 'blue' | 'green' | 'amber' | 'violet' | 'red'

export interface ProgrammingLanguage {
  id: ProgrammingLanguageId
  name: string
  shortName: string
  version: string
  monacoLanguage: string
  fileExtension: string
}

export interface AdminUser {
  id: string
  username: string
  name: string
  initials: string
  role: 'admin'
  title: string
  campus: Campus
}

export interface Student {
  id: string
  username: string
  name: string
  initials: string
  role: 'student'
  email?: string
  cohort: string
  campus: Campus
  track: string
  level: number
  status: StudentStatus
  progress: number
  assessmentsCompleted: number
  averageScore: number
  rank: number
  streakDays: number
  joinedAt: string
  lastActiveAt: string
  skills: string[]
}

export interface CodeExample {
  input: string
  output: string
  explanation?: string
}

export interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
  label?: string
  points: number
}

export interface CodingQuestion {
  id: string
  title: string
  slug: string
  category: string
  difficulty: QuestionDifficulty
  summary: string
  description: string
  inputFormat?: string
  outputFormat?: string
  constraints: string[]
  examples: CodeExample[]
  starterCode: Partial<Record<ProgrammingLanguageId, string>>
  testCases: TestCase[]
  points: number
  estimatedMinutes: number
  tags: string[]
}

export interface Assessment {
  id: string
  title: string
  slug: string
  eyebrow: string
  description: string
  instructions: string[]
  cohort: string
  campus: Campus | 'All campuses'
  status: AssessmentStatus
  questionIds: string[]
  allowedLanguages: ProgrammingLanguageId[]
  durationMinutes: number
  totalPoints: number
  passMark: number
  attemptsAllowed: number
  startsAt: string
  endsAt: string
  createdAt: string
  updatedAt: string
  createdBy: string
  participantsCount: number
  completedCount: number
  averageScore: number | null
  featured?: boolean
}

export interface QuestionResult {
  questionId: string
  score: number
  maxScore: number
  testsPassed: number
  testsTotal: number
  language: ProgrammingLanguageId
  code: string
}

export interface Submission {
  id: string
  assessmentId: string
  studentId: string
  status: SubmissionStatus
  attempt: number
  startedAt: string
  submittedAt?: string
  durationMinutes?: number
  score?: number
  maxScore: number
  percentage?: number
  questionResults: QuestionResult[]
  flagged: boolean
  feedback?: string
}

export interface DashboardStat {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  helper: string
  icon: 'users' | 'assessment' | 'completion' | 'score'
}

export interface ActivityItem {
  id: string
  type: 'submission' | 'assessment' | 'student' | 'result' | 'system'
  title: string
  description: string
  timestamp: string
  relativeTime: string
  tone: ActivityTone
  studentId?: string
  assessmentId?: string
}

export interface ChartPoint {
  label: string
  value: number
  secondaryValue?: number
}

export interface ScoreBand {
  label: string
  min: number
  max: number
  count: number
  color: string
}

export interface SkillPerformance {
  skill: string
  score: number
  attempts: number
  color: string
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  timestamp: string
  read: boolean
  type: 'assessment' | 'result' | 'reminder' | 'announcement'
}

export interface CampusPerformance {
  campus: Campus
  students: number
  completionRate: number
  averageScore: number
}
