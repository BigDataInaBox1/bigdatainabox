import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spiderAg: resolve(__dirname, 'spider-ag.html'),
        pricing: resolve(__dirname, 'pricing-sign-up.html')
      }
    }
  }
});
