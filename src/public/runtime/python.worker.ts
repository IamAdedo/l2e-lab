/// <reference lib="webworker" />

import { loadPyodide, type PyodideInterface } from 'pyodide'

type PythonTechniqueTarget = { target: 'ast-node' | 'call' | 'syntax'; name: string; feedback: string }
type PythonTechniqueScope = { kind: 'function'; name: string }
type PythonCheckBase = { id: string; label: string; hidden?: boolean }

type PythonCheckRule =
  | (PythonCheckBase & { kind: 'python-expression'; expression: string; expected: unknown })
  | (PythonCheckBase & { kind: 'stdout-contains'; expected: string; caseSensitive?: boolean })
  | (PythonCheckBase & {
    kind: 'python-technique'
    scope?: PythonTechniqueScope
    required?: PythonTechniqueTarget[]
    forbidden?: PythonTechniqueTarget[]
  })

type RunMessage = {
  type: 'run'
  requestId: string
  code: string
  checks: PythonCheckRule[]
}

type CheckResult = {
  id: string
  label: string
  passed: boolean
  actual?: unknown
  message?: string
}

const workerScope = self as unknown as DedicatedWorkerGlobalScope
let runtimePromise: Promise<PyodideInterface> | null = null

function getRuntime() {
  if (!runtimePromise) {
    workerScope.postMessage({ type: 'state', state: 'loading' })
    runtimePromise = loadPyodide({
      indexURL: new URL('/pyodide/', workerScope.location.origin).href,
      stdout: () => undefined,
      stderr: () => undefined,
    }).then((runtime) => {
      workerScope.postMessage({ type: 'state', state: 'ready' })
      return runtime
    })
  }

  return runtimePromise
}

function normalize(value: unknown): unknown {
  if (value && typeof value === 'object' && 'toJs' in value) {
    const proxy = value as { toJs: (options?: { dict_converter?: typeof Object.fromEntries }) => unknown; destroy?: () => void }
    const converted = proxy.toJs({ dict_converter: Object.fromEntries })
    proxy.destroy?.()
    return converted
  }
  return value
}

function isEqual(actual: unknown, expected: unknown) {
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) <= 1e-9 * Math.max(1, Math.abs(actual), Math.abs(expected))
  }
  try {
    return JSON.stringify(actual) === JSON.stringify(expected)
  } catch {
    return Object.is(actual, expected)
  }
}

type PythonTechniqueAnalysis = { nodes: string[]; calls: string[]; syntax: string[] }
type PythonSourceAnalysis = PythonTechniqueAnalysis & { functions: Record<string, PythonTechniqueAnalysis> }
type PythonGlobals = NonNullable<NonNullable<Parameters<PyodideInterface['runPythonAsync']>[1]>['globals']>

function includesTechnique(analysis: PythonTechniqueAnalysis, target: PythonTechniqueTarget): boolean {
  const values = analysis[target.target === 'ast-node' ? 'nodes' : target.target === 'call' ? 'calls' : 'syntax']
  return values.some((value) => value.toLowerCase() === target.name.toLowerCase())
}

function toTechniqueAnalysis(value: unknown): PythonTechniqueAnalysis {
  const analysis = value && typeof value === 'object' ? value as Partial<PythonTechniqueAnalysis> : {}
  return {
    nodes: Array.isArray(analysis.nodes) ? analysis.nodes.map(String) : [],
    calls: Array.isArray(analysis.calls) ? analysis.calls.map(String) : [],
    syntax: Array.isArray(analysis.syntax) ? analysis.syntax.map(String) : [],
  }
}

async function analyseSource(pyodide: PyodideInterface, globals: PythonGlobals, source: string): Promise<PythonSourceAnalysis> {
  const namespace = globals as unknown as { set: (key: string, value: unknown) => void; delete: (key: string) => void }
  namespace.set('__l2e_source__', source)
  try {
    const analysis = normalize(await pyodide.runPythonAsync(`
import ast as __l2e_ast

def __l2e_call_name(node):
    if isinstance(node, __l2e_ast.Name):
        return node.id
    if isinstance(node, __l2e_ast.Attribute):
        return node.attr
    return ""

__l2e_tree = __l2e_ast.parse(__l2e_source__)

def __l2e_analyse_node(root, recursive_name=None):
    nodes = list(__l2e_ast.walk(root))
    syntax = []
    if any(isinstance(node, __l2e_ast.ExceptHandler) and node.type is None for node in nodes):
        syntax.append("bare-except")
    if any(isinstance(node, __l2e_ast.Dict) and any(key is None for key in node.keys) for node in nodes):
        syntax.append("dict-unpack")
    if recursive_name and any(
        isinstance(node, __l2e_ast.Call)
        and isinstance(node.func, __l2e_ast.Name)
        and node.func.id == recursive_name
        for node in nodes
    ):
        syntax.append("recursive-call")
    return {
        "nodes": [type(node).__name__ for node in nodes],
        "calls": [__l2e_call_name(node.func) for node in nodes
            if isinstance(node, __l2e_ast.Call) and __l2e_call_name(node.func)],
        "syntax": syntax,
    }

__l2e_full_analysis = __l2e_analyse_node(__l2e_tree)
if any(
    "recursive-call" in __l2e_analyse_node(function, function.name)["syntax"]
    for function in __l2e_ast.walk(__l2e_tree)
    if isinstance(function, (__l2e_ast.FunctionDef, __l2e_ast.AsyncFunctionDef))
):
    __l2e_full_analysis["syntax"].append("recursive-call")

{
    **__l2e_full_analysis,
    "functions": {
        function.name: __l2e_analyse_node(function, function.name)
        for function in __l2e_tree.body
        if isinstance(function, (__l2e_ast.FunctionDef, __l2e_ast.AsyncFunctionDef))
    },
}
`, { globals })) as Partial<PythonSourceAnalysis>
    const functions: Record<string, PythonTechniqueAnalysis> = {}
    if (analysis.functions && typeof analysis.functions === 'object') {
      Object.entries(analysis.functions).forEach(([name, functionAnalysis]) => {
        functions[name] = toTechniqueAnalysis(functionAnalysis)
      })
    }
    return {
      ...toTechniqueAnalysis(analysis),
      functions,
    }
  } finally {
    namespace.delete('__l2e_source__')
  }
}

