import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  AlertTriangle,
  ArrowLeft,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Cloud,
  Code2,
  Copy,
  Expand,
  FileCode2,
  FlaskConical,
  GripHorizontal,
  Info,
  Laptop2,
  ListChecks,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  Menu,
  Minimize2,
  Play,
  RotateCcw,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Wifi,
  X,
  XCircle,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { Button, Modal, StatusBadge } from '../components/UI'
import { programmingLanguages, questions } from '../data'
import { useApp } from '../context/AppContext'
import type { CodingQuestion, ProgrammingLanguageId, TestCase } from '../types'

type TestResult = { id: string; label: string; passed: boolean; output: string; expected: string; duration: number; hidden: boolean; error?: string }
type RunState = 'idle' | 'queued' | 'running' | 'complete' | 'error'

const functionNames: Record<string, string> = { 'q-001': 'signalStrength', 'q-002': 'cohortPairing', 'q-003': 'reviewQueue', 'q-004': 'learningPath', 'q-005': 'attendanceStreak', 'q-006': 'resourceScheduler', 'q-007': 'projectSlugger' }

function parseArgs(questionId: string, raw: string) {
  if (questionId === 'q-002' || questionId === 'q-004') return raw.split(';').map((part) => JSON.parse(part.trim()))
  if (questionId === 'q-005' || questionId === 'q-007') return [raw]
  return [JSON.parse(raw)]
}

async function executeInWorker(code: string, question: CodingQuestion, testCases: TestCase[]): Promise<TestResult[]> {
  const runnable = testCases.filter((test) => !test.input.includes('items') && !test.input.includes('requests') && !test.input.includes('dense') && !test.input.includes('repeated') && !test.input.includes(':'))
  const workerCode = `
    self.onmessage = (event) => {
      const { code, fnName, tests, questionId } = event.data;
      try {
        const fn = new Function(code + '\\n; return typeof ' + fnName + ' !== "undefined" ? ' + fnName + ' : null;')();
        if (!fn) throw new Error('Expected a function named ' + fnName + '.');
        const parseArgs = (id, raw) => {
          if (id === 'q-002' || id === 'q-004') return raw.split(';').map((part) => JSON.parse(part.trim()));
          if (id === 'q-005' || id === 'q-007') return [raw];
          return [JSON.parse(raw)];
        };
        const results = tests.map((test, index) => {
          const started = performance.now();
          try {
            const output = fn(...parseArgs(questionId, test.input));
            const text = typeof output === 'string' ? output : JSON.stringify(output);
            const expected = test.expectedOutput;
            return { id: test.id, label: test.label || 'Test ' + (index + 1), passed: String(text).replace(/\\s/g,'') === String(expected).replace(/\\s/g,''), output: String(text), expected, duration: Math.max(1, Math.round(performance.now() - started)), hidden: test.isHidden };
          } catch (error) { return { id: test.id, label: test.label || 'Test ' + (index + 1), passed: false, output: '', expected: test.expectedOutput, duration: Math.max(1, Math.round(performance.now() - started)), hidden: test.isHidden, error: error.message }; }
        });
        self.postMessage({ results });
      } catch (error) { self.postMessage({ error: error.message }); }
    };`
  return new Promise((resolve, reject) => {
    const blob = new Blob([workerCode], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const worker = new Worker(url)
    const timer = window.setTimeout(() => { worker.terminate(); URL.revokeObjectURL(url); reject(new Error('Execution timed out after 3 seconds.')) }, 3000)
    worker.onmessage = (event) => { window.clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); event.data.error ? reject(new Error(event.data.error)) : resolve(event.data.results) }
    worker.onerror = () => { window.clearTimeout(timer); worker.terminate(); URL.revokeObjectURL(url); reject(new Error('The sandbox could not execute this code.')) }
    worker.postMessage({ code, fnName: functionNames[question.id], tests: runnable, questionId: question.id })
  })
}

