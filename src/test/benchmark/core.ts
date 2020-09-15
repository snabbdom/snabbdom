import 'core-js/stable/array/fill'
import faker from 'faker'
import { VNode } from '../../package/vnode'
import { h } from '../../package/h'
import { init as curInit } from '../../package/init'
import { init as refInit } from 'latest-snabbdom-release/init'
import { assert } from 'chai'
import pReduce from 'p-reduce'
import pMapSeries from 'p-map-series'
import { std, mean } from 'mathjs'

const RUNS = 5
const PATCHES_PER_RUN = 100
const WARM_UP_RUNS = 1
const REQUEST_ANIMATION_FRAME_EVERY_N_PATCHES = 1
const BENCHMARK_TIMEOUT_MINUTES = 10
const REQUIRED_PRECISION = 0.02

/* eslint-disable @typescript-eslint/no-unused-vars */
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const __karma__: {
    info(info: unknown): void
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

const ALLOWED_REGRESSION = 0.03
describe('core benchmark', () => {
  it('does not regress', async function Benchmark () {
    this.timeout(BENCHMARK_TIMEOUT_MINUTES * 1000 * 60)

    faker.seed(0)
    const inputs = Array(PATCHES_PER_RUN).fill(null).map(() => {
      return new Array(faker.random.number(20))
        .fill(null)
        .map(() => ({
          name: faker.company.companyName(),
          catchPhrase: faker.company.catchPhrase(),
          suffix: faker.company.companySuffix(),
          products: Array(faker.random.number(3))
            .fill(null)
            .map(() => ({
              name: faker.commerce.productName(),
              color: faker.commerce.color(),
              price: faker.commerce.price() + faker.finance.currencySymbol(),
            })),
          founded: faker.date.past()
        }))
    })

    type Input = (typeof inputs)[0]

    const view = (companies: Input): VNode => h('table', [
      h('caption', ['Companies']),
      h('thead', [
        h('tr', [
          'Details',
          'Products',
        ].map((th) => h('th', [th])))
      ]),
      h('tbody', companies.map(function companyView (company) {
        return h('tr', [
          h('td', [
            h('div', [
              h('b', [company.name]),
              company.suffix && `\xa0${company.suffix}`
            ]),
            h('div', h('i', [company.catchPhrase])),
            h('td', [
              h('dt', ['Founded']),
              h('dd', [company.founded.toLocaleDateString()])
            ])
          ]),
          h('td', [h('ul', company.products.map(function productView (product) {
            return h('li', [h('dl', [
              h('dt', ['Name']),
              h('dd', [product.name]),
              h('dt', ['Color']),
              h('dd', [product.color]),
              h('dt', ['Price']),
              h('dd', [product.price]),
            ])])
          }))])
        ])
      }))
    ])

    type Patcher = ReturnType<typeof refInit | typeof curInit>

    interface SingleRunResult {
      i: number
      cur: number
      ref: number
    }

    const subjectToResult = async (subject: Patcher, subjectId: string): Promise<number> => {
      await new Promise((resolve) => {
        requestAnimationFrame(resolve)
      })
      const markName = `mark:${subjectId}`
      const measureName = `measure:${subjectId}`
      performance.mark(markName)
      const lastVnode = await pReduce(
        inputs,
        async function subjectToResultReducer (acc: HTMLElement | VNode, input, i) {
          const vnode = view(input)
          subject(acc, vnode)
          if (i % REQUEST_ANIMATION_FRAME_EVERY_N_PATCHES === 0) {
            await new Promise((resolve) => {
              requestAnimationFrame(resolve)
            })
          }
          return vnode
        },
        document.body.appendChild(document.createElement('section')),
      )
      performance.measure(measureName, markName)
      if (!('elm' in lastVnode)) throw new Error()
      if (!lastVnode.elm) throw new Error()
      document.body.removeChild(lastVnode.elm)
      const measure = performance.getEntriesByName(measureName)[0]
      performance.clearMarks(markName)
      performance.clearMeasures(measureName)
      return measure.duration
    }

    const singleRun = async (_: null, runI: number): Promise<SingleRunResult> => {
      const cur = await subjectToResult(curInit([]), `cur:${runI}`)
      const ref = await subjectToResult(refInit([]), `ref:${runI}`)

      return { i: runI, cur, ref }
    }

    const runResults = (await pMapSeries(Array(RUNS + WARM_UP_RUNS).fill(null), singleRun))
      .slice(WARM_UP_RUNS)

    __karma__.info({ benchmark: runResults })

    const results = {
      ref: runResults.map((result) => result.ref),
      cur: runResults.map((result) => result.cur),
    }
    const means = {
      ref: mean(results.ref),
      cur: mean(results.cur),
    }
    const stds = {
      ref: std(results.ref, 'uncorrected'),
      cur: std(results.cur, 'uncorrected'),
    }

    ;(['ref', 'cur'] as const).forEach((subject) => {
      const stdRatio = stds[subject] / means[subject]
      assert.isAtMost(stdRatio, REQUIRED_PRECISION, `${subject} not precise enough`)
    })

    assert.isAtMost(means.cur, means.ref * (1 + ALLOWED_REGRESSION))
  })
})
