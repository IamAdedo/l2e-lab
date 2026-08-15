import type { JavaScriptExpressionValidation } from '../types'

export type JavaScriptCheckResult = { id: string; label: string; passed: boolean; actual?: unknown; message?: string }

export function runJavaScriptChecks(code: string, checks: JavaScriptExpressionValidation[], timeoutMs = 5_000) {
  return new Promise<{ ok: boolean; output: string; error?: string; results: JavaScriptCheckResult[] }>((resolve) => {
    const worker = new Worker(new URL('./javascript.worker.ts', import.meta.url), { type: 'module' })
    const requestId = crypto.randomUUID()
    const timeout = window.setTimeout(() => {
      worker.terminate()
      resolve({
        ok: false,
        output: '',
        error: 'Your JavaScript ran for more than 5 seconds and was stopped. Check for an infinite loop.',
        results: checks.map((check) => ({ id: check.id, label: check.label, passed: false, message: 'Timed out before this check completed.' })),
      })
    }, timeoutMs)

    worker.addEventListener('message', (event: MessageEvent<{ type: 'result'; requestId: string; ok: boolean; output: string; error?: string; results: JavaScriptCheckResult[] }>) => {
      if (event.data.requestId !== requestId) return
      window.clearTimeout(timeout)
      worker.terminate()
      resolve(event.data)
    })
    worker.addEventListener('error', () => {
      window.clearTimeout(timeout)
      worker.terminate()
      resolve({
        ok: false,
        output: '',
        error: 'The JavaScript checker could not start.',
        results: checks.map((check) => ({ id: check.id, label: check.label, passed: false, message: 'The checker could not run.' })),
      })
    })
    worker.postMessage({ type: 'check', requestId, code, checks })
  })
}
