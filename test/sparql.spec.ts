import $rdf from '@zazuko/env'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai'
import { prefixes, sparql } from '../src/index.js'
import './matchers.js'

const ex = $rdf.namespace('http://example.com/')
const schema = $rdf.namespace(prefixes.schema)
const foaf = $rdf.namespace(prefixes.foaf)
prefixes.sparql = 'http://sparql.com/'

describe('sparql', () => {
  describe('interpolating quads', () => {
    it('writes each in separate line', () => {
      // given
      const expected = 'SELECT * WHERE { ?s ?p ?o . ?a ?b ?c }'
      const patterns = [
        $rdf.quad($rdf.variable('s'), $rdf.variable('p'), $rdf.variable('o')),
        $rdf.quad($rdf.variable('a'), $rdf.variable('b'), $rdf.variable('c')),
      ]

      // when
      const query = sparql`SELECT * WHERE { ${patterns} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })

    it('wraps them in graph pattern', () => {
      // given
      const expected = `SELECT * WHERE {
          GRAPH <urn:foo:bar> { ?s ?p ?o } 
          GRAPH ?bar { ?a ?b ?c } 
          GRAPH ?bar { ?s ?p ?o } 
          GRAPH <urn:foo:bar> { ?a ?b ?c } 
       }`
      const patterns = [
        $rdf.quad($rdf.variable('s'), $rdf.variable('p'), $rdf.variable('o'), $rdf.namedNode('urn:foo:bar')),
        $rdf.quad($rdf.variable('a'), $rdf.variable('b'), $rdf.variable('c'), $rdf.variable('bar')),
        $rdf.quad($rdf.variable('s'), $rdf.variable('p'), $rdf.variable('o'), $rdf.variable('bar')),
        $rdf.quad($rdf.variable('a'), $rdf.variable('b'), $rdf.variable('c'), $rdf.namedNode('urn:foo:bar')),
      ]

      // when
      const query = sparql`SELECT * WHERE { ${patterns} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })
  })

  describe('interpolating dataset', () => {
    it('groups by common named graph in graph pattern', () => {
      // given
      const expected = `SELECT * WHERE {
          GRAPH <urn:foo:bar> { ?s ?p ?o . ?a ?b ?c } 
          GRAPH ?bar { ?s ?p ?o . ?a ?b ?c } 
       }`
      const patterns = $rdf.dataset([
        $rdf.quad($rdf.variable('s'), $rdf.variable('p'), $rdf.variable('o'), $rdf.namedNode('urn:foo:bar')),
        $rdf.quad($rdf.variable('a'), $rdf.variable('b'), $rdf.variable('c'), $rdf.variable('bar')),
        $rdf.quad($rdf.variable('s'), $rdf.variable('p'), $rdf.variable('o'), $rdf.variable('bar')),
        $rdf.quad($rdf.variable('a'), $rdf.variable('b'), $rdf.variable('c'), $rdf.namedNode('urn:foo:bar')),
      ])

      // when
      const query = sparql`SELECT * WHERE { ${patterns} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })

    it('does not wrap default graph in pattern', () => {
      // given
      const expected = `SELECT * WHERE {
          ?foo ?bar ?baz .
       }`
      const patterns = $rdf.dataset([
        $rdf.quad($rdf.variable('foo'), $rdf.variable('bar'), $rdf.variable('baz')),
      ])

      // when
      const query = sparql`SELECT * WHERE { ${patterns} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })
  })

  describe('interpolating named node', () => {
    it('serializes in angle brackets', () => {
      // given
      const type = $rdf.namedNode('http://example.com/type')
      const expected = 'SELECT * WHERE { ?person a <http://example.com/type> }'

      // when
      const query = sparql`SELECT * WHERE { ?person a ${type} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })

    it('writes URIs relative to base', function () {
      // given
      const dog = $rdf.namedNode('http://example.org/dog')

      // when
      const query = sparql`PREFIX : <http://example.org/vocab#> 
SELECT * WHERE { ${dog} :eats ${dog} }`.toString({
  base: 'http://example.org/',
})

      // then
      expect(query.toString()).to.matchSnapshot(this)
    })

    it('extracts known prefixes', () => {
      // given
      const expected = `PREFIX schema: <http://schema.org/>
    SELECT * WHERE { ?person schema:name "Tomasz" }`

      // when
      const query = sparql`SELECT * WHERE { ?person ${schema.name} "Tomasz" }`

      // then
      expect(query).to.be.query(expected)
    })

    it('extracts custom prefixes', () => {
      // given
      const ex = $rdf.namespace('http://example.org/')
      const exCom = 'http://example.com/'
      const expected = `PREFIX ex: <http://example.org/>
    PREFIX exCom: <http://example.com/>
    SELECT * WHERE { ?person ex:spouse exCom:Jane }`

      // when
      const jane = $rdf.namedNode('http://example.com/Jane')
      const query = sparql`SELECT * WHERE { ?person ${ex.spouse} ${jane} }`.toString({
        prefixes: { ex, exCom },
      })

      // then
      expect(query).to.be.query(expected)
    })

    it('extracts custom prefixes added globally', () => {
      // given
      const expected = `PREFIX sparql: <http://sparql.com/>

    SELECT * WHERE { ?person a sparql:Foo }`

      // when
      const Foo = $rdf.namedNode('http://sparql.com/Foo')
      const query = sparql`SELECT * WHERE { ?person a ${Foo} }`

      // then
      expect(query).to.be.query(expected)
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
      expect(query).to.be.query(expected)
    })

    it('respects base in sub-templates', function () {
      // given
      const dog = $rdf.namedNode('http://example.org/dog')

      // when
      const where = sparql`${dog} <eats> ${dog}`
      const query = sparql`SELECT * WHERE { ${where} }`.toString({
        base: 'http://example.org/',
      })

      // then
      expect(query.toString()).to.matchSnapshot(this)
    })

    it('escapes slashes and hash in prefixed names', function () {
      // given
      const dog = $rdf.namedNode('http://example.org/foo/bar#baz')

      // when
      const where = sparql`${dog} <eats> ${dog}`
      const query = sparql`SELECT * WHERE { ${where} }`.toString({
        prefixes: { 'ex:': 'http://example.org/' },
      })

      // then
      expect(query.toString()).to.matchSnapshot(this)
    })
  })

  describe('interpolating variable', () => {
    it('serializes with question mark', () => {
      // given
      const expected = 'SELECT * WHERE { ?s ?p ?o }'
      const s = $rdf.variable('s')
      const p = $rdf.variable('p')
      const o = $rdf.variable('o')

      // when
      const query = sparql`SELECT * WHERE { ${s} ${p} ${o} }`

      // then
      expect(query.toString()).to.be.query(expected)
    })
  })

  describe('interpolating literal', () => {
    it('serializes in quotes', () => {
      // given
      const name = $rdf.literal('John Doe')
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe" }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).to.be.query(expected)
    })

    it('writes datatype', () => {
      // given
      const name = $rdf.literal('John Doe', $rdf.namedNode('http://example.com/D'))
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe"^^<http://example.com/D> }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).to.be.query(expected)
    })

    it('shortens datatype as prefixed name', () => {
      // given
      const name = $rdf.literal('John Doe', xsd.normalizedString)
      const expected = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      
      SELECT * WHERE { ?person <http://schema.org/name> "John Doe"^^xsd:normalizedString }`

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).to.be.query(expected)
    })

    it('writes datatype with language tag', () => {
      // given
      const name = $rdf.literal('John Doe', 'en')
      const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe"@en }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

      // then
      expect(query).to.be.query(expected)
    })
  })

  describe('interpolating blank nodes', () => {
    it('writes correct value', () => {
      // given
      const whom = $rdf.blankNode('anyone')
      const expected = 'SELECT * WHERE { ?person <http://xmlns.com/foaf/0.1/knows> _:anyone }'

      // when
      const query = sparql`SELECT * WHERE { ?person <http://xmlns.com/foaf/0.1/knows> ${whom} }`

      // then
      expect(query).to.be.query(expected)
    })
  })

  describe('interpolating JS types', () => {
    it('leaves strings intact', () => {
      // when
      const foo = 'foo'
      const str = sparql`<http://example.com/${foo}>`.toString()

      // then
      expect(str).to.eq('<http://example.com/foo>')
    })

    it('iterates a set', () => {
      // when
      const terms = $rdf.termSet([schema.Person, schema.Agent])
      const str = sparql`DESCRIBE ${terms}`.toString({
        prologue: false,
      })

      // then
      expect(str).to.eq('DESCRIBE schema:Person\nschema:Agent')
    })
  })

  describe('interpolating SPARQL Template', () => {
    it('combines it with the parent', () => {
      // given
      const subquery = sparql`?s a ${schema.Person}`

      // when
      const query = sparql`SELECT * WHERE { ${subquery} }`.toString()

      // then
      expect(query).to.eq(`PREFIX schema: <http://schema.org/>

SELECT * WHERE { ?s a schema:Person }`)
    })
  })

  describe('without prefixes', () => {
    it('produces long URIs', () => {
      // given
      const subquery = sparql`${ex.foo} ?p ${schema.bar}`

      // when
      const query = sparql`SELECT * WHERE { ${subquery} }`.toString({
        prefixes: { ex },
        noPrefixedNames: true,
      })

      // then
      expect(query).to.eq('SELECT * WHERE { <http://example.com/foo> ?p <http://schema.org/bar> }')
    })
  })

  it('ignores null', () => {
    // given
    const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" }'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" ${null} }`

    // then
    expect(query).to.be.query(expected)
  })

  it('ignores undefined', () => {
    // given
    const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" }'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> "Tomasz" ${undefined} }`

    // then
    expect(query).to.be.query(expected)
  })
})
