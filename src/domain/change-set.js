import change, {compareChanges} from './change'
import { compareTypes } from './change-types';

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

  toJSON () {
    return this.changes
  }

  addChange (data) {
    const c = change(data)
    this.changes.push(c)
    if (compareTypes(this.mostSignificantChangeType, c.type) < 0) {
      this.mostSignificantChangeType = c.type
    }
  }

  addChanges (changes) {
    if (changes instanceof ChangeSet) {
      this.addChanges(changes.changes)
    } else {
      changes.forEach(c => this.addChange(c))
    }
  }

  getMinimumReleaseType () {
    return this.mostSignificantChangeType
  }
}
