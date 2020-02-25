> # @tpluscode/rdf-string ![Test](https://github.com/tpluscode/rdf-string/workflows/Test/badge.svg) [![codecov](https://codecov.io/gh/tpluscode/rdf-string/branch/master/graph/badge.svg)](https://codecov.io/gh/tpluscode/rdf-string) [![npm version](https://badge.fury.io/js/%40tpluscode%2Frdf-string.svg)](https://badge.fury.io/js/%40tpluscode%2Frdf-string)

Simplifies the construction of RDF strings (turtle, n-triples, SPARQL, etc.)
by taking care of correctly serializing values to their string representation
and automatically prefixing URIs.

## Usage

The heart of the library are [EcmaScript template string tag functions][template-literals].
All values interpolated values are serialized according to the syntactic rules of
the given RDF format.

Formats which support prefixes will automatically abbreviate the URIs and
return the prefix declarations according to the specific syntax.

### SPARQL

```js
import * as RDF from '@rdfjs/data-model' 
import { prefixes } from '@zazuko/rdf-vocabularies'
import namespace from '@rdfjs/namespace'

import { sparql } from '@zazuko/rdf-string'

const person = RDF.variable('person')
const PersonType = RDF.namedNode('http://example.com/Person')
const schema = namespace(prefixes.schema)
const name = "John"

const query = sparql`SELECT * WHERE {
  ${person} a ${PersonType} .
  ${person} ${schema.name} ${name} .
}`

query.toString()
```

The last line will return a complete query.

```sparql
PREFIX schema: <http://schema.org/>

SELECT * WHERE {
  ?person a <http://example.com/Person> .
  ?person schema:name "John" .
}
```

### turtle

TBD

### n-triples

TBD

[template-literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
