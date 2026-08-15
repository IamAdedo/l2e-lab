import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Braces,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  Code2,
  Copy,
  Eye,
  FileCheck2,
  GripVertical,
  Languages,
  Plus,
  Save,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import { campuses, cohorts, programmingLanguages, questionBank } from '../../data'
import { useApp } from '../../context/AppContext'
import { Button, Modal, StatusBadge } from '../../components/UI'
import type { Assessment, CodingQuestion, ProgrammingLanguageId } from '../../types'

const steps = [
  { number: 1, label: 'Details', icon: FileCheck2 },
  { number: 2, label: 'Questions', icon: Braces },
  { number: 3, label: 'Audience & rules', icon: UsersRound },
  { number: 4, label: 'Review', icon: ShieldCheck },
]

function makeBlank(): Assessment {
  return { id: `exam-${Date.now()}`, title: '', slug: '', eyebrow: 'Coding checkpoint', description: '', instructions: ['Complete every question before the timer ends.', 'Your work is saved automatically.', 'Final submissions cannot be changed.'], cohort: 'Cohort 4', campus: 'All campuses', status: 'draft', questionIds: [], allowedLanguages: ['javascript'], durationMinutes: 60, totalPoints: 0, passMark: 60, attemptsAllowed: 1, startsAt: '2026-08-20T09:00', endsAt: '2026-08-20T18:00', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'admin-01', participantsCount: 0, completedCount: 0, averageScore: null }
}

