import type {
  ActivityItem,
  AdminUser,
  Assessment,
  CampusPerformance,
  ChartPoint,
  CodingQuestion,
  DashboardStat,
  NotificationItem,
  ProgrammingLanguage,
  ScoreBand,
  SkillPerformance,
  Student,
  Submission,
} from './types'

export const currentAdmin: AdminUser = {
  id: 'admin-01',
  username: 'ada.okafor',
  name: 'Ada Okafor',
  initials: 'AO',
  role: 'admin',
  title: 'Learning Operations Lead',
  campus: 'Lagos',
}

export const programmingLanguages: ProgrammingLanguage[] = [
  { id: 'javascript', name: 'JavaScript', shortName: 'JS', version: 'Node 22', monacoLanguage: 'javascript', fileExtension: '.js' },
  { id: 'typescript', name: 'TypeScript', shortName: 'TS', version: '5.7', monacoLanguage: 'typescript', fileExtension: '.ts' },
  { id: 'python', name: 'Python', shortName: 'PY', version: '3.13', monacoLanguage: 'python', fileExtension: '.py' },
  { id: 'go', name: 'Go', shortName: 'GO', version: '1.24', monacoLanguage: 'go', fileExtension: '.go' },
]

export const questions: CodingQuestion[] = [
  {
    id: 'q-001',
    title: 'Signal Strength',
    slug: 'signal-strength',
    category: 'Arrays',
    difficulty: 'Easy',
    summary: 'Find the longest reliable stretch in a campus network signal log.',
    description: 'A campus router records one signal reading every minute. A reading of 1 means the connection was stable and 0 means it dropped. Return the length of the longest uninterrupted run of stable readings.',
    inputFormat: 'An array of integers containing only 0 and 1.',
    outputFormat: 'A single integer: the longest consecutive run of 1s.',
    constraints: ['1 ≤ readings.length ≤ 100,000', 'readings[i] is either 0 or 1', 'Aim for O(n) time and O(1) extra space'],
    examples: [
      { input: '[1, 1, 0, 1, 1, 1]', output: '3', explanation: 'The final three readings form the longest stable period.' },
      { input: '[0, 0, 0]', output: '0' },
    ],
    starterCode: {
      javascript: 'function signalStrength(readings) {\n  // Write your solution here\n}\n',
      typescript: 'function signalStrength(readings: number[]): number {\n  // Write your solution here\n  return 0\n}\n',
      python: 'def signal_strength(readings: list[int]) -> int:\n    # Write your solution here\n    pass\n',
      go: 'func signalStrength(readings []int) int {\n\t// Write your solution here\n\treturn 0\n}\n',
    },
    testCases: [
      { id: 'tc-001-a', input: '[1,1,0,1,1,1]', expectedOutput: '3', isHidden: false, label: 'Mixed readings', points: 5 },
      { id: 'tc-001-b', input: '[0,0,0]', expectedOutput: '0', isHidden: false, label: 'No stable signal', points: 5 },
      { id: 'tc-001-c', input: '[1]', expectedOutput: '1', isHidden: true, points: 5 },
      { id: 'tc-001-d', input: '[1,1,1,1,1,1,1]', expectedOutput: '7', isHidden: true, points: 10 },
    ],
    points: 25,
    estimatedMinutes: 15,
    tags: ['array', 'iteration', 'state'],
  },
  {
    id: 'q-002',
    title: 'Cohort Pairing',
    slug: 'cohort-pairing',
    category: 'Hash Maps',
    difficulty: 'Easy',
    summary: 'Match two fellows whose skill points add up to a project requirement.',
    description: 'Given a list of skill-point values and a target, return the zero-based indices of the two values whose sum equals the target. Exactly one valid pair exists and the same fellow cannot be selected twice.',
    inputFormat: 'An integer array points and an integer target.',
    outputFormat: 'An array containing the two matching indices.',
    constraints: ['2 ≤ points.length ≤ 10,000', '-10,000 ≤ points[i], target ≤ 10,000', 'Exactly one valid answer exists'],
    examples: [
      { input: 'points = [4, 7, 2, 9], target = 11', output: '[0, 1]' },
      { input: 'points = [3, 3], target = 6', output: '[0, 1]' },
    ],
    starterCode: {
      javascript: 'function cohortPairing(points, target) {\n  // Write your solution here\n}\n',
      typescript: 'function cohortPairing(points: number[], target: number): [number, number] {\n  // Write your solution here\n  return [0, 0]\n}\n',
      python: 'def cohort_pairing(points: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass\n',
    },
    testCases: [
      { id: 'tc-002-a', input: '[4,7,2,9]; 11', expectedOutput: '[0,1]', isHidden: false, label: 'Standard pair', points: 5 },
      { id: 'tc-002-b', input: '[3,3]; 6', expectedOutput: '[0,1]', isHidden: false, label: 'Duplicate values', points: 5 },
      { id: 'tc-002-c', input: '[-2,8,13,5]; 11', expectedOutput: '[0,2]', isHidden: true, points: 10 },
      { id: 'tc-002-d', input: '[1000 items]; 1942', expectedOutput: '[317,846]', isHidden: true, points: 10 },
    ],
    points: 30,
    estimatedMinutes: 20,
    tags: ['hash-map', 'lookup', 'complexity'],
  },
  {
    id: 'q-003',
    title: 'Review Queue',
    slug: 'review-queue',
    category: 'Queues',
    difficulty: 'Medium',
    summary: 'Process peer-review tickets fairly while respecting priority requests.',
    description: 'Each review request has an arrival order and a priority from 1 to 3. Process higher priority requests first while preserving arrival order among requests with equal priority. Return the ordered request IDs.',
    inputFormat: 'An array of objects: { id: string, priority: 1 | 2 | 3 }.',
    outputFormat: 'An array of request IDs in processing order; priority 3 is highest.',
    constraints: ['1 ≤ requests.length ≤ 50,000', 'Request IDs are unique', 'Ordering must be stable within a priority'],
    examples: [
      { input: '[{id:"R1",priority:1},{id:"R2",priority:3},{id:"R3",priority:3}]', output: '["R2","R3","R1"]' },
    ],
    starterCode: {
      javascript: 'function reviewQueue(requests) {\n  // Write your solution here\n}\n',
      typescript: 'type Request = { id: string; priority: 1 | 2 | 3 }\n\nfunction reviewQueue(requests: Request[]): string[] {\n  // Write your solution here\n  return []\n}\n',
      python: 'def review_queue(requests: list[dict]) -> list[str]:\n    # Write your solution here\n    pass\n',
    },
    testCases: [
      { id: 'tc-003-a', input: '[R1:1,R2:3,R3:3]', expectedOutput: '[R2,R3,R1]', isHidden: false, label: 'Stable priority', points: 8 },
      { id: 'tc-003-b', input: '[R1:2]', expectedOutput: '[R1]', isHidden: false, label: 'Single request', points: 4 },
      { id: 'tc-003-c', input: '[R1:1,R2:2,R3:1,R4:3]', expectedOutput: '[R4,R2,R1,R3]', isHidden: true, points: 8 },
      { id: 'tc-003-d', input: '[50,000 requests]', expectedOutput: '[priority-stable-order]', isHidden: true, points: 10 },
    ],
    points: 30,
    estimatedMinutes: 25,
    tags: ['queue', 'stable-sort', 'data-structures'],
  },
  {
    id: 'q-004',
    title: 'Learning Path',
    slug: 'learning-path',
    category: 'Graphs',
    difficulty: 'Hard',
    summary: 'Find a valid order for completing projects with prerequisites.',
    description: 'Projects can depend on other projects. Given the number of projects and prerequisite pairs [project, prerequisite], return any valid completion order. Return an empty array when the prerequisites contain a cycle.',
    inputFormat: 'An integer projectCount and an array of [project, prerequisite] pairs.',
    outputFormat: 'A valid project ordering, or [] when none exists.',
    constraints: ['1 ≤ projectCount ≤ 2,000', '0 ≤ project, prerequisite < projectCount', 'No duplicate prerequisite pair'],
    examples: [
      { input: '4, [[1,0],[2,0],[3,1],[3,2]]', output: '[0,1,2,3]', explanation: '[0,2,1,3] is also valid.' },
      { input: '2, [[0,1],[1,0]]', output: '[]', explanation: 'The two projects form a cycle.' },
    ],
    starterCode: {
      javascript: 'function learningPath(projectCount, prerequisites) {\n  // Write your solution here\n}\n',
      typescript: 'function learningPath(projectCount: number, prerequisites: Array<[number, number]>): number[] {\n  // Write your solution here\n  return []\n}\n',
      python: 'def learning_path(project_count: int, prerequisites: list[list[int]]) -> list[int]:\n    # Write your solution here\n    pass\n',
      go: 'func learningPath(projectCount int, prerequisites [][]int) []int {\n\t// Write your solution here\n\treturn []int{}\n}\n',
    },
    testCases: [
      { id: 'tc-004-a', input: '4; [[1,0],[2,0],[3,1],[3,2]]', expectedOutput: 'valid-order', isHidden: false, label: 'Branching path', points: 10 },
      { id: 'tc-004-b', input: '2; [[0,1],[1,0]]', expectedOutput: '[]', isHidden: false, label: 'Cycle', points: 10 },
      { id: 'tc-004-c', input: '1; []', expectedOutput: '[0]', isHidden: true, points: 5 },
      { id: 'tc-004-d', input: '2000; [dense-dag]', expectedOutput: 'valid-order', isHidden: true, points: 15 },
    ],
    points: 40,
    estimatedMinutes: 40,
    tags: ['graph', 'topological-sort', 'cycle-detection'],
  },
  {
    id: 'q-005',
    title: 'Attendance Streak',
    slug: 'attendance-streak',
    category: 'Strings',
    difficulty: 'Easy',
    summary: 'Summarise a fellow’s longest on-time campus attendance streak.',
    description: 'An attendance string uses P for present, L for late and A for absent. Return the longest consecutive streak containing only P. Any L or A ends the current streak.',
    inputFormat: 'A string made up of P, L and A characters.',
    outputFormat: 'The length of the longest consecutive P streak.',
    constraints: ['1 ≤ record.length ≤ 100,000', 'record contains only P, L and A'],
    examples: [
      { input: 'PPLPPPPALP', output: '4' },
      { input: 'LLAA', output: '0' },
    ],
    starterCode: {
      javascript: 'function attendanceStreak(record) {\n  // Write your solution here\n}\n',
      typescript: 'function attendanceStreak(record: string): number {\n  // Write your solution here\n  return 0\n}\n',
      python: 'def attendance_streak(record: str) -> int:\n    # Write your solution here\n    pass\n',
    },
    testCases: [
      { id: 'tc-005-a', input: 'PPLPPPPALP', expectedOutput: '4', isHidden: false, points: 5 },
      { id: 'tc-005-b', input: 'LLAA', expectedOutput: '0', isHidden: false, points: 5 },
      { id: 'tc-005-c', input: 'P', expectedOutput: '1', isHidden: true, points: 5 },
      { id: 'tc-005-d', input: 'P repeated 100000 times', expectedOutput: '100000', isHidden: true, points: 10 },
    ],
    points: 25,
    estimatedMinutes: 12,
    tags: ['string', 'iteration'],
  },
  {
    id: 'q-006',
    title: 'Resource Scheduler',
    slug: 'resource-scheduler',
    category: 'Intervals',
    difficulty: 'Medium',
    summary: 'Calculate the minimum number of rooms required for simultaneous sessions.',
    description: 'Each session is represented by a start and end minute. Return the minimum number of rooms needed so that no overlapping sessions share a room. A session ending at the exact time another starts does not overlap.',
    inputFormat: 'An array of [start, end] integer pairs.',
    outputFormat: 'A single integer: the minimum rooms required.',
    constraints: ['1 ≤ sessions.length ≤ 100,000', '0 ≤ start < end ≤ 1,440'],
    examples: [
      { input: '[[30,75],[0,50],[60,150]]', output: '2' },
      { input: '[[0,30],[30,60]]', output: '1' },
    ],
    starterCode: {
      javascript: 'function resourceScheduler(sessions) {\n  // Write your solution here\n}\n',
      typescript: 'function resourceScheduler(sessions: Array<[number, number]>): number {\n  // Write your solution here\n  return 0\n}\n',
      python: 'def resource_scheduler(sessions: list[list[int]]) -> int:\n    # Write your solution here\n    pass\n',
    },
    testCases: [
      { id: 'tc-006-a', input: '[[30,75],[0,50],[60,150]]', expectedOutput: '2', isHidden: false, points: 5 },
      { id: 'tc-006-b', input: '[[0,30],[30,60]]', expectedOutput: '1', isHidden: false, points: 5 },
      { id: 'tc-006-c', input: '[[0,1440]]', expectedOutput: '1', isHidden: true, points: 5 },
      { id: 'tc-006-d', input: '[100000 overlapping sessions]', expectedOutput: '100000', isHidden: true, points: 15 },
    ],
    points: 30,
    estimatedMinutes: 30,
    tags: ['intervals', 'sorting', 'two-pointers'],
  },
  {
    id: 'q-007',
    title: 'Project Slugger',
    slug: 'project-slugger',
    category: 'Strings',
    difficulty: 'Easy',
    summary: 'Convert project titles into clean URL-safe slugs.',
    description: 'Convert a project title to lowercase, remove punctuation, replace every run of whitespace with one hyphen and trim leading or trailing hyphens.',
    inputFormat: 'A UTF-8 project-title string.',
    outputFormat: 'A lowercase, hyphen-separated slug.',
    constraints: ['1 ≤ title.length ≤ 1,000', 'Accented letters may be normalised to their ASCII equivalent'],
    examples: [
      { input: 'Build the Future!', output: 'build-the-future' },
      { input: '  L2E   Campus Hub  ', output: 'l2e-campus-hub' },
    ],
    starterCode: {
      javascript: 'function projectSlugger(title) {\n  // Write your solution here\n}\n',
      typescript: 'function projectSlugger(title: string): string {\n  // Write your solution here\n  return ""\n}\n',
      python: 'def project_slugger(title: str) -> str:\n    # Write your solution here\n    pass\n',
    },
    testCases: [
      { id: 'tc-007-a', input: 'Build the Future!', expectedOutput: 'build-the-future', isHidden: false, points: 5 },
      { id: 'tc-007-b', input: '  L2E   Campus Hub  ', expectedOutput: 'l2e-campus-hub', isHidden: false, points: 5 },
      { id: 'tc-007-c', input: 'Peer_review @ Scale', expectedOutput: 'peer-review-scale', isHidden: true, points: 5 },
      { id: 'tc-007-d', input: 'Déjà Vu', expectedOutput: 'deja-vu', isHidden: true, points: 5 },
    ],
    points: 20,
    estimatedMinutes: 15,
    tags: ['string', 'regex', 'normalisation'],
  },
]

