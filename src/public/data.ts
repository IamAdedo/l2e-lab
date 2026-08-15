import type {
  DailyChallenge,
  LearningExample,
  LearningDifficulty,
  LearningTrack,
  PublicProject,
  PythonTechniqueScope,
  PythonTechniqueTarget,
  ShowcaseItem,
  StarterFile,
  ValidationRule,
} from './types'

export const learningTrackMeta: Record<LearningTrack, { label: string; shortLabel: string; description: string; color: string }> = {
  python: {
    label: 'Python',
    shortLabel: 'PY',
    description: 'Solve practical problems and build useful tools with Python.',
    color: '#246bfd',
  },
  react: {
    label: 'React',
    shortLabel: 'RX',
    description: 'Turn ideas into responsive, interactive web interfaces.',
    color: '#06a8d8',
  },
  javascript: {
    label: 'JavaScript',
    shortLabel: 'JS',
    description: 'Learn the language of the web through playful mini builds.',
    color: '#7557ff',
  },
}

const pythonFile = (code: string): StarterFile[] => [{ path: '/main.py', code: code.trim(), language: 'python' }]

const reactFiles = (code: string, css: string): StarterFile[] => [
  { path: '/App.js', code: code.trim(), language: 'jsx' },
  { path: '/styles.css', code: css.trim(), language: 'css' },
]

const javascriptFiles = (code: string, html = '<div id="app"></div>'): StarterFile[] => [
  { path: '/index.js', code: code.trim(), language: 'javascript' },
  { path: '/index.html', code: html.trim(), language: 'html' },
]

const baseCss = `
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; font-family: Inter, system-ui, sans-serif; background: #f4f8ff; color: #102348; }
button, input { font: inherit; }
`

const pyCheck = (id: string, label: string, expression: string, expected: string | number | boolean | null | Array<string | number | boolean | null>, points = 25, hidden = false): ValidationRule => ({
  id,
  kind: 'python-expression',
  label,
  expression,
  expected,
  points,
  hidden,
})

const stdoutCheck = (id: string, label: string, expected: string, points = 25, caseSensitive = true): ValidationRule => ({
  id,
  kind: 'stdout-contains',
  label,
  expected,
  points,
  caseSensitive,
})

const jsCheck = (id: string, label: string, expression: string, expected: string | number | boolean | null | Array<string | number | boolean | null>, points = 25, hidden = false): ValidationRule => ({
  id,
  kind: 'javascript-expression',
  label,
  expression,
  expected,
  points,
  hidden,
})

const sourceCheck = (id: string, label: string, file: string, tokens: string[], points = 25, match: 'all' | 'any' = 'all'): ValidationRule => ({
  id,
  kind: 'source-contains',
  label,
  file,
  tokens,
  points,
  match,
})

const previewCheck = (id: string, label: string, expected: string, points = 25, selector?: string): ValidationRule => ({
  id,
  kind: 'preview-text',
  label,
  expected,
  selector,
  points,
})

const technique = (target: PythonTechniqueTarget['target'], name: string, feedback: string): PythonTechniqueTarget => ({
  target,
  name,
  feedback,
})

const pyTechniqueCheck = (
  id: string,
  label: string,
  options: { scope?: PythonTechniqueScope; required?: PythonTechniqueTarget[]; forbidden?: PythonTechniqueTarget[] },
  points = 20,
): ValidationRule => ({
  id,
  kind: 'python-technique',
  label,
  points,
  ...options,
})

function displayExpected(value: unknown): string {
  if (typeof value === 'string') return value
  if (value === null) return 'None / null'
  return JSON.stringify(value)
}

function examplesFromValidation(validation: ValidationRule[]): LearningExample[] {
  return validation
    .flatMap((rule) => !rule.hidden && (rule.kind === 'python-expression' || rule.kind === 'javascript-expression') ? [rule] : [])
    .slice(0, 2)
    .map((rule, index) => ({
      label: index === 0 ? 'Example' : `Example ${index + 1}`,
      input: rule.expression,
      expectedOutput: displayExpected(rule.expected),
      explanation: rule.label,
    }))
}

type ProjectSeed = Omit<PublicProject, 'instructions' | 'examples'> & Partial<Pick<PublicProject, 'instructions' | 'examples'>>

