# Advanced topics

## Custom prefixes

By default, named nodes will be replaced with prefixed URIs using a list of namespaces published in the package
[@zazuko/rdf-vocabularies](https://github.com/zazuko/rdf-vocabularies)

To add or replace certain prefixes in a string template, pass them the `toString` call. Values can be strings or
instances of `NamespaceBuilder`.

> ![TIP]
> This is supported by Turtle and SPARQL builders

<run-kit>

```js
const namespace = require('@rdf-esm/namespace')
const { turtle } = require('@tpluscode/rdf-string')

const ex = namespace('https://example.com/')

turtle`${ex.foo} a ${ex.Foo}`.toString({
  prefixes: { ex }
})
```

</run-kit>

It is also possible to add namespaces globally to be applied to all templates:

<run-kit>

```js
const { prefixes, turtle } = require('@tpluscode/rdf-string')

prefixes.ex = 'https://example.com/'

turtle`${ex.foo} a ${ex.Foo}`.toString()
```

</run-kit>

## Creating custom objects to interpolate

While the `TemplateResult`, the type which all the tag functions return can interpret built-in JavaScript types and itself through nesting, it will fail to (meaningfully) serialize just any random object.

To that end, it is possible to create a custom interpolatable object by simply implementing a single-method interface which would like this

```typescript
interface Interpolatable<TOptions> {
    _toPartialString(options: TOptions): {
      value: string
      prefixes: Iterable<string>
    }   
}
```

It does not simply return a string value, because when injected inside a larger template, prefixed URIs may produce new prefixes which need to be hoisted to the outer template.

Here's an example which hopefully makes it clear. The `valuesClauseBuilder` decorates, or wraps a SPARQL template string and forwards the `_toPartialString` call to it.

Without this, the native `toString` would fire and a `[Object object]` would be inserted into the query.

<run-kit>

```js
const { variable } = require('@rdfjs/data-model')
const { sparql } = require('@tpluscode/rdf-string')
const { foaf, schema } = require('@tpluscode/rdf-ns-builders')

const valuesClauseBuilder = (...vars) => ({
  variables: vars.reduce((t, name) => sparql`${t} ${variable(name)}`, sparql``),
  values: sparql`\n   `,
  add(...values) {
    this.values = values.reduce((t, value) => sparql`${t}${value}\n   `, this.values)
  },
  _toPartialString(options) {
    return sparql`VALUES (${this.variables} )
{
      ${this.values}
}`._toPartialString(options)
  }
})

const valuesClause = valuesClauseBuilder('type')

valuesClause.add(schema.Person)
// valuesClause.add(foaf.Agent)

sparql`
    SELECT ?s
    WHERE {
        ${valuesClause}
        
        ?s a ?type
    }
`.toString()
```

</run-kit>

?> Now go ahead and uncomment line `22` and see how the `foaf` prefix appears at the top of the result.