export const assessments: Assessment[] = [
  {
    id: 'assess-aug-core',
    title: 'August Core Skills Sprint',
    slug: 'august-core-skills-sprint',
    eyebrow: 'Monthly benchmark',
    description: 'A practical checkpoint covering arrays, hash maps and dependable problem-solving under time pressure.',
    instructions: ['Complete all three questions.', 'You may run sample tests as often as needed.', 'Hidden tests run only after final submission.', 'External AI tools and copied solutions are not permitted.'],
    cohort: 'Cohort 4',
    campus: 'All campuses',
    status: 'live',
    questionIds: ['q-001', 'q-002', 'q-003'],
    allowedLanguages: ['javascript', 'typescript', 'python'],
    durationMinutes: 90,
    totalPoints: 85,
    passMark: 60,
    attemptsAllowed: 1,
    startsAt: '2026-08-15T08:00:00+01:00',
    endsAt: '2026-08-16T20:00:00+01:00',
    createdAt: '2026-08-04T11:20:00+01:00',
    updatedAt: '2026-08-14T16:45:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 184,
    completedCount: 71,
    averageScore: 74,
    featured: true,
  },
  {
    id: 'assess-dsa-pathways',
    title: 'DSA Pathways: Graphs & Scheduling',
    slug: 'dsa-pathways-graphs-scheduling',
    eyebrow: 'Level 3 challenge',
    description: 'Demonstrate graph traversal, dependency resolution and interval reasoning in two workplace-inspired problems.',
    instructions: ['Read the constraints before choosing an approach.', 'Your solution must pass the performance test cases.', 'Either question may be completed first.'],
    cohort: 'Cohort 3',
    campus: 'Lagos',
    status: 'scheduled',
    questionIds: ['q-004', 'q-006'],
    allowedLanguages: ['javascript', 'typescript', 'python', 'go'],
    durationMinutes: 105,
    totalPoints: 70,
    passMark: 65,
    attemptsAllowed: 1,
    startsAt: '2026-08-18T10:00:00+01:00',
    endsAt: '2026-08-18T13:00:00+01:00',
    createdAt: '2026-08-08T09:00:00+01:00',
    updatedAt: '2026-08-13T14:10:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 68,
    completedCount: 0,
    averageScore: null,
  },
  {
    id: 'assess-js-foundations',
    title: 'JavaScript Foundations Check',
    slug: 'javascript-foundations-check',
    eyebrow: 'Trials checkpoint',
    description: 'A friendly first assessment focused on loops, string operations and clear function design.',
    instructions: ['Use JavaScript for every answer.', 'Sample tests do not contribute to your score.', 'Submit before the timer reaches zero.'],
    cohort: 'August Trials',
    campus: 'Abuja',
    status: 'completed',
    questionIds: ['q-005', 'q-007', 'q-001'],
    allowedLanguages: ['javascript'],
    durationMinutes: 60,
    totalPoints: 70,
    passMark: 55,
    attemptsAllowed: 1,
    startsAt: '2026-08-10T09:00:00+01:00',
    endsAt: '2026-08-10T18:00:00+01:00',
    createdAt: '2026-08-01T13:30:00+01:00',
    updatedAt: '2026-08-11T09:05:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 96,
    completedCount: 91,
    averageScore: 78,
  },
  {
    id: 'assess-peer-systems',
    title: 'Peer Systems Mini Challenge',
    slug: 'peer-systems-mini-challenge',
    eyebrow: 'Practice lab',
    description: 'A compact assessment built around peer-review workflows and simple queue design.',
    instructions: ['This assessment permits two attempts.', 'Your highest score is retained.', 'Use the sample test to confirm the expected ordering.'],
    cohort: 'Cohort 4',
    campus: 'Enugu',
    status: 'draft',
    questionIds: ['q-003'],
    allowedLanguages: ['javascript', 'typescript', 'python'],
    durationMinutes: 35,
    totalPoints: 30,
    passMark: 60,
    attemptsAllowed: 2,
    startsAt: '2026-08-25T08:00:00+01:00',
    endsAt: '2026-08-28T20:00:00+01:00',
    createdAt: '2026-08-12T15:20:00+01:00',
    updatedAt: '2026-08-14T12:05:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 0,
    completedCount: 0,
    averageScore: null,
  },
  {
    id: 'assess-campus-ops',
    title: 'Campus Operations Logic Lab',
    slug: 'campus-operations-logic-lab',
    eyebrow: 'Applied problem solving',
    description: 'Solve common campus scheduling and connectivity problems using efficient algorithms.',
    instructions: ['Complete both questions.', 'Solutions are graded for correctness and efficiency.', 'You have one submission attempt.'],
    cohort: 'Cohort 3',
    campus: 'Aba',
    status: 'completed',
    questionIds: ['q-001', 'q-006'],
    allowedLanguages: ['javascript', 'python', 'go'],
    durationMinutes: 75,
    totalPoints: 55,
    passMark: 60,
    attemptsAllowed: 1,
    startsAt: '2026-07-29T10:00:00+01:00',
    endsAt: '2026-07-29T18:00:00+01:00',
    createdAt: '2026-07-19T10:10:00+01:00',
    updatedAt: '2026-07-30T09:20:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 54,
    completedCount: 52,
    averageScore: 71,
  },
  {
    id: 'assess-api-readiness',
    title: 'Backend Readiness Assessment',
    slug: 'backend-readiness-assessment',
    eyebrow: 'Specialisation gate',
    description: 'An advanced readiness gate combining data structures with API-oriented reasoning.',
    instructions: ['This assessment is not yet open.', 'Starter code and final test cases are under review.'],
    cohort: 'Cohort 3',
    campus: 'All campuses',
    status: 'draft',
    questionIds: ['q-002', 'q-004', 'q-006'],
    allowedLanguages: ['typescript', 'python', 'go'],
    durationMinutes: 120,
    totalPoints: 100,
    passMark: 70,
    attemptsAllowed: 1,
    startsAt: '2026-09-02T08:00:00+01:00',
    endsAt: '2026-09-03T20:00:00+01:00',
    createdAt: '2026-08-14T10:30:00+01:00',
    updatedAt: '2026-08-14T17:40:00+01:00',
    createdBy: 'admin-01',
    participantsCount: 0,
    completedCount: 0,
    averageScore: null,
  },
]

