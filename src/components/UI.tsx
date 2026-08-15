import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Check, X, AlertTriangle, Info, LoaderCircle } from 'lucide-react'

export type StatusTone = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'purple'

export function StatusBadge({ children, tone = 'slate', dot = true }: { children: ReactNode; tone?: StatusTone; dot?: boolean }) {
  return <span className={`status status--${tone}`}>{dot && <i />} {children}</span>
}

export function Avatar({ name, size = 'md', src }: { name: string; size?: 'sm' | 'md' | 'lg'; src?: string }) {
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
  return <span className={`avatar avatar--${size}`}>{src ? <img src={src} alt="" /> : initials}</span>
}

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' | 'amber' }) {
  return <div className="progress"><span className={`progress__bar progress__bar--${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

export function Button({ className = '', variant = 'primary', icon, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'; icon?: ReactNode }) {
  return <button className={`button button--${variant} ${className}`} {...props}>{icon}{children}</button>
}

export function EmptyState({ icon, title, copy, action }: { icon: ReactNode; title: string; copy: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state__icon">{icon}</span><h3>{title}</h3><p>{copy}</p>{action}</div>
}

export function Modal({ open, onClose, title, eyebrow, children, footer, width = 'md' }: { open: boolean; onClose: () => void; title: string; eyebrow?: string; children: ReactNode; footer?: ReactNode; width?: 'sm' | 'md' | 'lg' }) {
  if (!open) return null
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal modal--${width}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal__header">
          <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </section>
    </div>
  )
}

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export function Toast({ kind, message, onClose }: { kind: ToastKind; message: string; onClose: () => void }) {
  const icons = { success: <Check />, error: <X />, info: <Info />, warning: <AlertTriangle /> }
  return <div className={`toast toast--${kind}`}><span>{icons[kind]}</span><p>{message}</p><button onClick={onClose} aria-label="Dismiss"><X size={15} /></button></div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton ${className}`} />
}

export function Busy({ label = 'Loading' }: { label?: string }) {
  return <span className="busy"><LoaderCircle className="spin" size={17} />{label}</span>
}