export function WorkspacePage() {
  const { id } = useParams()
  const { assessments, notify } = useApp()
  const navigate = useNavigate()
  const exam = assessments.find((item) => item.id === id) || assessments[0]
  const examQuestions = useMemo(() => questions.filter((question) => exam.questionIds.includes(question.id)), [exam.questionIds])
  const [questionIndex, setQuestionIndex] = useState(0)
  const current = examQuestions[questionIndex] || questions[0]
  const [language, setLanguage] = useState<ProgrammingLanguageId>('javascript')
  const [codes, setCodes] = useState<Record<string, string>>(() => Object.fromEntries(examQuestions.map((question) => [question.id, localStorage.getItem(`l2e-code-${exam.id}-${question.id}`) || question.starterCode.javascript || ''])))
  const [seconds, setSeconds] = useState(42 * 60 + 18)
  const [statementTab, setStatementTab] = useState<'problem' | 'submissions'>('problem')
  const [consoleTab, setConsoleTab] = useState<'tests' | 'custom' | 'output'>('tests')
  const [consoleOpen, setConsoleOpen] = useState(true)
  const [promptOpen, setPromptOpen] = useState(true)
  const [runState, setRunState] = useState<RunState>('idle')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [runError, setRunError] = useState('')
  const [customInput, setCustomInput] = useState(current.examples[0]?.input || '')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [autosave, setAutosave] = useState<'saved' | 'saving'>('saved')
  const [fullscreen, setFullscreen] = useState(false)
  const editorRef = useRef<unknown>(null)
  const code = codes[current.id] || current.starterCode[language] || ''

  useEffect(() => { const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer) }, [])
  useEffect(() => { if (seconds === 0) { setSubmitOpen(false); submitAssessment() } }, [seconds])
  useEffect(() => { setCustomInput(current.examples[0]?.input || ''); setTestResults([]); setRunState('idle'); setRunError('') }, [current.id])
  useEffect(() => { if (!fullscreen) return; const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setFullscreen(false); window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey) }, [fullscreen])

  const setCode = (value: string) => {
    setCodes((items) => ({ ...items, [current.id]: value })); setAutosave('saving')
    window.setTimeout(() => { localStorage.setItem(`l2e-code-${exam.id}-${current.id}`, value); setAutosave('saved') }, 500)
  }

  const runTests = useCallback(async (all = false) => {
    if (runState === 'running' || runState === 'queued') return
    setRunError(''); setRunState('queued'); setConsoleOpen(true); setConsoleTab('tests')
    await new Promise((resolve) => window.setTimeout(resolve, 280)); setRunState('running')
    if (language !== 'javascript') {
      await new Promise((resolve) => window.setTimeout(resolve, 700)); setRunError(`${programmingLanguages.find(item => item.id === language)?.name} execution will connect to the production sandbox API. Switch to JavaScript to run locally in this prototype.`); setRunState('error'); return
    }
    try {
      void parseArgs
      const tests = all ? current.testCases : current.testCases.filter((test) => !test.isHidden)
      const results = await executeInWorker(code, current, tests)
      setTestResults(results); setRunState('complete')
    } catch (error) { setRunError(error instanceof Error ? error.message : 'Execution failed.'); setRunState('error') }
  }, [code, current, language, runState])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); void runTests(false) }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') { event.preventDefault(); setSubmitOpen(true) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [runTests])

  const changeLanguage = (next: ProgrammingLanguageId) => {
    setLanguage(next)
    if (!codes[current.id] || codes[current.id] === current.starterCode[language]) setCodes((items) => ({ ...items, [current.id]: current.starterCode[next] || current.starterCode.javascript || '' }))
  }

  const submitAssessment = () => {
    setSubmitted(true)
    window.setTimeout(() => { notify('Assessment submitted successfully.'); navigate('/app/results/sub-1001') }, 1200)
  }
  const time = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
  const editedCount = examQuestions.filter((question) => (codes[question.id] || '').trim() !== (question.starterCode.javascript || '').trim()).length

  return (
    <div className={`workspace ${fullscreen ? 'workspace--fullscreen' : ''}`}>
      <div className="workspace-mobile-block"><span><Laptop2 size={34} /></span><h2>A larger screen gives you room to think.</h2><p>Open this assessment on a laptop or desktop to use the secure code lab.</p><Button variant="secondary" onClick={() => navigate('/app/assessments')}><ArrowLeft size={16} />Back to assessments</Button></div>
      <header className="workspace-topbar"><div className="workspace-topbar__brand"><Brand inverse compact /><i /><button onClick={() => setSubmitOpen(true)}><Menu size={18} /></button><div><strong>{exam.title}</strong><small><Cloud size={12} />{autosave === 'saved' ? 'All changes saved' : 'Saving…'}</small></div></div><div className="workspace-progress"><span>Question <b>{questionIndex + 1}</b> of {examQuestions.length}</span><div>{examQuestions.map((question, index) => <button key={question.id} onClick={() => setQuestionIndex(index)} className={`${index === questionIndex ? 'active' : ''} ${(codes[question.id] || '').trim() !== (question.starterCode.javascript || '').trim() ? 'edited' : ''}`}>{index + 1}</button>)}</div></div><div className="workspace-topbar__right"><span className={`workspace-timer ${seconds < 600 ? 'workspace-timer--warning' : ''}`}><Clock3 size={16} /><div><small>TIME LEFT</small><strong>{time}</strong></div></span><Button variant="secondary" onClick={() => setSubmitOpen(true)}>Submit assessment <Send size={15} /></Button></div></header>

      <main className={`workspace-body ${promptOpen ? '' : 'workspace-body--prompt-closed'}`}>
        <aside className="question-rail"><div>{examQuestions.map((question, index) => <button key={question.id} onClick={() => setQuestionIndex(index)} className={index === questionIndex ? 'active' : ''}><span>{index + 1}</span><i className={(codes[question.id] || '').trim() !== (question.starterCode.javascript || '').trim() ? 'edited' : ''} /></button>)}</div><span /><button title="Settings"><Settings2 size={18} /></button><button title="Integrity mode"><ShieldCheck size={18} /></button></aside>

        <section className="problem-pane"><header className="pane-tabs"><div><button className={statementTab === 'problem' ? 'active' : ''} onClick={() => setStatementTab('problem')}><FileCode2 size={15} />Problem</button><button className={statementTab === 'submissions' ? 'active' : ''} onClick={() => setStatementTab('submissions')}><ListChecks size={15} />Submissions</button></div><button onClick={() => setPromptOpen(false)} title="Collapse problem"><ChevronLeft size={17} /></button></header>{statementTab === 'problem' ? <div className="problem-scroll"><div className="problem-heading"><span className="eyebrow">QUESTION {String(questionIndex + 1).padStart(2, '0')}</span><h1>{current.title}</h1><div><StatusBadge tone={current.difficulty === 'Easy' ? 'green' : current.difficulty === 'Medium' ? 'amber' : 'red'} dot={false}>{current.difficulty}</StatusBadge><span>{current.category}</span><span>{current.points} points</span></div></div><p className="problem-summary">{current.description}</p>{current.inputFormat && <section><h3>Input</h3><p>{current.inputFormat}</p></section>}{current.outputFormat && <section><h3>Output</h3><p>{current.outputFormat}</p></section>}<section><h3>Examples</h3>{current.examples.map((example, index) => <div className="code-example" key={index}><header><span>Example {index + 1}</span><button onClick={() => navigator.clipboard?.writeText(example.input)}><Copy size={13} />Copy</button></header><div><span><b>Input</b><code>{example.input}</code></span><span><b>Output</b><code>{example.output}</code></span>{example.explanation && <p><Info size={14} />{example.explanation}</p>}</div></div>)}</section><section><h3>Constraints</h3><ul className="constraint-list">{current.constraints.map((item) => <li key={item}><code>{item}</code></li>)}</ul></section><div className="problem-tip"><Sparkles size={17} /><p><strong>Think before you type.</strong>Walk through one example by hand, then choose a data structure.</p></div></div> : <div className="submission-empty"><ListChecks size={26} /><h3>No submissions yet</h3><p>Your run history will appear here after you test your solution.</p></div>}</section>

        {!promptOpen && <button className="open-prompt" onClick={() => setPromptOpen(true)}><ChevronRight size={16} /><span>Problem</span></button>}

        <section className="code-pane"><header className="editor-toolbar"><div className="file-tab"><FileCode2 size={15} /><span>solution{programmingLanguages.find((item) => item.id === language)?.fileExtension}</span><i /></div><div className="editor-toolbar__actions"><label className="language-select"><span>{programmingLanguages.find((item) => item.id === language)?.shortName}</span><select value={language} onChange={(event) => changeLanguage(event.target.value as ProgrammingLanguageId)}>{exam.allowedLanguages.map((lang) => <option key={lang} value={lang}>{programmingLanguages.find(item => item.id === lang)?.name}</option>)}</select><ChevronDown size={13} /></label><button title="Reset code" onClick={() => setCode(current.starterCode[language] || current.starterCode.javascript || '')}><RotateCcw size={15} /></button><button title="Fullscreen editor" onClick={() => setFullscreen((value) => !value)}>{fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button></div></header><div className="editor-area"><Editor onMount={(editor) => { editorRef.current = editor }} theme="vs-dark" language={programmingLanguages.find((item) => item.id === language)?.monacoLanguage} value={code} onChange={(value) => setCode(value || '')} options={{ fontFamily: "'Cascadia Code', 'JetBrains Mono', monospace", fontSize: 14, lineHeight: 23, minimap: { enabled: false }, padding: { top: 18 }, scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: 'smooth', renderLineHighlight: 'all', bracketPairColorization: { enabled: true }, automaticLayout: true }} /></div>

          <section className={`console-pane ${consoleOpen ? '' : 'console-pane--closed'}`}><button className="console-resizer"><GripHorizontal size={18} /></button><header className="console-header"><div><button className={consoleTab === 'tests' ? 'active' : ''} onClick={() => { setConsoleTab('tests'); setConsoleOpen(true) }}><TestTube2 size={14} />Test cases {testResults.length > 0 && <span>{testResults.filter(item => item.passed).length}/{testResults.length}</span>}</button><button className={consoleTab === 'custom' ? 'active' : ''} onClick={() => { setConsoleTab('custom'); setConsoleOpen(true) }}><Terminal size={14} />Custom input</button><button className={consoleTab === 'output' ? 'active' : ''} onClick={() => { setConsoleTab('output'); setConsoleOpen(true) }}><Code2 size={14} />Console</button></div><button onClick={() => setConsoleOpen((value) => !value)}>{consoleOpen ? <ChevronDown size={16} /> : <ChevronLeft size={16} />}</button></header>{consoleOpen && <div className="console-content">{consoleTab === 'tests' && <TestOutput state={runState} results={testResults} error={runError} />}{consoleTab === 'custom' && <div className="custom-input"><label>Input</label><textarea value={customInput} onChange={(event) => setCustomInput(event.target.value)} spellCheck={false} /><small>Custom input runs locally and does not affect your score.</small></div>}{consoleTab === 'output' && <div className="terminal-output"><span>$ l2e-lab run solution.js</span>{runState === 'complete' ? <p><b>✓</b> Process finished with exit code 0</p> : <p>Run your code to see console output.</p>}</div>}</div>}<footer className="run-bar"><span><Wifi size={13} />Sandbox ready · Node 22</span><div><button className="keyboard-hint">Ctrl ↵</button><Button variant="dark" disabled={runState === 'running' || runState === 'queued'} onClick={() => void runTests(false)}>{runState === 'running' || runState === 'queued' ? <><LoaderCircle className="spin" size={15} />Running…</> : <><Play size={15} fill="currentColor" />Run code</>}</Button><Button disabled={runState === 'running' || runState === 'queued'} onClick={() => void runTests(true)}><FlaskConical size={15} />Run all tests</Button></div></footer></section>
        </section>
      </main>

      <Modal open={submitOpen} onClose={() => !submitted && setSubmitOpen(false)} title={submitted ? 'Submitting your work…' : 'Ready to submit?'} eyebrow="Final submission" width="md" footer={!submitted ? <><Button variant="ghost" onClick={() => setSubmitOpen(false)}>Keep working</Button><Button onClick={submitAssessment}><Send size={16} />Submit assessment</Button></> : undefined}>{submitted ? <div className="submitting-state"><span><LoaderCircle className="spin" /></span><h3>Running final checks</h3><p>Securely packaging your answers and execution history.</p></div> : <div className="submit-summary"><div className="submit-summary__warning"><AlertTriangle size={18} /><p>You cannot change your answers after submitting. Hidden tests will run on every question.</p></div><div className="submit-question-list">{examQuestions.map((question, index) => { const edited = (codes[question.id] || '').trim() !== (question.starterCode.javascript || '').trim(); return <div key={question.id}><span className={edited ? 'done' : ''}>{edited ? <Check size={14} /> : index + 1}</span><div><strong>{question.title}</strong><small>{edited ? 'Answer saved' : 'No changes from starter code'}</small></div><StatusBadge tone={edited ? 'green' : 'amber'}>{edited ? 'Ready' : 'Review'}</StatusBadge></div> })}</div><div className="submit-summary__footer"><span><Clock3 size={15} />{time} remaining</span><span><Cloud size={15} />{editedCount}/{examQuestions.length} answers saved</span></div></div>}</Modal>
    </div>
  )
}

