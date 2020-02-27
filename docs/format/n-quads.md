# N-Quads

Reference: https://www.w3.org/TR/n-quads/

N-Quads is a simple dataset serialization format. A superset of [n-triples](n-triples.md) which supports named graphs.

## Basic usage

<run-kit>

```js
const fetch = require('@rdfjs/fetch')
const { nquads } = require('@tpluscode/rdf-string')

const dataset = await fetch('http://zazuko.github.io/tbbt-ld/dist/tbbt.nq')
  .then(response => response.dataset())
  
nquads`${dataset}`.toString()
```

</run-kit>
