/// <reference lib="webworker" />

type JavaScriptCheck = { id: string; label: string; expression: string; expected: unknown }
type RunMessage = { type: 'check'; requestId: string; code: string; checks: JavaScriptCheck[] }

const workerScope = self as unknown as DedicatedWorkerGlobalScope

function equal(actual: unknown, expected: unknown) {
  if (typeof actual === 'number' && typeof expected === 'number') return Math.abs(actual - expected) < Number.EPSILON * 10
  try { return JSON.stringify(actual) === JSON.stringify(expected) } catch { return Object.is(actual, expected) }
}

workerScope.addEventListener('message', (event: MessageEvent<RunMessage>) => {
  const { requestId, code, checks } = event.data
  const output: string[] = []
  const safeConsole = {
    log: (...values: unknown[]) => output.push(values.map(String).join(' ')),
    info: (...values: unknown[]) => output.push(values.map(String).join(' ')),
    warn: (...values: unknown[]) => output.push(values.map(String).join(' ')),
    error: (...values: unknown[]) => output.push(values.map(String).join(' ')),
  }

  try {
    const expressions = checks.map((check) => `(${check.expression})`).join(',\n')
    const evaluate = new Function('console', `"use strict";\n${code}\nreturn [${expressions}];`) as (consoleValue: typeof safeConsole) => unknown[]
    const actualValues = evaluate(safeConsole)
    const results = checks.map((check, index) => {
      const actual = actualValues[index]
      const passed = equal(actual, check.expected)
      return {
        id: check.id,
        label: check.label,
        passed,
        actual,
        message: passed ? undefined : `Expected ${JSON.stringify(check.expected)}, received ${JSON.stringify(actual)}.`,
      }
    })
    workerScope.postMessage({ type: 'result', requestId, ok: true, output: output.join('\n'), results })
  } catch (error) {
    workerScope.postMessage({
      type: 'result',
      requestId,
      ok: false,
      output: output.join('\n'),
      error: error instanceof Error ? error.message : String(error),
      results: checks.map((check) => ({ id: check.id, label: check.label, passed: false, message: 'Your code stopped before this check could run.' })),
    })
  }
})

export {}
