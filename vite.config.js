import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    electron({
      entry: 'main.js',
    }),
    renderer({
      nodeIntegration: true,
    }),
  ],
  build: {
    rollupOptions: {
      external: ['msnodesqlv8'],
    },
  },
})