const projectSeeds: ProjectSeed[] = [
  {
    id: 'project-python-tip-splitter',
    slug: 'smart-tip-splitter',
    title: 'Smart Tip Splitter',
    kicker: 'Your first useful Python tool',
    summary: 'Calculate a tip and split a restaurant bill fairly between friends.',
    description: 'Build the calculation engine for a tiny bill-splitting app. You will turn percentages into money, handle a group size, and format the final result so it is ready to show to a user.',
    track: 'python',
    difficulty: 'Beginner',
    durationMinutes: 25,
    skills: ['Functions', 'Arithmetic', 'Rounding'],
    requirements: [
      { id: 'tip-1', title: 'Calculate the tip', description: 'Return the tip amount from a bill and percentage.' },
      { id: 'tip-2', title: 'Split the total', description: 'Add the tip and divide the total by the number of people.' },
      { id: 'tip-3', title: 'Keep money tidy', description: 'Round currency values to two decimal places.' },
    ],
    starterFiles: pythonFile(`
def calculate_tip(bill, tip_percent):
    # Return only the tip amount.
    pass

def split_bill(bill, tip_percent, people):
    # Return how much each person should pay.
    pass

print("Each person pays:", split_bill(120, 20, 3))
`),
    validation: [
      pyTechniqueCheck('tip-technique', 'Keeps the solution in reusable functions', {
        required: [technique('ast-node', 'FunctionDef', 'Keep both calculations inside functions.')],
      }),
      pyCheck('tip-basic', 'Calculates a 15% tip', 'round(calculate_tip(100, 15), 2)', 15),
      pyCheck('tip-split', 'Splits bill plus tip', 'round(split_bill(120, 20, 3), 2)', 48),
      pyCheck('tip-hidden', 'Handles a different group', 'round(split_bill(87.5, 12, 4), 2)', 24.5, 50, true),
    ],
    expectedOutcome: 'Running the program prints “Each person pays: 48.0”.',
    hints: ['A percentage can be written as tip_percent / 100.', 'Calculate the full total before dividing it.'],
    theme: { accent: '#246bfd', accentSoft: '#dce9ff', surface: '#f5f9ff', illustration: 'utility', emoji: '🧾' },
    featured: true,
  },
  {
    id: 'project-python-gradebook',
    slug: 'class-gradebook',
    title: 'Class Gradebook',
    kicker: 'Turn scores into insights',
    summary: 'Create a grade calculator that reports letter grades and a class average.',
    description: 'Teachers should not need to calculate every result by hand. Build reusable functions that classify a score and summarize a list of scores.',
    track: 'python',
    difficulty: 'Beginner',
    durationMinutes: 35,
    skills: ['Conditionals', 'Lists', 'Functions'],
    requirements: [
      { id: 'grade-1', title: 'Assign letter grades', description: 'Use A for 70+, B for 60+, C for 50+, D for 45+, and F below 45.' },
      { id: 'grade-2', title: 'Find the average', description: 'Return the arithmetic mean of a non-empty score list.' },
      { id: 'grade-3', title: 'Print a report', description: 'Show the average and its matching letter grade.' },
    ],
    starterFiles: pythonFile(`
def letter_grade(score):
    # Return A, B, C, D, or F.
    pass

def class_average(scores):
    pass

scores = [72, 61, 88, 55, 79]
average = class_average(scores)
print(f"Class average: {average:.1f} ({letter_grade(average)})")
`),
    validation: [
      pyTechniqueCheck('grade-technique', 'Uses conditional branches for grade boundaries', {
        required: [technique('ast-node', 'If', 'Use if/elif/else to decide the letter grade.')],
      }),
      pyCheck('grade-a', 'Recognises an A', 'letter_grade(84)', 'A'),
      pyCheck('grade-boundary', 'Handles grade boundaries', 'letter_grade(60)', 'B'),
      pyCheck('grade-average', 'Calculates the class average', 'round(class_average([70, 80, 90]), 1)', 80, 50, true),
    ],
    expectedOutcome: 'The sample report shows an average of 71.0 and an A.',
    hints: ['Check the highest grade boundary first.', 'Use sum(scores) and len(scores).'],
    theme: { accent: '#0d8f73', accentSoft: '#d9f6ee', surface: '#f3fcf9', illustration: 'data', emoji: '📚' },
    featured: true,
  },
  {
    id: 'project-python-password',
    slug: 'password-strength-lab',
    title: 'Password Strength Lab',
    kicker: 'Think like a security engineer',
    summary: 'Inspect passwords and explain whether they are weak, fair, or strong.',
    description: 'Build a clear, rule-based password checker. The checker scores length and character variety, then turns the score into a human-friendly label.',
    track: 'python',
    difficulty: 'Beginner',
    durationMinutes: 40,
    skills: ['Strings', 'Booleans', 'Loops'],
    requirements: [
      { id: 'pass-1', title: 'Check character types', description: 'Look for uppercase, lowercase, numbers, and symbols.' },
      { id: 'pass-2', title: 'Award strength points', description: 'Give one point for length of 8+ and one for each character type.' },
      { id: 'pass-3', title: 'Return a label', description: '0–2 is Weak, 3–4 is Fair, and 5 is Strong.' },
    ],
    starterFiles: pythonFile(`
def password_score(password):
    # Return a score from 0 to 5.
    pass

def strength_label(password):
    pass

sample = "Learn2Earn!2026"
print(sample, "is", strength_label(sample))
`),
    validation: [
      pyTechniqueCheck('password-technique', 'Inspects the password characters', {
        required: [technique('ast-node', 'GeneratorExp', 'Use generator character checks with any(...).')],
      }),
      pyCheck('password-weak', 'Flags a weak password', 'strength_label("hello")', 'Weak'),
      pyCheck('password-strong', 'Recognises a strong password', 'strength_label("Learn2Earn!2026")', 'Strong'),
      pyCheck('password-score', 'Scores every rule', 'password_score("SafePass9!")', 5, 50, true),
    ],
    expectedOutcome: 'The program reports that Learn2Earn!2026 is Strong.',
    hints: ['any(character.isupper() for character in password) checks uppercase.', 'A symbol is a character that is not alphanumeric.'],
    theme: { accent: '#7557ff', accentSoft: '#e9e4ff', surface: '#f8f6ff', illustration: 'terminal', emoji: '🔐' },
  },
  {
    id: 'project-python-expenses',
    slug: 'pocket-expense-tracker',
    title: 'Pocket Expense Tracker',
    kicker: 'Make money data make sense',
    summary: 'Summarize daily spending and find the category taking the most money.',
    description: 'Work with a list of expense dictionaries to calculate totals by category and identify the biggest area of spending.',
    track: 'python',
    difficulty: 'Intermediate',
    durationMinutes: 55,
    skills: ['Dictionaries', 'Aggregation', 'Data modelling'],
    requirements: [
      { id: 'expense-1', title: 'Total one category', description: 'Add amounts whose category matches the requested category.' },
      { id: 'expense-2', title: 'Build a summary', description: 'Return a dictionary containing every category total.' },
      { id: 'expense-3', title: 'Find the biggest category', description: 'Return the category with the highest total.' },
    ],
    starterFiles: pythonFile(`
expenses = [
    {"category": "Food", "amount": 18.5},
    {"category": "Transport", "amount": 7.0},
    {"category": "Food", "amount": 12.0},
]

def total_by_category(items, category):
    pass

def category_summary(items):
    pass

def biggest_category(items):
    pass

print(category_summary(expenses))
`),
    validation: [
      pyTechniqueCheck('expense-technique', 'Builds totals with a for loop', {
        required: [technique('ast-node', 'For', 'Use a for loop to visit each expense.')],
        forbidden: [technique('call', 'sum', 'Do not use sum() here; practise maintaining a running category total.')],
      }),
      pyCheck('expense-total', 'Totals matching expenses', 'total_by_category(expenses, "Food")', 30.5),
      pyCheck('expense-summary', 'Creates every category total', 'category_summary(expenses).get("Transport")', 7),
      pyCheck('expense-biggest', 'Finds the biggest category', 'biggest_category(expenses)', 'Food', 50, true),
    ],
    expectedOutcome: 'The sample summary contains Food: 30.5 and Transport: 7.0.',
    hints: ['Use a running dictionary and dict.get(category, 0).', 'max(summary, key=summary.get) finds the largest value key.'],
    theme: { accent: '#ed7d31', accentSoft: '#ffeadc', surface: '#fff8f2', illustration: 'data', emoji: '💸' },
    featured: true,
  },
  {
    id: 'project-python-quiz',
    slug: 'quiz-game-engine',
    title: 'Quiz Game Engine',
    kicker: 'Power a playful learning game',
    summary: 'Create the scoring logic behind a multiple-choice quiz.',
    description: 'Build the reusable heart of a quiz: compare submitted answers, award points, and return encouraging feedback based on performance.',
    track: 'python',
    difficulty: 'Beginner',
    durationMinutes: 35,
    skills: ['Lists', 'zip()', 'Conditionals'],
    requirements: [
      { id: 'quiz-1', title: 'Compare answers', description: 'Award one point for each matching answer.' },
      { id: 'quiz-2', title: 'Handle different cases', description: 'Treat A and a as the same answer.' },
      { id: 'quiz-3', title: 'Give feedback', description: 'Return Perfect, Great try, or Keep practising.' },
    ],
    starterFiles: pythonFile(`
def score_answers(answers, answer_key):
    pass

def feedback(score, total):
    pass

key = ["A", "C", "B", "D"]
player = ["a", "C", "D", "D"]
score = score_answers(player, key)
print(f"You scored {score}/{len(key)} — {feedback(score, len(key))}")
`),
    validation: [
      pyTechniqueCheck('quiz-technique', 'Pairs answers with zip()', {
        required: [technique('call', 'zip', 'Use zip() to pair each submitted answer with the answer key.')],
      }),
      pyCheck('quiz-score', 'Scores matching answers', 'score_answers(["a", "B", "c"], ["A", "B", "D"])', 2),
      pyCheck('quiz-perfect', 'Celebrates a perfect score', 'feedback(5, 5)', 'Perfect'),
      pyCheck('quiz-low', 'Encourages another attempt', 'feedback(1, 5)', 'Keep practising', 50, true),
    ],
    expectedOutcome: 'The sample player scores 3/4 and receives “Great try”.',
    hints: ['zip(answers, answer_key) pairs answers together.', 'Compare both values after calling .upper().'],
    theme: { accent: '#e44772', accentSoft: '#ffe3ec', surface: '#fff7fa', illustration: 'game', emoji: '🎯' },
  },
  {
    id: 'project-python-library',
    slug: 'mini-library-manager',
    title: 'Mini Library Manager',
    kicker: 'Organize a digital bookshelf',
    summary: 'Search, borrow, and return books in a small library catalogue.',
    description: 'Model a real library with dictionaries. Users should be able to find available titles and safely change a book’s borrowed state.',
    track: 'python',
    difficulty: 'Intermediate',
    durationMinutes: 60,
    skills: ['Nested data', 'Mutation', 'Search'],
    requirements: [
      { id: 'library-1', title: 'List available books', description: 'Return titles that are not currently borrowed.' },
      { id: 'library-2', title: 'Borrow by title', description: 'Mark a matching available book as borrowed and return True.' },
      { id: 'library-3', title: 'Reject invalid borrowing', description: 'Return False for missing or already borrowed books.' },
    ],
    starterFiles: pythonFile(`
books = [
    {"title": "Purple Hibiscus", "borrowed": False},
    {"title": "Things Fall Apart", "borrowed": True},
    {"title": "Half of a Yellow Sun", "borrowed": False},
]

def available_titles(catalogue):
    pass

def borrow_book(catalogue, title):
    pass

print("Available:", available_titles(books))
`),
    validation: [
      pyTechniqueCheck('library-technique', 'Searches the catalogue with a for loop', {
        required: [technique('ast-node', 'For', 'Use a for loop to inspect books one at a time.')],
      }),
      pyCheck('library-list', 'Lists only available titles', 'available_titles(books)', ['Purple Hibiscus', 'Half of a Yellow Sun']),
      pyCheck('library-borrow', 'Borrows an available book', 'borrow_book([{"title": "A", "borrowed": False}], "A")', true),
      pyCheck('library-reject', 'Rejects an already borrowed book', 'borrow_book([{"title": "A", "borrowed": True}], "A")', false, 50, true),
    ],
    expectedOutcome: 'The catalogue prints the two books that can still be borrowed.',
    hints: ['Loop through each dictionary and compare its title.', 'Change book["borrowed"] only when it is currently False.'],
    theme: { accent: '#8b5a2b', accentSoft: '#f2e5d6', surface: '#fffaf4', illustration: 'cards', emoji: '📖' },
  },
  {
    id: 'project-python-text',
    slug: 'story-text-analyser',
    title: 'Story Text Analyser',
    kicker: 'Discover patterns in words',
    summary: 'Count words, estimate reading time, and find the most common word.',
    description: 'Turn a paragraph into useful reading statistics. Clean punctuation and letter case so words are counted consistently.',
    track: 'python',
    difficulty: 'Intermediate',
    durationMinutes: 50,
    skills: ['String methods', 'Frequency maps', 'Sorting'],
    requirements: [
      { id: 'text-1', title: 'Normalize words', description: 'Ignore case and common punctuation.' },
      { id: 'text-2', title: 'Count correctly', description: 'Return the number of words in a passage.' },
      { id: 'text-3', title: 'Find the top word', description: 'Return the most frequently occurring word.' },
    ],
    starterFiles: pythonFile(`
import string

def clean_words(text):
    pass

def word_count(text):
    pass

def most_common_word(text):
    pass

story = "Code, learn, build — then code some more!"
print("Words:", word_count(story))
print("Most common:", most_common_word(story))
`),
    validation: [
      pyTechniqueCheck('text-technique', 'Builds the frequency map manually', {
        required: [technique('ast-node', 'For', 'Use a for loop to count cleaned words.')],
        forbidden: [technique('call', 'Counter', 'Do not use Counter() in this project; build the dictionary yourself.')],
      }),
      pyCheck('text-clean', 'Normalizes case and punctuation', 'clean_words("Hello, HELLO world!")', ['hello', 'hello', 'world']),
      pyCheck('text-count', 'Counts every word', 'word_count("one two three four")', 4),
      pyCheck('text-common', 'Finds the most frequent word', 'most_common_word("go learn go build go")', 'go', 50, true),
    ],
    expectedOutcome: 'The sample passage reports 8 words and “code” as the most common.',
    hints: ['string.punctuation contains common punctuation characters.', 'A dictionary can track how many times each word appears.'],
    theme: { accent: '#1b7796', accentSoft: '#dff4fb', surface: '#f4fbfd', illustration: 'data', emoji: '📝' },
  },
  {
    id: 'project-python-habits',
    slug: 'habit-streak-tracker',
    title: 'Habit Streak Tracker',
    kicker: 'Make consistency visible',
    summary: 'Calculate current and best streaks from a habit check-in history.',
    description: 'A streak can make progress feel real. Write functions that inspect a list of completed and missed days without losing track of the longest run.',
    track: 'python',
    difficulty: 'Intermediate',
    durationMinutes: 45,
    skills: ['State in loops', 'Booleans', 'Sequences'],
    requirements: [
      { id: 'habit-1', title: 'Find the current streak', description: 'Count consecutive completed days from the end of the history.' },
      { id: 'habit-2', title: 'Find the best streak', description: 'Return the longest run anywhere in the history.' },
      { id: 'habit-3', title: 'Handle empty history', description: 'Both functions should return 0 for an empty list.' },
    ],
    starterFiles: pythonFile(`
def current_streak(history):
    pass

def best_streak(history):
    pass

week = [True, True, False, True, True, True]
print("Current streak:", current_streak(week))
print("Personal best:", best_streak(week))
`),
    validation: [
      pyTechniqueCheck('habit-technique', 'Tracks streaks inside a loop', {
        required: [technique('ast-node', 'For', 'Use a for loop and running counters to track streaks.')],
        forbidden: [technique('call', 'max', 'Do not use max(); update the best streak as you loop.')],
      }),
      pyCheck('habit-current', 'Finds the ending streak', 'current_streak([True, False, True, True])', 2),
      pyCheck('habit-best', 'Finds the longest streak', 'best_streak([True, True, False, True, True, True, False])', 3),
      pyCheck('habit-empty', 'Handles an empty history', 'best_streak([])', 0, 50, true),
    ],
    expectedOutcome: 'The sample week shows a current and personal-best streak of 3 days.',
    hints: ['For the current streak, loop over reversed(history).', 'Reset the running streak whenever a day is False.'],
    theme: { accent: '#0e9a59', accentSoft: '#d9f8e8', surface: '#f3fcf7', illustration: 'dashboard', emoji: '🔥' },
  },
  {
    id: 'project-python-contacts',
    slug: 'contact-search',
    title: 'Contact Search',
    kicker: 'Build a tiny people finder',
    summary: 'Search a contact list by partial name and return clean matching records.',
    description: 'Create the search logic for a contact book. The search should be case-insensitive and should not modify the original data.',
    track: 'python',
    difficulty: 'Beginner',
    durationMinutes: 35,
    skills: ['List comprehensions', 'Dictionaries', 'Search'],
    requirements: [
      { id: 'contact-1', title: 'Search partial names', description: 'A query can match any part of a name.' },
      { id: 'contact-2', title: 'Ignore letter case', description: 'ADA should match Ada.' },
      { id: 'contact-3', title: 'Return all matches', description: 'Return matching dictionaries in their original order.' },
    ],
    starterFiles: pythonFile(`
contacts = [
    {"name": "Ada Okafor", "phone": "0801 234 5678"},
    {"name": "Tobi Adeyemi", "phone": "0802 345 6789"},
    {"name": "Amaka Obi", "phone": "0803 456 7890"},
]

def search_contacts(items, query):
    pass

print(search_contacts(contacts, "ada"))
`),
    validation: [
      pyTechniqueCheck('contact-technique', 'Collects matches with a list comprehension', {
        required: [technique('ast-node', 'ListComp', 'Use a list comprehension to collect matching contacts.')],
      }),
      pyCheck('contact-partial', 'Matches part of a name', 'len(search_contacts(contacts, "obi"))', 1),
      pyCheck('contact-case', 'Ignores case', 'search_contacts(contacts, "ADA")[0]["name"]', 'Ada Okafor'),
      pyCheck('contact-none', 'Returns an empty list when nothing matches', 'search_contacts(contacts, "Zainab")', [], 50, true),
    ],
    expectedOutcome: 'The sample search returns Ada Okafor’s contact record.',
    hints: ['Call .lower() on both the query and the name.', 'A list comprehension is a concise way to collect matches.'],
    theme: { accent: '#2872b8', accentSoft: '#deefff', surface: '#f5faff', illustration: 'utility', emoji: '👥' },
  },
  {
    id: 'project-python-shop',
    slug: 'mini-shop-cart',
    title: 'Mini Shop Cart',
    kicker: 'Write checkout logic that works',
    summary: 'Calculate subtotals, discounts, and a final total for a simple cart.',
    description: 'Model a shopping basket with item dictionaries. Add line totals and apply a discount only when the cart reaches the qualifying amount.',
    track: 'python',
    difficulty: 'Intermediate',
    durationMinutes: 55,
    skills: ['Data modelling', 'Functions', 'Business rules'],
    requirements: [
      { id: 'shop-1', title: 'Calculate line totals', description: 'Multiply each price by its quantity.' },
      { id: 'shop-2', title: 'Calculate the subtotal', description: 'Add all line totals.' },
      { id: 'shop-3', title: 'Apply a bulk discount', description: 'Take 10% off subtotals of 100 or more.' },
    ],
    starterFiles: pythonFile(`
cart = [
    {"name": "Notebook", "price": 12.5, "quantity": 3},
    {"name": "Backpack", "price": 48, "quantity": 1},
]

def cart_subtotal(items):
    pass

def checkout_total(items):
    pass

print(f"Pay ₦{checkout_total(cart):.2f}")
`),
    validation: [
      pyTechniqueCheck('shop-technique', 'Calculates line totals with a for loop', {
        required: [technique('ast-node', 'For', 'Use a for loop to visit every cart item.')],
        forbidden: [technique('call', 'sum', 'Do not use sum() for this build; practise a running subtotal.')],
      }),
      pyCheck('shop-subtotal', 'Adds price times quantity', 'cart_subtotal(cart)', 85.5),
      pyCheck('shop-no-discount', 'Leaves small carts unchanged', 'checkout_total([{"price": 20, "quantity": 2}])', 40),
      pyCheck('shop-discount', 'Applies the bulk discount', 'checkout_total([{"price": 50, "quantity": 2}])', 90, 50, true),
    ],
    expectedOutcome: 'The sample cart prints a total of ₦85.50.',
    hints: ['Use item["price"] * item["quantity"] for each line.', 'A subtotal of exactly 100 receives the discount.'],
    theme: { accent: '#df5b25', accentSoft: '#ffe5da', surface: '#fff8f5', illustration: 'cards', emoji: '🛒' },
  },
  {
    id: 'project-react-profile',
    slug: 'profile-card-studio',
    title: 'Profile Card Studio',
    kicker: 'Your first polished React component',
    summary: 'Build a reusable learner profile card with skills and a follow button.',
    description: 'Create a friendly profile card for the community showcase. Pass learner details as props, map over skills, and make the follow state interactive.',
    track: 'react',
    difficulty: 'Beginner',
    durationMinutes: 45,
    skills: ['Components', 'Props', 'useState'],
    requirements: [
      { id: 'profile-1', title: 'Create a ProfileCard', description: 'Move the card markup into a reusable component.' },
      { id: 'profile-2', title: 'Render every skill', description: 'Use map to create one chip per skill.' },
      { id: 'profile-3', title: 'Toggle follow state', description: 'The button switches between Follow and Following.' },
    ],
    starterFiles: reactFiles(`
import { useState } from 'react';
import './styles.css';

const learner = {
  name: 'Amina Yusuf',
  role: 'Python Explorer',
  skills: ['Python', 'Problem solving', 'UI curious']
};

function ProfileCard({ learner }) {
  // Add the follow state and finish this component.
  return <main className="card"><p>Build Amina's profile card here.</p></main>;
}

export default function App() {
  return <ProfileCard learner={learner} />;
}
`, `${baseCss}
body { display: grid; place-items: center; padding: 24px; }
.card { width: min(100%, 360px); background: white; padding: 28px; border-radius: 24px; box-shadow: 0 18px 50px #1d5fd11c; }
`),
    validation: [
      sourceCheck('profile-component', 'Creates the reusable profile component', '/App.js', ['function ProfileCard', 'learner.skills.map']),
      sourceCheck('profile-state', 'Uses state for the follow button', '/App.js', ['useState', 'setFollowing']),
      previewCheck('profile-name', 'Shows the learner name', 'Amina Yusuf', 50),
    ],
    expectedOutcome: 'A polished card shows Amina’s name, role, skill chips, and an interactive Follow button.',
    hints: ['Start with const [following, setFollowing] = useState(false).', 'Remember to add a key to every skill chip.'],
    theme: { accent: '#08a5ca', accentSoft: '#d9f6fc', surface: '#f3fcfe', illustration: 'cards', emoji: '🪪' },
    featured: true,
  },
  {
    id: 'project-react-tasks',
    slug: 'study-task-board',
    title: 'Study Task Board',
    kicker: 'Make a plan people can use',
    summary: 'Create, complete, and filter learning tasks in an interactive board.',
    description: 'Build a focused study planner with React state. Learners should be able to add a task, mark it done, and switch between all, active, and finished views.',
    track: 'react',
    difficulty: 'Intermediate',
    durationMinutes: 75,
    skills: ['State arrays', 'Forms', 'Derived UI'],
    requirements: [
      { id: 'tasks-1', title: 'Add tasks', description: 'Submit a non-empty task from the form.' },
      { id: 'tasks-2', title: 'Toggle completion', description: 'Clicking a task changes its finished state.' },
      { id: 'tasks-3', title: 'Filter the list', description: 'Support All, Active, and Finished filters.' },
    ],
    starterFiles: reactFiles(`
import { useState } from 'react';
import './styles.css';

const starterTasks = [
  { id: 1, title: 'Finish Python loops lesson', done: true },
  { id: 2, title: 'Build a React component', done: false }
];

export default function App() {
  const [tasks, setTasks] = useState(starterTasks);
  const [filter, setFilter] = useState('all');
  // Build the form, filters, and task list.
  return <main className="board"><h1>My study board</h1></main>;
}
`, `${baseCss}
body { padding: 32px; }
.board { max-width: 680px; margin: auto; background: white; padding: 32px; border-radius: 28px; box-shadow: 0 18px 60px #245fb51a; }
`),
    validation: [
      sourceCheck('tasks-state', 'Stores tasks and filter in state', '/App.js', ['setTasks', 'setFilter']),
      sourceCheck('tasks-form', 'Handles form submission', '/App.js', ['onSubmit', 'preventDefault']),
      previewCheck('tasks-heading', 'Keeps the board heading visible', 'My study board', 50),
    ],
    expectedOutcome: 'A clean task board lets a learner add, finish, and filter their study tasks.',
    hints: ['Use tasks.map to render the list.', 'Derive filteredTasks before the return statement.'],
    theme: { accent: '#246bfd', accentSoft: '#dce9ff', surface: '#f5f9ff', illustration: 'dashboard', emoji: '✅' },
  },
  {
    id: 'project-react-quiz',
    slug: 'react-quiz-room',
    title: 'React Quiz Room',
    kicker: 'Build a complete interaction flow',
    summary: 'Show one question at a time, track answers, and reveal a final score.',
    description: 'Create a small quiz experience with progress, selectable answers, immediate movement to the next question, and a restartable results screen.',
    track: 'react',
    difficulty: 'Intermediate',
    durationMinutes: 90,
    skills: ['State machines', 'Conditional render', 'Events'],
    requirements: [
      { id: 'react-quiz-1', title: 'Show one question', description: 'Render the question at the active index.' },
      { id: 'react-quiz-2', title: 'Track the score', description: 'Increment only when the correct option is selected.' },
      { id: 'react-quiz-3', title: 'Show and restart results', description: 'After the last question, show the result and a Try again button.' },
    ],
    starterFiles: reactFiles(`
import { useState } from 'react';
import './styles.css';

const questions = [
  { text: 'Which keyword creates a function?', options: ['class', 'def', 'let'], answer: 'def' },
  { text: 'Which hook stores component state?', options: ['useState', 'useStyle', 'usePage'], answer: 'useState' },
  { text: 'What does CSS control?', options: ['Data', 'Presentation', 'Servers'], answer: 'Presentation' }
];

export default function App() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  return <main className="quiz"><h1>Quick knowledge check</h1></main>;
}
`, `${baseCss}
body { display: grid; place-items: center; padding: 24px; }
.quiz { width: min(100%, 620px); background: #102348; color: white; padding: 36px; border-radius: 28px; }
button { display: block; width: 100%; margin-top: 12px; padding: 14px; border: 0; border-radius: 12px; cursor: pointer; }
`),
    validation: [
      sourceCheck('rq-state', 'Tracks question and score state', '/App.js', ['setCurrent', 'setScore']),
      sourceCheck('rq-options', 'Renders answer options from data', '/App.js', ['questions[current]', '.map']),
      previewCheck('rq-heading', 'Shows the quiz heading', 'Quick knowledge check', 50),
    ],
    expectedOutcome: 'A three-question quiz advances on each answer and finishes with a score and restart action.',
    hints: ['Create a handleAnswer(option) function.', 'The result view appears when current >= questions.length.'],
    theme: { accent: '#7656ff', accentSoft: '#e9e3ff', surface: '#f8f6ff', illustration: 'game', emoji: '🧠' },
  },
  {
    id: 'project-react-budget',
    slug: 'budget-insight-dashboard',
    title: 'Budget Insight Dashboard',
    kicker: 'Turn an array into a story',
    summary: 'Build a responsive spending dashboard from a set of transactions.',
    description: 'Use reusable components and array methods to summarize a monthly budget. Show income, spending, balance, and a category breakdown that reacts to the data.',
    track: 'react',
    difficulty: 'Advanced',
    durationMinutes: 110,
    skills: ['Component composition', 'reduce()', 'Data visualization'],
    requirements: [
      { id: 'budget-1', title: 'Calculate summary values', description: 'Derive income, expenses, and balance from transactions.' },
      { id: 'budget-2', title: 'Create reusable stat cards', description: 'Use the same component for all three headline numbers.' },
      { id: 'budget-3', title: 'Render category progress', description: 'Show a labelled bar for each spending category.' },
    ],
    starterFiles: reactFiles(`
import './styles.css';

const transactions = [
  { id: 1, label: 'Freelance project', category: 'Income', amount: 180000 },
  { id: 2, label: 'Transport', category: 'Transport', amount: -18000 },
  { id: 3, label: 'Internet', category: 'Utilities', amount: -22000 },
  { id: 4, label: 'Lunches', category: 'Food', amount: -28500 }
];

function StatCard({ label, value }) {
  return <article className="stat"><span>{label}</span><strong>{value}</strong></article>;
}

export default function App() {
  // Derive your totals and category data here.
  return <main className="dashboard"><p className="eyebrow">AUGUST OVERVIEW</p><h1>My money, clearly.</h1></main>;
}
`, `${baseCss}
body { padding: 30px; background: #eef5ff; }
.dashboard { max-width: 900px; margin: auto; }
.eyebrow { color: #246bfd; font-weight: 800; letter-spacing: .12em; }
.stat { background: white; padding: 22px; border-radius: 20px; }
`),
    validation: [
      sourceCheck('budget-reduce', 'Derives values from transaction data', '/App.js', ['transactions', 'reduce']),
      sourceCheck('budget-cards', 'Uses the reusable StatCard', '/App.js', ['function StatCard', '<StatCard']),
      previewCheck('budget-copy', 'Shows the dashboard headline', 'My money, clearly.', 50),
    ],
    expectedOutcome: 'A responsive dashboard clearly shows totals and a visual breakdown of monthly spending.',
    hints: ['Positive amounts are income; negative amounts are spending.', 'Use Intl.NumberFormat for clean Naira formatting.'],
    theme: { accent: '#0c9869', accentSoft: '#daf7ed', surface: '#f3fcf9', illustration: 'dashboard', emoji: '📊' },
    featured: true,
  },
  {
    id: 'project-react-courses',
    slug: 'course-finder',
    title: 'Course Finder',
    kicker: 'Help learners find their next step',
    summary: 'Search and filter a responsive catalogue of learning courses.',
    description: 'Build a small discovery page that filters course cards by a live search query and track selection, with a thoughtful empty state.',
    track: 'react',
    difficulty: 'Intermediate',
    durationMinutes: 70,
    skills: ['Controlled inputs', 'Filtering', 'Empty states'],
    requirements: [
      { id: 'course-1', title: 'Search by title', description: 'Filter immediately as the learner types.' },
      { id: 'course-2', title: 'Filter by track', description: 'Support All, Python, React, and JavaScript.' },
      { id: 'course-3', title: 'Design an empty state', description: 'Explain when no courses match and offer a reset action.' },
    ],
    starterFiles: reactFiles(`
import { useState } from 'react';
import './styles.css';

const courses = [
  { id: 1, title: 'Python Foundations', track: 'Python', lessons: 24 },
  { id: 2, title: 'React Interface Lab', track: 'React', lessons: 18 },
  { id: 3, title: 'JavaScript in the Browser', track: 'JavaScript', lessons: 20 },
  { id: 4, title: 'Python Data Toolkit', track: 'Python', lessons: 16 }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('All');
  return <main><h1>Find your next course</h1></main>;
}
`, `${baseCss}
body { padding: 32px; }
main { max-width: 980px; margin: auto; }
`),
    validation: [
      sourceCheck('course-inputs', 'Controls search and track state', '/App.js', ['setQuery', 'setTrack']),
      sourceCheck('course-filter', 'Filters the catalogue', '/App.js', ['courses.filter', 'toLowerCase']),
      previewCheck('course-heading', 'Shows the discovery heading', 'Find your next course', 50),
    ],
    expectedOutcome: 'A responsive catalogue updates as learners search or switch tracks and explains empty results.',
    hints: ['Combine both conditions inside one filter callback.', 'Use query.trim().toLowerCase() before comparing.'],
    theme: { accent: '#176ddb', accentSoft: '#deebff', surface: '#f5f9ff', illustration: 'cards', emoji: '🧭' },
  },
  {
    id: 'project-js-pomodoro',
    slug: 'focus-timer',
    title: 'Focus Timer',
    kicker: 'Protect one focused session',
    summary: 'Build a start, pause, and reset Pomodoro timer with plain JavaScript.',
    description: 'Create the behaviour behind a distraction-free study timer. Keep the remaining time in state, update the page every second, and prevent duplicate intervals.',
    track: 'javascript',
    difficulty: 'Intermediate',
    durationMinutes: 65,
    skills: ['DOM events', 'setInterval', 'State'],
    requirements: [
      { id: 'timer-1', title: 'Format the time', description: 'Always show minutes and two-digit seconds.' },
      { id: 'timer-2', title: 'Start and pause safely', description: 'Never create more than one running interval.' },
      { id: 'timer-3', title: 'Reset the session', description: 'Stop and return the timer to 25:00.' },
    ],
    starterFiles: javascriptFiles(`
const app = document.querySelector('#app');
let secondsLeft = 25 * 60;
let timerId = null;

app.innerHTML = \`
  <main class="timer">
    <p>FOCUS SESSION</p>
    <h1 id="time">25:00</h1>
    <button id="start">Start</button>
    <button id="reset">Reset</button>
  </main>
\`;

function formatTime(totalSeconds) {
  // Return mm:ss.
}

function render() {
  document.querySelector('#time').textContent = formatTime(secondsLeft);
}

// Add the timer controls.
`, `<div id="app"></div><style>body{font-family:system-ui;background:#eef5ff;display:grid;place-items:center;min-height:100vh}.timer{background:white;padding:42px;border-radius:28px;text-align:center}h1{font-size:64px;color:#246bfd}button{padding:12px 20px;margin:4px}</style>`),
    validation: [
      sourceCheck('timer-format', 'Formats minutes and seconds', '/index.js', ['formatTime', 'padStart']),
      sourceCheck('timer-interval', 'Starts and stops an interval', '/index.js', ['setInterval', 'clearInterval']),
      previewCheck('timer-start', 'Shows the Start control', 'Start', 50, '#start'),
    ],
    expectedOutcome: 'A working 25-minute timer can start, pause, and reset without speeding up.',
    hints: ['Math.floor(totalSeconds / 60) gives minutes.', 'Set timerId back to null after clearInterval.'],
    theme: { accent: '#7557ff', accentSoft: '#e9e4ff', surface: '#f8f6ff', illustration: 'utility', emoji: '⏱️' },
    featured: true,
  },
  {
    id: 'project-js-palette',
    slug: 'colour-palette-maker',
    title: 'Colour Palette Maker',
    kicker: 'Generate a fresh visual idea',
    summary: 'Generate, display, and copy a set of random colour codes.',
    description: 'Build a tiny designer tool using DOM APIs. Every generated swatch should show its hex code and copy that value when clicked.',
    track: 'javascript',
    difficulty: 'Beginner',
    durationMinutes: 50,
    skills: ['DOM creation', 'Random values', 'Clipboard'],
    requirements: [
      { id: 'palette-1', title: 'Generate valid hex', description: 'Return a # followed by six hexadecimal characters.' },
      { id: 'palette-2', title: 'Render five swatches', description: 'Replace the old palette whenever Generate is clicked.' },
      { id: 'palette-3', title: 'Copy a colour', description: 'Click a swatch to copy its value and show feedback.' },
    ],
    starterFiles: javascriptFiles(`
const app = document.querySelector('#app');
app.innerHTML = \`
  <main>
    <p>COLOUR LAB</p>
    <h1>Find your next palette.</h1>
    <div id="palette"></div>
    <button id="generate">Generate colours</button>
  </main>
\`;

function randomHex() {
  // Return a colour like #246BFD.
}

function renderPalette() {
  // Create five clickable swatches.
}

document.querySelector('#generate').addEventListener('click', renderPalette);
renderPalette();
`, `<div id="app"></div><style>body{margin:0;font-family:system-ui;background:#101c3f;color:white;padding:40px}main{max-width:900px;margin:auto}#palette{display:grid;grid-template-columns:repeat(5,1fr);min-height:280px;margin:30px 0}.swatch{display:flex;align-items:end;padding:16px}button{padding:14px 20px}</style>`),
    validation: [
      sourceCheck('palette-random', 'Generates a hexadecimal colour', '/index.js', ['Math.random', 'toString(16)']),
      sourceCheck('palette-render', 'Creates five colour swatches', '/index.js', ['renderPalette', 'createElement']),
      previewCheck('palette-heading', 'Shows the palette heading', 'Find your next palette.', 50),
    ],
    expectedOutcome: 'Five fresh colours appear together and each swatch can copy its own hex value.',
    hints: ['A random integer below 0xFFFFFF can become a hex string.', 'navigator.clipboard.writeText copies text in supported browsers.'],
    theme: { accent: '#df4f88', accentSoft: '#ffe1ed', surface: '#fff6fa', illustration: 'cards', emoji: '🎨' },
  },
  {
    id: 'project-js-scoreboard',
    slug: 'live-team-scoreboard',
    title: 'Live Team Scoreboard',
    kicker: 'Make game night interactive',
    summary: 'Track two teams, update scores, and declare the winner.',
    description: 'Build a scoreboard with plain JavaScript. Buttons add points, reset begins a new game, and the leading team is highlighted after every change.',
    track: 'javascript',
    difficulty: 'Beginner',
    durationMinutes: 45,
    skills: ['Objects', 'Event listeners', 'DOM updates'],
    requirements: [
      { id: 'score-1', title: 'Store both scores', description: 'Keep team scores in one clear state object.' },
      { id: 'score-2', title: 'Add points', description: 'Each team has +1 and +3 controls.' },
      { id: 'score-3', title: 'Show the leader', description: 'Highlight the team ahead or show that the match is tied.' },
    ],
    starterFiles: javascriptFiles(`
const scores = { blue: 0, white: 0 };
const app = document.querySelector('#app');

app.innerHTML = \`
  <main>
    <h1>Game night scoreboard</h1>
    <section id="teams"></section>
    <button id="reset">New game</button>
  </main>
\`;

function addPoints(team, points) {
  // Update state, then render.
}

function render() {
  // Render scores and controls into #teams.
}

render();
`, `<div id="app"></div><style>body{font-family:system-ui;background:#eaf2ff;padding:32px}main{max-width:700px;margin:auto;background:white;padding:32px;border-radius:28px}#teams{display:grid;grid-template-columns:1fr 1fr;gap:18px}</style>`),
    validation: [
      sourceCheck('score-state', 'Updates score state', '/index.js', ['scores[team]', 'points']),
      sourceCheck('score-events', 'Connects score buttons', '/index.js', ['addEventListener', 'addPoints']),
      previewCheck('score-title', 'Shows the scoreboard heading', 'Game night scoreboard', 50),
    ],
    expectedOutcome: 'Both teams can gain points, the leader is visible, and New game resets the score.',
    hints: ['Use data-team and data-points attributes on buttons.', 'Compare scores.blue and scores.white inside render().'],
    theme: { accent: '#1c67db', accentSoft: '#dae8ff', surface: '#f4f8ff', illustration: 'game', emoji: '🏆' },
  },
  {
    id: 'project-js-notes',
    slug: 'sticky-note-wall',
    title: 'Sticky Note Wall',
    kicker: 'Capture ideas before they disappear',
    summary: 'Add, colour, search, and delete sticky notes in the browser.',
    description: 'Build a lightweight idea wall with DOM APIs and local storage. Notes should survive a refresh and remain easy to scan and remove.',
    track: 'javascript',
    difficulty: 'Intermediate',
    durationMinutes: 80,
    skills: ['localStorage', 'Forms', 'Rendering collections'],
    requirements: [
      { id: 'notes-1', title: 'Create notes', description: 'Save non-empty note text with a chosen colour.' },
      { id: 'notes-2', title: 'Persist the wall', description: 'Load and save the notes array with localStorage.' },
      { id: 'notes-3', title: 'Delete notes', description: 'Every card includes a working delete control.' },
    ],
    starterFiles: javascriptFiles(`
const STORAGE_KEY = 'l2e-sticky-notes';
let notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const app = document.querySelector('#app');

app.innerHTML = \`
  <main>
    <h1>Ideas worth keeping</h1>
    <form id="note-form">
      <input id="note-text" placeholder="Write a quick idea…" />
      <button>Add note</button>
    </form>
    <section id="notes"></section>
  </main>
\`;

function saveNotes() {}
function renderNotes() {}

// Handle form submission and note deletion.
renderNotes();
`, `<div id="app"></div><style>body{font-family:system-ui;background:#f3f7fe;padding:30px}main{max-width:960px;margin:auto}form{display:flex;gap:10px}input{flex:1;padding:14px}#notes{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:18px;margin-top:28px}.note{min-height:170px;padding:20px;border-radius:8px;box-shadow:0 12px 30px #17346b14}</style>`),
    validation: [
      sourceCheck('notes-storage', 'Persists notes locally', '/index.js', ['localStorage.setItem', 'JSON.stringify']),
      sourceCheck('notes-form', 'Handles new note submission', '/index.js', ['note-form', 'preventDefault']),
      previewCheck('notes-heading', 'Shows the wall heading', 'Ideas worth keeping', 50),
    ],
    expectedOutcome: 'A colourful wall can create and delete notes, and the notes remain after a refresh.',
    hints: ['saveNotes should serialize the whole notes array.', 'Use event delegation or add one delete listener per card.'],
    theme: { accent: '#d08b12', accentSoft: '#fff0c9', surface: '#fffbef', illustration: 'cards', emoji: '🗒️' },
  },
]

