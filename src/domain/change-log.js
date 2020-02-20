import release, {compareReleases} from './release'
import preRelease from './pre-release'
import semver from 'semver'

export default function changeLog (releases) {
  if (releases instanceof ChangeLog) {
    return releases
  } else {
    return new ChangeLog(releases)
  }
}

function prepareFirstRelease (data) {
  return release({ release: 1, version: '0.0.1', ...data })
}

function prepareAndValidateNextRelease (next, prev) {
  const candidate = preRelease(next)
  const updates = {
    release: next.release,
    version: next.version,
    date: next.date
  }
  if (next.release == null) {
    updates.release = prev.release + 1
  } else {
    if (prev.release >= next.release) {
      throw new Error(`Release numbering is inconsistent: found release ${prev.release} before release ${next.release}`)
    }
  }
  if (next.version == null) {
    updates.version = candidate.getSuggestedVersion(prev.version)
  } else if (semver.gt(prev.version, next.version)) {
    throw new Error(`Release versions are inconsistent: found ${prev.version} (rel ${prev.release}) before ${next.version} (rel ${next.release})`)
  } else if (semver.lt(next.version, candidate.getSuggestedVersion(prev.version))) {
    throw new Error(`Release version bump is insufficient for ${next.version} (rel ${next.release}): expected at least ${candidate.getSuggestedVersion(prev.version)} based on specified changes`)
  }

  if (next.date != null && prev.date != null) {
    if (new Date(prev.date) > new Date(next.date)) {
      throw new Error(`Release dates are inconsistent: found "${prev.date}" (rel ${prev.release}) before "${next.date}" (rel ${next.release})`)
    }
  }

  return candidate.promoteToRelease(updates)
}

class ChangeLog {
  constructor (releases = []) {
    const sortedReleaseData = [...releases].sort(compareReleases)
    this.releases = []
    for (let r of sortedReleaseData) {
      this.addRelease(r)
    }
  }

  toJSON () {
    return [...this.releases].reverse()
  }

  getLatestRelease () {
    return this.releases[this.releases.length - 1]
  }

  addRelease (data) {
    if (this.releases.length) {
      this.releases.push(prepareAndValidateNextRelease(data, this.releases[this.releases.length - 1]))
    } else {
      this.releases.push(prepareFirstRelease(data))
    }
  }
}