async function execute(message: RunMessage) {
  const startedAt = performance.now()
  const stdout: string[] = []
  const stderr: string[] = []

  try {
    const pyodide = await getRuntime()
    workerScope.postMessage({ type: 'state', state: 'executing', requestId: message.requestId })
    pyodide.setStdout({ batched: (line) => stdout.push(line) })
    pyodide.setStderr({ batched: (line) => stderr.push(line) })
    pyodide.setStdin({ stdin: () => null, autoEOF: true })

    const globals = pyodide.runPython("dict(__name__='__main__')")
    let returnValue: unknown
    const results: CheckResult[] = []

    try {
      await pyodide.loadPackagesFromImports(message.code)
      returnValue = normalize(await pyodide.runPythonAsync(message.code, {
        globals,
        filename: 'main.py',
      }))

      const sourceAnalysis = message.checks.some((check) => check.kind === 'python-technique')
        ? await analyseSource(pyodide, globals, message.code)
        : null

      for (const check of message.checks) {
        if (check.kind === 'stdout-contains') {
          const output = stdout.join('\n')
          const actual = check.caseSensitive ? output : output.toLowerCase()
          const expected = String(check.expected)
          const needle = check.caseSensitive ? expected : expected.toLowerCase()
          const passed = actual.includes(needle)
          results.push({
            id: check.id,
            label: check.label,
            passed,
            actual: check.hidden ? undefined : output,
            message: passed ? undefined : `Expected output to include “${expected}”.`,
          })
          if (check.hidden && !passed) {
            results[results.length - 1].message = 'An additional edge case did not pass. Review your logic and try again.'
          }
          continue
        }

        if (check.kind === 'python-technique') {
          const fullAnalysis = sourceAnalysis ?? { nodes: [], calls: [], syntax: [], functions: {} }
          const scopeName = check.scope?.kind === 'function' ? check.scope.name.trim() : ''
          const scopedAnalysis = scopeName ? fullAnalysis.functions[scopeName] : undefined
          if (scopeName && !scopedAnalysis) {
            results.push({
              id: check.id,
              label: check.label,
              passed: false,
              actual: { scope: scopeName, scopeFound: false },
              message: `Create a top-level function named ${scopeName}() so this workflow can be checked.`,
            })
            continue
          }
          const analysis = scopedAnalysis ?? fullAnalysis
          const missing = (check.required ?? []).filter((target) => !includesTechnique(analysis, target))
          const forbidden = (check.forbidden ?? []).filter((target) => includesTechnique(analysis, target))
          const passed = missing.length === 0 && forbidden.length === 0
          const context = scopeName ? `Inside ${scopeName}(): ` : ''
          const feedback = [
            ...missing.map((target) => `${context}Required: ${target.feedback}`),
            ...forbidden.map((target) => `${context}Change needed: ${target.feedback}`),
          ]
          results.push({
            id: check.id,
            label: check.label,
            passed,
            actual: {
              ...(scopeName ? { scope: scopeName, scopeFound: true } : {}),
              missing: missing.map((target) => target.name),
              forbidden: forbidden.map((target) => target.name),
            },
            message: passed ? undefined : feedback.join(' '),
          })
          continue
        }

        try {
          const actual = normalize(await pyodide.runPythonAsync(check.expression, { globals }))
          const passed = isEqual(actual, check.expected)
          results.push({
            id: check.id,
            label: check.label,
            passed,
            actual: check.hidden ? undefined : actual,
            message: passed ? undefined : `Expected ${JSON.stringify(check.expected)}, received ${JSON.stringify(actual)}.`,
          })
          if (check.hidden && !passed) {
            results[results.length - 1].message = 'An additional edge case did not pass. Review your logic and try again.'
          }
        } catch (error) {
          results.push({
            id: check.id,
            label: check.label,
            passed: false,
            message: check.hidden
              ? 'An additional edge case could not run. Review your logic and try again.'
              : error instanceof Error ? error.message : String(error),
          })
        }
      }
    } finally {
      if (globals && typeof globals === 'object' && 'destroy' in globals) {
        ;(globals as { destroy: () => void }).destroy()
      }
    }

    workerScope.postMessage({
      type: 'result',
      requestId: message.requestId,
      ok: true,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
      returnValue,
      checks: results,
      durationMs: Math.round(performance.now() - startedAt),
    })
  } catch (error) {
    workerScope.postMessage({
      type: 'result',
      requestId: message.requestId,
      ok: false,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
      error: error instanceof Error ? error.message : String(error),
      checks: [],
      durationMs: Math.round(performance.now() - startedAt),
    })
  }
}

workerScope.addEventListener('message', (event: MessageEvent<RunMessage>) => {
  if (event.data.type === 'run') void execute(event.data)
})

export {}
