const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  outputDir: '../../build/app',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
            { from: '../../dist/gdal3js.browser.js', to: 'package' },
            { from: '../../dist/gdal3js.wasm', to: 'package' },
            { from: '../../dist/gdal3js.data.txt', to: 'package' }
        ]
      })
    ]
  }
}
