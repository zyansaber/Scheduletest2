import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: false
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'schedule-final.onrender.com',  
      '.onrender.com',
      'localhost'
    ]
  },
  preview: {
    port: process.env.PORT || 4173,
    host: '0.0.0.0',
    allowedHosts: [
      'schedule-final.onrender.com',
      '.onrender.com',
      'localhost'
    ]
  }
})
