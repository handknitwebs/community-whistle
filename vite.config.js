import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import fs from 'node:fs'
import path from 'node:path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const base = repositoryName ? `/${repositoryName}/` : '/'

const inlineCssPlugin = () => {
  let combinedCss = ''
  const removedCssFiles = []

  return {
    name: 'inline-css-build',
    apply: 'build',
    generateBundle(_outputOptions, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (asset.type === 'asset' && fileName.endsWith('.css')) {
          combinedCss += asset.source?.toString() ?? ''
          removedCssFiles.push(fileName)
          delete bundle[fileName]
        }
      }
    },
    writeBundle(outputOptions) {
      if (!combinedCss) return

      const outputDir = outputOptions.dir
        ? outputOptions.dir
        : outputOptions.file
          ? path.dirname(outputOptions.file)
          : 'dist'
      const indexPath = path.join(outputDir, 'index.html')

      if (!fs.existsSync(indexPath)) return

      let html = fs.readFileSync(indexPath, 'utf8')

      for (const fileName of removedCssFiles) {
        const escapedFile = fileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${escapedFile}["'][^>]*>\\s*`, 'g')
        html = html.replace(linkRegex, '')
      }

      html = html.replace('</head>', `  <style>${combinedCss}</style>\n</head>`)
      fs.writeFileSync(indexPath, html)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: ['babel-plugin-react-compiler', react(), svgr(), inlineCssPlugin()],
})