export function ExamBuilderPage() {
  const { id } = useParams()
  const { assessments, saveAssessment, notify } = useApp()
  const navigate = useNavigate()
  const existing = assessments.find((exam) => exam.id === id)
  const [form, setForm] = useState<Assessment>(() => existing || makeBlank())
  const [step, setStep] = useState(1)
  const [dirty, setDirty] = useState(false)
  const [questionSearch, setQuestionSearch] = useState('')
  const [questionPickerOpen, setQuestionPickerOpen] = useState(false)
  const [newQuestionOpen, setNewQuestionOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [customQuestions, setCustomQuestions] = useState<CodingQuestion[]>([])
  const allQuestions = [...questionBank, ...customQuestions]
  const selectedQuestions = form.questionIds.map((qid) => allQuestions.find((question) => question.id === qid)).filter((question): question is CodingQuestion => Boolean(question))
  const totalPoints = selectedQuestions.reduce((sum, question) => sum + question.points, 0)

  useEffect(() => { setForm((value) => ({ ...value, totalPoints })) }, [totalPoints])
  const update = <K extends keyof Assessment>(key: K, value: Assessment[K]) => { setForm((current) => ({ ...current, [key]: value })); setDirty(true) }

  const canContinue = step === 1 ? Boolean(form.title.trim() && form.description.trim() && form.durationMinutes >= 10) : step === 2 ? form.questionIds.length > 0 : true
  const readiness = [
    { label: 'Title and description added', done: Boolean(form.title && form.description) },
    { label: 'At least one coding question', done: form.questionIds.length > 0 },
    { label: 'Schedule and audience configured', done: Boolean(form.startsAt && form.endsAt && form.cohort) },
    { label: 'Pass mark and attempts set', done: form.passMark > 0 && form.attemptsAllowed > 0 },
  ]
  const ready = readiness.every((item) => item.done)

  const save = (status: 'draft' | 'scheduled') => {
    const finalForm = { ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), status, updatedAt: new Date().toISOString(), totalPoints }
    saveAssessment(finalForm); setDirty(false)
    notify(status === 'draft' ? 'Draft saved to this browser.' : 'Examination scheduled and ready to go live.')
    if (status === 'scheduled') navigate('/admin/exams')
  }

  const moveQuestion = (index: number, delta: number) => {
    const next = [...form.questionIds]; const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]; update('questionIds', next)
  }

  return (
    <div className="builder-page">
      <section className="builder-topline"><button className="back-link" onClick={() => navigate('/admin/exams')}><ArrowLeft size={17} />Back to examinations</button><div className="save-state"><i className={dirty ? 'dirty' : ''} />{dirty ? 'Unsaved changes' : 'All changes saved'}</div><Button variant="secondary" icon={<Eye size={16} />} onClick={() => navigate(`/app/assessments/${form.id}`)}>Preview</Button></section>
      <section className="builder-shell">
        <aside className="builder-steps"><div className="builder-steps__intro"><span className="eyebrow">EXAM BUILDER</span><h2>{existing ? 'Refine your assessment' : 'Create with confidence'}</h2><p>Four clear steps from an idea to a live coding checkpoint.</p></div><nav>{steps.map(({ number, label, icon: Icon }) => <button key={number} onClick={() => number < step && setStep(number)} className={`${step === number ? 'active' : ''} ${number < step ? 'done' : ''}`}><span>{number < step ? <Check size={15} /> : <Icon size={17} />}</span><div><small>Step {number}</small><strong>{label}</strong></div>{step === number && <i />}</button>)}</nav><div className="builder-steps__tip"><Sparkles size={18} /><p><strong>Design tip</strong>Use action verbs and real scenarios. Great questions feel like small products.</p></div></aside>

        <div className="builder-content">
          {step === 1 && <DetailsStep form={form} update={update} />}
          {step === 2 && <QuestionsStep questions={selectedQuestions} search={questionSearch} setSearch={setQuestionSearch} onAdd={() => setQuestionPickerOpen(true)} onCreate={() => setNewQuestionOpen(true)} onRemove={(qid) => update('questionIds', form.questionIds.filter((item) => item !== qid))} move={moveQuestion} />}
          {step === 3 && <AudienceStep form={form} update={update} />}
          {step === 4 && <ReviewStep form={form} questions={selectedQuestions} readiness={readiness} onEdit={setStep} />}
        </div>
      </section>

      <footer className="builder-footer"><div><Button variant="ghost" icon={<Save size={16} />} onClick={() => save('draft')}>Save draft</Button><span>{dirty ? 'Changes are stored when you save.' : `Last saved ${new Date(form.updatedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`}</span></div><div>{step > 1 && <Button variant="secondary" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} />Back</Button>}{step < 4 ? <Button disabled={!canContinue} onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={16} /></Button> : <Button disabled={!ready} icon={<Send size={16} />} onClick={() => setPublishOpen(true)}>Review & publish</Button>}</div></footer>

      <QuestionPicker open={questionPickerOpen} onClose={() => setQuestionPickerOpen(false)} selected={form.questionIds} questions={allQuestions} onChange={(ids) => update('questionIds', ids)} />
      <NewQuestionModal open={newQuestionOpen} onClose={() => setNewQuestionOpen(false)} onCreate={(question) => { setCustomQuestions((items) => [...items, question]); update('questionIds', [...form.questionIds, question.id]); setNewQuestionOpen(false); notify('Question created and added to the examination.') }} />
      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title="Schedule this examination?" eyebrow="Ready to publish" width="md" footer={<><Button variant="ghost" onClick={() => setPublishOpen(false)}>Keep editing</Button><Button onClick={() => save('scheduled')}><Send size={16} />Schedule examination</Button></>}><div className="publish-confirm"><span><CheckCircle2 size={30} /></span><div><h3>{form.title || 'Untitled examination'}</h3><p>This exam will be assigned to <strong>{form.cohort}</strong> at <strong>{form.campus}</strong>. Students will see it as upcoming until the scheduled start.</p><div><span><CalendarDays size={15} />{new Date(form.startsAt).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span><span><Clock3 size={15} />{form.durationMinutes} minutes</span><span><Braces size={15} />{form.questionIds.length} questions</span></div></div></div></Modal>
    </div>
  )
}

type UpdateFn = <K extends keyof Assessment>(key: K, value: Assessment[K]) => void

