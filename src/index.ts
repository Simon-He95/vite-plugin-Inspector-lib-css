import path from 'path'
import fs from 'fs'
import {
  createGenerator,
  presetAttributify,
  presetUno,
} from 'unocss'

export default function vitePluginInspectorLibCss(options?: Record<string, any>) {
  let styles = ''
  const defaultConfig = Object.assign({
    presets: [
      presetUno(),
      presetAttributify(),
    ],
  }, options)
  return {
    name: 'vite-plugin-inspector-lib-css',
    apply: 'build',
    enforce: 'pre',
    writeBundle: {
      order: 'post',
      handler(options: any, bundle: any) {
        if (!styles)
          return
        const name = options.entryFileNames
        const outputPath = path.resolve(options.dir, name)
        const cssCode = JSON.stringify(styles.replace(/\n/g, ' '))
        const insertStyle = `try{if(typeof document != 'undefined'){var elementStyle = document.createElement('style');elementStyle.appendChild(document.createTextNode(${cssCode}));document.head.appendChild(elementStyle);}}catch(e){console.error('vite-plugin-Inspector-lib-css', e);}`
        const { code } = bundle[name]
        fs.writeFile(outputPath, insertStyle + code, (err: any) => {
          if (err)
            throw err
        })
      },
    },
    transform: {
      order: 'pre',
      handler(code: string) {
        if (!code.startsWith('// @unocss-include'))
          return code
        createGenerator({}, defaultConfig).generate(code || '').then((result: any) => {
          const css = result.getLayers()
          if (!styles.includes(css))
            styles += `${css} `
        })
      },
    },
  }
}
