import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'AFrameWebXRUIToolkit',
      formats: ['es', 'umd'],
      fileName: (format) => `aframe-webxr-ui-toolkit.${format === 'es' ? 'mjs' : 'js'}`
    },
    rollupOptions: {
      external: ['aframe'],
      output: {
        globals: {
          aframe: 'AFRAME'
        }
      }
    }
  },
  server: {
    port: 3000,
    open: '/examples/basic-menu.html',
    host: true,
    cors: true,
    hmr: {
      host: 'mint-fancy-quetzal.ngrok-free.app',
      clientPort: 443,
      protocol: 'wss'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  }
});