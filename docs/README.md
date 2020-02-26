> # @tpluscode/rdf-string ![Test](https://github.com/tpluscode/rdf-string/workflows/Test/badge.svg) [![codecov](https://codecov.io/gh/tpluscode/rdf-string/branch/master/graph/badge.svg)](https://codecov.io/gh/tpluscode/rdf-string) [![npm version](https://badge.fury.io/js/%40tpluscode%2Frdf-string.svg)](https://badge.fury.io/js/%40tpluscode%2Frdf-string)

Simplifies the construction of RDF strings (turtle, n-triples, SPARQL, etc.)
by taking care of correctly serializing values to their string representation
and automatically prefixing URIs.

## About

The heart of the library are [EcmaScript template string tag functions][template-literals].
All values interpolated values are serialized according to the syntactic rules of the given RDF format.

## Quick start

1. Import the desired format function
2. Use it with template string to interpolate RDF/JS terms

<run-kit>

```js
const RDF = require('@rdfjs/data-model')
const convert = require('@tpluscode/rdf-string')

const node = RDF.namedNode('http://example.com/node')

const results = {
  nQuads: convert.nquads`${node}`.toString(),  
  turtle: convert.turtle`${node}`.toString(),
  sparql: convert.sparql`${node}`.toString(),
}
```

</run-kit>

## Supported formats

* [n-quads](https://www.w3.org/TR/n-quads/)
* [turtle](https://www.w3.org/TR/turtle/)/[N3](https://www.w3.org/TeamSubmission/n3/)
* SPARQL 1.1 [Query](https://www.w3.org/TR/sparql11-query) and [Update](https://www.w3.org/TR/sparql11-update/)

More to come

[template-literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
