const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  outputDir: '../../build/app',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
            { from: '../../build/package/gdal3.js', to: 'package' },
            { from: '../../build/package/gdal3WebAssembly.wasm', to: 'package' },
            { from: '../../build/package/gdal3WebAssembly.data', to: 'package' }
        ]
      })
    ]
  }
}
