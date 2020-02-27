# N-Triples

Reference: https://www.w3.org/TR/n-triples/

## Basic usage

N-Triples can only serialize a single RDF graph. Without additional paramters, that will be the [default graph](https://www.w3.org/TR/rdf11-concepts/#section-dataset).

The `tbbt.nq` resource only contains named graphs, hence an empty string is returned.

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { ntriples } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nq')
  .then(response => response.dataset())
  
ntriples`${dataset}`.toString()
```

</run-kit>

## Serializing select named graph

By passing an optional parameter, a named graph can be serialized instead.

It's important to remember though that the graph URI will be removed from the result.

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { ntriples } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nq')
  .then(response => response.dataset())
  
ntriples`${dataset}`.toString({
  graph: namedNode('http://localhost:8080/data/person/amy-farrah-fowler>'),
})
```

</run-kit>