function DetailsStep({ form, update }: { form: Assessment; update: UpdateFn }) {
  return <div className="builder-step"><header><span className="eyebrow">Step 01</span><h2>Start with the essentials.</h2><p>Give students a clear picture of what this checkpoint measures.</p></header><div className="form-card"><label className="form-field form-field--full"><span>Examination title <b>*</b></span><input value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. JavaScript Foundations Check" /><small>{form.title.length}/80 characters</small></label><label className="form-field form-field--full"><span>Short description <b>*</b></span><textarea value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Tell fellows what skills this assessment will measure…" rows={4} /><small>{form.description.length}/240 characters</small></label><label className="form-field"><span>Assessment label</span><input value={form.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} placeholder="Monthly benchmark" /></label><label className="form-field"><span>Duration</span><div className="input-suffix"><input type="number" min="10" max="240" value={form.durationMinutes} onChange={(event) => update('durationMinutes', Number(event.target.value))} /><span>minutes</span></div></label><label className="form-field"><span>Pass mark</span><div className="input-suffix"><input type="number" min="1" max="100" value={form.passMark} onChange={(event) => update('passMark', Number(event.target.value))} /><span>%</span></div></label><label className="form-field"><span>Attempts allowed</span><select value={form.attemptsAllowed} onChange={(event) => update('attemptsAllowed', Number(event.target.value))}><option value={1}>One attempt</option><option value={2}>Two attempts</option><option value={3}>Three attempts</option></select></label></div><div className="builder-info"><Sparkles size={18} /><p><strong>Make the purpose obvious.</strong> Students perform better when the title and description name the exact skills being assessed.</p></div></div>
}

function QuestionsStep({ questions, onAdd, onCreate, onRemove, move }: { questions: CodingQuestion[]; search: string; setSearch: (value: string) => void; onAdd: () => void; onCreate: () => void; onRemove: (id: string) => void; move: (index: number, delta: number) => void }) {
  return <div className="builder-step"><header className="builder-step__row"><div><span className="eyebrow">Step 02</span><h2>Build the challenge.</h2><p>Choose questions, set their order and balance the difficulty.</p></div><div><Button variant="secondary" icon={<Plus size={16} />} onClick={onCreate}>New question</Button><Button icon={<BookOpenCheck size={16} />} onClick={onAdd}>Add from bank</Button></div></header><div className="question-summary"><span><strong>{questions.length}</strong><small>questions</small></span><i /><span><strong>{questions.reduce((sum, q) => sum + q.points, 0)}</strong><small>total points</small></span><i /><span><strong>{questions.reduce((sum, q) => sum + q.estimatedMinutes, 0)}m</strong><small>estimated time</small></span><i /><span><strong>{questions.filter((q) => q.difficulty === 'Hard').length}</strong><small>hard challenges</small></span></div>{questions.length ? <div className="selected-question-list">{questions.map((question, index) => <article key={question.id}><span className="drag-handle"><GripVertical /></span><span className="question-order">{String(index + 1).padStart(2, '0')}</span><div className="selected-question-list__copy"><div><strong>{question.title}</strong><StatusBadge tone={question.difficulty === 'Easy' ? 'green' : question.difficulty === 'Medium' ? 'amber' : 'red'} dot={false}>{question.difficulty}</StatusBadge></div><p>{question.summary}</p><small>{question.category} · {question.testCases.length} test cases · {question.estimatedMinutes} min</small></div><div className="selected-question-list__points"><strong>{question.points}</strong><span>points</span></div><div className="reorder-buttons"><button onClick={() => move(index, -1)} disabled={index === 0}><ChevronUp size={15} /></button><button onClick={() => move(index, 1)} disabled={index === questions.length - 1}><ChevronDown size={15} /></button></div><button className="icon-button icon-button--danger" onClick={() => onRemove(question.id)}><Trash2 size={16} /></button></article>)}</div> : <div className="question-empty"><span><Braces size={28} /></span><h3>No questions yet</h3><p>Start from the question bank or create a fresh coding challenge.</p><div><Button variant="secondary" onClick={onCreate}>Create question</Button><Button onClick={onAdd}>Browse question bank</Button></div></div>}<div className="difficulty-guide"><div><Target size={18} /><span><strong>A fair balance</strong><small>Aim for 30% easy · 50% medium · 20% hard</small></span></div><div className="difficulty-bar"><i className="easy" style={{ width: `${questions.length ? questions.filter(q => q.difficulty === 'Easy').length / questions.length * 100 : 0}%` }} /><i className="medium" style={{ width: `${questions.length ? questions.filter(q => q.difficulty === 'Medium').length / questions.length * 100 : 0}%` }} /><i className="hard" style={{ width: `${questions.length ? questions.filter(q => q.difficulty === 'Hard').length / questions.length * 100 : 0}%` }} /></div></div></div>
}

