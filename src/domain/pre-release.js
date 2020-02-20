
import changeSet from './change-set'
import release from './release'
import semver from 'semver'
import { isReleasableType } from './change-types'

export default function preRelease (data) {
  if (data instanceof preRelease) {
    return data
  }
  return new PreRelease(data)
}

class PreRelease {
  constructor ({ version = null, description, changes = [] } = {}) {
    this.description = description
    this.changes = changeSet(changes)
    this.version = version
  }

  addChanges (changes) {
    this.changes.addChanges(changes)
  }

  toJSON () {
    const json = {}
    if (this.version != null) {
      json.version = this.version
    }
    json.description = this.description
    json.changes = this.changes
    return json
  }

  getMinimumReleaseType () {
    return this.changes.getMinimumReleaseType()
  }

  getSuggestedVersion (previousVersion) {
    const minimumType = this.getMinimumReleaseType()
    if (minimumType && isReleasableType(minimumType)) {
      return semver.inc(previousVersion, this.getMinimumReleaseType())
    } else {
      return previousVersion
    }
  }

  isValidVersion (version, previousVersion) {
    return semver.gte(version, this.getSuggestedVersion(previousVersion))
  }

  promoteToRelease ({ release: releaseNumber, version = this.version, date }) {
    return release({ release: releaseNumber, version, date, description: this.description, changes: this.changes.changes })
  }
}
