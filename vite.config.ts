import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@activities': path.resolve(__dirname, './src/features/activities'),
      '@account': path.resolve(__dirname, './src/features/account'),
      '@sharedUi': path.resolve(__dirname, './src/shared/components/ui'),
      '@sharedForms': path.resolve(__dirname, './src/shared/components/forms'),
      '@sharedHooks': path.resolve(__dirname, './src/shared/hooks'),
      '@sharedSchemas': path.resolve(__dirname, './src/shared/schemas/'),
    }
  },
})
