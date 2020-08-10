const Git = require('nodegit')
const assert = require('assert')
const meow = require('meow');

/**
 * For reference, the unix shell equivalent of this script is kind of:
 *
 * ```sh
 * # `ORIGIN` is your remote name for the Snabbdom repository.
 * # `PR` is the pull request number
 * REF=refs/remotes/$ORIGIN/pull/$PR/head
 * git fetch $ORIGIN +refs/pull/$PR/head:$REF
 * BRANCH=allow-ci_$PR
 * git push $ORIGIN +${REF}:refs/heads/$BRANCH
 * ```
 */

(async function () {
  const [pr] = meow({ hardRejection: false }).input
  assert.notStrictEqual(pr, undefined)
  const repo = await Git.Repository.open(__dirname)
  const remote = (await repo.getRemotes())
    .find(r => r.url() === 'git@github.com:snabbdom/snabbdom.git')
  assert.notStrictEqual(remote, undefined)
  const ref = `refs/remotes/${remote.name()}/pull/${pr}/head`
  const credentials = (url, userName) => Git.Cred
    .sshKeyFromAgent(userName)
  await remote
    .fetch(
      [`+refs/pull/${pr}/head:${ref}`],
      { callbacks: { credentials } }
    )
  const branchName = `allow-ci_${pr}`
  await remote
    .push(
      [`+${ref}:refs/heads/${branchName}`],
      { callbacks: { credentials } }
    )
  console.log(`\
Marked head of pull request #${pr} as trusted by pushing it to branch \`${branchName}\`.
As soon as the pull request is closed/merged, this branch can be deleted.\
  `)
})()
