
import changeSet from './change-set'
import release from './release'
import semver from 'semver'

export default function preRelease (data) {
  if (data instanceof preRelease) {
    return data
  }
  return new PreRelease(data)
}

class PreRelease {
  constructor ({ description, date, changes }) {
    this.date = date && (date instanceof Date ? date : new Date(date))

    this.description = description

    this.changes = changeSet(changes)
  }

  getMinimumReleaseType () {
    return this.changes.getMinimumReleaseType()
  }

  getSuggestedVersion (previousVersion) {
    const minimumType = this.getMinimumReleaseType()
    if (minimumType) {
      return semver.inc(previousVersion, this.getMinimumReleaseType())
    } else {
      return previousVersion
    }
  }

  isValidVersion (version, previousVersion) {
    return semver.gte(version, this.getSuggestedVersion(previousVersion))
  }

  release ({ release: releaseNumber, version }) {
    return release({ release: releaseNumber, version, date: this.date, description: this.description, changes: this.changes })
  }
}