export const students: Student[] = [
  { id: 'stu-001', username: 'chidi.n', name: 'Chidi Nwosu', initials: 'CN', role: 'student', cohort: 'Cohort 4', campus: 'Lagos', track: 'Software Engineering', level: 4, status: 'active', progress: 82, assessmentsCompleted: 9, averageScore: 88, rank: 1, streakDays: 12, joinedAt: '2026-02-03', lastActiveAt: '2026-08-15T00:04:00+01:00', skills: ['JavaScript', 'React', 'Algorithms'] },
  { id: 'stu-002', username: 'amara.e', name: 'Amara Eze', initials: 'AE', role: 'student', cohort: 'Cohort 4', campus: 'Enugu', track: 'Software Engineering', level: 4, status: 'active', progress: 77, assessmentsCompleted: 8, averageScore: 84, rank: 2, streakDays: 8, joinedAt: '2026-02-03', lastActiveAt: '2026-08-14T23:41:00+01:00', skills: ['TypeScript', 'Node.js', 'SQL'] },
  { id: 'stu-003', username: 'tobi.a', name: 'Tobi Adebayo', initials: 'TA', role: 'student', cohort: 'Cohort 4', campus: 'Abuja', track: 'Software Engineering', level: 3, status: 'active', progress: 71, assessmentsCompleted: 8, averageScore: 81, rank: 3, streakDays: 15, joinedAt: '2026-02-03', lastActiveAt: '2026-08-14T22:18:00+01:00', skills: ['Python', 'APIs', 'Testing'] },
  { id: 'stu-004', username: 'zainab.b', name: 'Zainab Bello', initials: 'ZB', role: 'student', cohort: 'Cohort 4', campus: 'Abuja', track: 'Software Engineering', level: 3, status: 'active', progress: 69, assessmentsCompleted: 7, averageScore: 79, rank: 4, streakDays: 6, joinedAt: '2026-02-03', lastActiveAt: '2026-08-14T21:56:00+01:00', skills: ['JavaScript', 'CSS', 'Accessibility'] },
  { id: 'stu-005', username: 'favour.o', name: 'Favour Okon', initials: 'FO', role: 'student', cohort: 'Cohort 3', campus: 'Aba', track: 'Backend Engineering', level: 5, status: 'active', progress: 91, assessmentsCompleted: 12, averageScore: 78, rank: 5, streakDays: 10, joinedAt: '2025-09-08', lastActiveAt: '2026-08-14T20:32:00+01:00', skills: ['Go', 'PostgreSQL', 'Docker'] },
  { id: 'stu-006', username: 'daniel.u', name: 'Daniel Udo', initials: 'DU', role: 'student', cohort: 'Cohort 4', campus: 'Lagos', track: 'Software Engineering', level: 3, status: 'at-risk', progress: 48, assessmentsCompleted: 5, averageScore: 61, rank: 43, streakDays: 0, joinedAt: '2026-02-03', lastActiveAt: '2026-08-11T12:17:00+01:00', skills: ['HTML', 'JavaScript'] },
  { id: 'stu-007', username: 'ifeoma.c', name: 'Ifeoma Chukwu', initials: 'IC', role: 'student', cohort: 'Cohort 3', campus: 'Asaba', track: 'Frontend Engineering', level: 5, status: 'active', progress: 88, assessmentsCompleted: 11, averageScore: 76, rank: 9, streakDays: 5, joinedAt: '2025-09-08', lastActiveAt: '2026-08-14T19:05:00+01:00', skills: ['React', 'TypeScript', 'Design Systems'] },
  { id: 'stu-008', username: 'malik.s', name: 'Malik Sani', initials: 'MS', role: 'student', cohort: 'August Trials', campus: 'Abuja', track: 'Foundations', level: 1, status: 'active', progress: 31, assessmentsCompleted: 2, averageScore: 73, rank: 18, streakDays: 4, joinedAt: '2026-08-03', lastActiveAt: '2026-08-14T18:22:00+01:00', skills: ['JavaScript', 'Git'] },
  { id: 'stu-009', username: 'esther.a', name: 'Esther Afolabi', initials: 'EA', role: 'student', cohort: 'Cohort 4', campus: 'Osogbo', track: 'Software Engineering', level: 3, status: 'paused', progress: 53, assessmentsCompleted: 6, averageScore: 67, rank: 31, streakDays: 0, joinedAt: '2026-02-03', lastActiveAt: '2026-08-06T09:14:00+01:00', skills: ['Python', 'Git'] },
  { id: 'stu-010', username: 'victor.i', name: 'Victor Ibe', initials: 'VI', role: 'student', cohort: 'Cohort 3', campus: 'Benin', track: 'Backend Engineering', level: 5, status: 'active', progress: 86, assessmentsCompleted: 12, averageScore: 74, rank: 12, streakDays: 7, joinedAt: '2025-09-08', lastActiveAt: '2026-08-14T17:49:00+01:00', skills: ['Node.js', 'SQL', 'System Design'] },
]

