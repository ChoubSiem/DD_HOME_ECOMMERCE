import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_SIOUKS_API, // Make sure the env variable name matches what you're using
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Optional: removes /api prefix when forwarding
      }
    }
  }
})