import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: base must match repo name
export default defineConfig({
  plugins: [react()],
  base: '/Calendar_Loo/',
})
