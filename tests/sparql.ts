import { sparql } from '../src/index'
import { namedNode } from '@rdfjs/data-model'

describe('sparql', () => {
  it('serializes named node', () => {
    // given
    const type = namedNode('http://example.com/type')

    // when
    const query = sparql`SELECT * WHERE { ?person a ${type} }`

    // then
    expect(query.toString()).toMatchSnapshot()
  })

  it('serializes string literal', () => {
    // given
    const name = 'John Doe'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

    // then
    expect(query.toString()).toMatchSnapshot()
  })
})
