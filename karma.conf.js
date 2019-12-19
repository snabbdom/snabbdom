const ci = !!process.env.CI;
const watch = !!process.env.WATCH;
const live = !!process.env.LIVE;

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
    frameworks: ['mocha', 'karma-typescript'],
    // list of files / patterns to load in the browser
    files: [{ pattern: 'src/**/*.ts' }],
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-browserstack-launcher',
      'karma-typescript',
    ],
    hostname: ci ? ip : 'localhost',
    preprocessors: {
      'src/**/*.{ts,tsx}': ['karma-typescript']
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
    karmaTypescriptConfig: {
      coverageOptions: {
        exclude: /^src{\/|\\}test{\/|\\}/,
      },
      tsconfig: './tsconfig.json',
      include: {
        mode: 'merge',
        values: ['src/test/**/*'],
      },
    },
    reporters: ['dots', 'karma-typescript', 'BrowserStack'],
    port: 9876,
    colors: true,
    autoWatch: true,
    browsers: browsers,
    singleRun: !watch && !live,
    concurrency: ci ? 1 : Infinity,
  });
}
