# Contributing

## Making a release

You will need a personal GitHub API token (this is used to create the release on GitHub). You can obtain one [here](https://github.com/settings/tokens/new?scopes=repo&description=release-it) (it only needs "repo" access, not "admin" or other scopes).

Make sure the token is available with an environment variable. It's best to put this in `~/.profile`:

```sh
export GITHUB_TOKEN="<token from step 1>"
```

If you saved the token to `~/.profile` you will not have to repeat this in the future.

Then simply run `npm run release`. This will automatically determine the new version number based on the commit messages, create the commit, tag, github release and publish to npm.
