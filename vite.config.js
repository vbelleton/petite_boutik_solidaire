import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  // Servi sous /boutik/ : voir src/chemin.js et racine/ (fichiers posés à la racine du déploiement)
  base: '/boutik/',
  plugins: [vue()],
  resolve: {
    conditions: ['onnxruntime-web-use-extern-wasm'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist/boutik',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@imgly/background-removal') || id.includes('onnxruntime-web')) {
            return 'vendor-admin'
          }
        }
      }
    }
  }
})