export const currentStudent: Student = students[0]

export const submissions: Submission[] = [
  {
    id: 'sub-1001', assessmentId: 'assess-js-foundations', studentId: 'stu-008', status: 'graded', attempt: 1,
    startedAt: '2026-08-10T09:13:00+01:00', submittedAt: '2026-08-10T10:05:00+01:00', durationMinutes: 52,
    score: 61, maxScore: 70, percentage: 87, flagged: false, feedback: 'Clear, readable solutions. Great use of small helper functions.',
    questionResults: [
      { questionId: 'q-005', score: 25, maxScore: 25, testsPassed: 4, testsTotal: 4, language: 'javascript', code: 'function attendanceStreak(record) { /* submitted solution */ }' },
      { questionId: 'q-007', score: 16, maxScore: 20, testsPassed: 3, testsTotal: 4, language: 'javascript', code: 'function projectSlugger(title) { /* submitted solution */ }' },
      { questionId: 'q-001', score: 20, maxScore: 25, testsPassed: 3, testsTotal: 4, language: 'javascript', code: 'function signalStrength(readings) { /* submitted solution */ }' },
    ],
  },
  {
    id: 'sub-1002', assessmentId: 'assess-campus-ops', studentId: 'stu-005', status: 'graded', attempt: 1,
    startedAt: '2026-07-29T10:04:00+01:00', submittedAt: '2026-07-29T11:11:00+01:00', durationMinutes: 67,
    score: 49, maxScore: 55, percentage: 89, flagged: false, feedback: 'Strong performance on interval sorting and edge cases.',
    questionResults: [
      { questionId: 'q-001', score: 24, maxScore: 25, testsPassed: 4, testsTotal: 4, language: 'go', code: 'func signalStrength(readings []int) int { /* submitted solution */ return 0 }' },
      { questionId: 'q-006', score: 25, maxScore: 30, testsPassed: 3, testsTotal: 4, language: 'go', code: 'func resourceScheduler(sessions [][]int) int { /* submitted solution */ return 0 }' },
    ],
  },
  {
    id: 'sub-1003', assessmentId: 'assess-aug-core', studentId: 'stu-002', status: 'submitted', attempt: 1,
    startedAt: '2026-08-14T21:52:00+01:00', submittedAt: '2026-08-14T23:37:00+01:00', durationMinutes: 85,
    score: 75, maxScore: 85, percentage: 88, flagged: false,
    questionResults: [
      { questionId: 'q-001', score: 25, maxScore: 25, testsPassed: 4, testsTotal: 4, language: 'typescript', code: 'function signalStrength(readings: number[]): number { /* submitted solution */ return 0 }' },
      { questionId: 'q-002', score: 30, maxScore: 30, testsPassed: 4, testsTotal: 4, language: 'typescript', code: 'function cohortPairing(points: number[], target: number) { /* submitted solution */ }' },
      { questionId: 'q-003', score: 20, maxScore: 30, testsPassed: 3, testsTotal: 4, language: 'typescript', code: 'function reviewQueue(requests: unknown[]) { /* submitted solution */ }' },
    ],
  },
  {
    id: 'sub-1004', assessmentId: 'assess-aug-core', studentId: 'stu-006', status: 'in-progress', attempt: 1,
    startedAt: '2026-08-14T23:26:00+01:00', maxScore: 85, flagged: false,
    questionResults: [
      { questionId: 'q-001', score: 15, maxScore: 25, testsPassed: 2, testsTotal: 4, language: 'javascript', code: 'function signalStrength(readings) { /* work in progress */ }' },
    ],
  },
  {
    id: 'sub-1005', assessmentId: 'assess-js-foundations', studentId: 'stu-009', status: 'graded', attempt: 1,
    startedAt: '2026-08-10T09:22:00+01:00', submittedAt: '2026-08-10T10:21:00+01:00', durationMinutes: 59,
    score: 42, maxScore: 70, percentage: 60, flagged: true, feedback: 'Review string normalisation and test your boundary cases before submitting.',
    questionResults: [
      { questionId: 'q-005', score: 20, maxScore: 25, testsPassed: 3, testsTotal: 4, language: 'javascript', code: 'function attendanceStreak(record) { /* submitted solution */ }' },
      { questionId: 'q-007', score: 12, maxScore: 20, testsPassed: 2, testsTotal: 4, language: 'javascript', code: 'function projectSlugger(title) { /* submitted solution */ }' },
      { questionId: 'q-001', score: 10, maxScore: 25, testsPassed: 2, testsTotal: 4, language: 'javascript', code: 'function signalStrength(readings) { /* submitted solution */ }' },
    ],
  },
  {
    id: 'sub-1006', assessmentId: 'assess-campus-ops', studentId: 'stu-010', status: 'graded', attempt: 1,
    startedAt: '2026-07-29T10:18:00+01:00', submittedAt: '2026-07-29T11:27:00+01:00', durationMinutes: 69,
    score: 44, maxScore: 55, percentage: 80, flagged: false,
    questionResults: [
      { questionId: 'q-001', score: 24, maxScore: 25, testsPassed: 4, testsTotal: 4, language: 'javascript', code: 'function signalStrength(readings) { /* submitted solution */ }' },
      { questionId: 'q-006', score: 20, maxScore: 30, testsPassed: 3, testsTotal: 4, language: 'javascript', code: 'function resourceScheduler(sessions) { /* submitted solution */ }' },
    ],
  },
]

