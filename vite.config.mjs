import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const rootDir = import.meta.dirname;

export default defineConfig({
  root: '.',
  base: './',
  build: {
    rollupOptions: {
      input: {
        legacy: resolve(rootDir, 'index.html'),
        modern: resolve(rootDir, 'modern.html')
      }
    }
  }
});
