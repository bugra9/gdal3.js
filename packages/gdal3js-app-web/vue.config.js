const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: require.resolve('gdal3.js/wasm'), to: 'dist' },
          { from: require.resolve('gdal3.js/data.txt'), to: 'dist' }
        ]
      })
    ]
  }
}