export const adminDashboardStats: DashboardStat[] = [
  { id: 'stat-students', label: 'Active fellows', value: '1,284', change: '+8.4%', trend: 'up', helper: 'vs. last month', icon: 'users' },
  { id: 'stat-assessments', label: 'Live assessments', value: '04', change: '+1', trend: 'up', helper: 'across 7 campuses', icon: 'assessment' },
  { id: 'stat-completion', label: 'Completion rate', value: '86.2%', change: '+3.1%', trend: 'up', helper: 'last 30 days', icon: 'completion' },
  { id: 'stat-score', label: 'Average score', value: '74.8%', change: '+1.6%', trend: 'up', helper: 'across 642 attempts', icon: 'score' },
]

export const studentDashboardStats: DashboardStat[] = [
  { id: 'student-rank', label: 'Cohort rank', value: '#1', change: '+2 places', trend: 'up', helper: 'of 184 fellows', icon: 'users' },
  { id: 'student-completed', label: 'Assessments', value: '09', change: '3 this month', trend: 'up', helper: 'completed', icon: 'assessment' },
  { id: 'student-score', label: 'Average score', value: '88%', change: '+4.2%', trend: 'up', helper: 'personal best', icon: 'score' },
  { id: 'student-streak', label: 'Learning streak', value: '12 days', change: '+5 days', trend: 'up', helper: 'keep it going', icon: 'completion' },
]

