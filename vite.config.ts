import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración de build para Netlify y desarrollo local
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Carpeta que Netlify va a publicar
  },
  server: {
    port: 5173,
  }
});

