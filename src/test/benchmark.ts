import faker from 'faker';
import { VNode } from '../vnode';
import h from '../h';
import { init as currentInit } from '../snabbdom';
import { init as releaseInit } from 'latest-snabbdom-release';
// import { assert } from 'chai';
import 'core-js/stable/array/fill';

declare global {
  const __karma__: {
    info(info: unknown): void
  };
}

describe('Benchmark', () => {
  it('Core', function () {
    this.timeout(10000);

    const RUNS_PER_SUBJECT = 5;
    const PATCHES_PER_RUN = 20;

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

    const view = (companies: Data): VNode => h('table', [
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
    ]);

    const container = document.createElement('section');
    document.body.appendChild(container);

    type Patcher = ReturnType<typeof releaseInit | typeof currentInit>;

    const subjects = [currentInit, releaseInit]
      .map((init) => init([])) as [Patcher, Patcher];

    const subjectToResult = (subject: Patcher, subjectI: number): number => {
      const markName = 'mark';
      performance.mark(markName);
      new Array(PATCHES_PER_RUN)
        .fill(null)
        .map(makeData)
        .reduce(
          (acc: HTMLElement | VNode, data) => subject(acc, view(data)),
          container
        );
      const measureName = 'core';
      performance.measure(measureName, markName);
      const measure = performance.getEntriesByName(measureName)[0];
      performance.clearMeasures(measureName);
      container.innerHTML = '';
      return measure.duration;
    };

    type SingleRunResult = [number, number];

    const singleRun = (subjects: [Patcher, Patcher]): SingleRunResult => subjects
      .map(subjectToResult) as [number, number];

    const runResults: SingleRunResult[] = Array(RUNS_PER_SUBJECT + 1)
      .fill(null)
      .map(() => singleRun(subjects))
      .slice(1);

    runResults.forEach(([current, reference]: SingleRunResult) => {
      __karma__.info({ benchmark: { current, reference } });
    });

    type Averages = [number, number];

    const averages: Averages = runResults // eslint-disable-line @typescript-eslint/no-unused-vars
      .reduce(
        (sums, results) => [
          sums[0] + results[0],
          sums[1] + results[1]
        ],
        [0, 0] as SingleRunResult
      )
      .map((sum) => sum / runResults.length) as Averages;

    // assert.isAtMost(...averages);
  });
});
