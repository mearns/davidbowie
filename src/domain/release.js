
import semver from 'semver'
import changeSet from './change-set'

export default function release (data) {
  if (data instanceof Release) {
    return data
  }
  return new Release(data)
}

export function compareReleases (a, b) {
  const A_IS_LATER = 1
  const B_IS_LATER = -1
  const EQUAL = 0
  if (a.release != null && b.release != null) {
    if (a.release > b.release) {
      return A_IS_LATER
    } else if (a.release < b.release) {
      return B_IS_LATER
    }
  }

  if (semver.valid(a.version) && semver.valid(b.version)) {
    if (semver.gt(a.version, b.version)) {
      return A_IS_LATER
    } else if (semver.lt(a.version, b.version)) {
      return B_IS_LATER
    }
  }

  if (a.date != null && b.date != null) {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)
    if (aDate > bDate) {
      return A_IS_LATER
    } else if (aDate < bDate) {
      return B_IS_LATER
    }
  }
  return EQUAL
}

class Release {
  constructor ({ release, version, date, description, changes }) {
    this.release = parseInt(release)
    if (isNaN(this.release)) {
      throw new TypeError(`Invalid release number: ${release}`)
    }

    this.version = semver.clean(version)
    if (this.version === null) {
      throw new TypeError(`Invalid version: "${version}". Expected a semver string`)
    }

    this.date = date instanceof Date ? date : new Date(date)

    this.description = description

    this.changes = changeSet(changes)
  }
}
