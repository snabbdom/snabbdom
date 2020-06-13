const isPathInside = require('is-path-inside')
const path = require('path')

const ci = !!process.env.CI
const watch = !!process.env.WATCH
const live = !!process.env.LIVE

const ip = 'bs-local.com'

const browserstack = require('./browserstack-karma.cjs')

// https://www.browserstack.com/open-source (text search "parallels")
const BROWSERSTACK_OPEN_SOURCE_CONCURRENCY = 5

const browsers = ci
  ? Object.keys(browserstack)
  : live
    ? undefined
    : watch
      ? ['Chrome']
      : ['Chrome', 'Firefox']

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha'],
    // list of files / patterns to load in the browser
    files: [
      { pattern: process.env.FILES_PATTERN },
    ],
    plugins: [
      'karma-mocha',
      require('karma-mocha-reporter'),
      require('./karma-benchmark-reporter.cjs'),
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-browserstack-launcher',
      require('karma-webpack')
    ],
    hostname: ci ? ip : 'localhost',
    preprocessors: {
      '**/*.js': ['webpack']
    },
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            exclude: (input) => isPathInside(input, path.resolve(__dirname, 'node_modules')),
            test: /\.m?js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      useBuiltIns: 'usage',
                      corejs: 3,
                    }
                  ]
                ]
              }
            }
          }
        ]
      }
    },
    webpackMiddleware: {
      stats: 'errors-only'
    },
    browserStack: {
      name: 'Snabbdom',
      retryLimit: 3,
    },
    client: {
      captureConsole: true,
    },
    browserNoActivityTimeout: 1000000,
    customLaunchers: browserstack,
    reporters: ['mocha', 'benchmark', 'BrowserStack'],
    mochaReporter: {
      showDiff: true
    },
    port: 9876,
    colors: true,
    autoWatch: true,
    browsers: browsers,
    singleRun: !watch && !live,
    concurrency: ci ? BROWSERSTACK_OPEN_SOURCE_CONCURRENCY : Infinity,
  })
}