function TestOutput({ state, results, error }: { state: RunState; results: TestResult[]; error: string }) {
  if (state === 'idle') return <div className="console-empty"><span><TestTube2 size={20} /></span><div><strong>Test your thinking</strong><p>Run the sample cases to check your solution.</p></div><kbd>Ctrl + Enter</kbd></div>
  if (state === 'queued' || state === 'running') return <div className="console-running"><span><LoaderCircle className="spin" /></span><div><strong>{state === 'queued' ? 'Preparing sandbox…' : 'Executing your code…'}</strong><p>Isolated worker · 3 second limit</p></div></div>
  if (state === 'error') return <div className="console-error"><span><XCircle size={18} /></span><div><strong>Execution failed</strong><code>{error}</code></div></div>
  return <div className="test-result-list">{results.map((result, index) => <div key={result.id} className={result.passed ? 'passed' : 'failed'}><span>{result.passed ? <Check size={14} /> : <X size={14} />}</span><div><strong>{result.hidden ? `Hidden test ${index + 1}` : result.label}</strong><small>{result.passed ? `Passed · ${result.duration}ms` : result.error || `Expected ${result.expected}, received ${result.output || 'undefined'}`}</small></div><b>{result.passed ? 'Passed' : 'Failed'}</b></div>)}</div>
}
