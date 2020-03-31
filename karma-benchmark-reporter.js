const chalk = require('chalk');

exports['reporter:benchmark'] = ['type', BenchmarkReporter];

function BenchmarkReporter (baseReporterDecorator) {
  baseReporterDecorator(this);
  const resultsPerBrowser = new Map();
  this.onBrowserInfo = function (browser, info) {
    if (!info.benchmark) return;
    if (!resultsPerBrowser.has(browser.name)) {
      resultsPerBrowser.set(browser.name, []);
    }
    const results = resultsPerBrowser.get(browser.name);
    results.push(info.benchmark);
  };
  this.onRunComplete = function () {
    this.writeCommonMsg(chalk.underline.bold('\nBENCHMARK (times in seconds):\n'));
    resultsPerBrowser.forEach((results, browserName) => {
      this.writeCommonMsg(`  ${chalk.bold(browserName)}:\n`);
      results.forEach(({ current, reference }, runI) => {
        this.writeCommonMsg([
          `    ${chalk.bold(runI + ':')}`,
          `   current: ${current}\n`,
          `       reference: ${reference}\n`,
        ].join(''));
      });
    });
  };
}
