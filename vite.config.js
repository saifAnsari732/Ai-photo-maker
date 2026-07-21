import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/ap': {
        target: 'https://ai-photo-maker-back.onrender.co',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
