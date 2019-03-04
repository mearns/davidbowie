import change, {compareChanges} from './change'

export default function changeSet (changes) {
  if (changes instanceof ChangeSet) {
    return changes
  } else {
    return new ChangeSet(changes)
  }
}

function forceArray (x) {
  return (Array.isArray(x) && x) || [x]
}

class ChangeSet {
  constructor (changes = []) {
    this.changes = forceArray(changes).map(c => change(c)).sort(compareChanges);
    ({type: this.mostSignificantChangeType} = this.changes[0] || {})
  }

  getMinimumReleaseType () {
    return this.mostSignificantChangeType
  }
}
