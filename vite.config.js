import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  // Support client-side routing - redirect all paths to index.html
  build: {
    rollupOptions: {
      input: {
        // the React portfolio
        main: './index.html',
        // the standalone game at /gemoji, built by Vite so that %VITE_*%
        // placeholders in its HTML get the same env substitution as the app
        gemoji: './gemoji/index.html'
      }
    }
  }
});
