import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/** Figma Make importuje `balíček@1.2.3` — namapuj na nainstalovaný balíček. */
function figmaVersionedImportResolver() {
  return {
    name: 'figma-versioned-import-resolver',
    resolveId(id: string) {
      const match = id.match(/^((?:@[^/]+\/)?[^@/]+)@\d/)
      if (match) {
        return this.resolve(match[1])
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaVersionedImportResolver(),
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/app'),
    },
  },
})