function materializeProject(seed: ProjectSeed): PublicProject {
  const derivedExamples = examplesFromValidation(seed.validation)
  const techniqueRules = seed.validation.filter((rule) => rule.kind === 'python-technique')
  const validation = [
    ...seed.validation.filter((rule) => rule.kind !== 'python-technique'),
    ...techniqueRules,
  ]
  const requirements = [
    ...seed.requirements,
    ...techniqueRules.map((rule) => ({
      id: `${rule.id}-requirement`,
      title: rule.label,
      description: [
        ...(rule.required ?? []).map((item) => item.feedback),
        ...(rule.forbidden ?? []).map((item) => item.feedback),
      ].join(' '),
    })),
  ]
  return {
    ...seed,
    requirements,
    validation,
    instructions: seed.instructions ?? [
      `Read the brief and keep the starter file names and required function or component names unchanged.`,
      ...requirements.map((requirement, index) => `${index + 1}. ${requirement.title}: ${requirement.description}`),
      `Run the project with the visible example before choosing Check work. Fix every failed behaviour and technique check before marking it finished.`,
    ],
    examples: seed.examples ?? (derivedExamples.length > 0 ? derivedExamples : [{
      label: 'Expected preview',
      input: 'Run the supplied starter project after completing every requirement.',
      expectedOutput: seed.expectedOutcome,
      explanation: 'The preview and source checks must both pass.',
    }]),
  }
}

export const publicProjects: PublicProject[] = projectSeeds.map(materializeProject)

export const featuredProjects = publicProjects.filter((project) => project.featured)

export function getProjectBySlug(slug: string): PublicProject | undefined {
  return publicProjects.find((project) => project.slug === slug)
}

export function getProjectsByTrack(track: LearningTrack): PublicProject[] {
  return publicProjects.filter((project) => project.track === track)
}

type ChallengeSeed = {
  title: string
  concept: string
  prompt: string
  code: string
  expected: string
  validation: ValidationRule[]
  instructions?: string[]
  examples?: LearningExample[]
  hints: string[]
  tags: string[]
  difficulty?: LearningDifficulty
  minutes?: number
}

function challengeInstructions(track: LearningTrack, prompt: string, validation: ValidationRule[]): string[] {
  const techniqueRules = validation.filter((rule) => rule.kind === 'python-technique')
  const techniqueNotes = techniqueRules.flatMap((rule) => [
    ...(rule.required ?? []).map((item) => item.feedback),
    ...(rule.forbidden ?? []).map((item) => item.feedback),
  ])
  return [
    `Read the full task: ${prompt}`,
    `Keep the starter ${track === 'python' ? 'names and required structure' : 'file names and public function or component names'} unchanged so the checker can find your work.`,
    ...techniqueNotes,
    'Run the visible example first. Then choose Check work to run the visible case, hidden edge case, and workflow checks.',
  ]
}

function challengeExamples(seed: ChallengeSeed): LearningExample[] {
  const derived = examplesFromValidation(seed.validation)
  if (derived.length > 0) return derived
  return [{
    label: 'Expected result',
    input: 'Run the completed starter files.',
    expectedOutput: seed.expected,
  }]
}

