
import {TextWriter} from 'text-scribe'
import {ChangeLog} from './change-log'

const warnings = []

const changeLog = new ChangeLog({
  Releases: [
    {
      release: 2,
      version: '1.1.0',
      date: '2018-04-12',
      description: 'Add an `adopt(thennable)` method to settle an `ExtrinsicPromise` based on the settled state of another thennable.',
      changes: [
        {
          type: 'semantic',
          description: 'Document in README that fulfill and reject methods are bound.',
          commits: ['9fb1eeb']
        },
        {
          type: 'minor',
          description: 'Add `ExtrinsicPromise::adopt()` method'
        },
        {
          type: 'semantic',
          description: 'Add unit tests to ensure that the `fulfill()` and `reject()` methods are bound'
        }
      ]
    },
    {
      release: 1,
      version: '1.0.0',
      date: '2017-11-20'
    },
    {
      release: 3,
      version: '1.1.1',
      date: '2018-05-01'
    },
    {
      release: 4,
      version: '2.0.0',
      date: '2018-05-01'
    },
    {
      release: 5,
      version: '2.1.2',
      date: '2018-06-03'
    }
  ]
}, {warnings})

warnings.forEach(warning => console.log('Warning: ', warning))

const writer = changeLog.writeMarkdown(new TextWriter())

console.log(writer.toString())
