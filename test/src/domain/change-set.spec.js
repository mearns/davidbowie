/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
import changeSet from '../../../src/domain/change-set'

// Support modules
import {expect} from 'chai'

describe('the change-set module', () => {
  it('should sort changes from most signficant to least', () => {
    // given
    const changeSetUnderTest = changeSet([
      {type: 'patch'},
      {type: 'major'},
      {type: 'minor'}
    ])

    // expect
    expect(changeSetUnderTest.changes.map(({type}) => type)).to.deep.equal([
      'major', 'minor', 'patch', 'semantic'
    ])
  })

  it('should select the most signficant change type from the set', () => {
    // given
    const changeSetUnderTest = changeSet([
      {type: 'patch'},
      {type: 'semantic'},
      {type: 'minor'},
      {type: 'patch'}
    ])

    // expect
    expect(changeSetUnderTest.mostSignificantChange).to.equal('minor')
  })
})
