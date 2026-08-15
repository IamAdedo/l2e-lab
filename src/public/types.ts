export type LearningTrack = 'python' | 'react' | 'javascript'

export type LearningDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type StarterFileLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'css'
  | 'html'
  | 'json'
  | 'text'

export interface StarterFile {
  path: string
  code: string
  language: StarterFileLanguage
}

export interface ProjectRequirement {
  id: string
  title: string
  description: string
}

interface ValidationRuleBase {
  id: string
  label: string
  points: number
  hidden?: boolean
}

export interface PythonTechniqueTarget {
  target: 'ast-node' | 'call' | 'syntax'
  name: string
  feedback: string
}

export interface PythonTechniqueScope {
  kind: 'function'
  name: string
}

export interface PythonTechniqueValidation extends ValidationRuleBase {
  kind: 'python-technique'
  /**
   * Limit workflow checks to the code inside a named top-level function.
   * Omit this property for the original whole-file behaviour.
   */
  scope?: PythonTechniqueScope
  required?: PythonTechniqueTarget[]
  forbidden?: PythonTechniqueTarget[]
}

export interface PythonExpressionValidation extends ValidationRuleBase {
  kind: 'python-expression'
  expression: string
  expected: string | number | boolean | null | Array<string | number | boolean | null>
}

export interface JavaScriptExpressionValidation extends ValidationRuleBase {
  kind: 'javascript-expression'
  expression: string
  expected: string | number | boolean | null | Array<string | number | boolean | null>
}

export interface StdoutContainsValidation extends ValidationRuleBase {
  kind: 'stdout-contains'
  expected: string
  caseSensitive?: boolean
}

export interface SourceContainsValidation extends ValidationRuleBase {
  kind: 'source-contains'
  file: string
  tokens: string[]
  match: 'all' | 'any'
}

export interface PreviewTextValidation extends ValidationRuleBase {
  kind: 'preview-text'
  expected: string
  selector?: string
}

export type ValidationRule =
  | PythonExpressionValidation
  | PythonTechniqueValidation
  | JavaScriptExpressionValidation
  | StdoutContainsValidation
  | SourceContainsValidation
  | PreviewTextValidation

export interface ProjectTheme {
  accent: string
  accentSoft: string
  surface: string
  illustration: 'terminal' | 'dashboard' | 'cards' | 'game' | 'utility' | 'data'
  emoji: string
}

export interface LearningExample {
  label: string
  input: string
  expectedOutput: string
  explanation?: string
}

export interface PublicProject {
  id: string
  slug: string
  title: string
  kicker: string
  summary: string
  description: string
  track: LearningTrack
  difficulty: LearningDifficulty
  durationMinutes: number
  skills: string[]
  requirements: ProjectRequirement[]
  instructions: string[]
  examples: LearningExample[]
  starterFiles: StarterFile[]
  validation: ValidationRule[]
  expectedOutcome: string
  hints: string[]
  theme: ProjectTheme
  featured?: boolean
}

export interface DailyChallenge {
  id: string
  day: number
  track: LearningTrack
  title: string
  summary: string
  prompt: string
  concept: string
  difficulty: LearningDifficulty
  estimatedMinutes: number
  instructions: string[]
  examples: LearningExample[]
  starterFiles: StarterFile[]
  validation: ValidationRule[]
  expectedOutcome: string
  hints: string[]
  tags: string[]
}

export interface ShowcaseItem {
  id: string
  projectId: string
  projectSlug: string
  projectTitle: string
  track: LearningTrack
  author: string
  authorInitials: string
  title: string
  description: string
  files: StarterFile[]
  submittedAt: string
  likes: number
  preview: {
    accent: string
    eyebrow: string
    headline: string
    body: string
  }
  source: 'seed' | 'local'
}

export interface ProjectSubmissionInput {
  project: PublicProject
  title?: string
  description?: string
  files: StarterFile[]
  author?: string
  preview?: Partial<ShowcaseItem['preview']>
}

export type DailyProgress = Record<LearningTrack, number[]>

export interface PublicProgressSnapshot {
  displayName: string
  finishedProjectIds: string[]
  dailyProgress: DailyProgress
  submissions: ShowcaseItem[]
  likedShowcaseIds: string[]
}
