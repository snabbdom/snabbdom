const ci = !!process.env.CI;
const watch = !!process.env.WATCH;
const live = !!process.env.LIVE;
const { DefineVariablePlugin } = require('define-variable-webpack-plugin');
const { benchmarkMaxDurationEnvPrefix } = require('./util');

const browserBenchmarkMaxDurationFromEnv = () => Object.fromEntries(Object
  .entries(process.env)
  .filter(([varName]) => varName.startsWith(benchmarkMaxDurationEnvPrefix))
  .map(([key, max]) => [
    key.slice(benchmarkMaxDurationEnvPrefix.length),
    max
  ]));

const ip = 'bs-local.com';

const browserstack = require('./browserstack-karma.js');

const browsers = ci
  ? Object.keys(browserstack)
  : live
    ? undefined
    : watch
      ? ['Chrome']
      : ['Chrome', 'Firefox'];

module.exports = function (config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha'],
    // list of files / patterns to load in the browser
    files: [
      { pattern: 'test/**/*.js' },
      { pattern: 'es/test/**/*.js' }
    ],
    plugins: [
      'karma-mocha',
      require('karma-mocha-reporter'),
      require('./karma-benchmark-reporter'),
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
      plugins: [
        new DefineVariablePlugin({
          benchmark: JSON.stringify(browserBenchmarkMaxDurationFromEnv())
        })
      ],
      mode: 'development'
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
    concurrency: ci ? 1 : Infinity,
  });
};
