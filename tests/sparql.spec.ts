import { sparql } from '../src/index'
import { namedNode } from '@rdfjs/data-model'
import { prefixes } from '@zazuko/rdf-vocabularies'
import namespace from '@rdfjs/namespace'

const schema = namespace(prefixes.schema)
const foaf = namespace(prefixes.foaf)

describe('sparql', () => {
  it('serializes named node', () => {
    // given
    const type = namedNode('http://example.com/type')
    const expected = 'SELECT * WHERE { ?person a <http://example.com/type> }'

    // when
    const query = sparql`SELECT * WHERE { ?person a ${type} }`

    // then
    expect(query.toString()).toMatchQuery(expected)
  })

  it('serializes string literal', () => {
    // given
    const name = 'John Doe'
    const expected = 'SELECT * WHERE { ?person <http://schema.org/name> "John Doe" }'

    // when
    const query = sparql`SELECT * WHERE { ?person <http://schema.org/name> ${name} }`

    // then
    expect(query).toMatchQuery(expected)
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
})
