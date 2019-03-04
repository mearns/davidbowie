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
      }
    ])
  })

  it('should correctly add the first release using defaults', () => {
    // given
    const changeLogUnderTest = changeLog()

    // when
    changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], description: 'test description' })

    // then
    expect(changeLogUnderTest.releases).to.have.lengthOf(1)
    expect(changeLogUnderTest.releases[0]).to.have.property('release', 1)
    expect(changeLogUnderTest.releases[0]).to.have.property('version', '0.0.1')
    expect(changeLogUnderTest.releases[0]).to.have.property('description', 'test description')
  })

  it('should correctly add the first release with specified version', () => {
    // given
    const changeLogUnderTest = changeLog()

    // when
    changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], version: '1.0.0', description: 'test description' })

    // then
    expect(changeLogUnderTest.releases).to.have.lengthOf(1)
    expect(changeLogUnderTest.releases[0]).to.have.property('release', 1)
    expect(changeLogUnderTest.releases[0]).to.have.property('version', '1.0.0')
    expect(changeLogUnderTest.releases[0]).to.have.property('description', 'test description')
  })

  it('should correctly add the first release with specified release number', () => {
    // given
    const changeLogUnderTest = changeLog()

    // when
    changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], release: 2, description: 'test description' })

    // then
    expect(changeLogUnderTest.releases).to.have.lengthOf(1)
    expect(changeLogUnderTest.releases[0]).to.have.property('release', 2)
    expect(changeLogUnderTest.releases[0]).to.have.property('version', '0.0.1')
    expect(changeLogUnderTest.releases[0]).to.have.property('description', 'test description')
  })

  it('should correctly add a release with calculated release and version', () => {
    // given
    const changeLogUnderTest = changeLog([
      { version: '1.2.3', release: 2 }
    ])

    // when
    changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], description: 'test description' })

    // then
    expect(changeLogUnderTest.releases).to.have.lengthOf(2)
    expect(changeLogUnderTest.releases[1]).to.have.property('release', 3)
    expect(changeLogUnderTest.releases[1]).to.have.property('version', '1.3.0')
    expect(changeLogUnderTest.releases[1]).to.have.property('description', 'test description')
  })

  it('should correctly add a release with specified release and version', () => {
    // given
    const changeLogUnderTest = changeLog([
      { version: '1.2.3', release: 2 }
    ])

    // when
    changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], version: '1.5.7', release: 5, description: 'test description' })

    // then
    expect(changeLogUnderTest.releases).to.have.lengthOf(2)
    expect(changeLogUnderTest.releases[1]).to.have.property('release', 5)
    expect(changeLogUnderTest.releases[1]).to.have.property('version', '1.5.7')
    expect(changeLogUnderTest.releases[1]).to.have.property('description', 'test description')
  })

  it('should throw an error if trying to add a release out of order because of specified version', () => {
    // given
    const changeLogUnderTest = changeLog([
      { version: '1.2.3', release: 2 }
    ])

    // expect
    expect(() => changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], version: '1.2.2', description: 'test description' })).to.throw(Error, /Release versions are inconsistent/)
  })

  it('should throw an error if trying to add a release out of order because of specified release', () => {
    // given
    const changeLogUnderTest = changeLog([
      { version: '1.2.3', release: 2 }
    ])

    // expect
    expect(() => changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], release: 1, description: 'test description' })).to.throw(Error, /Release numbering is inconsistent/)
  })

  it('should throw an error if trying to add a release with an insufficient version bump', () => {
    // given
    const changeLogUnderTest = changeLog([
      { version: '1.2.3', release: 2 }
    ])

    // expect
    expect(() => changeLogUnderTest.addRelease({ changes: [{ type: 'minor' }], version: '1.2.4', description: 'test description' })).to.throw(Error, /Release version bump is insufficient/)
  })
})
