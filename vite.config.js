const path = require('path')
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'idle-js',
      fileName: (format) => `idle-js.${format}.js`
    }
  }
})