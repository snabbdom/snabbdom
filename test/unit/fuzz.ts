import {
  describeOptions,
  dumpFuzzTest,
  FuzzResult,
  optionsFromQuery,
  resolveSeed,
  resolveTests,
  runFuzzTest
} from "../fuzz/index";

// The suite is configured through the query string of the test page, e.g.
//   ?seed=abc123&tests=50&iteration=7
//   ?seed=abc123&tests=50&iteration=7&dump=1
// `dump=1` prints the vnode and DOM trees of every step of that single test
// instead of checking them.
const options = optionsFromQuery(
  typeof location === "undefined" ? "" : location.search
);
const seed = resolveSeed(options);
const tests = resolveTests(options);
const iteration = options.iteration;

function check(result: FuzzResult): void {
  if (!result.ok) throw new Error(result.report);
}

describe("fuzz", () => {
  before(() => {
    console.info(`[fuzz] ${describeOptions({ ...options, seed, tests })}`);
  });

  if (options.dump === true) {
    if (iteration === undefined) {
      throw new Error(
        "dump needs an iteration number, e.g. dump=1&iteration=3"
      );
    }
    it(`dumps the trees of test ${iteration}`, () => {
      console.info(dumpFuzzTest({ seed, index: iteration, tests, options }));
    });
  } else if (iteration === undefined) {
    for (let index = 0; index < tests; index++) {
      it(`keeps the DOM in sync with the vnode tree (test ${index})`, () => {
        check(runFuzzTest({ seed, index, tests, verify: true, options }));
      });
    }
  } else {
    // Run the preceding tests without the DOM comparison, then verify only the
    // requested one.
    for (let index = 0; index < iteration; index++) {
      it(`runs test ${index} without verification`, () => {
        runFuzzTest({ seed, index, tests, verify: false, options });
      });
    }
    it(`keeps the DOM in sync with the vnode tree (test ${iteration})`, () => {
      check(
        runFuzzTest({ seed, index: iteration, tests, verify: true, options })
      );
    });
  }
});