export const performanceTrend: ChartPoint[] = [
  { label: 'Mar', value: 68, secondaryValue: 72 },
  { label: 'Apr', value: 72, secondaryValue: 73 },
  { label: 'May', value: 70, secondaryValue: 71 },
  { label: 'Jun', value: 77, secondaryValue: 74 },
  { label: 'Jul', value: 82, secondaryValue: 76 },
  { label: 'Aug', value: 88, secondaryValue: 75 },
]

export const weeklyParticipation: ChartPoint[] = [
  { label: 'Mon', value: 118, secondaryValue: 104 },
  { label: 'Tue', value: 142, secondaryValue: 119 },
  { label: 'Wed', value: 164, secondaryValue: 137 },
  { label: 'Thu', value: 151, secondaryValue: 129 },
  { label: 'Fri', value: 178, secondaryValue: 152 },
  { label: 'Sat', value: 96, secondaryValue: 81 },
  { label: 'Sun', value: 62, secondaryValue: 54 },
]

export const scoreDistribution: ScoreBand[] = [
  { label: '90–100', min: 90, max: 100, count: 84, color: '#0ea5e9' },
  { label: '80–89', min: 80, max: 89, count: 156, color: '#2563eb' },
  { label: '70–79', min: 70, max: 79, count: 193, color: '#4f46e5' },
  { label: '60–69', min: 60, max: 69, count: 121, color: '#8b5cf6' },
  { label: 'Below 60', min: 0, max: 59, count: 88, color: '#cbd5e1' },
]

