const ci = !!process.env.CI;
const watch = !!process.env.WATCH;
const live = !!process.env.LIVE;
const es5 = !!process.env.ES5;

const ip = "bs-local.com";

const browserstack = require("./browserstack-karma.js");

// https://www.browserstack.com/open-source (text search "parallels")
// Instead of the 5 available we only use 2, so two commits can run CI at the same time
const BROWSERSTACK_OPEN_SOURCE_CONCURRENCY = 2;

const getBrowserstackBrowsers = () =>
  Object.keys(browserstack).filter((k) => !!browserstack[k].es5 === es5);

const browsers = ci
  ? getBrowserstackBrowsers()
  : live
  ? undefined
  : watch
  ? ["Chrome"]
  : ["ChromeHeadless", "FirefoxHeadless"];

module.exports = function (config) {
  config.set({
    basePath: ".",
    frameworks: ["mocha", "karma-typescript"],
    // list of files / patterns to load in the browser
    files: process.env.FILES_PATTERN.split(",")
      .map((p) => ({ pattern: p }))
      .concat({ pattern: "src/**/*.ts" }),
    preprocessors: {
      "**/*.ts": "karma-typescript",
      "**/*.tsx": "karma-typescript",
    },
    plugins: [
      "karma-mocha",
      "karma-typescript",
      "karma-mocha-reporter",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
      "karma-browserstack-launcher",
    ],
    hostname: ci ? ip : "localhost",
    karmaTypescriptConfig: {
      compilerOptions: {
        ...require("./tsconfig.json").compilerOptions,
        ...require("./test/tsconfig.json").compilerOptions,
        sourceMap: false,
        inlineSourceMap: true,
        target: es5 ? "es5" : "es6",
      },
      bundlerOptions: {
        sourceMap: true,
      },
      include: process.env.FILES_PATTERN.split(",").concat("src/**/*.ts"),
    },
    browserStack: {
      name: "Snabbdom",
      retryLimit: 1,
    },
    client: {
      captureConsole: true,
    },
    customLaunchers: browserstack,
    reporters: ["karma-typescript", "mocha", "BrowserStack"],
    mochaReporter: {
      showDiff: true,
    },
    port: 9876,
    colors: true,
    autoWatch: true,
    browsers: browsers,
    singleRun: !watch && !live,
    concurrency: ci ? BROWSERSTACK_OPEN_SOURCE_CONCURRENCY : Infinity,
  });
};
