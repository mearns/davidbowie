import strftime from 'strftime'
import semver from 'semver'

const CHANGE_TYPE_RANKS = {
  major: 0,
  minor: -1,
  patch: -2,
  semantic: -3
}

export class ChangeLog {
  constructor (changeLog, {warnings = {push: () => {}}} = {}) {
    const releases = (changeLog.Releases || [])
    releases.forEach(release => this.validateRelease(release, warnings))

    // Sort by release number (highest first)
    this.releases = [...releases]
      .sort(({release: releaseA}, {release: releaseB}) => releaseB - releaseA)
      .map(release => ({...release, date: new Date(release.date)}))

    this.releases.forEach((release, idx) => {
      release.changes = [...(release.changes || [])]
        .sort(compareChangesByType)
        .map(change => ({...change}))
      release.changes.forEach(change => {
        change.commits = [...(change.commits || [])]
      })

      release.prev = this.releases[idx + 1]
      release.next = this.releases[idx - 1]
      if (release.prev) {
        if (release.prev.release === release.release) {
          warnings.push(new Error(`Duplicate release number ${release.release}`))
        }
        if (release.prev.release + 1 < release.release) {
          warnings.push(new Error(`Releases skipped between ${release.prev.release} and ${release.release}`))
        }
        if (semver.lte(release.version, release.prev.version)) {
          warnings.push(new Error(`Release ${release.release} version (${release.version}) is not greater than that of the previous release (rel${release.prev.release}: ${release.prev.version})`))
        }
        if (release.date < release.prev.date) {
          warnings.push(new Error(`Release ${release.release} has a release date (${release.date}) prior to the previous release (rel${release.prev.release}: ${release.prev.date})`))
        }
        release.step = semver.diff(release.prev.version, release.version)
        if (release.changes.length) {
          const stepRank = CHANGE_TYPE_RANKS[release.step]
          const biggestChange = Math.max(...(release.changes.map(({type}) => CHANGE_TYPE_RANKS[type])))
          if (biggestChange > stepRank) {
            warnings.push(new Error(`Insufficient version step (${release.step}) in release ${release.release}: change list describes larger changes`))
          } else if (biggestChange < stepRank) {
            warnings.push(new Error(`Unnecessary version step (${release.step}) in release ${release.release}: no changes listed with that significance`))
          }
        }
      }
    })
  }

  validateRelease (release, warnings) {
    if (!release.release || isNaN(release.release) || parseInt(release.release) !== parseFloat(release.release) || release.release <= 0) {
      throw new Error(`Invalid release number: ${release.release}. Expected an integer greater than 0`)
    }

    if (!semver.valid(release.version)) {
      throw new Error(`Version string for release ${release.release} is not a valid semver`)
    }

    if (semver.prerelease(release.version)) {
      warnings.push(new Error(`Release ${release.release} is a pre-release version: ${release.version}`))
    }

    if (!release.date) {
      throw new Error(`Release ${release.release} has no release date`)
    }
  }

  writeMarkdown (writer) {
    this.releases
      .forEach(release => {
        writer.writeline(`## Release ${release.release} - ${release.version} - ${formatDate(release.date)}`)
        writer.skipline()
        writer.write('&nbsp;&nbsp;&nbsp;&nbsp;_')
        if (release.step) {
          writer.write(`${release.step} change`)
        } else {
          writer.write('initial release')
        }
        writer.writeline('_')
        writer.skipline()
        if (release.description) {
          writer.writeline(release.description)
          writer.skipline()
        }

        release.changes.forEach(({type, description, commits}) => {
          writer.write(`*   _${type}_ - ${description}`)
          if (commits.length) {
            writer.writeline(` _(${commits.join(', ')})_`)
          }
        })

        writer.skipline()
      })

    return writer
  }
}

function compareChangesByType ({type: typeA}, {type: typeB}) {
  const rankA = CHANGE_TYPE_RANKS[typeA]
  const rankB = CHANGE_TYPE_RANKS[typeB]
  return rankB - rankA
}

function formatDate (date) {
  return strftime('%Y-%m-%d', date)
}
