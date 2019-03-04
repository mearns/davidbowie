/* eslint-env mocha */
/* eslint no-unused-expressions:0 */

// Module under test
import * as changeTypes from '../../../src/domain/change-types'

// Support modules
import {expect} from 'chai'

describe('the change-types module', () => {
  ['major', 'minor', 'patch'].forEach(type => {
    it(`should consider "${type}" to be a valid type`, () => {
      expect(changeTypes.isValidType(type)).to.be.true
    })
  })

  it('should compare major greater than minor', () => {
    expect(changeTypes.compareTypes('major', 'minor')).to.be.lessThan(0)
    expect(changeTypes.compareTypes('minor', 'major')).to.be.greaterThan(0)
  })
})
