import { blankNode, literal, namedNode, quad } from '@rdfjs/data-model'
import RDF from '@rdfjs/dataset'
import { xsd, foaf } from '@tpluscode/rdf-ns-builders'
import namespace from '@rdfjs/namespace'
import { turtle } from '../src'

const ex = namespace('http://example.com/')

describe('turtle', () => {
  describe('named node interpolation', () => {
    it('serializes named node', async () => {
    // given
      const node = namedNode('http://example.com/')

      // when
      const str = turtle`${node} a <http://example.com/Type> .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> a <http://example.com/Type> .')
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
  })

  describe('blank node interpolation', () => {
    it('serializes blank node', async () => {
      // given
      const node = blankNode('bar')

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/foo> _:bar .')
      await expect(str).toBeValidTurtle()
    })
  })

  describe('literal node interpolation', () => {
    it('serializes typed literal node', async () => {
      // given
      const node = literal('bar', 'http://example.com/Datatype')

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/foo> "bar"^^<http://example.com/Datatype> .')
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
  })

  describe('quad interpolation', () => {
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

    it('ignores named graph', () => {
      // given
      const q = quad(ex.S, ex.P, ex.O, ex.G)

      // when
      const str = turtle`${q}`.toString()

      // then
      expect(str).toEqual('')
    })
  })

  describe('dataset interpolation', () => {
    it('ignores named graph', () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P, ex.O, ex.G))

      // when
      const str = turtle`${dataset}`.toString()

      // then
      expect(str).toEqual('')
    })

    it('can serialize quads from a selected named graph', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P, ex.O, ex.G1))
        .add(quad(ex.S, ex.P, ex.O, ex.G2))

      // when
      const str = turtle`${dataset}`.toString({
        graph: ex.G1,
      })

      // then
      expect(str).toMatch('<http://example.com/S> <http://example.com/P> <http://example.com/O> .')
      await expect(str).toBeValidTurtle()
    })
  })

  describe('interpolating JS types', () => {
    it('leaves strings intact', () => {
      // when
      const foo = 'foo'
      const str = turtle`<http://example.com/${foo}>`.toString()

      // then
      expect(str).toEqual('<http://example.com/foo>')
    })
  })
})
