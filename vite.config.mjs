import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cp } from 'node:fs/promises';

const rootDir = import.meta.dirname;

export default defineConfig({
  root: '.',
  base: './',
  plugins: [{
    name: 'decent-head-static-assets',
    async closeBundle() {
      for (const file of ['decent-head.js', 'decent-head.config.js', 'vendor/decent-head/2.0.0']) {
        await cp(resolve(rootDir, file), resolve(rootDir, 'dist', file), { recursive: true });
      }
    }
  }],
  build: {
    rollupOptions: {
      input: {
        legacy: resolve(rootDir, 'index.html'),
        modern: resolve(rootDir, 'modern.html')
      }
    }
  }
});
