import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const rootDir = import.meta.dirname;

export default defineConfig({
  root: '.',
  base: './',
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    }
  },
  build: {
    rollupOptions: {
      input: {
        legacy: resolve(rootDir, 'index.html'),
        modern: resolve(rootDir, 'modern.html')
      }
    }
  }
});
