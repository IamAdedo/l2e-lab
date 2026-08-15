import { useCallback, useEffect, useRef, useState } from 'react'
import type { PythonTechniqueScope, PythonTechniqueTarget, ValidationRule } from '../types'

export type PythonCheckResult = {
  id: string
  label: string
  passed: boolean
  actual?: unknown
  message?: string
}

export type PythonRunResult = {
  ok: boolean
  stdout: string
  stderr: string
  returnValue?: unknown
  error?: string
  checks: PythonCheckResult[]
  durationMs: number
}

export type PythonRunnerState = 'idle' | 'loading' | 'ready' | 'running' | 'error'

type PendingRun = {
  requestId: string
  resolve: (result: PythonRunResult) => void
  timeout: number
}

type PythonWorkerCheck =
  | { id: string; label: string; hidden?: boolean; kind: 'python-expression'; expression: string; expected: unknown }
  | { id: string; label: string; hidden?: boolean; kind: 'stdout-contains'; expected: string; caseSensitive?: boolean }
  | {
    id: string
    label: string
    hidden?: boolean
    kind: 'python-technique'
    scope?: PythonTechniqueScope
    required?: PythonTechniqueTarget[]
    forbidden?: PythonTechniqueTarget[]
  }

const INITIAL_LOAD_TIMEOUT = 60_000
const EXECUTION_TIMEOUT = 10_000

function emptyFailure(message: string): PythonRunResult {
  return { ok: false, stdout: '', stderr: '', error: message, checks: [], durationMs: 0 }
}

export function usePythonRunner() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<PendingRun | null>(null)
  const [state, setState] = useState<PythonRunnerState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)

  const disposeWorker = useCallback(() => {
    workerRef.current?.terminate()
    workerRef.current = null
  }, [])

  const resolveAsTimedOut = useCallback((message: string) => {
    const pending = pendingRef.current
    if (!pending) return
    window.clearTimeout(pending.timeout)
    pendingRef.current = null
    pending.resolve(emptyFailure(message))
    disposeWorker()
    setState('error')
    setLoadError(message)
  }, [disposeWorker])

  const armTimeout = useCallback((duration: number, message: string) => {
    const pending = pendingRef.current
    if (!pending) return
    window.clearTimeout(pending.timeout)
    pending.timeout = window.setTimeout(() => resolveAsTimedOut(message), duration)
  }, [resolveAsTimedOut])

  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current
    const worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' })

    worker.addEventListener('message', (event: MessageEvent<Record<string, unknown>>) => {
      const message = event.data
      if (message.type === 'state') {
        if (message.state === 'loading') setState('loading')
        if (message.state === 'ready') {
          setState(pendingRef.current ? 'running' : 'ready')
          setLoadError(null)
        }
        if (message.state === 'executing') {
          setState('running')
          armTimeout(EXECUTION_TIMEOUT, 'Your Python program ran for more than 10 seconds, so it was stopped. Check for an infinite loop and try again.')
        }
        return
      }

      if (message.type !== 'result') return
      const pending = pendingRef.current
      if (!pending || pending.requestId !== message.requestId) return
      window.clearTimeout(pending.timeout)
      pendingRef.current = null
      const result = message as unknown as PythonRunResult & { type: 'result'; requestId: string }
      setState(result.ok ? 'ready' : 'error')
      setLoadError(result.ok ? null : result.error ?? 'Python could not run this code.')
      pending.resolve({
        ok: result.ok,
        stdout: result.stdout,
        stderr: result.stderr,
        returnValue: result.returnValue,
        error: result.error,
        checks: result.checks,
        durationMs: result.durationMs,
      })
    })

    worker.addEventListener('error', () => {
      resolveAsTimedOut('The Python runtime could not load. Check your internet connection and try again.')
    })

    workerRef.current = worker
    return worker
  }, [armTimeout, resolveAsTimedOut])

  const execute = useCallback((code: string, validation: ValidationRule[] = []) => {
    if (pendingRef.current) {
      return Promise.resolve(emptyFailure('Python is already running. Wait for it to finish or stop it first.'))
    }
    const requestId = crypto.randomUUID()
    const checks: PythonWorkerCheck[] = []
    validation.forEach((rule) => {
      if (rule.kind === 'python-expression') {
        checks.push({ id: rule.id, label: rule.label, hidden: rule.hidden, kind: rule.kind, expression: rule.expression, expected: rule.expected })
      }
      if (rule.kind === 'stdout-contains') {
        checks.push({ id: rule.id, label: rule.label, hidden: rule.hidden, kind: rule.kind, expected: rule.expected, caseSensitive: rule.caseSensitive })
      }
      if (rule.kind === 'python-technique') {
        checks.push({
          id: rule.id,
          label: rule.label,
          hidden: rule.hidden,
          kind: rule.kind,
          scope: rule.scope,
          required: rule.required,
          forbidden: rule.forbidden,
        })
      }
    })
    const worker = ensureWorker()
    setLoadError(null)
    setState((current) => current === 'idle' || current === 'error' ? 'loading' : 'running')

    return new Promise<PythonRunResult>((resolve) => {
      const timeout = window.setTimeout(
        () => resolveAsTimedOut('Python took too long to load. Check your internet connection, then try again.'),
        INITIAL_LOAD_TIMEOUT,
      )
      pendingRef.current = { requestId, resolve, timeout }
      worker.postMessage({ type: 'run', requestId, code, checks })
    })
  }, [ensureWorker, resolveAsTimedOut])

  const stop = useCallback(() => {
    resolveAsTimedOut('Run stopped. Your code is still saved in the editor.')
  }, [resolveAsTimedOut])

  const retry = useCallback(() => {
    disposeWorker()
    setLoadError(null)
    setState('idle')
  }, [disposeWorker])

  useEffect(() => () => {
    if (pendingRef.current) window.clearTimeout(pendingRef.current.timeout)
    disposeWorker()
  }, [disposeWorker])

  return {
    state,
    loadError,
    isBusy: state === 'loading' || state === 'running',
    run: (code: string) => execute(code),
    check: (code: string, validation: ValidationRule[]) => execute(code, validation),
    stop,
    retry,
  }
}
