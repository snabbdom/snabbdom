# Contributing

## Fuzz testing

`npm run fuzz` runs the suite in `test/fuzz/` on Node, with [jsdom](https://github.com/jsdom/jsdom)
standing in for the DOM. Every test generates a random vnode tree (elements with
random tags, keys, attributes, classes and props, plus text nodes, comments and
fragments, up to 5 levels deep with up to 10 siblings per parent), patches it
into the DOM and then applies between 2 and 6 random changes to the tree, each
followed by another patch. After every patch it walks the vnode tree and the DOM
side by side and fails when they do not match.

```sh
npm run fuzz                                   # 25 tests with a fresh seed
npm run fuzz -- --seed 39yq931xe69p9           # replay a run
npm run fuzz -- --tests 200                    # more tests
npm run fuzz -- --seed abc --tests 200 --run-all    # keep going after failures
npm run fuzz -- --seed abc --iteration 592          # run one test on its own
npm run fuzz -- --seed abc --iteration 592 --dump   # print what that test does
```

- `--seed` – seed of the run. A new seed is generated and printed when omitted.
- `--tests` – how many tests to run, 25 by default.
- `--iteration` – run a single test instead of the suite.
- `--run-all` – keep running the iterations after a failing one and print a
  summary (iterations run, passed, failed and up to 10 commands that replay a
  failure) instead of the details of the first failure. A failing iteration still
  stops at its first mismatch.
- `--dump` – with `--iteration`, print the initial trees and, for every round,
  the change that was applied together with the resulting vnode and DOM trees,
  instead of checking anything. Useful to see what a test is doing.
- `--max-depth`, `--max-siblings` – generation limits.

Every test derives its generator from `<seed>-<iteration>`, so a run is fully
reproducible from its seed and a single iteration can be run on its own without
replaying the ones before it.

## Making a commit

This repository uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to be able to generate a meaningful changelog automatically. After you make changes and added them e.g. by running `git add <my changed file>`, use `git commit` (without `-m`) to get help for creating a valid commit message. If you use `-m` (or write a commit message directly in your editor for example), your message will still be checked and the commit will fail if it is against the commit conventions.

## Making a release

You will need a personal GitHub API token (this is used to create the release on GitHub). You can obtain one [here](https://github.com/settings/tokens/new?scopes=repo&description=release-it) (it only needs "repo" access, not "admin" or other scopes).

Make sure the token is available with an environment variable. It's best to put this in `~/.profile`:

```sh
export GITHUB_TOKEN="<token from step 1>"
```

If you saved the token to `~/.profile` you will not have to repeat this in the future.

Then simply run `npm run release`. This will automatically determine the new version number based on the commit messages, create the commit, tag, github release and publish to npm.
