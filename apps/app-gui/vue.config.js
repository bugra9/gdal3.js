const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  outputDir: '../../build/app',
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
            { from: '../../build/package/gdal.js', to: 'package' },
            { from: '../../build/package/gdalWebAssembly.wasm', to: 'package' },
            { from: '../../build/package/gdalWebAssembly.data', to: 'package' }
        ]
      })
    ]
  }
}
