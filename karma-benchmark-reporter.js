const chalk = require('chalk')
const Table = require('tty-table')

exports['reporter:benchmark'] = ['type', BenchmarkReporter]

function BenchmarkReporter (baseReporterDecorator) {
  baseReporterDecorator(this)
  const resultsPerBrowser = new Map()
  this.onBrowserInfo = function (browser, info) {
    if (!info.benchmark) return
    if (!resultsPerBrowser.has(browser.name)) {
      resultsPerBrowser.set(browser.name, info.benchmark)
    }
  }
  this.onRunComplete = function () {
    if (resultsPerBrowser.size === 0) return
    this.writeCommonMsg(chalk.underline.bold('\nBENCHMARK (times in seconds):\n'))
    resultsPerBrowser.forEach((results, browserName) => {
      this.writeCommonMsg(`  ${chalk.bold(browserName)}:\n`)
      const rows = results.map(({ cur, ref }, i) => ({
        i: String(i),
        cur: cur.toFixed(0),
        ref: ref.toFixed(0),
        diff: `${(cur / ref * 100).toFixed(2)}%`,
      }))
      const header = [
        {
          value: 'i',
          align: 'right'
        },
        {
          value: 'ref',
          align: 'right'
        },
        {
          value: 'cur',
          align: 'right'
        },
        {
          value: 'diff',
          align: 'right'
        },
      ]
      console.log(Table(header, rows).render())
    })
    resultsPerBrowser.clear()
  }
}
