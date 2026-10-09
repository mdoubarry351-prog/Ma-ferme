import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Publié sur https://mdoubarry351-prog.github.io/Ma-ferme/admin/
export default defineConfig({
  base: '/Ma-ferme/admin/',
  plugins: [react()],
})
