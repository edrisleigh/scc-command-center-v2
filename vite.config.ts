import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tanstackStart({
      spa: { enabled: true },
      router: {
        codeSplittingOptions: {
          defaultBehavior: [],
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
