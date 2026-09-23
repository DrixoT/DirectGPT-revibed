import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/anthropic/, ''),
      },
      '/google-ai': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-ai/, ''),
      },
      '/openrouter': {
        target: 'https://openrouter.ai/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openrouter/, ''),
      },
    },
  },
});
