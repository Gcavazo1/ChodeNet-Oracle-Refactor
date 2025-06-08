import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Proxy requests from /sdapi to the local Stable Diffusion server
      '/sdapi': {
        target: 'http://127.0.0.1:7860',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
