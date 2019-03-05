import git from 'simple-git'
import Promise from 'bluebird'
import change from '../domain/change'
import preRelease from '../domain/pre-release'

function logEntryToChange (entry) {
  return change({
    type: 'major',
    description: entry.message,
    commits: [entry.hash]
  })
}

function logToPreRelease (log) {
  return preRelease({
    changes: log.map(logEntryToChange)
  })
}

export default function gitService (repoDir) {
  return new GitService(repoDir)
}

class GitService {
  constructor (repoDir = '.') {
    this.git = git(repoDir)
  }

  _call (method, ...args) {
    return Promise.promisify(this.git[method].bind(this.git))(...args)
  }

  prepareNextPreRelease () {
    return this.getTaggedReleases()
      .then(releaseNumbers => {
        const lastReleaseNumber = releaseNumbers[releaseNumbers.length - 1]
        const from = (lastReleaseNumber && this.getTagPathForRelease(lastReleaseNumber)) || undefined
        return this.getLogBetweenCommits(from, 'HEAD')
      })
      .then(logToPreRelease)
  }

  getTags () {
    return this._call('tags').then(tagList => tagList.all)
  }

  getLogBetweenCommits (c1, c2) {
    return this._call('log', { from: c1, to: c2 })
      .then(log => log.all)
  }

  getTaggedReleases () {
    const releaseTagPattern = /^releases\/([0-9]+)$/
    return this.getTags()
      .then(tags => tags.map(t => releaseTagPattern.exec(t)).filter(m => m).map(m => m[1]).sort())
  }

  getTagPathForRelease (r) {
    return `refs/tags/releases/${r}`
  }

  getTagPathForVersion (v) {
    return `refs/tags/versions/${v}`
  }

  getLogBetweenVersions (v1, v2) {
    return this.getLogBetweenCommits(this.getTagPathForVersion(v1), this.getTagPathForVersion(v2))
  }
}
