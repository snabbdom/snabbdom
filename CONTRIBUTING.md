# Contributing

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
