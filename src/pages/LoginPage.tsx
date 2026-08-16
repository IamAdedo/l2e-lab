import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Braces,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UserRound,
  Wifi,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { Button } from '../components/UI'

export function LoginPage({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Enter the username and password issued by your campus.')
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => onLogin(username.trim()), 650)
  }

  const demoLogin = (role: 'student' | 'admin') => {
    setUsername(role === 'admin' ? 'admin' : 'amara.okafor')
    setPassword('lab2026')
    setError('')
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story__texture" />
        <div className="login-story__orb login-story__orb--one" />
        <div className="login-story__orb login-story__orb--two" />
        <header className="login-story__header">
          <Brand inverse />
          <span className="secure-pill"><ShieldCheck size={15} /> Secure assessment environment</span>
        </header>

        <div className="login-story__content">
          <div className="story-kicker"><span><Sparkles size={15} /></span>Built for Africa’s next great engineers</div>
          <h1>Think clearly.<br />Code boldly.<br /><em>Prove it.</em></h1>
          <p>A focused assessment lab where every challenge becomes evidence of what you can build.</p>

          <div className="floating-code-card">
            <div className="floating-code-card__top"><div><i /><i /><i /></div><span><Wifi size={13} /> Environment ready</span></div>
            <pre><code><b>const</b> future = <span>await</span> talentNation<br />  .learn()<br />  .build()<br />  .<strong>ship</strong>();</code></pre>
            <div className="floating-code-card__result"><span><Check size={14} /></span><div><b>All tests passed</b><small>4 assertions · 128ms</small></div><strong>100%</strong></div>
          </div>
        </div>

        <footer className="login-story__footer">
          <div className="story-stats"><span><strong>50+</strong><small>real projects</small></span><i /><span><strong>100%</strong><small>collaborative</small></span><i /><span><strong>∞</strong><small>potential</small></span></div>
          <div className="official-brand"><small>AN INITIATIVE OF</small><img src="/learn2earn-white.png" alt="Learn2Earn" /></div>
        </footer>
      </section>

      <section className="login-panel">
        <a className="login-back-link" href="/">← Back to the public Lab</a>
        <div className="login-panel__mobile-brand"><Brand /></div>
        <div className="login-card">
          <span className="login-icon"><TerminalSquare size={24} /></span>
          <div className="login-heading"><span>Welcome back</span><h2>Enter the Lab.</h2><p>Use the access details issued by your campus coordinator.</p></div>

          <form onSubmit={submit} noValidate>
            <label className="field-label" htmlFor="username">Username</label>
            <div className={`input-wrap ${error && !username ? 'input-wrap--error' : ''}`}><UserRound size={18} /><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder="e.g. amara.okafor" autoFocus /></div>

            <div className="label-row"><label className="field-label" htmlFor="password">Password</label><button type="button" className="text-button">Forgot password?</button></div>
            <div className={`input-wrap ${error && !password ? 'input-wrap--error' : ''}`}><LockKeyhole size={18} /><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            {error && <p className="form-error">{error}</p>}

            <Button className="login-submit" disabled={loading} type="submit">{loading ? <><span className="button-spinner" />Opening your lab…</> : <>Sign in to L2E LAB <ArrowRight size={18} /></>}</Button>
          </form>

          <div className="demo-access"><div><span>Preview the prototype</span><i /></div><p>No authentication is connected yet. Choose a workspace:</p><div className="demo-access__buttons"><button onClick={() => demoLogin('student')}><Braces size={16} /><span><b>Student demo</b><small>amara.okafor</small></span></button><button onClick={() => demoLogin('admin')}><ShieldCheck size={16} /><span><b>Admin demo</b><small>admin</small></span></button></div></div>

          <p className="access-note"><LockKeyhole size={14} /> Dashboard access is provisioned by Learn2Earn—there is no public signup.</p>
        </div>
        <footer className="login-panel__footer"><span>© 2026 L2E LAB</span><div><a href="mailto:support@learn2earn.ng">Support</a><a href="#privacy">Privacy</a></div></footer>
      </section>
    </main>
  )
}
