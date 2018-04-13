
import {TextWriter} from 'text-scribe'
import {ChangeLog} from './change-log'
import * as gitUtils from './git-utils'

const warnings = []

const changeLog = new ChangeLog({
  Releases: [
    {
      release: 2,
      version: '1.1.0',
      description: 'Add an `adopt(thennable)` method to settle an `ExtrinsicPromise` based on the settled state of another thennable.',
      changes: [
        {
          type: 'semantic',
          description: 'Document in README that fulfill and reject methods are bound.',
          commits: ['9fb1eeb'],
          issues: ['1', '2']
        },
        {
          type: 'minor',
          description: 'Add `ExtrinsicPromise::adopt()` method',
          issues: ['3']
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
      date: '2018-05-01',
      version: '1.2.0',
      changes: [
        {
          type: 'foo',
          description: 'Add `ExtrinsicPromise::adopt()` method'
        },
        {
          type: 'minor',
          description: 'Add `ExtrinsicPromise::adopt()` method'
        }
      ]
    },
    {
      release: 5,
      version: '2.1.2',
      date: '2018-06-03'
    }
  ]
}, {
  warnings,
  commitLinkGenerator: gitUtils.createGithubCommitLinkGenerator({username: 'mearns', repo: 'structured-change'})
})

warnings.forEach(warning => console.error('Warning: ', warning))

const writer = changeLog.writeMarkdown(new TextWriter())

console.log(writer.toString())
