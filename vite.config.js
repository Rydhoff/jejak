import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',   // WAJIB!
      srcDir: 'public',
      filename: 'sw.js',

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },

      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png',
        '**/*.png',
        '**/*.svg',
        '**/*.jpg',
        '**/*.jpeg',
      ],

      manifest: {
        name: 'Jejak',
        short_name: 'Jejak',
        description: 'Aplikasi laporan publik pintar',
        theme_color: '#0A3B44',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
