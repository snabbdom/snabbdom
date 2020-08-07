# Contributing

## Allowing CI builds of pull requests from forks

Some secrets are included as environment variables in the CI build.
Since code in forks is considered un-trusted,
CI builds of pull requests from forks are run without secrets.
This causes the CI build to fail.

To mark the HEAD of a pull request as trusted
— which would trigger a build that includes the secrets —
run the following command:

```sh
# `REMOTE` is a temporary remote name. It could be the pull request author user name.
# `FORK_URL` is the URL of the fork.
git remote add $REMOTE $FORK_URL
git fetch $REMOTE
# `FORK_BRANCH` is the compare (source) branch.
BRANCH=allow-ci_${REMOTE}_${FORK_BRANCH}
# `ORIGIN` is your remote name for the Snabbdom repository.
git push $ORIGIN refs/remotes/${REMOTE}/${FORK_BRANCH}:refs/heads/$BRANCH
git remote remove $REMOTE
```

After the pull request is merged or closed, delete the branch:

```sh
git push --delete $ORIGIN $BRANCH
```

## Making a release

Make sure you have permission to publish, by running

    npm access ls-collaborators

While on the `master` branch, switch to a new branch, possibly called `release`:

    git switch --create release
    npm run make-release-commit

Create a new pull request from this branch. The name of the pull request possibly identical to the commit message.

"Rebase and merge" the pull request.

    git switch master
    git pull

Where `$VERSION` is the new version, run

    git tag v$VERSION

For example:

    git tag v5.2.4

And then

    git push --tags
    npm publish
