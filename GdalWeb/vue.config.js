const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
            { from: '../dist/gdal3.js', to: '.' },
            { from: '../dist/gdal3WebAssembly.wasm', to: '.' },
            { from: '../dist/gdal3WebAssembly.data', to: '.' }
        ]
      })
    ]
  }
}
