const ci = !!process.env.CI;
const watch = !!process.env.WATCH;
const live = !!process.env.LIVE;

const identifier = process.env.BROWSERSTACK_LOCAL_IDENTIFIER;
const ip = process.env.IP_ADDR;

const browserstack = require('./browserstack-karma.js');

const browsers = ci
  ? Object.keys(browserstack)
  : live
    ? undefined
    : watch
      ? ['Chrome']
      : ['Chrome', 'Firefox'];

module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['mocha', 'karma-typescript'],
    // list of files / patterns to load in the browser
    files: [{pattern: 'src/**/*.ts'}, {pattern: 'test/**/*'}],
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-browserstack-launcher',
      'karma-typescript',
    ],
    hostname: ci ? ip : 'localhost',
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
      'test/**/*.js': ['karma-typescript'],
    },
    browserStack: {
      name: 'Snabbdom',
      startTunnel: false,
      retryLimit: 3,
      tunnelIdentifier: identifier,
    },
    browserNoActivityTimeout: 1000000,
    customLaunchers: browserstack,
    karmaTypescriptConfig: {
      coverageOptions: {
        exclude: /test\//,
      },
      compilerOptions: {
        allowJs: true,
        declaration: false
      },
      tsconfig: './tsconfig.json',
      include: {
        mode: 'merge',
        values: ['test/**/*'],
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
