import { blankNode, literal, namedNode, quad } from '@rdfjs/data-model'
import RDF from '@rdfjs/dataset'
import { xsd, foaf, schema, rdf } from '@tpluscode/rdf-ns-builders'
import namespace from '@rdfjs/namespace'
import { DateTime } from 'luxon'
import { prefixes, turtle } from '../src'

const ex = namespace('http://example.com/')
prefixes.turtle = 'http://turtle.com/'

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

    it('applies base URI string to identifiers', async () => {
      // given
      const node = ex()

      // when
      const str = turtle`${node} a ${ex('Type/Person')} .`.toString({
        base: ex().value,
      })

      // then
      expect(str).toEqual(`@base <http://example.com/> .

<> a <Type/Person> .`)
      await expect(str).toBeValidTurtle()
    })

    it('applies base URI node to identifiers', async () => {
      // given
      const node = ex()

      // when
      const str = turtle`${node} a ${ex('Type/Person')} .`.toString({
        base: ex(),
      })

      // then
      expect(str).toEqual(`@base <http://example.com/> .

<> a <Type/Person> .`)
      await expect(str).toBeValidTurtle()
    })

    it('reduces known datatype URI to prefixed name', async () => {
      // given
      const node = xsd.TOKEN

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

      // then
      expect(str).toEqual(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://example.com/> <http://example.com/foo> xsd:TOKEN .`)
      await expect(str).toBeValidTurtle()
    })

    it('prefixes custom prefixes added globally', async () => {
      const Foo = namedNode('http://turtle.com/Foo')

      // when
      const str = turtle`[ a ${Foo} ] .`.toString()

      // then
      expect(str).toEqual(`@prefix turtle: <http://turtle.com/> .

[ a turtle:Foo ] .`)
      await expect(str).toBeValidTurtle()
    })

    it('outputs prefixed node for ad-hoc prefixes', async () => {
      // given
      const exOrg = 'http://example.org/'
      const Foo = namedNode('http://example.org/Foo')

      // when
      const str = turtle`${ex.foo} a ${Foo} .`.toString({
        prefixes: { ex, exOrg },
      })

      // then
      expect(str).toEqual(`@prefix ex: <http://example.com/> .
@prefix exOrg: <http://example.org/> .

ex:foo a exOrg:Foo .`)
      await expect(str).toBeValidTurtle()
    })

    it('escapes slashes and hash in prefixed names', async () => {
      // given
      const exOrg = 'http://example.org/'
      const Foo = RDF.namedNode('http://example.org/foo/bar#baz')

      // when
      const str = turtle`${ex.foo} a ${Foo} .`.toString({
        prefixes: { ex, exOrg },
      })

      // then
      expect(str).toEqual(`@prefix ex: <http://example.com/> .
@prefix exOrg: <http://example.org/> .

ex:foo a exOrg:foo\\/bar\\#baz .`)
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

    it('serializes explicitly typed decimal', async () => {
      // given
      const node = literal('10', xsd.decimal)

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

      // then
      expect(str).toMatch('<http://example.com/> <http://example.com/foo> "10"^^xsd:decimal .')
      await expect(str).toBeValidTurtle()
    })

    it('serializes decimal shorthand', async () => {
      // given
      const node = literal('10.4', xsd.decimal)

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString()

      // then
      expect(str).toMatch('<http://example.com/> <http://example.com/foo> 10.4 .')
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

    it('reduces known datatype URI to using base URI string', async () => {
      // given
      const node = literal('bar', ex.TOKEN)

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString({
        base: ex().value,
      })

      // then
      expect(str).toEqual(`@base <http://example.com/> .

<http://example.com/> <http://example.com/foo> "bar"^^<TOKEN> .`)
      await expect(str).toBeValidTurtle()
    })

    it('reduces known datatype URI to using base URI named node', async () => {
      // given
      const node = literal('bar', ex.TOKEN)

      // when
      const str = turtle`<http://example.com/> <http://example.com/foo> ${node} .`.toString({
        base: ex(),
      })

      // then
      expect(str).toEqual(`@base <http://example.com/> .

<http://example.com/> <http://example.com/foo> "bar"^^<TOKEN> .`)
      await expect(str).toBeValidTurtle()
    })

    it('serializes integer as xsd:integer', async () => {
      // when
      const str = turtle`<http://example.com/> <http://example.com/le-foo> ${10} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> 10 .')
    })

    it('serializes Date as xsd:DateTime', async () => {
      // given
      const date = DateTime.utc(2020, 2, 27, 14, 13).toJSDate()

      // when
      const str = turtle`<http://example.com/> <http://example.com/le-foo> ${date} .`.toString()

      // then
      expect(str).toEqual(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

<http://example.com/> <http://example.com/le-foo> "2020-02-27T14:13:00.000Z"^^xsd:dateTime .`)
    })

    it('serializes float as xsd:decimal', async () => {
      // when
      const str = turtle`<http://example.com/> <http://example.com/le-foo> ${10.5} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> 10.5 .')
    })

    it('serializes boolean as xsd:boolean', async () => {
      // when
      const str = turtle`<http://example.com/> <http://example.com/le-foo> ${true} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> true .')
    })

    it('serializes false boolean as xsd:boolean', async () => {
      // when
      const str = turtle`<http://example.com/> <http://example.com/le-foo> ${false} .`.toString()

      // then
      expect(str).toEqual('<http://example.com/> <http://example.com/le-foo> false .')
    })

    it('escapes line breaks and quote chars from literal', () => {
      // when
      const value = literal(`This is
a multiline string
with "quotations"`, xsd.anyType)
      const str = turtle`${value}`.toString()

      // then
      expect(str).toEqual(`@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

"This is\\na multiline string\\nwith \\"quotations\\""^^xsd:anyType`)
    })
  })

  describe('quad interpolation', () => {
    it('serializes a single quad', async () => {
      // given
      const q = quad(
        namedNode('http://example.com/person/John'),
        foaf.lastName,
        literal('Doe'),
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
      expect(str).toMatch('<http://example.com/S>\n   <http://example.com/P> <http://example.com/O> .')
      await expect(str).toBeValidTurtle()
    })

    it('combines multiple predicates from same subsequent subject', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P1, ex.O1))
        .add(quad(ex.S, ex.P2, ex.O2))
        .add(quad(ex.S, ex.P3, ex.O3))

      // when
      const str = turtle`${dataset}`.toString()

      // then
      expect(str).toMatchSnapshot()
      await expect(str).toBeValidTurtle()
    })

    it('combines multiple objects for subsequent quads', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P, ex.O1))
        .add(quad(ex.S, ex.P, ex.O2))
        .add(quad(ex.S, ex.P, ex.O3))

      // when
      const str = turtle`${dataset}`.toString()

      // then
      expect(str).toMatchSnapshot()
      await expect(str).toBeValidTurtle()
    })

    it('correctly compresses output when prefixing names', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(schema.S, schema.P, schema.O1))
        .add(quad(schema.S, schema.P, schema.O2))
        .add(quad(schema.S, schema.P, schema.O3))
        .add(quad(schema.S1, schema.P1, schema.O))
        .add(quad(schema.S1, schema.P2, schema.O))

      // when
      const str = turtle`${dataset}`.toString()

      // then
      expect(str).toMatchSnapshot()
      await expect(str).toBeValidTurtle()
    })

    it('reorders quads to get the most efficient compression', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(schema.S1, schema.P, schema.O1))
        .add(quad(schema.S2, schema.P, schema.O2))
        .add(quad(schema.S, schema.P, schema.O3))
        .add(quad(schema.S1, schema.P1, schema.O))
        .add(quad(schema.S2, schema.P2, schema.O))
        .add(quad(schema.S2, schema.P, schema.O1))
        .add(quad(schema.S, schema.P, schema.O1))

      // when
      const str = turtle`${dataset}`.toString()

      // then
      expect(str).toMatchSnapshot()
      await expect(str).toBeValidTurtle()
    })

    it('does not combine multiple objects for non-linear quads when doing cheap compression', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P, ex.O1))
        .add(quad(ex.S, ex.P1, ex.O2))
        .add(quad(ex.S, ex.P, ex.O3))

      // when
      const str = turtle`${dataset}`.toString({
        cheapCompression: true,
      })

      // then
      expect(str).toMatchSnapshot()
      await expect(str).toBeValidTurtle()
    })

    it('does not combine multiple predicates for non-linear quads when doing cheap compression', async () => {
      // given
      const dataset = RDF.dataset()
        .add(quad(ex.S, ex.P, ex.O1))
        .add(quad(ex.S1, ex.P, ex.O2))
        .add(quad(ex.S, ex.P, ex.O3))

      // when
      const str = turtle`${dataset}`.toString({
        cheapCompression: true,
      })

      // then
      expect(str).toMatchSnapshot()
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

    it('reduces an array to it\'s values', () => {
      // given
      const array = [
        RDF.quad(ex.foo, rdf.type, ex.Bar),
        RDF.quad(ex.foo, rdf.type, ex.Baz),
      ]

      // when
      const str = turtle`${array}`.toString()

      // then
      expect(str).toMatchSnapshot()
    })
  })
})
