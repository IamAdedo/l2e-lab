import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const pyodideAssetNames = [
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
] as const

const pyodideAssetTypes: Record<string, string> = {
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
}

function pyodideAssets(): Plugin {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const packageRoot = resolve(projectRoot, 'node_modules', 'pyodide')
  const allowed = new Set<string>(pyodideAssetNames)

  return {
    name: 'l2e-local-pyodide-assets',
    configureServer(server) {
      server.middlewares.use('/pyodide', (request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        const assetName = basename(pathname)
        if (!allowed.has(assetName)) {
          next()
          return
        }

        try {
          const extension = assetName.slice(assetName.lastIndexOf('.'))
          response.statusCode = 200
          response.setHeader('Content-Type', pyodideAssetTypes[extension] ?? 'application/octet-stream')
          response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          response.end(readFileSync(resolve(packageRoot, assetName)))
        } catch (error) {
          next(error as Error)
        }
      })
    },
    generateBundle() {
      pyodideAssetNames.forEach((assetName) => {
        this.emitFile({
          type: 'asset',
          fileName: `pyodide/${assetName}`,
          source: readFileSync(resolve(packageRoot, assetName)),
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), pyodideAssets()],
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['pyodide'] },
  server: { port: 5173 },
})