const pythonChallengeSeeds: ChallengeSeed[] = [
  {
    title: 'Your First Python Line',
    concept: 'Printing output',
    prompt: 'Edit the words inside print() so the program shows exactly: Hello, L2E LAB!',
    code: `# print() sends words to the Output panel.\nprint("Change these words")`,
    expected: 'The Output panel shows exactly “Hello, L2E LAB!”.',
    validation: [
      stdoutCheck('py-d1-output', 'Prints the welcome message', 'Hello, L2E LAB!', 100),
    ],
    instructions: [
      'Find the text between the quotation marks inside print(...).',
      'Replace only that text with: Hello, L2E LAB!',
      'Keep the quotation marks and parentheses in place.',
      'Choose Run code, then Check work.',
    ],
    examples: [{ label: 'Expected output', input: 'print("Hello, L2E LAB!")', expectedOutput: 'Hello, L2E LAB!', explanation: 'print() displays the text between its quotation marks.' }],
    hints: ['Your finished line is print("Hello, L2E LAB!").'],
    tags: ['print', 'first steps'],
  },
  {
    title: 'Meet Variables',
    concept: 'Variables',
    prompt: 'Store “Ada” in learner_name and “Python” in course_name. The final print line should say: Ada is learning Python',
    code: `learner_name = ""\ncourse_name = ""\n\nprint(learner_name, "is learning", course_name)`,
    expected: 'The two variables store the requested words and the program prints “Ada is learning Python”.',
    validation: [
      pyCheck('py-d2-name', 'Stores the learner name', 'learner_name', 'Ada', 30),
      pyCheck('py-d2-course', 'Stores the course name', 'course_name', 'Python', 30),
      stdoutCheck('py-d2-output', 'Prints the learning sentence', 'Ada is learning Python', 40),
    ],
    instructions: [
      'A variable is a named box that stores a value.',
      'Put "Ada" after learner_name = and "Python" after course_name =.',
      'Do not change the final print line.',
      'Run the program and check that the words appear in the correct order.',
    ],
    examples: [{ label: 'Expected output', input: 'learner_name = "Ada"\ncourse_name = "Python"', expectedOutput: 'Ada is learning Python' }],
    hints: ['Text values need quotation marks: learner_name = "Ada".'],
    tags: ['variables', 'strings'],
  },
  {
    title: 'Build a Sentence',
    concept: 'Strings and f-strings',
    prompt: 'Use one f-string to make message equal “Ada is learning Python!”. Then print message.',
    code: `learner_name = "Ada"\ncourse_name = "Python"\n\n# Put both variables inside one f-string.\nmessage = ""\nprint(message)`,
    expected: 'message contains and prints “Ada is learning Python!”.',
    validation: [
      pyTechniqueCheck('py-d3-technique', 'Builds the sentence with an f-string', { required: [technique('ast-node', 'JoinedStr', 'Start the message with f and place variable names inside curly braces.')] }, 30),
      pyCheck('py-d3-message', 'Builds the complete sentence', 'message', 'Ada is learning Python!', 40),
      stdoutCheck('py-d3-output', 'Prints the complete sentence', 'Ada is learning Python!', 30),
    ],
    instructions: [
      'Keep the two variables at the top unchanged.',
      'Replace the empty string after message = with an f-string.',
      'Put {learner_name} and {course_name} in the sentence.',
      'Run the program before checking your work.',
    ],
    examples: [{ label: 'F-string example', input: 'name = "Ada"\nprint(f"Hello, {name}!")', expectedOutput: 'Hello, Ada!', explanation: 'Python replaces a name inside curly braces with the value stored in that variable.' }],
    hints: ['Try: message = f"{learner_name} is learning {course_name}!"'],
    tags: ['strings', 'f-strings'],
  },
  {
    title: 'Earn Learning Points',
    concept: 'Numbers and arithmetic',
    prompt: 'Calculate total_points by multiplying lessons_completed by points_per_lesson. The sample should print 30.',
    code: `lessons_completed = 3\npoints_per_lesson = 10\n\n# Replace 0 with a multiplication using the variables above.\ntotal_points = 0\nprint(total_points)`,
    expected: 'Three lessons worth 10 points each produce and print a total of 30 points.',
    validation: [
      pyTechniqueCheck('py-d4-technique', 'Calculates with an arithmetic operator', { required: [technique('ast-node', 'BinOp', 'Calculate the result with lessons_completed * points_per_lesson.')] }, 30),
      pyCheck('py-d4-total', 'Calculates the total points', 'total_points', 30, 40),
      stdoutCheck('py-d4-output', 'Prints the total', '30', 30),
    ],
    instructions: [
      'Read the two number variables at the top.',
      'Use * to multiply lessons_completed by points_per_lesson.',
      'Store the answer in total_points.',
      'Run the code and confirm that the Output panel shows 30.',
    ],
    examples: [{ label: 'Multiplication example', input: '3 lessons × 10 points', expectedOutput: '30' }],
    hints: ['Write: total_points = lessons_completed * points_per_lesson'],
    tags: ['numbers', 'arithmetic'],
  },
  {
    title: 'Is the Score a Pass?',
    concept: 'Comparisons and booleans',
    prompt: 'Use >= to compare score with pass_mark. Store the result in passed; it should be True for the sample values.',
    code: `score = 72\npass_mark = 50\n\n# Replace False with a comparison.\npassed = False\nprint(passed)`,
    expected: 'The comparison stores True in passed and prints True.',
    validation: [
      pyTechniqueCheck('py-d5-technique', 'Compares the two numbers', { required: [technique('ast-node', 'Compare', 'Use score >= pass_mark to make a True or False value.')] }, 30),
      pyCheck('py-d5-result', 'Stores the correct boolean', 'passed', true, 40),
      stdoutCheck('py-d5-output', 'Prints True', 'True', 30),
    ],
    instructions: [
      'A comparison produces either True or False.',
      'Use >= because a score equal to the pass mark should also pass.',
      'Store the comparison result in passed.',
      'Run the program and look for True in the Output panel.',
    ],
    examples: [{ label: 'Comparison example', input: '72 >= 50', expectedOutput: 'True', explanation: '72 is greater than the pass mark.' }],
    hints: ['Write: passed = score >= pass_mark'],
    tags: ['comparisons', 'booleans'],
  },
  {
    title: 'Choose a Progress Message',
    concept: 'if and else',
    prompt: 'Use if and else. When score is at least pass_mark, set result to “Passed”; otherwise set it to “Keep trying”.',
    code: `score = 72\npass_mark = 50\nresult = ""\n\n# Write an if/else block that changes result.\n\nprint(result)`,
    expected: 'The sample score chooses and prints “Passed”.',
    validation: [
      pyTechniqueCheck('py-d6-technique', 'Makes the choice with if/else', { required: [technique('ast-node', 'If', 'Use an if/else block to choose the message.')] }, 30),
      pyCheck('py-d6-result', 'Chooses the passing message', 'result', 'Passed', 40),
      stdoutCheck('py-d6-output', 'Prints the passing message', 'Passed', 30),
    ],
    instructions: [
      'Start an if line with: if score >= pass_mark:',
      'Indent result = "Passed" underneath it.',
      'Add else: and indent result = "Keep trying" underneath that.',
      'Run the program and check the selected message.',
    ],
    examples: [{ label: 'Sample decision', input: 'score = 72, pass_mark = 50', expectedOutput: 'Passed' }],
    hints: ['Python uses indentation to show which lines belong inside if and else.'],
    tags: ['conditionals', 'if else'],
  },
  {
    title: 'Print Every Learning Step',
    concept: 'for loops',
    prompt: 'Use a for loop to print each word in steps on its own line, in the original order.',
    code: `steps = ["Learn", "Build", "Share"]\n\n# Write a for loop below.`,
    expected: 'The Output panel shows Learn, Build, and Share on separate lines.',
    validation: [
      pyTechniqueCheck('py-d7-technique', 'Repeats with a for loop', { required: [technique('ast-node', 'For', 'Use a for loop to visit every word in steps.')] }, 30),
      stdoutCheck('py-d7-output', 'Prints every step in order', 'Learn\nBuild\nShare', 70),
    ],
    instructions: [
      'Start the loop with: for step in steps:',
      'On the next line, indent print(step) by four spaces.',
      'The loop runs once for every item in the list.',
      'Run the program and make sure each word has its own line.',
    ],
    examples: [{ label: 'Expected output', input: 'steps = ["Learn", "Build", "Share"]', expectedOutput: 'Learn\nBuild\nShare' }],
    hints: ['Use two lines: for step in steps: and an indented print(step).'],
    tags: ['loops', 'print'],
  },
  {
    title: 'Read Items from a List',
    concept: 'Lists and indexes',
    prompt: 'Use list indexes to store the first tool in first_tool and the last tool in last_tool. Then print both values.',
    code: `tools = ["Python", "Git", "VS Code"]\n\nfirst_tool = ""\nlast_tool = ""\n\nprint(first_tool)\nprint(last_tool)`,
    expected: 'first_tool is “Python”, last_tool is “VS Code”, and both are printed.',
    validation: [
      pyTechniqueCheck('py-d8-technique', 'Reads values with list indexes', { required: [technique('ast-node', 'Subscript', 'Use tools[0] and tools[-1] to read the first and last items.')] }, 30),
      pyCheck('py-d8-first', 'Reads the first item', 'first_tool', 'Python', 35),
      pyCheck('py-d8-last', 'Reads the last item', 'last_tool', 'VS Code', 35),
    ],
    instructions: [
      'A list keeps several values in order.',
      'Index 0 means the first item: tools[0].',
      'Index -1 means the last item: tools[-1].',
      'Store those two values, then run and check the program.',
    ],
    examples: [{ label: 'Index example', input: 'colors = ["Blue", "White"]\nprint(colors[0])', expectedOutput: 'Blue' }],
    hints: ['Set first_tool = tools[0] and last_tool = tools[-1].'],
    tags: ['lists', 'indexes'],
  },
  {
    title: 'Total a List with a Loop',
    concept: 'Lists and running totals',
    prompt: 'Use a for loop and a running total to add every score. Do not use sum(). The sample total is 210.',
    code: `scores = [70, 85, 55]\ntotal = 0\n\n# Add each score to total with a for loop.\n\nprint(total)`,
    expected: 'The loop stores 210 in total and prints 210.',
    validation: [
      pyTechniqueCheck('py-d9-technique', 'Adds items with a for loop', {
        required: [technique('ast-node', 'For', 'Use a for loop to visit each score.')],
        forbidden: [technique('call', 'sum', 'Do not use sum() yet; practise changing a running total inside the loop.')],
      }, 30),
      pyCheck('py-d9-total', 'Adds every score', 'total', 210, 40),
      stdoutCheck('py-d9-output', 'Prints the total', '210', 30),
    ],
    instructions: [
      'total already starts at 0.',
      'Loop through scores with: for score in scores:',
      'Inside the loop, add the current score to total.',
      'Keep print(total) after the loop and check for 210.',
    ],
    examples: [{ label: 'Running-total example', input: 'scores = [70, 85, 55]', expectedOutput: '210', explanation: 'The total changes from 0 to 70, then 155, then 210.' }],
    hints: ['Inside the loop, write total = total + score or total += score.'],
    tags: ['lists', 'loops', 'running total'],
  },
  {
    title: 'Your First Function',
    concept: 'Functions and return',
    prompt: 'Complete lab_message(). It takes no information and returns exactly “Welcome to L2E LAB!”. Use return instead of printing inside the function.',
    code: `def lab_message():\n    # Replace pass with one return statement.\n    pass\n\nprint(lab_message())`,
    expected: 'Calling lab_message() returns “Welcome to L2E LAB!”.',
    validation: [
      pyTechniqueCheck('py-d10-technique', 'Returns a value from the function', {
        scope: { kind: 'function', name: 'lab_message' },
        required: [technique('ast-node', 'Return', 'Replace pass with a return statement inside lab_message().')],
      }, 30),
      pyCheck('py-d10-message', 'Returns the complete message', 'lab_message()', 'Welcome to L2E LAB!', 70),
    ],
    instructions: [
      'def lab_message(): creates a reusable block named lab_message.',
      'Replace the indented pass with an indented return statement.',
      'Return the exact text “Welcome to L2E LAB!”.',
      'The final print line calls the function and shows what it returned.',
    ],
    examples: [{ label: 'Function call', input: 'lab_message()', expectedOutput: 'Welcome to L2E LAB!', explanation: 'The parentheses call the function; return sends its answer back.' }],
    hints: ['Inside the function, write: return "Welcome to L2E LAB!"'],
    tags: ['functions', 'return'],
    difficulty: 'Beginner',
  },
  {
    title: 'A Reusable Personal Greeting',
    concept: 'Function parameters and f-strings',
    prompt: 'Complete make_greeting(name). It must return the full sentence “Welcome to L2E LAB, Ada!” when name is “Ada”, and place any other supplied name in the same sentence.',
    code: `def make_greeting(name):\n    # Return the full message, not only name.\n    # Format: Welcome to L2E LAB, <name>!\n    pass\n\nprint(make_greeting("Ada"))`,
    expected: 'The function returns the complete greeting for Ada and for any other supplied name.',
    validation: [
      pyTechniqueCheck('py-d11-technique', 'Builds and returns the full f-string', {
        scope: { kind: 'function', name: 'make_greeting' },
        required: [
          technique('ast-node', 'Return', 'Return the completed greeting from make_greeting().'),
          technique('ast-node', 'JoinedStr', 'Use an f-string so the supplied name appears inside the complete message.'),
        ],
      }, 20),
      pyCheck('py-d11-ada', 'Greets Ada with the full sentence', 'make_greeting("Ada")', 'Welcome to L2E LAB, Ada!', 40),
      pyCheck('py-d11-tobi', 'Works for another learner', 'make_greeting("Tobi")', 'Welcome to L2E LAB, Tobi!', 40, true),
    ],
    instructions: [
      'name is a parameter: it receives the value inside the call parentheses.',
      'Replace pass with one return statement inside make_greeting.',
      'Return the entire greeting, not just name.',
      'Use an f-string so both Ada and an unseen learner name work.',
    ],
    examples: [
      { label: 'Ada example', input: 'make_greeting("Ada")', expectedOutput: 'Welcome to L2E LAB, Ada!' },
      { label: 'Tobi example', input: 'make_greeting("Tobi")', expectedOutput: 'Welcome to L2E LAB, Tobi!', explanation: 'Only the name changes; the rest of the sentence stays in the function.' },
    ],
    hints: ['Use: return f"Welcome to L2E LAB, {name}!"', 'return name would return only “Ada” or “Tobi”, so it would be incomplete.'],
    tags: ['functions', 'parameters', 'f-strings'],
    difficulty: 'Beginner',
  },
  {
    title: 'A Function That Makes a Choice',
    concept: 'Functions with conditionals',
    prompt: 'Complete progress_message(completed). Return “Great progress!” for 5 or more completed lessons; otherwise return “Keep going!”.',
    code: `def progress_message(completed):\n    # Use if/else and return one of the two messages.\n    pass\n\nprint(progress_message(7))`,
    expected: 'The function returns the correct progress message for both lower and higher lesson counts.',
    validation: [
      pyTechniqueCheck('py-d12-technique', 'Chooses and returns inside the function', {
        scope: { kind: 'function', name: 'progress_message' },
        required: [
          technique('ast-node', 'If', 'Use if/else inside progress_message() to choose a message.'),
          technique('ast-node', 'Return', 'Return the chosen message from the function.'),
        ],
      }, 20),
      pyCheck('py-d12-high', 'Encourages strong progress', 'progress_message(7)', 'Great progress!', 40),
      pyCheck('py-d12-low', 'Encourages an early learner', 'progress_message(2)', 'Keep going!', 40, true),
    ],
    instructions: [
      'The completed parameter is a number supplied by the function call.',
      'Check whether completed >= 5 with an if statement.',
      'Return “Great progress!” in that branch and “Keep going!” otherwise.',
      'Check work tests both sides of your decision.',
    ],
    examples: [
      { label: 'Higher count', input: 'progress_message(7)', expectedOutput: 'Great progress!' },
      { label: 'Lower count', input: 'progress_message(2)', expectedOutput: 'Keep going!' },
    ],
    hints: ['Start with: if completed >= 5:', 'Both branches need a return statement.'],
    tags: ['functions', 'conditionals'],
    difficulty: 'Beginner',
    minutes: 18,
  },
]

const growthPhases = [
  { label: 'Explore', verb: 'write a clear first solution' },
  { label: 'Build', verb: 'turn the idea into a reusable utility' },
  { label: 'Edge cases', verb: 'handle empty and unexpected values safely' },
  { label: 'Refactor', verb: 'improve readability without changing the result' },
]

const pythonGrowthPhases = [
  { label: 'Learn', verb: 'complete the core function for a familiar example' },
  { label: 'Reuse', verb: 'call the completed function and save a new result' },
  { label: 'Edge case', verb: 'handle an empty, boundary, or unusual input' },
  { label: 'Self-check', verb: 'prove the finished function with an assert statement' },
] as const

type RuntimeExpected = string | number | boolean | null | Array<string | number | boolean | null>
type PythonCurriculumCase = { input: string; expected: RuntimeExpected; scenario: string }
type PythonCurriculumModule = {
  title: string
  concept: string
  task: string
  starter: string
  cases: [PythonCurriculumCase, PythonCurriculumCase, PythonCurriculumCase, PythonCurriculumCase]
  hidden: PythonCurriculumCase
  required: PythonTechniqueTarget[]
  forbidden?: PythonTechniqueTarget[]
  hints: string[]
  tags: string[]
}

