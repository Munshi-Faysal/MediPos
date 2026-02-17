import { defineConfig } from 'vite'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default defineConfig({
  server: {
    host: true,           // listen on all interfaces
    port: 4200,           // your dev server port
    strictPort: true,
    allowedHosts: 'all'   // allow any host, including Cloudflare Tunnel
  },
  resolve: {
    alias: {
      'zone.js': require.resolve('zone.js'),
      'font-awesome': require.resolve('font-awesome')
    }
  }
})
