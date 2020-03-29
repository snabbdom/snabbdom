import faker from 'faker';
import { VNode } from '../vnode';
import h from '../h';
import { init } from '../snabbdom';
import { assert } from 'chai';
import { dynamicImporter } from 'define-variable-webpack-plugin/dynamicImporter';
import { UAParser } from 'ua-parser-js';
import { getBrowserId, missingBrowserMaxTimeMessage } from '../util';
import 'core-js/stable/array/fill';

declare global {
  const __karma__: {
    info(info: unknown): void
  };
}

const getBenchmarkMaxDuration = () => {
  const { benchmark } = dynamicImporter as {
    benchmark: { [browser: string]: number }
  };
  const browserId = getBrowserId(window.navigator.userAgent);
  const raw = benchmark[browserId];
  assert.isDefined(raw, missingBrowserMaxTimeMessage(browserId));
  const parsed = Number(raw);
  assert.isNumber(parsed);
  assert.isNotNaN(parsed);
  return parsed;
};

const reportBenchmarkResult = (duration: number) => {
  const userAgent = new UAParser();
  __karma__.info({
    benchmark: {
      ...userAgent.getBrowser(),
      duration
    }
  });
};

describe('Benchmark', () => {
  it.only('Core', function () {
    const max = getBenchmarkMaxDuration();
    this.timeout(max * 2);
    const makeData = () => new Array(faker.random.number(20))
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
      }));

    type Data = ReturnType<typeof makeData>;

    const patch = init([]);
    const container = document.createElement('section');
    document.body.appendChild(container);

    const view = (companies: Data): VNode => h(
      'table',
      [
        h('caption', ['Companies']),
        h('thead', [
          h('tr', [
            'Details',
            'Products',
          ].map((th) => h('th', [th])))
        ]),
        h('tbody', companies.map((company) => h('tr', [
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
          h('td', [h('ul', company.products.map((product) => h('li', [h('dl', [
            h('dt', ['Name']),
            h('dd', [product.name]),
            h('dt', ['Color']),
            h('dd', [product.color]),
            h('dt', ['Price']),
            h('dd', [product.price]),
          ])])))])
        ])))
      ]
    );

    performance.mark('start');
    new Array(100)
      .fill(null)
      .map(makeData)
      .reduce(
        (acc, data, i): VNode => {
          const vnode = view(data);
          patch(acc, vnode);
          return vnode;
        },
        container as HTMLElement | VNode
      );
    performance.measure('core');
    const { duration } = performance.getEntriesByName('core')[0];
    assert.isAtMost(duration, max);
    reportBenchmarkResult(duration);
  });
});
