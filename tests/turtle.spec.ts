import { blankNode, literal, namedNode } from '@rdfjs/data-model'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { turtle } from '../src'

describe('turtle', () => {
  it('serializes named node', () => {
    // given
    const node = namedNode('http://example.com/')

    // when
    const str = turtle`${node}`.toString()

    // then
    expect(str).toEqual('<http://example.com/>')
  })

  it('serializes blank node', () => {
    // given
    const node = blankNode('foo')

    // when
    const str = turtle`${node}`.toString()

    // then
    expect(str).toEqual('_:foo')
  })

  it('serializes typed literal node', () => {
    // given
    const node = literal('foo', 'http://example.com/Datatype')

    // when
    const str = turtle`${node}`.toString()

    // then
    expect(str).toEqual('"foo"^^<http://example.com/Datatype>')
  })

  it('reduces known datatype URI to prefixed name', () => {
    // given
    const node = literal('foo', xsd.TOKEN)

    // when
    const str = turtle`${node}`.toString()

    // then
    expect(str).toEqual(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

"foo"^^xsd:TOKEN`)
  })

  it('serializes literal node with language', () => {
    // given
    const node = literal('foo', 'fr')

    // when
    const str = turtle`${node}`.toString()

    // then
    expect(str).toEqual('"foo"@fr')
  })
})
