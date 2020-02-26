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

## Serialize named graph

The default behavior of Turtle is to serialize default graph
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
