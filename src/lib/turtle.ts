import { BlankNode, DatasetCore, DefaultGraph, Literal, NamedNode, Quad, Term } from 'rdf-js'
import { defaultGraph } from '@rdfjs/data-model'
import { prefixes as knownPrefixes } from '@zazuko/rdf-vocabularies'
import { Value } from './value'
import { PartialString, TemplateResult } from './TemplateResult'
import * as syntax from './syntax/turtle'

export type TurtleValue<T extends Term = Term> = Value<TurtleTemplateResult, T>

interface TurtleOptions {
  directives?: boolean
  graph: NamedNode | DefaultGraph
}

function prefixDeclarations(prefixes: Iterable<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `@prefix ${prefix}: <${knownPrefixes[prefix]}> .`)
}

export class TurtleTemplateResult extends TemplateResult<TurtleTemplateResult, TurtleValue, TurtleOptions> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(strings: TemplateStringsArray, values: TurtleValue[], turtle: (strings: TemplateStringsArray, ...values: TurtleValue<any>[]) => TurtleTemplateResult) {
    super(strings, values, turtle)
  }

  protected get __defaultOptions(): TurtleOptions {
    return {
      directives: true,
      graph: defaultGraph(),
    }
  }

  protected _evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: syntax.blankNode(term),
      prefixes: [],
    }
  }

  protected _evaluateLiteral(term: Literal): PartialString {
    return syntax.literal(term)
  }

  protected _evaluateNamedNode(term: NamedNode): PartialString {
    return syntax.namedNode(term)
  }

  protected _evaluateDataset(dataset: DatasetCore, options: TurtleOptions): PartialString {
    const graphQuads = [...dataset.match(null, null, null, options.graph)]

    return graphQuads.reduce<PartialString>((result, quad) => {
      const quadResult = this._evaluateQuad(quad, options)

      return {
        value: result.value + '\n' + quadResult.value,
        prefixes: [...result.prefixes, ...quadResult.prefixes],
      }
    }, { value: '', prefixes: [] })
  }

  protected _evaluateQuad(quad: Quad, options: TurtleOptions): PartialString {
    if (!options.graph.equals(quad.graph)) {
      return {
        value: '',
        prefixes: [],
      }
    }

    const subject = this._evaluateTerm(quad.subject, options)
    const predicate = this._evaluateTerm(quad.predicate, options)
    const object = this._evaluateTerm(quad.object, options)

    return {
      value: `${subject.value} ${predicate.value} ${object.value} .`,
      prefixes: [
        ...subject.prefixes,
        ...predicate.prefixes,
        ...object.prefixes,
      ],
    }
  }

  protected _getFinalString(result: string, prefixes: Iterable<string>, options: TurtleOptions): string {
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

export const turtle = (strings: TemplateStringsArray, ...values: TurtleValue<NamedNode | Literal | BlankNode>[]) =>
  new TurtleTemplateResult(strings, values, turtle)