const pythonCurriculumModules: PythonCurriculumModule[] = [
  {
    title: 'List Comprehension Workshop',
    concept: 'List comprehensions',
    task: 'Complete squared_evens(numbers). Return a new list containing the square of each even number, in its original order, without changing numbers.',
    starter: `def squared_evens(numbers):\n    # Build and return one list comprehension.\n    pass`,
    cases: [
      { input: 'squared_evens([1, 2, 3, 4])', expected: [4, 16], scenario: 'Start with a mixed list of four integers.' },
      { input: 'squared_evens([6, 8, 10])', expected: [36, 64, 100], scenario: 'Handle a list where every value is even.' },
      { input: 'squared_evens([])', expected: [], scenario: 'Return an empty list for empty input.' },
      { input: 'squared_evens([-4, -3, 0, 5])', expected: [16, 0], scenario: 'Handle negative values and zero without special cases.' },
    ],
    hidden: { input: 'squared_evens([11, 12, 13, 14])', expected: [144, 196], scenario: 'Handle unseen values.' },
    required: [technique('ast-node', 'ListComp', 'Use one list comprehension to filter and transform the numbers.')],
    forbidden: [technique('call', 'map', 'Do not use map() for this exercise.'), technique('call', 'filter', 'Do not use filter() for this exercise.')],
    hints: ['A comprehension can contain both an expression and an if condition.', 'The square of number is number ** 2.'],
    tags: ['lists', 'comprehensions'],
  },
  {
    title: 'Unpack the Results',
    concept: 'Tuple unpacking',
    task: 'Complete format_scores(records). Each record is a (name, score) tuple. Return strings formatted as “Name: score” in the same order.',
    starter: `def format_scores(records):\n    result = []\n    # Unpack name and score inside the loop.\n    return result`,
    cases: [
      { input: 'format_scores([("Ada", 80), ("Tobi", 65)])', expected: ['Ada: 80', 'Tobi: 65'], scenario: 'Format two learner results.' },
      { input: 'format_scores([("Musa", 100)])', expected: ['Musa: 100'], scenario: 'Format a single perfect score.' },
      { input: 'format_scores([])', expected: [], scenario: 'Handle an empty record list.' },
      { input: 'format_scores([("Amaka", 0), ("Zainab", 48)])', expected: ['Amaka: 0', 'Zainab: 48'], scenario: 'Keep zero and lower scores intact.' },
    ],
    hidden: { input: 'format_scores([("David", 73)])', expected: ['David: 73'], scenario: 'Format an unseen record.' },
    required: [technique('ast-node', 'For', 'Use a for loop that unpacks each record into name and score.')],
    hints: ['Write for name, score in records.', 'Append an f-string to result.'],
    tags: ['tuples', 'loops'],
  },
  {
    title: 'Profile Merge',
    concept: 'Dictionary unpacking',
    task: 'Complete merge_profile(base, updates). Return a new dictionary containing both inputs; updates must win when a key appears in both. Do not mutate either input.',
    starter: `def merge_profile(base, updates):\n    # Return a new dictionary using ** unpacking.\n    pass`,
    cases: [
      { input: 'merge_profile({"name": "Ada", "city": "Aba"}, {"city": "Lagos", "track": "Python"}).get("city")', expected: 'Lagos', scenario: 'Let updated fields replace old values.' },
      { input: 'merge_profile({"name": "Tobi"}, {"level": 2}).get("level")', expected: 2, scenario: 'Add a completely new field.' },
      { input: 'len(merge_profile({}, {}))', expected: 0, scenario: 'Handle two empty dictionaries.' },
      { input: 'merge_profile({"active": True}, {}).get("active")', expected: true, scenario: 'Keep base values when no update exists.' },
    ],
    hidden: { input: 'merge_profile({"x": 1}, {"x": 9}).get("x")', expected: 9, scenario: 'Resolve an unseen duplicate key.' },
    required: [technique('syntax', 'dict-unpack', 'Create a new dictionary with {**base, **updates}.')],
    forbidden: [technique('call', 'update', 'Do not call update(); it can encourage accidental mutation here.')],
    hints: ['Later dictionary entries overwrite earlier entries with the same key.'],
    tags: ['dictionaries', 'unpacking'],
  },
  {
    title: 'Shared Skills Finder',
    concept: 'Set operations',
    task: 'Complete shared_skills(first, second). Return an alphabetically sorted list of skills appearing in both lists, with duplicates removed.',
    starter: `def shared_skills(first, second):\n    # Convert the inputs to sets and find their intersection.\n    pass`,
    cases: [
      { input: 'shared_skills(["Python", "Git", "React"], ["Git", "Python", "CSS"])', expected: ['Git', 'Python'], scenario: 'Find two shared skills.' },
      { input: 'shared_skills(["React", "React"], ["React"])', expected: ['React'], scenario: 'Remove repeated skills.' },
      { input: 'shared_skills([], ["Python"])', expected: [], scenario: 'Handle an empty first list.' },
      { input: 'shared_skills(["JS"], ["Python"])', expected: [], scenario: 'Return an empty list when nothing overlaps.' },
    ],
    hidden: { input: 'shared_skills(["SQL", "CSS", "Git"], ["CSS", "SQL"])', expected: ['CSS', 'SQL'], scenario: 'Sort unseen shared skills.' },
    required: [technique('call', 'set', 'Use set() to remove duplicates and compare membership.')],
    hints: ['The & operator finds the intersection of two sets.', 'Convert the result to a list and sort it.'],
    tags: ['sets', 'intersection'],
  },
  {
    title: 'Rank the Learners',
    concept: 'Sorting with a key',
    task: 'Complete rank_names(learners). Return learner names ordered from highest score to lowest. Do not mutate the input list.',
    starter: `def rank_names(learners):\n    # Sort a copy by each record's score.\n    pass`,
    cases: [
      { input: 'rank_names([{"name": "Ada", "score": 70}, {"name": "Musa", "score": 91}])', expected: ['Musa', 'Ada'], scenario: 'Rank two different scores.' },
      { input: 'rank_names([{"name": "Tobi", "score": 55}])', expected: ['Tobi'], scenario: 'Handle one learner.' },
      { input: 'rank_names([])', expected: [], scenario: 'Handle an empty leaderboard.' },
      { input: 'rank_names([{"name": "A", "score": 2}, {"name": "B", "score": 9}, {"name": "C", "score": 5}])', expected: ['B', 'C', 'A'], scenario: 'Rank three learners.' },
    ],
    hidden: { input: 'rank_names([{"name": "Low", "score": -1}, {"name": "High", "score": 0}])', expected: ['High', 'Low'], scenario: 'Handle unusual scores.' },
    required: [technique('call', 'sorted', 'Use sorted() so the original learner list is not changed.')],
    hints: ['Pass reverse=True.', 'The key function should return learner["score"].'],
    tags: ['sorting', 'dictionaries'],
  },
  {
    title: 'Sort by Word Length',
    concept: 'Lambda functions',
    task: 'Complete sort_by_length(words). Return a new list ordered from shortest word to longest, using a lambda as the sorting key.',
    starter: `def sort_by_length(words):\n    # Return a sorted copy using a lambda key.\n    pass`,
    cases: [
      { input: 'sort_by_length(["React", "Py", "JavaScript"])', expected: ['Py', 'React', 'JavaScript'], scenario: 'Order three technology names.' },
      { input: 'sort_by_length(["code"])', expected: ['code'], scenario: 'Handle one word.' },
      { input: 'sort_by_length([])', expected: [], scenario: 'Handle an empty list.' },
      { input: 'sort_by_length(["four", "a", "six"])', expected: ['a', 'six', 'four'], scenario: 'Order several word lengths.' },
    ],
    hidden: { input: 'sort_by_length(["longest", "mid", "to"])', expected: ['to', 'mid', 'longest'], scenario: 'Order unseen words.' },
    required: [technique('ast-node', 'Lambda', 'Pass a lambda function as the sorting key.'), technique('call', 'sorted', 'Use sorted() to return a new list.')],
    hints: ['The key is lambda word: len(word).'],
    tags: ['lambda', 'sorting'],
  },
  {
    title: 'Validate Every Score',
    concept: 'all()',
    task: 'Complete all_valid_scores(scores). Return True only when every score is a number from 0 through 100 inclusive. An empty list should return True.',
    starter: `def all_valid_scores(scores):\n    # Combine all() with a generator expression.\n    pass`,
    cases: [
      { input: 'all_valid_scores([0, 70, 100])', expected: true, scenario: 'Accept all valid boundary scores.' },
      { input: 'all_valid_scores([50, 101])', expected: false, scenario: 'Reject a score above 100.' },
      { input: 'all_valid_scores([])', expected: true, scenario: 'Use the standard empty-list behaviour of all().' },
      { input: 'all_valid_scores([-1, 50])', expected: false, scenario: 'Reject a negative score.' },
    ],
    hidden: { input: 'all_valid_scores([33.5, 99.9])', expected: true, scenario: 'Accept decimal scores inside the range.' },
    required: [technique('call', 'all', 'Use all() to express that every score must pass.'), technique('ast-node', 'GeneratorExp', 'Feed all() with a generator expression.')],
    forbidden: [technique('ast-node', 'For', 'Do not write a manual for loop in this exercise.')],
    hints: ['The condition is 0 <= score <= 100.'],
    tags: ['all', 'validation'],
  },
  {
    title: 'Number the Plan',
    concept: 'enumerate()',
    task: 'Complete number_steps(steps). Return strings numbered from 1, such as “1. Plan”. Preserve the original order.',
    starter: `def number_steps(steps):\n    result = []\n    # Use enumerate with a starting value of 1.\n    return result`,
    cases: [
      { input: 'number_steps(["Plan", "Build"])', expected: ['1. Plan', '2. Build'], scenario: 'Number two project steps.' },
      { input: 'number_steps(["Ship"])', expected: ['1. Ship'], scenario: 'Number a single step.' },
      { input: 'number_steps([])', expected: [], scenario: 'Handle no steps.' },
      { input: 'number_steps(["Read", "Code", "Test"])', expected: ['1. Read', '2. Code', '3. Test'], scenario: 'Number a three-step workflow.' },
    ],
    hidden: { input: 'number_steps(["Ask", "Try", "Reflect", "Share"])', expected: ['1. Ask', '2. Try', '3. Reflect', '4. Share'], scenario: 'Number an unseen plan.' },
    required: [technique('call', 'enumerate', 'Use enumerate(steps, start=1) to produce the numbers.')],
    hints: ['Unpack index and step in the loop.'],
    tags: ['enumerate', 'loops'],
  },
  {
    title: 'Pair Names and Scores',
    concept: 'zip()',
    task: 'Complete pair_results(names, scores). Pair values at matching positions and return “Name=score” strings. Stop at the shorter input.',
    starter: `def pair_results(names, scores):\n    result = []\n    # Pair the lists with zip().\n    return result`,
    cases: [
      { input: 'pair_results(["Ada", "Tobi"], [80, 65])', expected: ['Ada=80', 'Tobi=65'], scenario: 'Pair two names and scores.' },
      { input: 'pair_results(["Musa"], [100, 20])', expected: ['Musa=100'], scenario: 'Stop at the shorter list.' },
      { input: 'pair_results([], [])', expected: [], scenario: 'Handle two empty lists.' },
      { input: 'pair_results(["A", "B", "C"], [1, 2, 3])', expected: ['A=1', 'B=2', 'C=3'], scenario: 'Pair three aligned values.' },
    ],
    hidden: { input: 'pair_results(["Only", "Ignored"], [9])', expected: ['Only=9'], scenario: 'Handle mismatched unseen input.' },
    required: [technique('call', 'zip', 'Use zip(names, scores) to pair matching positions.')],
    hints: ['Loop with for name, score in zip(names, scores).'],
    tags: ['zip', 'lists'],
  },
  {
    title: 'Format a Learner Badge',
    concept: 'F-strings',
    task: 'Complete format_student(name, track, level). Return exactly “Name | Track | Level N” using one f-string.',
    starter: `def format_student(name, track, level):\n    # Return one f-string.\n    pass`,
    cases: [
      { input: 'format_student("Ada", "Python", 4)', expected: 'Ada | Python | Level 4', scenario: 'Format a Python learner.' },
      { input: 'format_student("Tobi", "React", 1)', expected: 'Tobi | React | Level 1', scenario: 'Format a beginner.' },
      { input: 'format_student("", "JavaScript", 0)', expected: ' | JavaScript | Level 0', scenario: 'Keep the exact format even for an empty name.' },
      { input: 'format_student("Musa", "Data", 10)', expected: 'Musa | Data | Level 10', scenario: 'Format a two-digit level.' },
    ],
    hidden: { input: 'format_student("Zainab", "UI", 2)', expected: 'Zainab | UI | Level 2', scenario: 'Format unseen values.' },
    required: [technique('ast-node', 'JoinedStr', 'Use an f-string rather than joining pieces manually.')],
    forbidden: [technique('call', 'format', 'Do not use .format() in this f-string exercise.')],
    hints: ['Start the returned string with f before its opening quote.'],
    tags: ['f-strings', 'formatting'],
  },
  {
    title: 'Username Gate',
    concept: 'Input validation',
    task: 'Complete valid_username(value). Accept 4–16 characters containing only letters, numbers, or underscores. Reject leading or trailing whitespace.',
    starter: `def valid_username(value):\n    # Check type, whitespace, length, and allowed characters.\n    pass`,
    cases: [
      { input: 'valid_username("ada_2026")', expected: true, scenario: 'Accept a normal username.' },
      { input: 'valid_username(" abcd")', expected: false, scenario: 'Reject surrounding whitespace.' },
      { input: 'valid_username("abc")', expected: false, scenario: 'Reject a name that is too short.' },
      { input: 'valid_username("name!")', expected: false, scenario: 'Reject punctuation other than underscore.' },
    ],
    hidden: { input: 'valid_username("Learner_42")', expected: true, scenario: 'Accept an unseen valid username.' },
    required: [technique('ast-node', 'If', 'Use clear conditional checks for invalid input.')],
    hints: ['value.replace("_", "").isalnum() checks the allowed character set.', 'Compare value with value.strip().'],
    tags: ['validation', 'strings'],
  },
  {
    title: 'Safe Division',
    concept: 'Error handling',
    task: 'Complete safe_divide(first, second). Return the quotient, but return None when division cannot be performed because of zero or incompatible values.',
    starter: `def safe_divide(first, second):\n    # Catch only the expected division errors.\n    pass`,
    cases: [
      { input: 'safe_divide(10, 2)', expected: 5, scenario: 'Divide two ordinary numbers.' },
      { input: 'safe_divide(1, 0)', expected: null, scenario: 'Handle division by zero.' },
      { input: 'safe_divide("ten", 2)', expected: null, scenario: 'Handle an incompatible first value.' },
      { input: 'safe_divide(-9, 3)', expected: -3, scenario: 'Handle a negative quotient.' },
    ],
    hidden: { input: 'safe_divide(7.5, 2.5)', expected: 3, scenario: 'Divide unseen decimals.' },
    required: [technique('ast-node', 'Try', 'Use try/except to handle ZeroDivisionError and TypeError.')],
    forbidden: [technique('syntax', 'bare-except', 'Do not use a bare except; catch only expected error types.')],
    hints: ['Use except (ZeroDivisionError, TypeError):', 'Return inside the try block.'],
    tags: ['exceptions', 'defensive code'],
  },
  {
    title: 'Recursive Factorial',
    concept: 'Recursion',
    task: 'Complete factorial(number). Return 1 for zero and otherwise multiply number by factorial(number - 1). Inputs are non-negative integers.',
    starter: `def factorial(number):\n    # Add a base case and a recursive return.\n    pass`,
    cases: [
      { input: 'factorial(5)', expected: 120, scenario: 'Calculate five factorial.' },
      { input: 'factorial(3)', expected: 6, scenario: 'Calculate a smaller factorial.' },
      { input: 'factorial(0)', expected: 1, scenario: 'Handle the base case.' },
      { input: 'factorial(1)', expected: 1, scenario: 'Handle one without extra recursion.' },
    ],
    hidden: { input: 'factorial(7)', expected: 5040, scenario: 'Calculate an unseen factorial.' },
    required: [technique('syntax', 'recursive-call', 'Call factorial() from inside itself after the base case.')],
    forbidden: [technique('ast-node', 'For', 'Do not use a for loop in this recursion exercise.'), technique('ast-node', 'While', 'Do not use a while loop in this recursion exercise.')],
    hints: ['The base case is number == 0.', 'The recursive step reduces number by one.'],
    tags: ['recursion', 'base cases'],
  },
  {
    title: 'Bracket Checker',
    concept: 'Stack patterns',
    task: 'Complete balanced_brackets(text). Return True when (), [], and {} are correctly nested. Ignore non-bracket characters.',
    starter: `def balanced_brackets(text):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    # Push opening brackets and match closing brackets.\n    pass`,
    cases: [
      { input: 'balanced_brackets("([])")', expected: true, scenario: 'Accept nested matching brackets.' },
      { input: 'balanced_brackets("([)]")', expected: false, scenario: 'Reject crossed bracket order.' },
      { input: 'balanced_brackets("")', expected: true, scenario: 'Accept empty text.' },
      { input: 'balanced_brackets("print({})")', expected: true, scenario: 'Ignore ordinary characters.' },
    ],
    hidden: { input: 'balanced_brackets("{[()]}]")', expected: false, scenario: 'Reject an extra closing bracket.' },
    required: [technique('ast-node', 'For', 'Use a for loop to read the text left to right.'), technique('call', 'append', 'Push opening brackets with append().'), technique('call', 'pop', 'Pop the latest opening bracket when closing one appears.')],
    hints: ['A closing bracket fails when the stack is empty.', 'The stack must be empty at the end.'],
    tags: ['stacks', 'algorithms'],
  },
  {
    title: 'Serve the Queue',
    concept: 'Queue patterns',
    task: 'Complete serve_next(queue). Remove and return the first name. Return None for an empty queue. The supplied list should be updated in place.',
    starter: `def serve_next(queue):\n    # Remove from the front when possible.\n    pass`,
    cases: [
      { input: 'serve_next(["Ada", "Tobi"])', expected: 'Ada', scenario: 'Serve the first of two learners.' },
      { input: 'serve_next(["Musa"])', expected: 'Musa', scenario: 'Serve the only learner.' },
      { input: 'serve_next([])', expected: null, scenario: 'Handle an empty queue.' },
      { input: '(lambda q: (serve_next(q), q)[1])(["A", "B", "C"])', expected: ['B', 'C'], scenario: 'Confirm the queue is changed in place.' },
    ],
    hidden: { input: '(lambda q: (serve_next(q), q)[1])(["First", "Second"])', expected: ['Second'], scenario: 'Update an unseen queue.' },
    required: [technique('call', 'pop', 'Use queue.pop(0) to remove the first item.')],
    forbidden: [technique('call', 'sorted', 'Do not reorder the queue.')],
    hints: ['Check whether queue is empty before popping index 0.'],
    tags: ['queues', 'mutation'],
  },
  {
    title: 'Binary Search Lab',
    concept: 'Binary search',
    task: 'Complete binary_search(numbers, target). numbers is sorted. Return the target index, or -1 when missing. Narrow the search range instead of scanning every item.',
    starter: `def binary_search(numbers, target):\n    left = 0\n    right = len(numbers) - 1\n    # Narrow the range while left <= right.\n    pass`,
    cases: [
      { input: 'binary_search([2, 5, 7, 11], 7)', expected: 2, scenario: 'Find a value in the middle.' },
      { input: 'binary_search([2, 5, 7, 11], 2)', expected: 0, scenario: 'Find the first value.' },
      { input: 'binary_search([], 3)', expected: -1, scenario: 'Handle an empty list.' },
      { input: 'binary_search([2, 5, 7, 11], 9)', expected: -1, scenario: 'Report a missing target.' },
    ],
    hidden: { input: 'binary_search([1, 4, 8, 12, 19, 25], 25)', expected: 5, scenario: 'Find an unseen endpoint.' },
    required: [technique('ast-node', 'While', 'Use a while loop to repeatedly halve the search range.')],
    forbidden: [technique('call', 'index', 'Do not use list.index(); implement binary search yourself.'), technique('ast-node', 'For', 'Do not scan with a for loop.')],
    hints: ['middle = (left + right) // 2.', 'Move left or right past middle after each comparison.'],
    tags: ['search', 'algorithms'],
  },
  {
    title: 'Best Study Window',
    concept: 'Sliding windows',
    task: 'Complete max_window_sum(values, size). Return the largest sum of size consecutive values. Return 0 when size is invalid or values is empty.',
    starter: `def max_window_sum(values, size):\n    # Compute the first window, then slide it one item at a time.\n    pass`,
    cases: [
      { input: 'max_window_sum([2, 1, 5, 1, 3], 2)', expected: 6, scenario: 'Find the best two-value window.' },
      { input: 'max_window_sum([4, 2, 1, 7, 8, 1, 2], 3)', expected: 16, scenario: 'Find a three-value window.' },
      { input: 'max_window_sum([], 2)', expected: 0, scenario: 'Handle empty values.' },
      { input: 'max_window_sum([1, 2], 3)', expected: 0, scenario: 'Reject a window larger than the list.' },
    ],
    hidden: { input: 'max_window_sum([-5, -2, -9], 1)', expected: -2, scenario: 'Handle all-negative values.' },
    required: [technique('ast-node', 'For', 'Use a for loop to slide the window after computing the first sum.')],
    forbidden: [technique('call', 'max', 'Do not use max(); update the best window yourself.'), technique('call', 'sorted', 'Do not sort; window order matters.')],
    hints: ['Subtract the value leaving the window and add the value entering it.', 'Initialize best from the first complete window.'],
    tags: ['sliding window', 'algorithms'],
  },
  {
    title: 'Most Frequent Skill',
    concept: 'Frequency counting',
    task: 'Complete most_frequent(values). Return the first value with the highest frequency. Return None for an empty list.',
    starter: `def most_frequent(values):\n    counts = {}\n    # Count values, then find the first highest count.\n    pass`,
    cases: [
      { input: 'most_frequent(["py", "js", "py"])', expected: 'py', scenario: 'Find a clear winner.' },
      { input: 'most_frequent(["a", "b", "b", "a"])', expected: 'a', scenario: 'Resolve a tie by first appearance.' },
      { input: 'most_frequent([])', expected: null, scenario: 'Handle empty input.' },
      { input: 'most_frequent([4, 4, 2, 4, 2])', expected: 4, scenario: 'Count numeric values.' },
    ],
    hidden: { input: 'most_frequent(["x", "y", "z", "z"])', expected: 'z', scenario: 'Count unseen strings.' },
    required: [technique('ast-node', 'For', 'Use for loops to build and inspect a frequency dictionary.')],
    forbidden: [technique('call', 'Counter', 'Do not use Counter(); build counts manually.'), technique('call', 'max', 'Do not use max(); track the best value yourself.'), technique('call', 'sorted', 'Do not sort the input.')],
    hints: ['First build counts with dict.get(value, 0).', 'Loop through the original values again to preserve tie order.'],
    tags: ['frequencies', 'dictionaries'],
  },
  {
    title: 'Group the Cohort',
    concept: 'Grouping records',
    task: 'Complete group_names(records). Return a dictionary mapping each track to learner names in original order.',
    starter: `def group_names(records):\n    groups = {}\n    # Group each record by its track.\n    return groups`,
    cases: [
      { input: 'group_names([{"name": "Ada", "track": "Python"}, {"name": "Tobi", "track": "React"}, {"name": "Musa", "track": "Python"}]).get("Python")', expected: ['Ada', 'Musa'], scenario: 'Group learners across two tracks.' },
      { input: 'group_names([{"name": "Zainab", "track": "JS"}]).get("JS")', expected: ['Zainab'], scenario: 'Group one learner.' },
      { input: 'len(group_names([]))', expected: 0, scenario: 'Handle no records.' },
      { input: 'group_names([{"name": "A", "track": "React"}, {"name": "B", "track": "React"}]).get("React")', expected: ['A', 'B'], scenario: 'Preserve order within one group.' },
    ],
    hidden: { input: 'group_names([{"name": "D", "track": "Data"}]).get("Data")', expected: ['D'], scenario: 'Create an unseen group.' },
    required: [technique('ast-node', 'For', 'Use a for loop to visit every learner record.'), technique('call', 'setdefault', 'Use setdefault(track, []) before appending a name.')],
    hints: ['groups.setdefault(track, []).append(name) is useful here.'],
    tags: ['grouping', 'dictionaries'],
  },
  {
    title: 'Days Between Dates',
    concept: 'Date calculations',
    task: 'Complete days_between(first, second). Inputs use YYYY-MM-DD. Return the absolute number of calendar days between them.',
    starter: `from datetime import date\n\ndef days_between(first, second):\n    # Parse both dates and return the absolute day difference.\n    pass`,
    cases: [
      { input: 'days_between("2026-08-01", "2026-08-15")', expected: 14, scenario: 'Measure two weeks.' },
      { input: 'days_between("2026-08-15", "2026-08-01")', expected: 14, scenario: 'Work regardless of date order.' },
      { input: 'days_between("2026-08-15", "2026-08-15")', expected: 0, scenario: 'Handle the same date.' },
      { input: 'days_between("2024-02-28", "2024-03-01")', expected: 2, scenario: 'Handle a leap day.' },
    ],
    hidden: { input: 'days_between("2025-12-31", "2026-01-02")', expected: 2, scenario: 'Cross a year boundary.' },
    required: [technique('call', 'fromisoformat', 'Parse each date with date.fromisoformat().')],
    forbidden: [technique('call', 'strptime', 'Do not use strptime(); ISO dates have a simpler parser.')],
    hints: ['Subtracting date objects returns a timedelta.', 'Use abs(delta.days).'],
    tags: ['dates', 'standard library'],
  },
  {
    title: 'Completed Project Titles',
    concept: 'JSON-shaped data',
    task: 'Complete completed_titles(projects). Return titles whose finished field is exactly True. Missing finished values count as False.',
    starter: `def completed_titles(projects):\n    # Read each dictionary safely and return matching titles.\n    pass`,
    cases: [
      { input: 'completed_titles([{"title": "Loops", "finished": True}, {"title": "CSS", "finished": False}])', expected: ['Loops'], scenario: 'Filter mixed completion states.' },
      { input: 'completed_titles([{"title": "React", "finished": True}])', expected: ['React'], scenario: 'Return one completed title.' },
      { input: 'completed_titles([])', expected: [], scenario: 'Handle an empty response.' },
      { input: 'completed_titles([{"title": "Draft"}, {"title": "Done", "finished": True}])', expected: ['Done'], scenario: 'Handle a missing finished field.' },
    ],
    hidden: { input: 'completed_titles([{"title": "A", "finished": 1}, {"title": "B", "finished": True}])', expected: ['B'], scenario: 'Require the boolean True, not merely a truthy value.' },
    required: [technique('ast-node', 'ListComp', 'Use a list comprehension to select completed titles.'), technique('call', 'get', 'Use project.get("finished") to handle missing fields safely.')],
    hints: ['Check project.get("finished") is True for an exact boolean match.'],
    tags: ['json', 'data filtering'],
  },
  {
    title: 'Test a Clamp Function',
    concept: 'Assertions and boundaries',
    task: 'Complete clamp(value, low, high). Return low below the range, high above it, and value inside it.',
    starter: `def clamp(value, low, high):\n    # Use explicit comparisons and returns.\n    pass`,
    cases: [
      { input: 'clamp(12, 0, 10)', expected: 10, scenario: 'Clamp a value above the range.' },
      { input: 'clamp(-2, 0, 10)', expected: 0, scenario: 'Clamp a value below the range.' },
      { input: 'clamp(6, 0, 10)', expected: 6, scenario: 'Keep a value inside the range.' },
      { input: 'clamp(5, 5, 5)', expected: 5, scenario: 'Handle equal boundaries.' },
    ],
    hidden: { input: 'clamp(2.5, 1.5, 3.5)', expected: 2.5, scenario: 'Handle decimal boundaries.' },
    required: [technique('ast-node', 'If', 'Use explicit if statements for the range boundaries.')],
    forbidden: [technique('call', 'min', 'Do not use min() in this boundary exercise.'), technique('call', 'max', 'Do not use max() in this boundary exercise.'), technique('call', 'sorted', 'Do not sort values to clamp one number.')],
    hints: ['Check below low first and above high second.', 'Return value when it is already inside the boundaries.'],
    tags: ['testing', 'boundaries'],
  },
]

