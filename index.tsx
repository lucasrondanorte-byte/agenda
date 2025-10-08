import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración para compilar tu proyecto
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Carpeta donde se guardará el build final
  },
});

