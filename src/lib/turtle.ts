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

    return graphQuads.reduce<PartialString>((result, quad) => {
      const quadResult = this.evaluateQuad(quad, options)

      return {
        value: result.value + '\n' + quadResult.value,
        prefixes: [...result.prefixes, ...quadResult.prefixes],
      }
    }, { value: '', prefixes: [] })
  }

  public evaluateQuad(quad: Quad, options: TurtleOptions): PartialString {
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
      value: `${subject.value} ${predicate.value} ${object.value} .`,
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
