import { BlankNode, DatasetCore, DefaultGraph, Literal, NamedNode, Quad, Term } from 'rdf-js'
import { defaultGraph } from '@rdfjs/data-model'
import { prefixes as knownPrefixes } from '@zazuko/rdf-vocabularies'
import { Value } from './value'
import { PartialString, SerializationStrategy, TemplateResult } from './TemplateResult'
import * as syntax from './syntax/turtle'

export type TurtleValue<T extends Term = Term> = Value<TurtleTemplateResult, T>

interface TurtleOptions {
  directives: boolean
  graph: NamedNode | DefaultGraph
}

function prefixDeclarations(prefixes: Iterable<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `@prefix ${prefix}: <${knownPrefixes[prefix]}> .`)
}

export type TurtleTemplateResult = TemplateResult<TurtleOptions>

interface DatasetEvaluationContext {
  previous?: Quad
}

export class TurtleStrategy extends SerializationStrategy<TurtleOptions> {
  public evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: syntax.blankNode(term),
      prefixes: [],
    }
  }

  public evaluateLiteral(term: Literal): PartialString {
    return syntax.literal(term)
  }

  public evaluateNamedNode(term: NamedNode): PartialString {
    return syntax.namedNode(term)
  }

  public evaluateVariable(): PartialString {
    throw new Error('Turtle cannot serialize variables')
  }

  public evaluateDataset(dataset: DatasetCore, options: TurtleOptions): PartialString {
    const graphQuads = [...dataset.match(null, null, null, options.graph)]

    if (graphQuads.length === 0) {
      return {
        value: '',
        prefixes: [],
      }
    }

    const result = graphQuads.reduce<PartialString & DatasetEvaluationContext>((context, quad) => {
      if (!context.previous) {
        return {
          ...this.evaluateQuad(quad, options, false),
          previous: quad,
        }
      }

      if (context.previous.subject.equals(quad.subject) && context.previous.predicate.equals(quad.predicate)) {
        return {
          ...this.__appendObject(context, quad, options),
          previous: quad,
        }
      }

      if (context.previous.subject.equals(quad.subject)) {
        return {
          ...this.__appendPredicateObject(context, quad, options),
          previous: quad,
        }
      }

      const quadResult = this.evaluateQuad(quad, options, false)

      return {
        value: context.value + ' .\n' + quadResult.value,
        prefixes: [...context.prefixes, ...quadResult.prefixes],
        previous: quad,
      }
    }, { value: '', prefixes: [] })

    return {
      ...result,
      value: result.value + ' .',
    }
  }

  public evaluateQuad(quad: Quad, options: TurtleOptions, terminate = true): PartialString {
    if (!options.graph.equals(quad.graph)) {
      return {
        value: '',
        prefixes: [],
      }
    }

    const subject = this.evaluateTerm(quad.subject, options)
    const predicate = this.evaluateTerm(quad.predicate, options)
    const object = this.evaluateTerm(quad.object, options)

    return {
      value: `${subject.value} ${predicate.value} ${object.value}${terminate ? ' .' : ''}`,
      prefixes: [
        ...subject.prefixes,
        ...predicate.prefixes,
        ...object.prefixes,
      ],
    }
  }

  public getFinalString(result: string, prefixes: Iterable<string>, options: TurtleOptions): string {
    const prologue = options.directives || typeof options.directives === 'undefined'

    let prologueLines: string[] = []
    if (prologue) {
      prologueLines = prefixDeclarations(prefixes)
      if (prologueLines.length > 0) {
        prologueLines.push('\n')
      }
    }

    return `${prologueLines.join('\n')}${result}`
  }

  private __appendPredicateObject(context: PartialString, quad: Quad, options: TurtleOptions): PartialString {
    const currentPredicateResult = this.evaluateTerm(quad.predicate, options)
    const currentObjectResult = this.evaluateTerm(quad.object, options)

    return {
      value: `${context.value} ;\n   ${currentPredicateResult.value} ${currentObjectResult.value}`,
      prefixes: [...context.prefixes, ...currentPredicateResult.prefixes, ...currentObjectResult.prefixes],
    }
  }

  private __appendObject(context: PartialString, quad: Quad, options: TurtleOptions): PartialString {
    const currentObjectResult = this.evaluateTerm(quad.object, options)
    return {
      value: `${context.value} ,\n      ${currentObjectResult.value}`,
      prefixes: [...context.prefixes, ...currentObjectResult.prefixes],
    }
  }
}

export const turtle = (strings: TemplateStringsArray, ...values: Value<TemplateResult<TurtleOptions>, NamedNode | Literal | BlankNode>[]) =>
  new TemplateResult<TurtleOptions>({
    strings,
    values,
    tag: turtle,
    strategy: new TurtleStrategy(),
    defaultOptions: {
      directives: true,
      graph: defaultGraph(),
    },
  })
