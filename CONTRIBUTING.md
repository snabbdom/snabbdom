# Contributing

## Fuzz testing

`test/unit/fuzz.ts` generates random vnode trees (elements, text, comments and
fragments, up to 5 levels deep with up to 10 siblings per parent), patches them
into the DOM and then applies between 2 and 6 random changes to the tree, each
followed by another patch. After every patch it walks the vnode tree and the DOM
side by side and fails when they do not match.

The run is driven by the query string of the test page:

- `seed` – the seed of the run. A new seed is generated and printed when it is
  missing, so a failing run can be reproduced by passing it back.
- `tests` – how many tests to run, 25 by default.
- `iteration` – index of a single test to verify. The tests before it are run
  without the comparison, which makes reproducing one failing test quick.
- `dump=1` – with `iteration`, prints the initial trees and, for every round, the
  change that was applied and the resulting vnode and DOM trees, instead of
  checking anything.
- `maxDepth`, `maxSiblings` – generation limits.

For example `?seed=abc123&tests=50&iteration=7&dump=1`.

The same seed and the same `tests` value always produce the same run: every test
draws from its own generator seeded with the run seed and its index, so running a
single iteration on its own reproduces exactly what the full run does.

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