function AudienceStep({ form, update }: { form: Assessment; update: UpdateFn }) {
  const toggleLanguage = (id: ProgrammingLanguageId) => update('allowedLanguages', form.allowedLanguages.includes(id) ? form.allowedLanguages.filter((lang) => lang !== id) : [...form.allowedLanguages, id])
  return <div className="builder-step"><header><span className="eyebrow">Step 03</span><h2>Set the room and the rules.</h2><p>Choose who gets access, when it opens and how results behave.</p></header><div className="form-card form-card--sections"><section><header><span><UsersRound /></span><div><h3>Audience</h3><p>Assign this assessment to the right fellows.</p></div></header><div className="form-grid"><label className="form-field"><span>Cohort</span><select value={form.cohort} onChange={(event) => update('cohort', event.target.value)}>{cohorts.map((item) => <option key={item}>{item}</option>)}</select></label><label className="form-field"><span>Campus</span><select value={form.campus} onChange={(event) => update('campus', event.target.value as Assessment['campus'])}>{campuses.map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="audience-preview"><span><UsersRound size={20} /></span><div><strong>184 eligible fellows</strong><small>{form.cohort} · {form.campus}</small></div><button>View roster</button></div></section><section><header><span><CalendarDays /></span><div><h3>Availability window</h3><p>Control when students can start.</p></div></header><div className="form-grid"><label className="form-field"><span>Opens</span><input type="datetime-local" value={form.startsAt.slice(0, 16)} onChange={(event) => update('startsAt', event.target.value)} /></label><label className="form-field"><span>Closes</span><input type="datetime-local" value={form.endsAt.slice(0, 16)} onChange={(event) => update('endsAt', event.target.value)} /></label></div></section><section><header><span><Languages /></span><div><h3>Allowed languages</h3><p>Students choose one language per question.</p></div></header><div className="language-options">{programmingLanguages.map((language) => <button key={language.id} className={form.allowedLanguages.includes(language.id) ? 'selected' : ''} onClick={() => toggleLanguage(language.id)}><span>{language.shortName}</span><div><strong>{language.name}</strong><small>{language.version}</small></div>{form.allowedLanguages.includes(language.id) && <Check size={16} />}</button>)}</div></section><section><header><span><Settings2 /></span><div><h3>Assessment rules</h3><p>These appear in the student briefing.</p></div></header><div className="rule-editor">{form.instructions.map((rule, index) => <div key={index}><span>{index + 1}</span><input value={rule} onChange={(event) => update('instructions', form.instructions.map((item, i) => i === index ? event.target.value : item))} /><button onClick={() => update('instructions', form.instructions.filter((_, i) => i !== index))}><X size={15} /></button></div>)}<button onClick={() => update('instructions', [...form.instructions, ''])}><Plus size={15} />Add another rule</button></div></section></div></div>
}

function ReviewStep({ form, questions, readiness, onEdit }: { form: Assessment; questions: CodingQuestion[]; readiness: { label: string; done: boolean }[]; onEdit: (step: number) => void }) {
  return <div className="builder-step"><header><span className="eyebrow">Step 04</span><h2>One last look.</h2><p>Review the complete student experience before you schedule it.</p></header><div className="review-layout"><div className="review-preview"><div className="review-preview__hero"><StatusBadge tone="blue">Upcoming</StatusBadge><span className="eyebrow">{form.eyebrow}</span><h3>{form.title || 'Untitled examination'}</h3><p>{form.description || 'Your assessment description will appear here.'}</p><div><span><Clock3 size={15} />{form.durationMinutes} min</span><span><Braces size={15} />{questions.length} questions</span><span><Target size={15} />{form.totalPoints} pts</span></div></div><section><header><h4>Challenge line-up</h4><button onClick={() => onEdit(2)}>Edit</button></header>{questions.map((question, index) => <div className="review-question" key={question.id}><span>{index + 1}</span><div><strong>{question.title}</strong><small>{question.category} · {question.difficulty}</small></div><b>{question.points} pts</b></div>)}</section><section><header><h4>Audience & schedule</h4><button onClick={() => onEdit(3)}>Edit</button></header><div className="review-facts"><span><UsersRound /><strong>{form.cohort}</strong><small>{form.campus}</small></span><span><CalendarDays /><strong>{new Date(form.startsAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</strong><small>{new Date(form.startsAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</small></span><span><Languages /><strong>{form.allowedLanguages.length} languages</strong><small>{form.allowedLanguages.join(', ')}</small></span></div></section></div><aside className="readiness-card"><span className="eyebrow">Publish readiness</span><h3>{readiness.filter(item => item.done).length} of {readiness.length} complete</h3><div className="readiness-progress"><span style={{ width: `${readiness.filter(item => item.done).length / readiness.length * 100}%` }} /></div><ul>{readiness.map((item) => <li key={item.label} className={item.done ? 'done' : ''}>{item.done ? <Check size={15} /> : <CircleAlert size={15} />}{item.label}</li>)}</ul><div><ShieldCheck size={19} /><p><strong>Integrity mode</strong>Autosave, hidden tests and activity tracking are enabled.</p></div></aside></div></div>
}

function QuestionPicker({ open, onClose, selected, questions, onChange }: { open: boolean; onClose: () => void; selected: string[]; questions: CodingQuestion[]; onChange: (ids: string[]) => void }) {
  const [local, setLocal] = useState(selected); const [query, setQuery] = useState('')
  useEffect(() => setLocal(selected), [selected, open])
  const filtered = questions.filter((question) => question.title.toLowerCase().includes(query.toLowerCase()) || question.tags.some((tag) => tag.includes(query.toLowerCase())))
  return <Modal open={open} onClose={onClose} title="Add from question bank" eyebrow="Reusable challenges" width="lg" footer={<><span className="modal-selection-count">{local.length} selected</span><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => { onChange(local); onClose() }}>Add selected questions</Button></>}><label className="search-field question-picker-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, topic or tag" /></label><div className="question-picker-list">{filtered.map((question) => { const active = local.includes(question.id); return <button key={question.id} className={active ? 'selected' : ''} onClick={() => setLocal(active ? local.filter((id) => id !== question.id) : [...local, question.id])}><span className="picker-check">{active && <Check size={14} />}</span><div><div><strong>{question.title}</strong><StatusBadge tone={question.difficulty === 'Easy' ? 'green' : question.difficulty === 'Medium' ? 'amber' : 'red'} dot={false}>{question.difficulty}</StatusBadge></div><p>{question.summary}</p><small>{question.category} · {question.testCases.length} tests · Used in 3 exams</small></div><b>{question.points}<small>pts</small></b></button> })}</div></Modal>
}

function NewQuestionModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (question: CodingQuestion) => void }) {
  const [title, setTitle] = useState(''); const [description, setDescription] = useState(''); const [difficulty, setDifficulty] = useState<CodingQuestion['difficulty']>('Medium'); const [points, setPoints] = useState(25); const [code, setCode] = useState('function solve(input) {\n  // Write your solution here\n}\n')
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title || !description) return; onCreate({ id: `q-${Date.now()}`, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), category: 'Custom', difficulty, summary: description, description, constraints: ['Write a correct and efficient solution.'], examples: [{ input: 'sample input', output: 'sample output' }], starterCode: { javascript: code }, testCases: [{ id: `tc-${Date.now()}`, input: 'sample input', expectedOutput: 'sample output', isHidden: false, points }], points, estimatedMinutes: 20, tags: ['custom'] }); setTitle(''); setDescription('') }
  return <Modal open={open} onClose={onClose} title="Create coding question" eyebrow="New challenge" width="lg" footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={() => document.getElementById('new-question-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}>Create & add</Button></>}><form id="new-question-form" className="new-question-form" onSubmit={submit}><div className="form-grid"><label className="form-field form-field--wide"><span>Question title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Normalize Campus Attendance" /></label><label className="form-field"><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as CodingQuestion['difficulty'])}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label className="form-field"><span>Points</span><input type="number" value={points} onChange={(event) => setPoints(Number(event.target.value))} /></label></div><label className="form-field"><span>Problem statement</span><textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the problem, expected input and output…" /></label><label className="form-field"><span>JavaScript starter code</span><div className="mini-editor"><Editor height="180px" theme="vs-dark" language="javascript" value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 13, padding: { top: 14 }, scrollBeyondLastLine: false }} /></div></label></form></Modal>
}
