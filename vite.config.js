import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'node:module'

// version.json is the single source of truth for JS, Gradle and GitHub Actions.
const require = createRequire(import.meta.url)
const versionInfo = require('./version.json')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(versionInfo.version),
    __APP_VERSION_CODE__: JSON.stringify(versionInfo.versionCode),
    __GITHUB_REPO__: JSON.stringify(versionInfo.repo),
    __MIN_SUPPORTED_VERSION__: JSON.stringify(versionInfo.minSupportedVersion)
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: true
  }
})
