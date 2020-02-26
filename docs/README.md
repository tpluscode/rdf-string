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

It may be most powerful for building SPARQL queries from without

<run-kit>

```js
const RDF = require('@rdfjs/data-model')
const { sparql } = require('@tpluscode/rdf-string')

const Person = RDF.namedNode('http://schema.org/Person')

sparql`SELECT * WHERE {
  ?s a ${Person}
}`.toString()
```

</run-kit>

On the other hand, in the case of RDF serializations it might be used as a makeshift, string-based, synchronous serializer...

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { turtle } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://dbpedia.org/resource/RDF')
  .then(response => response.dataset())
  
turtle`${dataset}`.toString()
```

</run-kit>

## Features

1. Easily composable from smaller pieces
2. Serializes term values according to format's syntactic rules
3. Abbreviates URIs to prefixed names using vocabularies from [@zazuko/rdf-vocabularies](https://npm.im/@zazuko/rdf-vocabularies)
4. Applies base URI
5. (coming soon) Compresses turtle

## What it does not do

1. Check syntax

## Supported formats

* [n-quads](https://www.w3.org/TR/n-quads/)
* [turtle](https://www.w3.org/TR/turtle/)/[N3](https://www.w3.org/TeamSubmission/n3/)
* SPARQL 1.1 [Query](https://www.w3.org/TR/sparql11-query) and [Update](https://www.w3.org/TR/sparql11-update/)

More to come

[template-literals]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
