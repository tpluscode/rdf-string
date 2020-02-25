import { blankNode, literal, namedNode, quad } from '@rdfjs/data-model'
import { xsd, foaf } from '@tpluscode/rdf-ns-builders'
import { turtle } from '../src'

describe('turtle', () => {
  it('serializes named node', async () => {
    // given
    const node = namedNode('http://example.com/')

    // when
    const str = turtle`${node} a <http://example.com/Type> .`.toString()

    // then
    expect(str).toEqual('<http://example.com/> a <http://example.com/Type> .')
    await expect(str).toBeValidTurtle()
  })

  it('serializes blank node', async () => {
    // given
    const node = blankNode('bar')

    // when
    const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

    // then
    expect(str).toEqual('<http://example.com/> <http://example.com/foo> _:bar .')
    await expect(str).toBeValidTurtle()
  })

  it('serializes typed literal node', async () => {
    // given
    const node = literal('bar', 'http://example.com/Datatype')

    // when
    const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

    // then
    expect(str).toEqual('<http://example.com/> <http://example.com/foo> "bar"^^<http://example.com/Datatype> .')
    await expect(str).toBeValidTurtle()
  })

  it('reduces known datatype URI to prefixed name', async () => {
    // given
    const node = literal('bar', xsd.TOKEN)

    // when
    const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

    // then
    expect(str).toEqual(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://example.com/> <http://example.com/foo> "bar"^^xsd:TOKEN .`)
    await expect(str).toBeValidTurtle()
  })

  it('serializes literal node with language', async () => {
    // given
    const node = literal('foo', 'fr')

    // when
    const str = turtle`<http://example.com/> <http://example.com/le-foo> ${node} .`.toString()

    // then
    expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> "foo"@fr .')
    await expect(str).toBeValidTurtle()
  })

  it('serializes a single quad', async () => {
    // given
    const q = quad(
      namedNode('http://example.com/person/John'),
      foaf.lastName,
      literal('Doe')
    )

    // when
    const str = turtle`${q}`.toString()

    // then
    expect(str).toEqual(`@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<http://example.com/person/John> foaf:lastName "Doe" .`)
    await expect(str).toBeValidTurtle()
  })
})
