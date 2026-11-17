# Testing

## Unit tests

`npm test` builds the library, lints it and runs the unit tests in `test/unit/`
in a browser through [web-test-runner](https://modern-web.dev/docs/test-runner/overview/).
`npm run unit` runs only the latter.

## Fuzz testing

`npm run fuzz` runs the suite in `test/fuzz/` on Node, with [jsdom](https://github.com/jsdom/jsdom)
standing in for the DOM. Every test generates a random vnode tree (elements with
random tags, keys, attributes, classes and props, plus text nodes, comments and
fragments, up to 5 levels deep with up to 10 siblings per parent), patches it
into the DOM and then applies between 2 and 6 random changes to the tree, each
followed by another patch. After every patch it walks the vnode tree and the DOM
side by side and fails when they do not match.

The changes a test applies are adding a node, removing a node, moving a node
(within its parent or into another one, the root included) and updating a node.

```sh
npm run fuzz                                        # 25 tests with a fresh seed
npm run fuzz -- --seed 39yq931xe69p9                # replay a run
npm run fuzz -- --tests 200                         # more tests
npm run fuzz -- --seed abc --tests 200 --stop-on-first-failure  # stop at the first failure
npm run fuzz -- --seed abc --iteration 592          # run one test on its own
npm run fuzz -- --seed abc --iteration 592 --dump   # print what that test does
```

### Options

- `--seed` – seed of the run. A new seed is generated and printed when omitted.
- `--tests` – how many tests to run, 25 by default.
- `--iteration` – run a single test instead of the suite.
- `--stop-on-first-failure` – stop at the first failing test and print its
  details. This is not the default: a run normally keeps going after a failing
  iteration and ends with a summary (iterations run, passed, failed and up to 10
  commands that replay a failure). A failing iteration still stops at its first
  mismatch.
- `--dump` – with `--iteration`, print the initial trees and, for every round,
  the change that was applied together with the resulting vnode and DOM trees,
  instead of checking anything. Useful to see what a test is doing.
- `--max-depth`, `--max-siblings` – generation limits, 5 levels and 10 siblings
  by default.
- `--help` – list the options.

### Reproducing a failure

A run prints its seed, and every test derives its generator from
`<seed>-<iteration>`, so a run is fully reproducible from its seed and a single
iteration can be run on its own without replaying the ones before it. A failing
run and a failure report both end with the command that replays the failure,
for example

```sh
npm run fuzz -- --seed 39yq931xe69p9 --tests 25 --iteration 6
```

### Exit codes

`0` when every test of the run passed, `1` when at least one test failed and `2`
when the arguments could not be understood. A patch that throws is reported like
any other failure of its iteration, with the exception it threw, so a DOM
implementation refusing a call does not end the run; `--dump` shows such a step
as an `ERROR` line.
