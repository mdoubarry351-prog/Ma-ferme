import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Publié sur https://mdoubarry351-prog.github.io/ma-ferme/admin/
export default defineConfig({
  base: '/ma-ferme/admin/',
  plugins: [react()],
})
