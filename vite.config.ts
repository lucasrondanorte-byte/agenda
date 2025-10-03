import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/agenda/',             // 👈 clave para GitHub Pages
  define: { 'process.env': {} } // evita "process is not defined" en prod
})
