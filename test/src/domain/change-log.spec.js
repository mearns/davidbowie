/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
import changeLog from '../../../src/domain/change-log'

// Support modules
import {expect} from 'chai'

describe('the change-log module', () => {
  it('should generate missing release numbers and versions', () => {
    // given
    const changeLogUnderTest = changeLog([
      {
        date: '2018-01-01'
      },
      {
        date: '2018-01-02',
        release: 3
      },
      {
        date: '2018-01-03',
        changes: [
          { type: 'minor' }
        ]
      },
      {
        date: '2018-01-04'
      }
    ])

    // expect
    console.log(changeLogUnderTest.releases)
    expect(changeLogUnderTest.releases.map(({ release, version, date }) => ({release, version, date}))).to.deep.equal([
      {
        date: new Date('2018-01-01'),
        release: 1,
        version: '0.0.1'
      },
      {
        date: new Date('2018-01-02'),
        release: 3,
        version: '0.0.1'
      },
      {
        date: new Date('2018-01-03'),
        release: 4,
        version: '0.1.0'
      },
      {
        date: new Date('2018-01-04'),
        release: 5,
        version: '0.1.0'
      },
    ])
  })
})
