import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process entry point
        entry: 'main.js',
      },
    ]),
    renderer(),
  ],
  build: {
    rollupOptions: {
      external: ['msnodesqlv8']
    }
  },
  optimizeDeps: {
    exclude: ['msnodesqlv8']
  },
  resolve: {
    alias: {
      'msnodesqlv8': 'msnodesqlv8'
    }
  }
}) 