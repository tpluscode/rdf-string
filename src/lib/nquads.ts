import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term } from 'rdf-js'
import { Value } from './value'
import { PartialString, TemplateResult } from './TemplateResult'
import * as ntriples from './syntax/ntriples'

export type NQuadsValue<T extends Term = Term> = Value<NQuadsTemplateResult, T>

interface NQuadsOptions {
  sortGraphs: boolean
}

export class NQuadsTemplateResult extends TemplateResult<NQuadsTemplateResult, NQuadsValue, NQuadsOptions> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(strings: TemplateStringsArray, values: NQuadsValue[], turtle: (strings: TemplateStringsArray, ...values: NQuadsValue<any>[]) => NQuadsTemplateResult) {
    super(strings, values, turtle)
  }

  protected _evaluateDataset(dataset: DatasetCore, options: NQuadsOptions): PartialString {
    const [first, ...rest] = dataset

    return rest.reduce<PartialString>((result, quad) => {
      const nextQuad = this._evaluateQuad(quad, options)
      return {
        value: `${result.value}\n${nextQuad.value}`,
        prefixes: result.prefixes,
      }
    },
    this._evaluateQuad(first, options))
  }

  protected _evaluateQuad(quad: Quad, options: NQuadsOptions): PartialString {
    const subject = this._evaluateTerm(quad.subject, options)
    const predicate = this._evaluateTerm(quad.predicate, options)
    const object = this._evaluateTerm(quad.object, options)
    const graph = this._evaluateTerm(quad.graph, options)

    return {
      value: `${subject.value} ${predicate.value} ${object.value} ${graph.value} .`,
      prefixes: [],
    }
  }

  protected _evaluateLiteral(term: Literal): PartialString {
    return {
      value: ntriples.literal(term),
      prefixes: [],
    }
  }

  protected _evaluateNamedNode(term: NamedNode): PartialString {
    return {
      value: ntriples.namedNode(term),
      prefixes: [],
    }
  }

  protected _evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: ntriples.blankNode(term),
      prefixes: [],
    }
  }

  protected get __defaultOptions(): NQuadsOptions {
    return {
      sortGraphs: false,
    }
  }

  protected _getFinalString(result: string): string {
    return result
  }
}

export const nquads = (strings: TemplateStringsArray, ...values: NQuadsValue<NamedNode | Literal | BlankNode>[]) =>
  new NQuadsTemplateResult(strings, values, nquads)