export const skillPerformance: SkillPerformance[] = [
  { skill: 'Arrays', score: 92, attempts: 14, color: '#0ea5e9' },
  { skill: 'Strings', score: 86, attempts: 11, color: '#2563eb' },
  { skill: 'Hash maps', score: 81, attempts: 8, color: '#4f46e5' },
  { skill: 'Queues', score: 74, attempts: 6, color: '#8b5cf6' },
  { skill: 'Graphs', score: 63, attempts: 3, color: '#f59e0b' },
]

export const campusPerformance: CampusPerformance[] = [
  { campus: 'Lagos', students: 286, completionRate: 91, averageScore: 79 },
  { campus: 'Abuja', students: 241, completionRate: 88, averageScore: 77 },
  { campus: 'Enugu', students: 174, completionRate: 86, averageScore: 75 },
  { campus: 'Aba', students: 162, completionRate: 84, averageScore: 73 },
  { campus: 'Asaba', students: 138, completionRate: 82, averageScore: 72 },
  { campus: 'Benin', students: 151, completionRate: 80, averageScore: 71 },
  { campus: 'Osogbo', students: 132, completionRate: 78, averageScore: 69 },
]

export const recentActivity: ActivityItem[] = [
  { id: 'act-01', type: 'submission', title: 'Amara submitted August Core Skills Sprint', description: '75 of 85 points · TypeScript', timestamp: '2026-08-14T23:37:00+01:00', relativeTime: '28 min ago', tone: 'green', studentId: 'stu-002', assessmentId: 'assess-aug-core' },
  { id: 'act-02', type: 'assessment', title: 'DSA Pathways is ready to publish', description: '68 fellows assigned · Lagos campus', timestamp: '2026-08-14T22:55:00+01:00', relativeTime: '1 hr ago', tone: 'blue', assessmentId: 'assess-dsa-pathways' },
  { id: 'act-03', type: 'student', title: 'Daniel may need support', description: 'No activity for 3 days and two incomplete checkpoints', timestamp: '2026-08-14T19:30:00+01:00', relativeTime: '4 hrs ago', tone: 'amber', studentId: 'stu-006' },
  { id: 'act-04', type: 'result', title: 'JavaScript Foundations results released', description: '91 submissions · 78% average score', timestamp: '2026-08-14T16:12:00+01:00', relativeTime: '8 hrs ago', tone: 'violet', assessmentId: 'assess-js-foundations' },
  { id: 'act-05', type: 'system', title: 'Execution workers are healthy', description: 'Median run time 1.2 seconds · 0 failed jobs', timestamp: '2026-08-14T15:05:00+01:00', relativeTime: '9 hrs ago', tone: 'blue' },
  { id: 'act-06', type: 'student', title: '24 August Trials fellows joined', description: 'Accounts provisioned for Abuja campus', timestamp: '2026-08-14T11:40:00+01:00', relativeTime: '12 hrs ago', tone: 'green' },
]

