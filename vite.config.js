import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cmsPlugin } from './cms/render.mjs';

export default defineConfig({
  plugins: [cmsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        spiderAg: resolve(__dirname, 'spider-ag.html'),
        pricing: resolve(__dirname, 'pricing-sign-up.html'),
        scheduleDemo: resolve(__dirname, 'schedule-demo.html')
      }
    }
  }
});
