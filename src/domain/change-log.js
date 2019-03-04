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

class ChangeLog {
  constructor (releases) {
    const sortedReleases = [...releases].sort(compareReleases)
    const [firstRelease] = sortedReleases
    if (firstRelease) {
      if (firstRelease.release == null) {
        firstRelease.release = 1
      }
      if (firstRelease.version == null) {
        firstRelease.version = '0.0.1'
      }
      this.releases = sortedReleases.map((current, idx) => {
        const candidate = preRelease(current)
        if (idx > 0) {
          const prev = sortedReleases[idx - 1]
          if (current.release == null) {
            current.release = prev.release + 1
          } else {
            if (prev.release >= current.release) {
              throw new Error(`Release numbering is inconsistent: found release ${prev.release} before release ${current.release}`)
            }
          }
          if (current.version == null) {
            current.version = candidate.getSuggestedVersion(prev.version)
          } else if (semver.gt(prev.version, current.version)) {
            throw new Error(`Release versions are inconsistent: found ${prev.version} (rel ${prev.release}) before ${current.version} (rel ${current.release})`)
          }

          if (current.date != null && prev.date != null) {
            if (new Date(prev.date) > new Date(current.date)) {
              throw new Error(`Release dates are inconsistent: found "${prev.date}" (rel ${prev.release}) before "${current.date}" (rel ${current.release})`)
            }
          }
        }
        return candidate.release(current)
      })
    }
  }
}
