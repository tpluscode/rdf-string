# SPARQL

References:

* https://www.w3.org/TR/sparql11-query
* https://www.w3.org/TR/sparql11-update

SPARQL has much of the actual triple syntax similar to Turtle in terms of serializing nodes, triples. It differs in it's ability to represent graph patterns and of course adds a lot of query-specific keyword which this library ignores.

Check [@tpluscode/sparql-builder](https://t-code.pl/sparql-builder] which uses rdf-string and provides a higher level API with a more SPARQL-like feel embedded in JavaScript.

## Basic usage

Unlike Turtle, the SPARQL syntax can also interpolate variables to produce triple patterns

<run-kit>

```js
const { sparql } = require('@tpluscode/rdf-string')
const { schema } = require('@tpluscode/rdf-ns-builders')
const { variable } = require('@rdfjs/data-model')

const person = variable('person') 

sparql`SELECT * WHERE {
  ${person} a ${schema.Person}
}`.toString()
```

</run-kit>

## Using quads as patterns

A quad with variables can also be used and reused in a SPARQL string

<run-kit>

```js
const { sparql } = require('@tpluscode/rdf-string')
const { schema } = require('@tpluscode/rdf-ns-builders')
const { quad, variable } = require('@rdfjs/data-model')

const personPattern = quad(variable('person'), rdf.type, schema.Person) 

sparql`DESCRIBE
{
  ${personPattern}
} 
WHERE
{
  ${personPattern}
}`.toString()
```

</run-kit>

In the same fashion a dataset can be used. The difference is that graph names will be respected to produce `GRAPH` patterns

<run-kit>

```js
const { sparql } = require('@tpluscode/rdf-string')
const { schema } = require('@tpluscode/rdf-ns-builders')
const { dataset, quad, variable } = require('@rdfjs/dataset')

const person = variable('person')
const personPatterns = dataset([
    quad(person, rdf.type, schema.Person, variable('g')),
])

sparql`SELECT ${person}
WHERE
{
  ${personPatterns}
}`.toString()
```

</run-kit>
