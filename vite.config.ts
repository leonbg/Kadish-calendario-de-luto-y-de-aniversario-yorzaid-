import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export const APP_METADATA = {
  id: '/',
  name: 'Kadish y Yurzaid',
  short_name: 'Kadish',
  description:
    'Aplicación para la lectura, audio y traducción interactiva de rezos y Kadish (Nusaj Sefaradi).',
  theme_color: '#b45309',
  background_color: '#fdfbf7',
  display: 'standalone' as const,
  orientation: 'portrait-primary' as const,
  start_url: '/',
  scope: '/',
  lang: 'es',
  dir: 'ltr' as const,
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'lucide-react',
        '@hebcal/core',
        'firebase/app',
        'firebase/auth',
      ],
    },
    build: {
      target: 'es2022',
      minify: true,
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@hebcal')) {
              return 'vendor-hebcal';
            }
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'vendor-firebase';
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      headers: {
        'Cache-Control': 'no-cache',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  };
});

