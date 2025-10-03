import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: '/agenda/',

    server: { port: 3000, host: '0.0.0.0' },

    plugins: [react()],

    // Garantiza que process.env exista en el navegador (evita "process is not defined")
    define: {
      'process.env': {
        NODE_ENV: 'production',
        GEMINI_API_KEY: env.GEMINI_API_KEY ?? '',
        API_KEY: env.GEMINI_API_KEY ?? '',
      },
    },

    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
  };
});
