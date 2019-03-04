
export default function issue (data) {
  if (data instanceof Issue) {
    return data
  } else if (typeof data === 'string') {
    return new Issue({ id: data })
  } else {
    return new Issue(data)
  }
}

class Issue {
  constructor ({id, link, summary}) {
    this.id = id
    this.link = link
    this.summary = summary
  }
}
