import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Code2, ShieldCheck, UserRound, X } from 'lucide-react'
import { Brand } from '../components/Brand'
import './username-gate.css'

type UsernameGateProps = {
  destinationLabel: string
  onConfirm: (name: string) => void
  onCancel: () => void
}

export function UsernameGate({ destinationLabel, onConfirm, onCancel }: UsernameGateProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  const errorId = useId()

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = name.trim().replace(/\s+/g, ' ').slice(0, 40)
    if (!cleaned) {
      setError('Enter a username to continue.')
      inputRef.current?.focus()
      return
    }
    onConfirm(cleaned)
  }

  return (
    <div className="username-gate" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <div
        className="username-gate__dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="username-gate__topbar">
          <Brand compact />
          <span><Code2 size={14} /> BUILDER CHECK-IN</span>
          <button type="button" onClick={onCancel} aria-label="Cancel and go back">
            <X size={18} />
          </button>
        </header>

        <div className="username-gate__body">
          <span className="username-gate__icon"><UserRound size={25} /></span>
          <p className="username-gate__eyebrow">ONE QUICK STEP</p>
          <h1 id={titleId}>What should we call you?</h1>
          <p id={descriptionId}>Choose a username before opening {destinationLabel}. This is only a display name for your work and progress.</p>

          <form onSubmit={submit} noValidate>
            <label htmlFor="learner-display-name">Username</label>
            <div className={`username-gate__input${error ? ' is-invalid' : ''}`}>
              <span>@</span>
              <input
                ref={inputRef}
                id="learner-display-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value.slice(0, 40))
                  if (error) setError('')
                }}
                placeholder="e.g. AdaCodes"
                maxLength={40}
                autoComplete="nickname"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
              />
              <small>{name.length}/40</small>
            </div>
            {error && <p className="username-gate__error" id={errorId} role="alert">{error}</p>}

            <div className="username-gate__actions">
              <button type="button" className="username-gate__cancel" onClick={onCancel}>Cancel</button>
              <button type="submit" className="username-gate__continue">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>

        <footer className="username-gate__privacy">
          <ShieldCheck size={15} />
          <p><strong>No password or signup required.</strong> Your username, completion progress, and visit time sync to L2E LAB when you are online.</p>
        </footer>
      </div>
    </div>
  )
}
