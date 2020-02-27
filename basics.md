# The basics

All of the supported format are used in a similar manner, by importing on of the [tag functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) from the package. For example to create a quad in [Turtle](formats/turtle.md):

<run-kit>

```js
const { turtle } = require('@tpluscode/rdf-string')

turtle`<http://example.com> a <http://schema.org/WebPage>`.toString()
```

</run-kit>

That of course is pretty boring, as the input is already a concrete string. The tag functions however take care of correctly formatting interpolated values in the resulting string according to the syntactic rules of the given format.

## Interpolating values

<run-kit>

```js
const { namedNode } = require('@rdfjs/data-model')
const { schema } = require('@tpluscode/rdf-ns-builders')
const { ntriples } = require('@tpluscode/rdf-string')

const example = namedNode('http://example.com')

ntriples`<http://example.com> a ${schema.WebPage}`.toString()
```

</run-kit>

?> Now go ahead and change `ntriples` to `turtle` like in the first snippet. See what happens?

## What can be interpolated?

Any value can be interpolated in a tagged string:

* [RDF/JS data model terms and quads](https://rdf.js.org/data-model-spec/)
* [RDF/JS Datasets](https://rdf.js.org/dataset-spec/)
* Built-in JS types, which are converted to appropriate RDF representations

Anything else will be simply be appended as `toString()`.

Here's an example which wraps multiple templates in a loop, creating some quads

<run-kit>

```js
const { quad, namedNode } = require('@rdfjs/data-model')
const { foaf } = require('@tpluscode/rdf-ns-builders')
const { turtle } = require('@tpluscode/rdf-string')

const peopleData = [
    {
      name: 'John', age: 34,
    },
    {
      name: 'Jane', age: 29,
    },
    {
      name: 'Susie', age: 8,
    }
]

const quads = peopleData.reduce((result, person) => {
  const personId = namedNode(`http://example.com${person.name}`)
  return turtle`${result}\n${personId} ${foaf.age} ${person.age} .`
}, turtle``)

quads.toString()
```

</run-kit>

## Tweaking the result

Each format's `toString` function has additional parameters which alter the end result. Consult individual pages on the left for more details.
