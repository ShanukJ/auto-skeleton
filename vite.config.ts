import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  // Library build mode (npm run build:lib)
  if (process.env.LIB_BUILD) {
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          formats: ['es'],
          fileName: 'auto-skeleton-react',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    }
  }

  // Default: demo app dev/build
  return {
    plugins: [react()],
  }
})
