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

/** CSS (и @font-face) раньше JS — шрифты из preload применяются без предупреждения. */
function cssBeforeJs() {
  return {
    name: 'css-before-js',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      const stylesheet = html.match(/<link rel="stylesheet" crossorigin href="[^"]+">/)
      const moduleScript = html.match(/<script type="module" crossorigin src="[^"]+"><\/script>/)
      if (!stylesheet || !moduleScript) return html
      if (html.indexOf(stylesheet[0]) < html.indexOf(moduleScript[0])) return html

      return html
        .replace(stylesheet[0], '')
        .replace(moduleScript[0], `${stylesheet[0]}\n      ${moduleScript[0]}`)
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    cssBeforeJs(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@terrasound/shared': path.resolve(__dirname, '../packages/shared/src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('sonner')) {
            return 'sonner';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) {
            return 'router';
          }
        },
      },
    },
  },
})
