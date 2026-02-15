const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  // outputDir: '../../build/app',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: '../gdal3.js/dist/gdal3js-wasm-wasm32-st-release.browser.js', to: 'package' },
          { from: '../gdal3.js/dist/gdal3js-wasm-wasm32-st-release.wasm', to: 'package' },
          { from: '../gdal3.js/dist/gdal3js-wasm-wasm32-st-release.data.txt', to: 'package' }
        ]
      })
    ]
  }
}
