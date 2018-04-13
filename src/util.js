
export function buildObject (seeds, ...args) {
  if (args.length === 0) {
    return seeds.reduce((obj, key) => {
      obj[key] = null
    }, {})
  } else if (args.length === 1) {
    const [keyToValue] = args
    return seeds.reduce((obj, key, idx) => {
      obj[key] = keyToValue(key, idx)
      return obj
    }, {})
  } else {
    const [keyGenerator, valueGenerator] = args
    return seeds.reduce((obj, seed, idx) => {
      const key = keyGenerator(seed, idx)
      obj[key] = valueGenerator(seed, idx, key)
      return obj
    }, {})
  }
}
