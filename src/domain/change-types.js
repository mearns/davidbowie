import isUndefined from 'lodash.isundefined'

const CHANGE_TYPE_RANKS = {
  patch: 0,
  minor: 1,
  major: 2
}

function getTypeRank (type) {
  return CHANGE_TYPE_RANKS[type]
}

export function isValidType (type) {
  return !isUndefined(CHANGE_TYPE_RANKS[type])
}

export function assertValidType (type) {
  if (!isValidType(type)) {
    throw new TypeError(`Invalid change type ${type}. Expected one of ${Object.keys(CHANGE_TYPE_RANKS).join(', ')}`)
  }
}

export function compareTypes (typeA, typeB) {
  const A_IS_MORE_IMPORTANT = -1
  const B_IS_MORE_IMPORTANT = 1
  const EQUAL = 0

  const rankA = getTypeRank(typeA)
  const rankB = getTypeRank(typeB)
  if (rankA < rankB) {
    return B_IS_MORE_IMPORTANT
  } else if (rankA > rankB) {
    return A_IS_MORE_IMPORTANT
  }
  return EQUAL
}
