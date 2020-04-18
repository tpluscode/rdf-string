import { quad, literal } from '@rdfjs/data-model'
import { dataset } from '@rdfjs/dataset'
import namespace from '@rdfjs/namespace'
import { ntriples } from '../src'

const ex = namespace('http://example.com/')

describe('ntriples', () => {
  describe('serializing dataset', () => {
    it('ignores named graphs by default', () => {
      // given
      const q = dataset().add(quad(ex.S, ex.P, ex.O, ex.G))

      // when
      const str = ntriples`${q}`.toString()

      // then
      expect(str).toEqual('')
    })

    it('can serialize selected graph', () => {
      // given
      const q = dataset()
        .add(quad(ex.S, ex.P, ex.O, ex.G))
        .add(quad(ex.A, ex.B, ex.C, ex.D))

      // when
      const str = ntriples`${q}`.toString({
        graph: ex.D,
      })

      // then
      expect(str).toEqual('<http://example.com/A> <http://example.com/B> <http://example.com/C>  .')
    })
  })

  describe('serializing quads', () => {
    it('ignores triples from named graphs', () => {
      // given
      const q = quad(ex.S, ex.P, ex.O, ex.G)

      // when
      const str = ntriples`${q}`.toString()

      // then
      expect(str).toEqual('')
    })

    it('omits the graph part of named graph quads', () => {
      // given
      const q = quad(ex.S, ex.P, ex.O, ex.G)

      // when
      const str = ntriples`${q}`.toString({
        graph: ex.G,
      })

      // then
      expect(str).toEqual('<http://example.com/S> <http://example.com/P> <http://example.com/O>  .')
    })
  })

  describe('serializing literal', () => {
    it('serializes integer as xsd:int', async () => {
      // when
      const str = ntriples`<http://example.com/> <http://example.com/le-foo> ${10} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> "10"^^<http://www.w3.org/2001/XMLSchema#integer> .')
    })

    it('serializes float as xsd:decimal', async () => {
      // when
      const str = ntriples`<http://example.com/> <http://example.com/le-foo> ${10.5} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> "10.5"^^<http://www.w3.org/2001/XMLSchema#decimal> .')
    })

    it('serializes boolean as xsd:boolean', async () => {
      // when
      const str = ntriples`<http://example.com/> <http://example.com/le-foo> ${true} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .')
    })

    it('serializes false boolean as xsd:boolean', async () => {
      // when
      const str = ntriples`<http://example.com/> <http://example.com/le-foo> ${false} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> "false"^^<http://www.w3.org/2001/XMLSchema#boolean> .')
    })

    it('escapes line breaks and quote chars from literal', () => {
      // when
      const value = literal(`This is
a multiline string
with "quotations"`)
      const str = ntriples`${value}`.toString()

      // then
      expect(str).toEqual('"This is\\na multiline string\\nwith \\"quotations\\""')
    })
  })
})