export const notifications: NotificationItem[] = [
  { id: 'note-01', title: 'Assessment now live', body: 'August Core Skills Sprint is open until Sunday at 8:00 PM.', timestamp: '2026-08-15T08:00:00+01:00', read: false, type: 'assessment' },
  { id: 'note-02', title: 'Result released', body: 'Your JavaScript Foundations Check result is ready to view.', timestamp: '2026-08-11T09:05:00+01:00', read: false, type: 'result' },
  { id: 'note-03', title: 'Keep your streak alive', body: 'Complete today’s warm-up challenge to reach a 13-day streak.', timestamp: '2026-08-14T17:00:00+01:00', read: true, type: 'reminder' },
  { id: 'note-04', title: 'Campus demo day', body: 'Project demos begin Friday at 2:00 PM in the collaboration hall.', timestamp: '2026-08-13T12:30:00+01:00', read: true, type: 'announcement' },
]

export const topPerformers = students.slice(0, 5)
export const atRiskStudents = students.filter((student) => student.status === 'at-risk')

export const getQuestionById = (questionId: string) => questions.find((question) => question.id === questionId)
export const getAssessmentById = (assessmentId: string) => assessments.find((assessment) => assessment.id === assessmentId)
export const getStudentById = (studentId: string) => students.find((student) => student.id === studentId)
export const getAssessmentQuestions = (assessmentId: string) => {
  const assessment = getAssessmentById(assessmentId)
  return assessment ? assessment.questionIds.map(getQuestionById).filter((question): question is CodingQuestion => Boolean(question)) : []
}

// Friendly aliases for components that prefer explicit mock-data naming.
export const mockAssessments = assessments
export const mockQuestions = questions
export const mockStudents = students
export const mockSubmissions = submissions

// Concise collection names used by the dashboard and assessment-builder views.
export const questionBank = questions
export const activityFeed = recentActivity
export const scoreTrend = performanceTrend
export const performanceByTopic = skillPerformance
export const campuses = ['All campuses', 'Aba', 'Abuja', 'Asaba', 'Benin', 'Enugu', 'Lagos', 'Osogbo', 'Remote'] as const
export const cohorts = ['August Trials', 'Cohort 4', 'Cohort 3'] as const
