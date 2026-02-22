import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/setup': 'http://backend:8080',
      '/auth': 'http://backend:8080',
      '/users': 'http://backend:8080',
      '/projects': 'http://backend:8080',
      '/profile': 'http://backend:8080',
    }
  }
})
