import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

// Fichiers « assets » (scripts, styles) : chargés directement depuis le site de la boutique, sans passer par le
// relais de brasouverts.bzh/boutik (chaque fichier relayé compte comme un appel de fonction Cloudflare).
// Construit par Cloudflare Pages : adresse stable en production (branche main), adresse de l'aperçu sinon.
// En local : adresses relatives, comme avant.
const ORIGINE_ASSETS = process.env.CF_PAGES
  ? (process.env.CF_PAGES_BRANCH === 'main' ? 'https://petite-boutik-solidaire.pages.dev' : (process.env.CF_PAGES_URL || '')).replace(/\/+$/, '')
  : ''

// https://vite.dev/config/
export default defineConfig({
  // Servi sous /boutik/ : voir src/chemin.js et racine/ (fichiers posés à la racine du déploiement)
  base: '/boutik/',
  plugins: [vue()],
  experimental: {
    renderBuiltUrl(fichier, { type }) {
      // Outil de détourage de l'admin (workers, wasm) : même origine que la page, comme avant
      if (ORIGINE_ASSETS && type === 'asset' && fichier.startsWith('assets/') && !/ort|wasm|onnx/i.test(fichier)) return `${ORIGINE_ASSETS}/boutik/${fichier}`
    }
  },
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
          // Petits utilitaires communs (chargement différé de Vite, aides CommonJS) : à part. Sinon Rollup les
          // range dans vendor-admin, et TOUTES les pages publiques (galerie comprise) chargeaient ce fichier de
          // 880 Ko de l'outil de détourage, réservé à l'admin.
          if (id.includes('vite/preload-helper') || id.includes('commonjsHelpers') || id.includes('vite/modulepreload-polyfill')) {
            return 'aides'
          }
          if (id.includes('@imgly/background-removal') || id.includes('onnxruntime-web')) {
            return 'vendor-admin'
          }
        }
      }
    }
  }
})
