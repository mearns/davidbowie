import strftime from 'strftime'
import semver from 'semver'
import {buildObject} from './util'
import isUndefined from 'lodash.isundefined'

const MIN_RELEASABLE_RANK = 1
const MAX_NONRELEASABLE_RANK = -1
const RELEASABLE_CHANGE_TYPE_ORDER = ['patch', 'minor', 'major']
const NONRELEASABLE_CHANGE_TYPE_ORDER = ['semantic']

const CHANGE_TYPE_RANKS = {
  ...(buildObject(RELEASABLE_CHANGE_TYPE_ORDER, (type, idx) => MIN_RELEASABLE_RANK + idx)),
  ...(buildObject(NONRELEASABLE_CHANGE_TYPE_ORDER, (type, idx) => MAX_NONRELEASABLE_RANK - idx))
}

const CHANGE_TYPE_LOOKUP_BY_RANK = buildObject(Object.keys(CHANGE_TYPE_RANKS), type => CHANGE_TYPE_RANKS[type], type => type)

export class ChangeLog {
  constructor (changeLog, {
    warnings = {push: () => {}},
    commitLinkGenerator = (commitId) => ({text: commitId}),
    initialVersion = '1.0.0'
  } = {}) {
    this.commitLinkGenerator = commitLinkGenerator

    const releases = (changeLog.Releases || [])
    releases.forEach(release => this.validateRelease(release, warnings))

    // Sort by release number (highest first)
    this.releases = releases
      .map(release => ({
        ...release,
        date: (release.date && new Date(release.date)) || undefined,
        identifier: this.getReleaseIdentifier(release)
      }))
      .sort(this.compareReleases.bind(this))

    this.releases.forEach((release, idx) => {
      release.changes = [...(release.changes || [])]
        .sort(this.compareChangesByType.bind(this))
        .map(change => ({...change}))
      release.changes.forEach(change => {
        change.commits = [...(change.commits || [])]
      })

      release.prev = this.releases[idx + 1]
      release.next = this.releases[idx - 1]
      if (!release.prev) {
        if (!release.version) {
          release.version = initialVersion
        }
      } else {
        if (isUndefined(release.release)) {
          const identifier = release.identifier
          release.release = release.prev.release + 1
          release.identifier = this.getReleaseIdentifier(release, true)
          warnings.push(new Error(`Release ${identifier} had no release number, a release number (${release.release}) was auto generated based on the previous release`))
        } else {
          if (release.prev.release === release.release) {
            warnings.push(new Error(`Duplicate release number ${release.release}`))
          }
          if (release.prev.release + 1 < release.release) {
            warnings.push(new Error(`Releases skipped between ${release.prev.identifier} and ${release.release.identifier}`))
          }
        }

        if (semver.valid(release.prev.version) && semver.valid(release.version) && semver.lte(release.version, release.prev.version)) {
          warnings.push(new Error(`Release ${release.identifier} version (${release.version}) is not greater than that of the previous release (${release.prev.identifier}: ${release.prev.version})`))
        }
        if (release.date < release.prev.date) {
          warnings.push(new Error(`Release ${release.identifier} has a release date (${release.date}) prior to the previous release (${release.prev.identifier}: ${release.prev.date})`))
        }

        if (semver.valid(release.prev.version) && semver.valid(release.version)) {
          release.step = semver.diff(release.prev.version, release.version)
        }
        if (release.changes.length) {
          const changeRanks = release.changes.map(({type}) => CHANGE_TYPE_RANKS[type])
          if (changeRanks.some(isUndefined)) {
            const unrecognizedTypes = release.changes
              .map(({type}) => type)
              .filter(type => isUndefined(CHANGE_TYPE_RANKS[type]))
            warnings.push(new Error(`Release ${release.identifier} has unrecognized change types: ${unrecognizedTypes.join(', ')}`))
          } else if (!changeRanks.some(rank => rank >= MIN_RELEASABLE_RANK)) {
            warnings.push(new Error(`Release ${release.identifier} has no releaseable changes listed`))
          } else {
            const biggestChangeRank = Math.max(...changeRanks)
            const biggestChange = CHANGE_TYPE_LOOKUP_BY_RANK[biggestChangeRank]
            if (release.step) {
              const stepRank = CHANGE_TYPE_RANKS[release.step]
              if (biggestChangeRank > stepRank) {
                warnings.push(new Error(`Insufficient version step (${release.step}) in release ${release.identifier}: change list describes ${biggestChange} changes from release ${release.prev.identifier}`))
              } else if (biggestChangeRank < stepRank) {
                warnings.push(new Error(`Possibly unnecessary version step (${release.step}) in release ${release.identifier}: largest described change is ${biggestChange}`))
              }
            } else if (semver.valid(release.prev.version) && !release.version && biggestChangeRank >= MIN_RELEASABLE_RANK) {
              release.version = semver.inc(release.prev.version, biggestChange)
              release.identifier = this.getReleaseIdentifier(release, true)
              warnings.push(new Error(`Release ${release.identifier} had no version, it was automatically generated based on previous release and recorded changes (${release.version})`))
            }
          }
        }
      }
    })
  }

  validateRelease (release, warnings) {
    const identifier = this.getReleaseIdentifier(release)
    if (!release.release || isNaN(release.release) || parseInt(release.release) !== parseFloat(release.release) || release.release <= 0) {
      warnings.push(new Error(`Invalid release number (${release.release}) for release ${identifier}. Expected an integer greater than 0`))
    }

    if (!semver.valid(release.version)) {
      warnings.push(new Error(`Version string for release ${identifier} is not a valid semver: ${release.version}`))
    }

    if (semver.prerelease(release.version)) {
      warnings.push(new Error(`Release ${identifier} is a pre-release version: ${release.version}`))
    }

    if (!release.date) {
      warnings.push(new Error(`Release ${identifier} has no release date`))
    }
  }

  generateMarkdownLink ({text, url}) {
    if (url) {
      return `[${text}](${url})`
    } else {
      return String(text)
    }
  }

  writeMarkdown (writer) {
    this.releases
      .forEach(release => {
        writer.writeline(`## Release ${release.release} - ${release.version} - ${this.formatDate(release.date)}`)
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
            writer.writeline(` _(${commits
                .map((commit) => this.commitLinkGenerator(commit))
                .map(this.generateMarkdownLink.bind(this))
                .join(', ')})_`)
          } else {
            writer.endline()
          }
        })

        writer.skipline()
      })

    return writer
  }

  compareChangesByType ({type: typeA}, {type: typeB}) {
    const rankA = CHANGE_TYPE_RANKS[typeA]
    const rankB = CHANGE_TYPE_RANKS[typeB]
    return rankB - rankA
  }

  getReleaseIdentifier (release, force) {
    const {identifier, release: releaseNumber, version, date} = release
    if (identifier && !force) {
      return identifier
    } else if (releaseNumber) {
      return String(releaseNumber)
    } else if (version) {
      return version
    } else if (date) {
      return this.formatDate(date)
    }
    return 'unknown'
  }

  compareReleases (releaseA, releaseB) {
    if (releaseA.release && releaseB.release) {
      return releaseB.release - releaseA.release
    }
    if (semver.valid(releaseA.version) && semver.valid(releaseB.version)) {
      return semver.compare(releaseB.version, releaseA.version)
    }
    if (releaseA.date && releaseB.date) {
      return releaseB.date - releaseA.date
    }
    return 0
  }

  formatDate (date) {
    if (date) {
      return strftime('%Y-%m-%d', date)
    } else {
      return 'unknown'
    }
  }
}
