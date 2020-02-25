import { sparql } from '../src/index'
import { blankNode, literal, namedNode, variable } from '@rdfjs/data-model'
import { prefixes } from '@zazuko/rdf-vocabularies'
import namespace from '@rdfjs/namespace'
import { xsd } from '@tpluscode/rdf-ns-builders'

const schema = namespace(prefixes.schema)
const foaf = namespace(prefixes.foaf)

describe('sparql', () => {
  describe('interpolating named node', () => {
    it('serializes in angle brackets', () => {
      // given
      const type = namedNode('http://example.com/type')
      const expected = 'SELECT * WHERE { ?person a <http://example.com/type> }'

      // when
      const query = sparql`SELECT * WHERE { ?person a ${type} }`

      // then
      expect(query.toString()).toMatchQuery(expected)
    })

    it('writes URIs relative to base', () => {
      // given
      const dog = namedNode('http://example.org/dog')

      // when
      const query = sparql`PREFIX : <http://example.org/vocab#> 
SELECT * WHERE { ${dog} :eats ${dog} }`.toString({
  base: 'http://example.org/',
})

      // then
      expect(query.toString()).toMatchSnapshot()
    })

    it('extracts known prefixes', () => {
      // given
      const expected = `PREFIX schema: <http://schema.org/>
    SELECT * WHERE { ?person schema:name "Tomasz" }`

      // when
      const query = sparql`SELECT * WHERE { ?person ${schema.name} "Tomasz" }`

      // then
      expect(query).toMatchQuery(expected)
    })

    it('merges nested templates, hoisting prefixes', () => {
      // given
      const expected = `
    PREFIX schema: <http://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    
    SELECT * WHERE {
     ?person schema:name "Tomasz" .
     ?person foaf:knows ?friend .
    }`

      // when
      const namePattern = sparql`?person ${schema.name} "Tomasz" .`
      const knowsPattern = sparql`?person ${foaf.knows} ?friend .`
      const query = sparql`SELECT * WHERE { ${namePattern} ${knowsPattern} }`

      // then
      expect(query).toMatchQuery(expected)
    })

    it('respects base in sub-templates', () => {
      // given
      const dog = namedNode('http://example.org/dog')

      // when
      const where = sparql`${dog} <eats> ${dog}`
      const query = sparql`SELECT * WHERE { ${where} }`.toString({
        base: 'http://example.org/',
      })

      // then
      expect(query.toString()).toMatchSnapshot()
    })
  })

  describe('interpolating variable', () => {
    it('serializes with question mark', () => {
      // given
      const expected = 'SELECT * WHERE { ?s ?p ?o }'
      const s = variable('s')
      const p = variable('p')
      const o = variable('o')

      // when
      const query = sparql`SELECT * WHERE { ${s} ${p} ${o} }`

      // then
      expect(query.toString()).toMatchQuery(expected)
    })
  })

  describe('interpolating literal', () => {
    it('serializes in quotes', () => {
      // given
      const name = literal('John Doe')
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe" }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).toMatchQuery(expected)
    })

    it('writes datatype', () => {
      // given
      const name = literal('John Doe', namedNode('http://example.com/D'))
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe"^^<http://example.com/D> }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).toMatchQuery(expected)
    })

    it('shortens datatype as prefixed name', () => {
      // given
      const name = literal('John Doe', xsd.normalizedString)
      const expected = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT * WHERE { ?person <http://schema.org/name> "John Doe"^^xsd:normalizedString }`

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).toMatchQuery(expected)
    })

    it('writes datatype with language tag', () => {
      // given
      const name = literal('John Doe', 'en')
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe"@en }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).toMatchQuery(expected)
    })
  })

  describe('interpolating blank nodes', () => {
    it('writes correct value', () => {
      // given
      const whom = blankNode('anyone')
      const expected = 'SELECT * WHERE { ?person <http://xmlns.com/foaf/0.1/knows> _:anyone }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://xmlns.com/foaf/0.1/knows> ${whom} }`

      // then
      expect(query).toMatchQuery(expected)
    })
  })

  describe('interpolating JS types', () => {
    it('leaves strings intact', () => {
      // when
      const foo = 'foo'
      const str = sparql`<http://example.com/${foo}>`.toString()

      // then
      expect(str).toEqual('<http://example.com/foo>')
    })
  })

  it('ignores null', () => {
    // given
    const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" }'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" ${null} }`

    // then
    expect(query).toMatchQuery(expected)
  })

  it('ignores undefined', () => {
    // given
    const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" }'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" ${undefined} }`

    // then
    expect(query).toMatchQuery(expected)
  })
})
