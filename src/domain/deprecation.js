
export default function deprecation (data) {
  if (data instanceof Deprecation) {
    return data
  } else if (typeof data === 'string') {
    return new Deprecation({ version: data })
  } else {
    return new Deprecation(data)
  }
}

class Deprecation {
  constructor ({ version, explanation }) {
    this.version = version
    this.explanation = explanation
  }

  toJSON () {
    const json = {
      version: this.version
    }
    if (this.explanation) { json.explanation = this.explanation }
    return json
  }
}
