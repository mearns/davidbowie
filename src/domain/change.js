import {compareTypes, isValidType} from './change-types'
import issue from './issue'
import securityIssue from './security-issue'

export function compareChanges (changeA, changeB) {
  const CHANGE_A_MORE_IMPORTANT = -1
  const CHANGE_B_MORE_IMPORTANT = 1
  const EQUAL = 0
  const typeCompare = compareTypes(changeA.type, changeB.type)
  if (typeCompare !== EQUAL) {
    return typeCompare
  }

  if (changeA.securityIssuesAddressed.length > changeB.securityIssuesAddressed.length) {
    return CHANGE_A_MORE_IMPORTANT
  } else if (changeA.securityIssuesAddressed.length < changeB.securityIssuesAddressed.length) {
    return CHANGE_B_MORE_IMPORTANT
  }

  if (changeA.issuesAddressed.length > changeB.issuesAddressed.length) {
    return CHANGE_A_MORE_IMPORTANT
  } else if (changeA.issuesAddressed.length < changeB.issuesAddressed.length) {
    return CHANGE_B_MORE_IMPORTANT
  }

  if (changeA.commits.length > changeB.commits.length) {
    return CHANGE_A_MORE_IMPORTANT
  } else if (changeA.commits.length < changeB.commits.length) {
    return CHANGE_B_MORE_IMPORTANT
  }

  if (changeA.description < changeB.description) {
    return CHANGE_A_MORE_IMPORTANT
  } else if (changeA.description > changeB.description) {
    return CHANGE_B_MORE_IMPORTANT
  }
  return EQUAL
}

function forceArray (x) {
  return (Array.isArray(x) && x) || [x]
}

export default function change (data) {
  if (data instanceof Change) {
    return data
  }
  return new Change(data)
}

class Change {
  constructor ({type, description = '', commits = [], issuesAddressed = [], securityIssuesAddressed = []}) {
    if (!isValidType(type)) {
      throw new TypeError(`Invalid change type: ${type}`)
    }
    this.type = type
    this.description = description
    this.commits = forceArray(commits).map(String)
    this.issuesAddressed = forceArray(issuesAddressed).map(issue)
    this.securityIssuesAddressed = forceArray(securityIssuesAddressed).map(securityIssue)
  }
}
