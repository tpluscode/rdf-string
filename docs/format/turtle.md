# Turtle/Notation3

Reference: https://www.w3.org/TR/turtle/

Similarly to [N-Triples](n-triples.md), Turtle can only represent a single RDF graph.

## Basic usage

Turtle has syntactic features which shorten the resulting string. The library will make attempts to use them.

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { turtle } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())
  
turtle`${dataset}`.toString()
```

</run-kit>

## Base URI

?> From version 0.1.1

By setting the `base` parameter on the `toString` call it is possible to set a base URI which will be used to compute relative URIs for matching identifiers (named nodes and literal datatypes alike).

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { turtle } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())
  
turtle`${dataset}`.toString({
  base: 'http://localhost:8080/data/',
})
```

</run-kit>

## Cheap compression

For large datasets it may be detrimental to perform an accurate compression of the output string because quads have to be reordered in memory to correctly merge predicates of common subjects and objects of common predicates.

An optional flag can be set on the `toString` call to process quads in whatever order the appear the source dataset.

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { turtle } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nt')
  .then(response => response.dataset())
  
turtle`${dataset}`.toString({
  cheapCompression: true,
})
```

</run-kit>

## Serialize named graph

The default behavior of Turtle is to serialize default graph. Passing a named node to the `toString` method will change the graph being serialized.

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { turtle } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nq')
  .then(response => response.dataset({
    
  }))
  
turtle`${dataset}`.toString({
  graph: namedNode('http://localhost:8080/data/person/amy-farrah-fowler>')
})
```

</run-kit>
