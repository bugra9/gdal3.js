// TODO: It doesn't work with node 17.
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai'],

    files: [
      {pattern: 'build/package/gdal3.coverage.js', included: true, served: true, watched: false, nocache: true},
      {pattern: 'build/package/gdal3WebAssembly.js', included: false, served: true, watched: false, nocache: true},
      {pattern: 'build/package/gdal3WebAssembly.wasm', included: false, served: true, watched: false, nocache: true},
      {pattern: 'build/package/gdal3WebAssembly.data', included: false, served: true, watched: false, nocache: true},
      {pattern: 'test/data/*', included: false, served: true, watched: false, nocache: true},
      {pattern: 'src/**/*.spec.js', type: 'module', included: true, served: true, watched: false, nocache: true},
      {pattern: 'test/*.spec.js', type: 'module', included: true, served: true, watched: false, nocache: true}
    ],

    proxies: {
      '/data/': '/base/test/data/',
      '/test/data/': '/base/test/data/',
      '/package/': '/base/build/package/',
      '/build/package/': '/base/build/package/'
    },

    exclude: [],
    preprocessors: {'src/allJsFunctions/**/!(*spec).js': ['coverage']},
    reporters: ['progress', 'coverage-istanbul'],

    /* coverageReporter: {
      type : 'html',
      dir : 'build/coverage/',
      fixWebpackSourcePaths: true,
      combineBrowserReports: true
    }, */

    coverageIstanbulReporter: {
      reports: ['json', 'html'],
      dir: 'build/coverage/browser',

      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      skipFilesWithNoCoverage: true,
      verbose: false,
    },

    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    browsers: ['ChromeHeadless', 'FirefoxHeadless'/*, 'Firefox', 'FirefoxHeadless', 'Chrome', 'ChromeHeadless' */]
  })
}