// Each four-day module builds on the previous one. Fundamentals come before
// compact syntax, data processing, defensive code, and finally algorithms.
const pythonCurriculumOrder = [
  'Format a Learner Badge',
  'Number the Plan',
  'Pair Names and Scores',
  'Unpack the Results',
  'List Comprehension Workshop',
  'Profile Merge',
  'Shared Skills Finder',
  'Completed Project Titles',
  'Group the Cohort',
  'Most Frequent Skill',
  'Rank the Learners',
  'Sort by Word Length',
  'Validate Every Score',
  'Username Gate',
  'Test a Clamp Function',
  'Safe Division',
  'Serve the Queue',
  'Days Between Dates',
  'Recursive Factorial',
  'Bracket Checker',
  'Binary Search Lab',
  'Best Study Window',
] as const

const pythonCurriculumRank = new Map<string, number>(pythonCurriculumOrder.map((title, index) => [title, index]))
const orderedPythonCurriculumModules = [...pythonCurriculumModules].sort(
  (first, second) => (pythonCurriculumRank.get(first.title) ?? Number.MAX_SAFE_INTEGER) - (pythonCurriculumRank.get(second.title) ?? Number.MAX_SAFE_INTEGER),
)

function pythonLiteral(value: RuntimeExpected): string {
  if (value === null) return 'None'
  if (value === true) return 'True'
  if (value === false) return 'False'
  if (Array.isArray(value)) return `[${value.map((item) => pythonLiteral(item)).join(', ')}]`
  return JSON.stringify(value) ?? 'None'
}

