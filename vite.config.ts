import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/agenda/',   // 👈 muy importante para GitHub Pages
  define: {
    'process.env': {} // evita errores de variables de entorno en navegador
  }
})

