
export default function securityIssue (data) {
  if (data instanceof SecurityIssue) {
    return data
  } else if (typeof data === 'string') {
    return new SecurityIssue({ link: data })
  } else {
    return new SecurityIssue(data)
  }
}

class SecurityIssue {
  constructor ({link, summary}) {
    this.link = link
    this.summary = summary
  }

  toJSON () {
    const json = { link: this.link }
    if (this.summary) { json.summary = this.summary }
    return json
  }
}