function starterFunctionName(starter: string): string | undefined {
  return starter.match(/(?:^|\n)def\s+([A-Za-z_]\w*)\s*\(/)?.[1]
}

function generatedPythonChallenges(): DailyChallenge[] {
  return orderedPythonCurriculumModules.flatMap((module, topicIndex) => pythonGrowthPhases.map((phase, phaseIndex) => {
    const day = 13 + topicIndex * pythonGrowthPhases.length + phaseIndex
    const example = module.cases[phaseIndex]
    const functionName = starterFunctionName(module.starter)
    const savedResultName = phaseIndex === 1 ? 'practice_result' : phaseIndex === 2 ? 'edge_result' : undefined
    const phaseStarter = savedResultName
      ? `${module.starter}\n\n# Call the function with today's example and save its answer.\n${savedResultName} = None\nprint(${savedResultName})`
      : phaseIndex === 3
        ? `${module.starter}\n\n# Add an assert for today's example below.\n\nprint(${example.input})`
        : `${module.starter}\n\nprint(${example.input})`
    const phaseRequirement = savedResultName
      ? ` After the function, set ${savedResultName} = ${example.input}.`
      : phaseIndex === 3
        ? ` Add this self-check below the function: assert ${example.input} == ${pythonLiteral(example.expected)}.`
        : ''
    const validation: ValidationRule[] = [
      pyTechniqueCheck(`python-${day}-technique`, `Uses the required ${module.concept.toLowerCase()} workflow`, {
        scope: functionName ? { kind: 'function', name: functionName } : undefined,
        required: module.required,
        forbidden: module.forbidden,
      }),
      pyCheck(`python-${day}-sample`, example.scenario, example.input, example.expected, savedResultName || phaseIndex === 3 ? 30 : 50),
      pyCheck(`python-${day}-hidden`, module.hidden.scenario, module.hidden.input, module.hidden.expected, 30, true),
    ]
    if (savedResultName) {
      validation.push(pyCheck(`python-${day}-saved-result`, `Saves today's function result in ${savedResultName}`, savedResultName, example.expected, 20))
    }
    if (phaseIndex === 3) {
      validation.push(pyTechniqueCheck(`python-${day}-self-check`, 'Adds a working assert statement', {
        required: [technique('ast-node', 'Assert', `Add assert ${example.input} == ${pythonLiteral(example.expected)} below the function.`)],
      }))
    }
    const prompt = `${module.task} In this “${phase.label}” step, ${phase.verb}. ${example.scenario}${phaseRequirement}`
    const phaseHints = savedResultName
      ? [...module.hints, `Replace None with ${example.input}.`]
      : phaseIndex === 3
        ? [...module.hints, `Add: assert ${example.input} == ${pythonLiteral(example.expected)}`]
        : module.hints
    return {
      id: `python-day-${day}`,
      day,
      track: 'python' as const,
      title: `${module.title}: ${phase.label}`,
      summary: `${phase.verb.charAt(0).toUpperCase()}${phase.verb.slice(1)} while practising ${module.concept.toLowerCase()}.`,
      prompt,
      concept: module.concept,
      difficulty: topicIndex < 7 ? 'Beginner' as const : topicIndex < 16 ? 'Intermediate' as const : 'Advanced' as const,
      estimatedMinutes: topicIndex < 7 ? 15 : topicIndex < 16 ? 20 : 25,
      instructions: challengeInstructions('python', prompt, validation),
      examples: [{ label: `Day ${day} example`, input: example.input, expectedOutput: displayExpected(example.expected), explanation: example.scenario }],
      starterFiles: pythonFile(phaseStarter),
      validation,
      expectedOutcome: `${example.input} returns ${displayExpected(example.expected)}. The “${phase.label}” requirement, hidden case, and workflow constraints must all pass.`,
      hints: phaseHints,
      tags: [...module.tags, 'daily practice'],
    }
  }))
}

function materializePythonSeeds(): DailyChallenge[] {
  return pythonChallengeSeeds.map((seed, index) => ({
    id: `python-day-${index + 1}`,
    day: index + 1,
    track: 'python',
    title: seed.title,
    summary: seed.expected,
    prompt: seed.prompt,
    concept: seed.concept,
    difficulty: seed.difficulty ?? 'Beginner',
    estimatedMinutes: seed.minutes ?? (index < 7 ? 12 : 18),
    instructions: seed.instructions ?? challengeInstructions('python', seed.prompt, seed.validation),
    examples: seed.examples ?? challengeExamples(seed),
    starterFiles: pythonFile(seed.code),
    validation: seed.validation,
    expectedOutcome: seed.expected,
    hints: seed.hints,
    tags: seed.tags,
  }))
}

const reactChallengeSeeds: ChallengeSeed[] = [
  {
    title: 'Welcome Card',
    concept: 'Your first component',
    prompt: 'Create a WelcomeCard component that receives name as a prop and renders “Welcome, Ada!” inside an h1. App should render the card for Ada.',
    code: `import './styles.css';\n\nfunction WelcomeCard({ name }) {\n  return <section className="card">{/* Add the greeting */}</section>;\n}\n\nexport default function App() {\n  return <WelcomeCard name="Ada" />;\n}`,
    expected: 'The preview shows a reusable card that says “Welcome, Ada!”.',
    validation: [sourceCheck('react-d1-a', 'Creates WelcomeCard with a name prop', '/App.js', ['function WelcomeCard', '{ name }'], 50), previewCheck('react-d1-b', 'Shows the personal greeting', 'Welcome, Ada!', 50, 'h1')],
    hints: ['Write <h1>Welcome, {name}!</h1> inside the section.'],
    tags: ['components', 'props'],
  },
  {
    title: 'Click Counter',
    concept: 'useState',
    prompt: 'Build a counter that starts at zero. One button adds one and another resets the count. Keep the value visible in an element labelled “Count”.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  // Add state and button handlers.\n  return <main className="card"><h1>Click counter</h1></main>;\n}`,
    expected: 'The preview shows a count that can increase and reset.',
    validation: [sourceCheck('react-d2-a', 'Stores the count in state', '/App.js', ['useState(0)', 'setCount'], 50), sourceCheck('react-d2-b', 'Adds click controls', '/App.js', ['onClick', 'Reset'], 50)],
    hints: ['const [count, setCount] = useState(0) creates the state pair.'],
    tags: ['state', 'events'],
  },
  {
    title: 'Skill Chip Row',
    concept: 'Rendering lists',
    prompt: 'Render every value from skills as a chip. Use map, show a “Skills I am growing” heading, and give each chip a stable key.',
    code: `import './styles.css';\n\nconst skills = ['Python', 'React', 'Teamwork'];\n\nexport default function App() {\n  return <main className="card"><h1>Skills I am growing</h1><div className="chips">{/* Render skills */}</div></main>;\n}`,
    expected: 'Three skill chips appear beneath the heading.',
    validation: [sourceCheck('react-d3-a', 'Maps over the skills', '/App.js', ['skills.map', 'key='], 50), previewCheck('react-d3-b', 'Renders the final skill', 'Teamwork', 50)],
    hints: ['skills.map(skill => <span key={skill}>{skill}</span>)'],
    tags: ['lists', 'jsx'],
  },
  {
    title: 'Show and Hide',
    concept: 'Conditional rendering',
    prompt: 'Add a button that toggles a learning tip. The button label should switch between “Show tip” and “Hide tip”.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [visible, setVisible] = useState(false);\n  return <main className="card"><h1>Today’s learning tip</h1>{/* Add the toggle */}</main>;\n}`,
    expected: 'The tip can be revealed and hidden without reloading the page.',
    validation: [sourceCheck('react-d4-a', 'Toggles visible state', '/App.js', ['setVisible', '!visible'], 50), sourceCheck('react-d4-b', 'Conditionally renders the tip', '/App.js', ['visible &&', 'Show tip'], 50)],
    hints: ['Use visible && <p>...</p> for the optional content.'],
    tags: ['conditionals', 'state'],
  },
  {
    title: 'Live Character Counter',
    concept: 'Controlled inputs',
    prompt: 'Create a textarea controlled by state and show “N / 120 characters” underneath. Prevent the learner from typing beyond 120 characters.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [message, setMessage] = useState('');\n  return <main className="card"><h1>Share an update</h1>{/* Add the textarea and count */}</main>;\n}`,
    expected: 'The count updates with every keystroke and the textarea stops at 120 characters.',
    validation: [sourceCheck('react-d5-a', 'Controls the textarea value', '/App.js', ['value={message}', 'onChange'], 50), sourceCheck('react-d5-b', 'Shows and enforces the limit', '/App.js', ['message.length', 'maxLength={120}'], 50)],
    hints: ['Use event.target.value inside onChange.'],
    tags: ['forms', 'state'],
  },
  {
    title: 'Reusable Product Card',
    concept: 'Props and composition',
    prompt: 'Build ProductCard using title, price, and inStock props. Render two different products and show “Sold out” when inStock is false.',
    code: `import './styles.css';\n\nconst products = [\n  { id: 1, title: 'Notebook', price: 2500, inStock: true },\n  { id: 2, title: 'Headphones', price: 18000, inStock: false }\n];\n\nfunction ProductCard(props) {\n  return null;\n}\n\nexport default function App() {\n  return <main><h1>Student shop</h1></main>;\n}`,
    expected: 'Two product cards display their own data and the unavailable item says “Sold out”.',
    validation: [sourceCheck('react-d6-a', 'Maps products into cards', '/App.js', ['products.map', '<ProductCard'], 50), previewCheck('react-d6-b', 'Shows unavailable stock', 'Sold out', 50)],
    hints: ['Destructure props in the ProductCard parameter.'],
    tags: ['props', 'components'],
  },
  {
    title: 'Active Learner List',
    concept: 'Filtering arrays',
    prompt: 'Render only learners whose active value is true. Show each active learner’s name and track, plus a count in the heading.',
    code: `import './styles.css';\n\nconst learners = [\n  { id: 1, name: 'Ada', track: 'Python', active: true },\n  { id: 2, name: 'Musa', track: 'React', active: false },\n  { id: 3, name: 'Tobi', track: 'JavaScript', active: true }\n];\n\nexport default function App() {\n  // Derive activeLearners, then render them.\n  return <main className="card"><h1>Active learners</h1></main>;\n}`,
    expected: 'Ada and Tobi appear, Musa does not, and the heading reports 2 active learners.',
    validation: [sourceCheck('react-d7-a', 'Filters active learners', '/App.js', ['learners.filter', 'learner.active'], 50), previewCheck('react-d7-b', 'Renders an active learner', 'Tobi', 50)],
    hints: ['Filter first, then map activeLearners in JSX.'],
    tags: ['filtering', 'lists'],
  },
  {
    title: 'Join Form',
    concept: 'Form submission',
    prompt: 'Build a name and email form. Prevent the default refresh, then replace the form with “Welcome to the lab, NAME!” after a valid submission.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [name, setName] = useState('');\n  const [email, setEmail] = useState('');\n  const [submitted, setSubmitted] = useState(false);\n  return <main className="card"><h1>Join the study room</h1></main>;\n}`,
    expected: 'A controlled form submits without a reload and shows a personal success message.',
    validation: [sourceCheck('react-d8-a', 'Handles form submission', '/App.js', ['onSubmit', 'preventDefault', 'setSubmitted'], 50), sourceCheck('react-d8-b', 'Controls both inputs', '/App.js', ['setName', 'setEmail', 'value={name}', 'value={email}'], 50)],
    hints: ['Put the handler on form, not on the button.'],
    tags: ['forms', 'events'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Course Search',
    concept: 'Derived state',
    prompt: 'Add a search input that filters courses by title without changing the original array. Matching should ignore letter case.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nconst courses = ['Python Basics', 'React Interfaces', 'JavaScript Logic', 'Python Projects'];\n\nexport default function App() {\n  const [query, setQuery] = useState('');\n  return <main className="card"><h1>Find a course</h1></main>;\n}`,
    expected: 'Typing “python” leaves the two Python courses visible.',
    validation: [sourceCheck('react-d9-a', 'Filters by the query', '/App.js', ['courses.filter', 'toLowerCase', 'includes'], 50), sourceCheck('react-d9-b', 'Controls the search input', '/App.js', ['value={query}', 'setQuery'], 50)],
    hints: ['Derive filteredCourses on every render; no extra state is needed.'],
    tags: ['search', 'derived state'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Goal Progress Bar',
    concept: 'Dynamic styles',
    prompt: 'Show completed out of total lessons, a percentage label, and a progress fill whose width reflects that percentage. Keep the value between 0 and 100.',
    code: `import './styles.css';\n\nfunction Progress({ completed, total }) {\n  // Calculate and render the percentage.\n  return null;\n}\n\nexport default function App() {\n  return <main className="card"><h1>Weekly goal</h1><Progress completed={7} total={10} /></main>;\n}`,
    expected: 'The weekly goal displays 70% and a progress bar filled to 70%.',
    validation: [sourceCheck('react-d10-a', 'Calculates the percentage', '/App.js', ['completed / total', 'Math.round'], 50), previewCheck('react-d10-b', 'Shows 70%', '70%', 50)],
    hints: ['Set style={{ width: `${percentage}%` }} on the fill element.'],
    tags: ['styles', 'props'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Learning Tabs',
    concept: 'Interactive navigation',
    prompt: 'Create Python, React, and JavaScript tabs. Clicking a tab should update the active button and reveal the matching description.',
    code: `import { useState } from 'react';\nimport './styles.css';\n\nconst tracks = {\n  Python: 'Build logic and useful tools.',\n  React: 'Create interactive interfaces.',\n  JavaScript: 'Bring web pages to life.'\n};\n\nexport default function App() {\n  const [active, setActive] = useState('Python');\n  return <main className="card"><h1>Choose a track</h1></main>;\n}`,
    expected: 'Three accessible tabs switch the displayed track description.',
    validation: [sourceCheck('react-d11-a', 'Builds tabs from the data', '/App.js', ['Object.keys', 'setActive'], 50), sourceCheck('react-d11-b', 'Shows active content', '/App.js', ['tracks[active]', 'active'], 50)],
    hints: ['Map Object.keys(tracks) into buttons.'],
    tags: ['navigation', 'state'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Session Timer',
    concept: 'useEffect and cleanup',
    prompt: 'Create a timer that counts seconds from zero while running. Add pause and reset controls, and always clear the interval when it is replaced or the component unmounts.',
    code: `import { useEffect, useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [seconds, setSeconds] = useState(0);\n  const [running, setRunning] = useState(false);\n  // Connect an interval to running state.\n  return <main className="card"><h1>Study session</h1></main>;\n}`,
    expected: 'The counter starts, pauses, resets, and never creates duplicate intervals.',
    validation: [sourceCheck('react-d12-a', 'Runs the timer in an effect', '/App.js', ['useEffect', 'setInterval'], 50), sourceCheck('react-d12-b', 'Cleans up the interval', '/App.js', ['clearInterval', 'return () =>'], 50)],
    hints: ['If running is false, the effect does not need an interval.'],
    tags: ['effects', 'timers'],
    difficulty: 'Intermediate',
    minutes: 25,
  },
]

const reactTopics = [
  'Component composition', 'Prop defaults', 'Children patterns', 'State updates', 'Immutable arrays', 'Immutable objects',
  'Controlled forms', 'Form validation', 'Conditional UI', 'List keys', 'Derived values', 'Effect dependencies',
  'Effect cleanup', 'Reusable hooks', 'Context values', 'Reducer state', 'Accessible controls', 'Keyboard interaction',
  'Responsive components', 'Loading states', 'Error states', 'Optimistic interfaces',
]

function generatedReactChallenges(): DailyChallenge[] {
  return reactTopics.flatMap((topic, topicIndex) => growthPhases.map((phase, phaseIndex) => {
    const day = 13 + topicIndex * growthPhases.length + phaseIndex
    const heading = `Day ${day} ${topic} Lab`
    return {
      id: `react-day-${day}`,
      day,
      track: 'react' as const,
      title: `${topic}: ${phase.label}`,
      summary: `Create a small interactive interface focused on ${topic.toLowerCase()}.`,
      prompt: `Use React to ${phase.verb} with ${topic.toLowerCase()}. Your finished component must render the heading “${heading}”, include an interactive button, and update visible UI state when the button is used.`,
      concept: topic,
      difficulty: day < 41 ? 'Beginner' as const : day < 76 ? 'Intermediate' as const : 'Advanced' as const,
      estimatedMinutes: day < 41 ? 18 : day < 76 ? 24 : 30,
      instructions: [
        `Build a focused ${topic.toLowerCase()} example and keep the App component as the default export.`,
        `Render the exact heading “${heading}” so the preview check can find it.`,
        'Add a button wired to React state, then confirm the visible value changes when it is clicked.',
        'Use Check work after the preview compiles without errors.',
      ],
      examples: [{ label: `Day ${day} preview`, input: '<App />', expectedOutput: `${heading} plus a working stateful button.` }],
      starterFiles: reactFiles(`import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  // Day ${day}: ${topic}\n  return <main className="card"><p>Build today's interface here.</p></main>;\n}`, `${baseCss}\nbody { display: grid; place-items: center; padding: 24px; }\n.card { width: min(100%, 560px); padding: 28px; border-radius: 24px; background: white; box-shadow: 0 18px 50px #17346b18; }`),
      validation: [
        previewCheck(`react-${day}-heading`, 'Renders the required heading', heading, 50, 'h1'),
        sourceCheck(`react-${day}-interaction`, 'Adds a stateful interaction', '/App.js', ['useState', 'onClick', 'set'], 50),
      ],
      expectedOutcome: `The preview shows “${heading}” and visibly responds to a button click.`,
      hints: ['Start with one small piece of state.', 'Connect an onClick handler, then render the updated value.'],
      tags: [topic.toLowerCase(), 'interface practice'],
    }
  }))
}

function materializeReactSeeds(): DailyChallenge[] {
  return reactChallengeSeeds.map((seed, index) => ({
    id: `react-day-${index + 1}`,
    day: index + 1,
    track: 'react',
    title: seed.title,
    summary: seed.expected,
    prompt: seed.prompt,
    concept: seed.concept,
    difficulty: seed.difficulty ?? (index < 7 ? 'Beginner' : 'Intermediate'),
    estimatedMinutes: seed.minutes ?? (index < 7 ? 15 : 20),
    instructions: seed.instructions ?? challengeInstructions('react', seed.prompt, seed.validation),
    examples: seed.examples ?? challengeExamples(seed),
    starterFiles: reactFiles(seed.code, `${baseCss}\nbody { display: grid; place-items: center; padding: 24px; }\n.card { width: min(100%, 560px); background: white; padding: 28px; border-radius: 24px; box-shadow: 0 18px 50px #17346b18; }\nbutton, input, textarea { padding: 10px 14px; border-radius: 10px; }`),
    validation: seed.validation,
    expectedOutcome: seed.expected,
    hints: seed.hints,
    tags: seed.tags,
  }))
}

const javascriptChallengeSeeds: ChallengeSeed[] = [
  {
    title: 'Greeting Function',
    concept: 'Functions and template strings',
    prompt: 'Complete makeGreeting so it returns “Hello, Ada — keep building!” for Ada and works with any other name.',
    code: `function makeGreeting(name) {\n  // Return the message.\n}\n\nconsole.log(makeGreeting('Ada'));`,
    expected: 'A reusable function returns a personal encouragement message.',
    validation: [jsCheck('js-d1-a', 'Greets Ada', 'makeGreeting("Ada")', 'Hello, Ada — keep building!', 50), jsCheck('js-d1-b', 'Works for another name', 'makeGreeting("Musa")', 'Hello, Musa — keep building!', 50, true)],
    hints: ['Use a template string wrapped in backticks.'],
    tags: ['functions', 'strings'],
  },
  {
    title: 'Bill Splitter',
    concept: 'Numbers and arithmetic',
    prompt: 'Return each person’s share of a bill after adding a percentage tip. Round the answer to two decimal places.',
    code: `function splitBill(bill, tipPercent, people) {\n  // Calculate one person's share.\n}\n\nconsole.log(splitBill(120, 20, 3));`,
    expected: 'A ₦120 bill with 20% tip split by 3 returns 48.',
    validation: [jsCheck('js-d2-a', 'Splits the sample bill', 'splitBill(120, 20, 3)', 48, 50), jsCheck('js-d2-b', 'Handles decimal money', 'splitBill(87.5, 12, 4)', 24.5, 50, true)],
    hints: ['Math.round(value * 100) / 100 keeps two-decimal precision.'],
    tags: ['math', 'functions'],
  },
  {
    title: 'Number Classifier',
    concept: 'Conditionals',
    prompt: 'Return “positive”, “negative”, or “zero” for any number. Make each branch explicit and easy to read.',
    code: `function classifyNumber(number) {\n  // Add conditions.\n}\n\n[-4, 0, 9].forEach(value => console.log(classifyNumber(value)));`,
    expected: 'Negative, zero, and positive numbers receive the correct label.',
    validation: [jsCheck('js-d3-a', 'Recognises negative', 'classifyNumber(-4)', 'negative'), jsCheck('js-d3-b', 'Recognises zero', 'classifyNumber(0)', 'zero'), jsCheck('js-d3-c', 'Recognises positive', 'classifyNumber(9)', 'positive', 50, true)],
    hints: ['Check number === 0 before returning positive.'],
    tags: ['conditionals', 'numbers'],
  },
  {
    title: 'Title Case',
    concept: 'Strings and arrays',
    prompt: 'Convert a sentence to title case: every word starts uppercase and its remaining letters are lowercase.',
    code: `function titleCase(text) {\n  // Split, transform, and join the words.\n}\n\nconsole.log(titleCase('welcome TO the lab'));`,
    expected: '“welcome TO the lab” becomes “Welcome To The Lab”.',
    validation: [jsCheck('js-d4-a', 'Formats a sentence', 'titleCase("welcome TO the lab")', 'Welcome To The Lab', 50), jsCheck('js-d4-b', 'Handles one word', 'titleCase("pYTHON")', 'Python', 50, true)],
    hints: ['Use split(" "), map, and join(" ").'],
    tags: ['strings', 'arrays'],
  },
  {
    title: 'Cart Total',
    concept: 'reduce()',
    prompt: 'Add price multiplied by quantity for every cart item. Return 0 for an empty cart.',
    code: `function cartTotal(items) {\n  // Return the full total.\n}\n\nconst cart = [{ price: 12.5, quantity: 2 }, { price: 8, quantity: 1 }];\nconsole.log(cartTotal(cart));`,
    expected: 'The sample cart totals 33.',
    validation: [jsCheck('js-d5-a', 'Calculates line totals', 'cartTotal([{price: 12.5, quantity: 2}, {price: 8, quantity: 1}])', 33, 50), jsCheck('js-d5-b', 'Handles an empty cart', 'cartTotal([])', 0, 50, true)],
    hints: ['Use reduce with an initial total of 0.'],
    tags: ['arrays', 'reduce'],
  },
  {
    title: 'Passing Scores',
    concept: 'filter()',
    prompt: 'Return scores greater than or equal to the pass mark. Preserve their original order and do not modify the input.',
    code: `function passingScores(scores, passMark = 50) {\n  // Return matching scores.\n}\n\nconsole.log(passingScores([32, 72, 50, 44, 91]));`,
    expected: 'The sample returns [72, 50, 91].',
    validation: [jsCheck('js-d6-a', 'Filters at the boundary', 'passingScores([32, 72, 50, 44, 91])', [72, 50, 91], 50), jsCheck('js-d6-b', 'Supports a custom mark', 'passingScores([60, 70, 80], 75)', [80], 50, true)],
    hints: ['Array.filter returns a new array.'],
    tags: ['arrays', 'filter'],
  },
  {
    title: 'Unique Tags',
    concept: 'Sets',
    prompt: 'Return each tag once in the order it first appeared. The supplied tags are already lowercase.',
    code: `function uniqueTags(tags) {\n  // Remove duplicates.\n}\n\nconsole.log(uniqueTags(['python', 'react', 'python', 'design']));`,
    expected: 'The sample returns ["python", "react", "design"].',
    validation: [jsCheck('js-d7-a', 'Removes duplicate tags', 'uniqueTags(["python", "react", "python", "design"])', ['python', 'react', 'design'], 50), jsCheck('js-d7-b', 'Handles an empty list', 'uniqueTags([])', [], 50, true)],
    hints: ['Spread a new Set back into an array.'],
    tags: ['sets', 'arrays'],
  },
  {
    title: 'Profile Lookup',
    concept: 'find()',
    prompt: 'Find a learner by id. Return the full object when found and null when the id does not exist.',
    code: `function findLearner(learners, id) {\n  // Search without changing the array.\n}\n\nconst learners = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Tobi' }];\nconsole.log(findLearner(learners, 2));`,
    expected: 'A matching learner object is returned, while a missing id returns null.',
    validation: [jsCheck('js-d8-a', 'Finds a learner', 'findLearner([{id: 1, name: "Ada"}, {id: 2, name: "Tobi"}], 2).name', 'Tobi', 50), jsCheck('js-d8-b', 'Returns null when missing', 'findLearner([{id: 1}], 9)', null, 50, true)],
    hints: ['Array.find returns undefined when nothing matches; use || null.'],
    tags: ['arrays', 'search'],
  },
  {
    title: 'Vote Counter',
    concept: 'Frequency objects',
    prompt: 'Turn an array of votes into an object mapping each option to its total count.',
    code: `function countVotes(votes) {\n  const totals = {};\n  // Count each vote.\n  return totals;\n}\n\nconsole.log(countVotes(['Python', 'React', 'Python']));`,
    expected: 'The sample result counts Python twice and React once.',
    validation: [jsCheck('js-d9-a', 'Counts a repeated vote', 'countVotes(["Python", "React", "Python"]).Python', 2, 50), jsCheck('js-d9-b', 'Counts every option', 'countVotes(["JS", "JS", "React"]).React', 1, 50, true)],
    hints: ['totals[vote] = (totals[vote] || 0) + 1'],
    tags: ['objects', 'counting'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Leaderboard Sort',
    concept: 'Sorting objects',
    prompt: 'Return a new player array sorted by score from highest to lowest. Do not mutate the original array.',
    code: `function rankPlayers(players) {\n  // Copy, then sort.\n}\n\nconst players = [{ name: 'Ada', score: 74 }, { name: 'Musa', score: 91 }];\nconsole.log(rankPlayers(players));`,
    expected: 'The highest-scoring player appears first and the input order is unchanged.',
    validation: [jsCheck('js-d10-a', 'Ranks highest first', 'rankPlayers([{name: "Ada", score: 74}, {name: "Musa", score: 91}])[0].name', 'Musa', 50), jsCheck('js-d10-b', 'Does not mutate the input', '(() => { const p=[{score:1},{score:3}]; rankPlayers(p); return p[0].score; })()', 1, 50, true)],
    hints: ['Use [...players].sort(...) to protect the original.'],
    tags: ['sorting', 'immutability'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Safe Email Check',
    concept: 'Validation',
    prompt: 'Return true only when a trimmed string has text before @ and contains a dot somewhere after @. This is a friendly practice validator, not a full email standard.',
    code: `function looksLikeEmail(value) {\n  // Add the three small checks.\n}\n\nconsole.log(looksLikeEmail('learner@l2e.ng'));`,
    expected: 'Common email-shaped values pass and incomplete values fail.',
    validation: [jsCheck('js-d11-a', 'Accepts a common email', 'looksLikeEmail("learner@l2e.ng")', true, 50), jsCheck('js-d11-b', 'Rejects an incomplete value', 'looksLikeEmail("learner@localhost")', false, 50, true)],
    hints: ['Find the indexes of @ and the final dot.'],
    tags: ['validation', 'strings'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Tiny Task List',
    concept: 'Classes',
    prompt: 'Complete TaskList so add creates an unfinished task, complete marks a matching task done, and remaining returns unfinished titles.',
    code: `class TaskList {\n  constructor() {\n    this.tasks = [];\n  }\n\n  add(title) {}\n  complete(title) {}\n  remaining() {}\n}\n\nconst list = new TaskList();\nlist.add('Finish challenge');\nconsole.log(list.remaining());`,
    expected: 'Tasks can be added, completed, and filtered through class methods.',
    validation: [jsCheck('js-d12-a', 'Adds a task', '(() => { const l=new TaskList(); l.add("Build"); return l.remaining(); })()', ['Build'], 50), jsCheck('js-d12-b', 'Completes a task', '(() => { const l=new TaskList(); l.add("Build"); l.complete("Build"); return l.remaining(); })()', [], 50, true)],
    hints: ['Store objects shaped like { title, done: false }.'],
    tags: ['classes', 'arrays'],
    difficulty: 'Intermediate',
    minutes: 25,
  },
]

const javascriptTopics = [
  'Array mapping', 'Array filtering', 'Array reduction', 'Object transforms', 'Destructuring', 'Spread syntax',
  'Rest parameters', 'Optional chaining', 'Nullish values', 'String parsing', 'Number formatting', 'Date helpers',
  'Pure functions', 'Closure state', 'Factory functions', 'Promises', 'Async functions', 'Fetch-shaped data',
  'DOM templates', 'Event delegation', 'Local storage', 'Defensive code',
]

function generatedJavaScriptChallenges(): DailyChallenge[] {
  return javascriptTopics.flatMap((topic, topicIndex) => growthPhases.map((phase, phaseIndex) => {
    const day = 13 + topicIndex * growthPhases.length + phaseIndex
    const multiplier = (day % 4) + 2
    const expected = [1, 2, 3, 4].filter((number) => number % 2 === 0).map((number) => number * multiplier)
    return {
      id: `javascript-day-${day}`,
      day,
      track: 'javascript' as const,
      title: `${topic}: ${phase.label}`,
      summary: `Practise ${topic.toLowerCase()} in a small, testable function.`,
      prompt: `Use ${topic.toLowerCase()} where it fits and ${phase.verb}. Complete solve(numbers): keep only even numbers and multiply each one by ${multiplier}. Return a new array.`,
      concept: topic,
      difficulty: day < 41 ? 'Beginner' as const : day < 76 ? 'Intermediate' as const : 'Advanced' as const,
      estimatedMinutes: day < 41 ? 15 : day < 76 ? 20 : 25,
      instructions: [
        `Complete solve(numbers) while practising ${topic.toLowerCase()}.`,
        `Keep the function name and parameter unchanged and return a new array.`,
        `Run solve([1, 2, 3, 4]); it must return [${expected.join(', ')}].`,
        'Choose Check work to run the visible input and a hidden empty-array case.',
      ],
      examples: [{ label: `Day ${day} example`, input: 'solve([1, 2, 3, 4])', expectedOutput: `[${expected.join(', ')}]` }],
      starterFiles: javascriptFiles(`function solve(numbers) {\n  // Day ${day}: keep evens and multiply each by ${multiplier}.\n}\n\nconsole.log(solve([1, 2, 3, 4]));`),
      validation: [
        jsCheck(`javascript-${day}-sample`, 'Transforms the sample without mutation', 'solve([1, 2, 3, 4])', expected, 60),
        jsCheck(`javascript-${day}-empty`, 'Handles an empty array', 'solve([])', [], 40, true),
      ],
      expectedOutcome: `The sample returns [${expected.join(', ')}] and an empty array returns [].`,
      hints: ['Filter the even values before mapping them.', 'Both filter and map return new arrays.'],
      tags: [topic.toLowerCase(), 'daily practice'],
    }
  }))
}

function materializeJavaScriptSeeds(): DailyChallenge[] {
  return javascriptChallengeSeeds.map((seed, index) => ({
    id: `javascript-day-${index + 1}`,
    day: index + 1,
    track: 'javascript',
    title: seed.title,
    summary: seed.expected,
    prompt: seed.prompt,
    concept: seed.concept,
    difficulty: seed.difficulty ?? (index < 7 ? 'Beginner' : 'Intermediate'),
    estimatedMinutes: seed.minutes ?? (index < 7 ? 12 : 18),
    instructions: seed.instructions ?? challengeInstructions('javascript', seed.prompt, seed.validation),
    examples: seed.examples ?? challengeExamples(seed),
    starterFiles: javascriptFiles(seed.code),
    validation: seed.validation,
    expectedOutcome: seed.expected,
    hints: seed.hints,
    tags: seed.tags,
  }))
}

export const dailyChallenges: Record<LearningTrack, DailyChallenge[]> = {
  python: [...materializePythonSeeds(), ...generatedPythonChallenges()],
  react: [...materializeReactSeeds(), ...generatedReactChallenges()],
  javascript: [...materializeJavaScriptSeeds(), ...generatedJavaScriptChallenges()],
}

export function getDailyChallenges(track: LearningTrack): DailyChallenge[] {
  return dailyChallenges[track]
}

export function getDailyChallenge(track: LearningTrack, day: number): DailyChallenge | undefined {
  return dailyChallenges[track].find((challenge) => challenge.day === day)
}

export const seedShowcaseItems: ShowcaseItem[] = [
  {
    id: 'showcase-amina-expenses',
    projectId: 'project-python-expenses',
    projectSlug: 'pocket-expense-tracker',
    projectTitle: 'Pocket Expense Tracker',
    track: 'python',
    author: 'Amina Yusuf',
    authorInitials: 'AY',
    title: 'Amina’s weekly money map',
    description: 'I added savings as a category and made the summary sort from highest to lowest spend.',
    files: pythonFile(`expenses = [{"category": "Food", "amount": 4200}, {"category": "Data", "amount": 3000}]\n\ndef category_summary(items):\n    totals = {}\n    for item in items:\n        category = item["category"]\n        totals[category] = totals.get(category, 0) + item["amount"]\n    return dict(sorted(totals.items(), key=lambda pair: pair[1], reverse=True))\n\nprint(category_summary(expenses))`),
    submittedAt: '2026-08-14T18:22:00.000Z',
    likes: 42,
    preview: { accent: '#0c9869', eyebrow: 'PYTHON BUILD', headline: 'Know where your money went.', body: 'A clean weekly category summary built with dictionaries.' },
    source: 'seed',
  },
  {
    id: 'showcase-david-profile',
    projectId: 'project-react-profile',
    projectSlug: 'profile-card-studio',
    projectTitle: 'Profile Card Studio',
    track: 'react',
    author: 'David Eze',
    authorInitials: 'DE',
    title: 'Developer card with a mood switch',
    description: 'My follow button works, and I added a tiny theme switch for late-night learning.',
    files: reactFiles(`import { useState } from 'react';\nimport './styles.css';\n\nexport default function App() {\n  const [following, setFollowing] = useState(false);\n  return <main className="card"><span>DE</span><h1>David Eze</h1><p>React learner • Enugu</p><button onClick={() => setFollowing(!following)}>{following ? 'Following' : 'Follow'}</button></main>;\n}`, baseCss),
    submittedAt: '2026-08-14T15:05:00.000Z',
    likes: 36,
    preview: { accent: '#08a5ca', eyebrow: 'REACT BUILD', headline: 'Learning in public.', body: 'A profile card with a follow interaction and thoughtful details.' },
    source: 'seed',
  },
  {
    id: 'showcase-chioma-quiz',
    projectId: 'project-python-quiz',
    projectSlug: 'quiz-game-engine',
    projectTitle: 'Quiz Game Engine',
    track: 'python',
    author: 'Chioma Nwosu',
    authorInitials: 'CN',
    title: 'Naija tech trivia engine',
    description: 'I created ten locally-inspired questions and added a different message for every score range.',
    files: pythonFile(`def score_answers(answers, answer_key):\n    return sum(a.upper() == b.upper() for a, b in zip(answers, answer_key))\n\ndef feedback(score, total):\n    ratio = score / total\n    if ratio == 1: return "Perfect"\n    if ratio >= .6: return "Great try"\n    return "Keep practising"`),
    submittedAt: '2026-08-13T20:40:00.000Z',
    likes: 58,
    preview: { accent: '#e44772', eyebrow: 'PYTHON BUILD', headline: 'How well do you know tech?', body: 'Ten quick questions, instant scoring, and another chance to improve.' },
    source: 'seed',
  },
  {
    id: 'showcase-tobi-timer',
    projectId: 'project-js-pomodoro',
    projectSlug: 'focus-timer',
    projectTitle: 'Focus Timer',
    track: 'javascript',
    author: 'Tobi Adeyemi',
    authorInitials: 'TA',
    title: 'Deep work, but make it calm',
    description: 'I added short breaks, a session counter, and a soft sound when focus time ends.',
    files: javascriptFiles(`let secondsLeft = 25 * 60;\nfunction formatTime(total) {\n  const minutes = String(Math.floor(total / 60)).padStart(2, '0');\n  const seconds = String(total % 60).padStart(2, '0');\n  return \`${'${minutes}:${seconds}'}\`;\n}\nconsole.log(formatTime(secondsLeft));`),
    submittedAt: '2026-08-13T16:11:00.000Z',
    likes: 31,
    preview: { accent: '#7557ff', eyebrow: 'JAVASCRIPT BUILD', headline: '25:00', body: 'One calm focus session at a time.' },
    source: 'seed',
  },
  {
    id: 'showcase-zainab-library',
    projectId: 'project-python-library',
    projectSlug: 'mini-library-manager',
    projectTitle: 'Mini Library Manager',
    track: 'python',
    author: 'Zainab Bello',
    authorInitials: 'ZB',
    title: 'Our cohort bookshelf',
    description: 'The app now supports borrowers, due dates, and a friendly overdue list.',
    files: pythonFile(`def available_titles(catalogue):\n    return [book["title"] for book in catalogue if not book["borrowed"]]\n\ndef borrow_book(catalogue, title):\n    for book in catalogue:\n        if book["title"] == title and not book["borrowed"]:\n            book["borrowed"] = True\n            return True\n    return False`),
    submittedAt: '2026-08-12T12:36:00.000Z',
    likes: 27,
    preview: { accent: '#8b5a2b', eyebrow: 'PYTHON BUILD', headline: 'A bookshelf shared by everyone.', body: 'Find what is free, borrow it, then bring it back for the next learner.' },
    source: 'seed',
  },
  {
    id: 'showcase-malik-budget',
    projectId: 'project-react-budget',
    projectSlug: 'budget-insight-dashboard',
    projectTitle: 'Budget Insight Dashboard',
    track: 'react',
    author: 'Malik Ibrahim',
    authorInitials: 'MI',
    title: 'Freelancer cash-flow view',
    description: 'I grouped transactions by week and added a savings goal meter above the category chart.',
    files: reactFiles(`import './styles.css';\nconst money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });\nexport default function App() {\n  return <main><p>AUGUST CASH FLOW</p><h1>{money.format(111500)}</h1><span>Available balance</span></main>;\n}`, baseCss),
    submittedAt: '2026-08-11T19:02:00.000Z',
    likes: 49,
    preview: { accent: '#0c9869', eyebrow: 'REACT BUILD', headline: '₦111,500', body: 'Available after expenses, with the savings goal still in sight.' },
    source: 'seed',
  },
]
