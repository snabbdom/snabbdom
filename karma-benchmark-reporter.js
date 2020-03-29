const chalk = require('chalk');
const { getBrowserId } = require('./util');

exports['reporter:benchmark'] = ['type', BenchmarkReporter];

function BenchmarkReporter (baseReporterDecorator, formatError, config) {
  baseReporterDecorator(this);
  const results = new Map();
  this.onBrowserInfo = function (browser, info) {
    if (!info.benchmark) return;
    results.set(getBrowserId(browser.fullName), info.benchmark.duration);
  };
  this.onRunComplete = function () {
    this.writeCommonMsg(chalk.underline.bold('\nBENCHMARK:\n'));
    results.forEach((duration, browserId) => {
      this.writeCommonMsg(`  ${browserId}: ${duration}s\n`);
    });
  };
}
