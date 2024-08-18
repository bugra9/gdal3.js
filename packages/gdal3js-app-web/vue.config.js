const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: require.resolve('gdal3.js/browser/st/js'), to: 'dist' },
          { from: require.resolve('gdal3.js/browser/st/wasm'), to: 'dist' },
          { from: require.resolve('gdal3.js/browser/st/data.txt'), to: 'dist' }
        ]
      })
    ]
  }
}
