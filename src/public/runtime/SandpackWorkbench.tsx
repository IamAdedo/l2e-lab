/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef } from 'react'
import {
  SandpackCodeEditor,
  SandpackConsole,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
} from '@codesandbox/sandpack-react'
import type { LearningTrack, StarterFile } from '../types'

type Props = {
  track: Extract<LearningTrack, 'react' | 'javascript'>
  files: StarterFile[]
  onFilesChange?: (files: StarterFile[]) => void
  showConsole?: boolean
  height?: number
}

const sandpackTheme = {
  colors: {
    surface1: '#071426',
    surface2: '#0b1d35',
    surface3: '#102744',
    clickable: '#8ea5c2',
    base: '#d8e7fb',
    disabled: '#536981',
    hover: '#eef7ff',
    accent: '#38bdf8',
    error: '#fb7185',
    errorSurface: '#3c1522',
  },
  syntax: {
    plain: '#d8e7fb',
    comment: { color: '#657b96', fontStyle: 'italic' as const },
    keyword: '#c084fc',
    tag: '#60a5fa',
    punctuation: '#8ea5c2',
    definition: '#67e8f9',
    property: '#93c5fd',
    static: '#fbbf24',
    string: '#86efac',
  },
  font: {
    body: 'DM Sans, system-ui, sans-serif',
    mono: 'Cascadia Code, Consolas, monospace',
    size: '13px',
    lineHeight: '1.6',
  },
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function FileObserver({ sourceFiles, onFilesChange }: Pick<Props, 'onFilesChange'> & { sourceFiles: StarterFile[] }) {
  const { sandpack } = useSandpack()
  const lastSignature = useRef('')

  useEffect(() => {
    if (!onFilesChange) return
    const next = sourceFiles.map((file) => ({
      ...file,
      code: sandpack.files[normalizePath(file.path)]?.code ?? file.code,
    }))
    const signature = next.map((file) => `${file.path}:${file.code}`).join('\u0000')
    if (signature === lastSignature.current) return
    lastSignature.current = signature
    onFilesChange(next)
  }, [onFilesChange, sandpack.files, sourceFiles])

  return null
}

export function SandpackWorkbench({ track, files, onFilesChange, showConsole = true, height = 620 }: Props) {
  const sandpackFiles = useMemo<SandpackFiles>(() => Object.fromEntries(
    files.map((file) => [normalizePath(file.path), { code: file.code, active: /App\.(jsx|tsx)$/.test(file.path) }]),
  ), [files])

  return (
    <div className="runtime-sandpack" style={{ '--runtime-height': `${height}px` } as React.CSSProperties}>
      <SandpackProvider
        template={track === 'react' ? 'react' : 'vanilla'}
        theme={sandpackTheme}
        files={sandpackFiles}
        options={{
          activeFile: normalizePath(files.find((file) => /App\.(jsx|tsx)$/.test(file.path))?.path ?? files[0]?.path ?? '/src/App.jsx'),
          visibleFiles: files.map((file) => normalizePath(file.path)),
          recompileMode: 'delayed',
          recompileDelay: 450,
        }}
      >
        <FileObserver sourceFiles={files} onFilesChange={onFilesChange} />
        <SandpackLayout>
          <div className="runtime-sandpack__editor">
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              wrapContent
              closableTabs={false}
              style={{ height: showConsole ? Math.round(height * .68) : height }}
            />
            {showConsole && <SandpackConsole style={{ height: Math.round(height * .32) }} showHeader standalone />}
          </div>
          <SandpackPreview
            showNavigator
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

export function checkSourceRules(files: StarterFile[], validation: import('../types').ValidationRule[]) {
  return validation.flatMap((rule) => {
    if (rule.kind === 'source-contains') {
      const source = files.find((file) => normalizePath(file.path) === normalizePath(rule.file))?.code ?? ''
      const matches = rule.tokens.map((token) => source.toLowerCase().includes(token.toLowerCase()))
      const passed = rule.match === 'all' ? matches.every(Boolean) : matches.some(Boolean)
      return [{ id: rule.id, label: rule.label, passed, message: passed ? undefined : `Look for: ${rule.tokens.join(rule.match === 'all' ? ', ' : ' or ')}` }]
    }
    if (rule.kind === 'preview-text') {
      const allSource = files.map((file) => file.code).join('\n').toLowerCase()
      const passed = allSource.includes(rule.expected.toLowerCase())
      return [{ id: rule.id, label: rule.label, passed, message: passed ? undefined : `Add “${rule.expected}” to your project.` }]
    }
    return []
  })
}
