import { BlankNode, DataFactory, DatasetCore, Literal, NamedNode, Quad, Term } from '@rdfjs/types'
import type { Environment } from '@rdfjs/environment/Environment.js'
import type { TermMapFactory } from '@rdfjs/term-map/Factory.js'
import { Value } from './value.js'
import { PartialString, SerializationStrategy, TemplateResult } from './TemplateResult.js'
import * as ntriples from './syntax/ntriples.js'

export interface NQuadsOptions {
  env: Environment<DataFactory | TermMapFactory>
  sortGraphs: boolean
}

export type NQuadsTemplateResult = TemplateResult<NQuadsOptions>
export type NQuadsValue<T extends Term = Term> = Value<NQuadsTemplateResult, T>

export class NQuadsStrategy<TOptions extends NQuadsOptions = NQuadsOptions> extends SerializationStrategy<TOptions> {
  public evaluateDataset(dataset: DatasetCore, options: TOptions): PartialString {
    const [first, ...rest] = dataset

    let firstQuadString: PartialString = { value: '', prefixes: [] }
    if (first) {
      firstQuadString = this.evaluateQuad(first, options)
    }

    return rest.reduce((result, quad) => {
      const nextQuad = this.evaluateQuad(quad, options)
      return {
        value: `${result.value}\n${nextQuad.value}`,
        prefixes: result.prefixes,
      }
    }, firstQuadString)
  }

  public evaluateQuad(quad: Quad, options: TOptions): PartialString {
    const subject = this.evaluateTerm(quad.subject, options)
    const predicate = this.evaluateTerm(quad.predicate, options)
    const object = this.evaluateTerm(quad.object, options)
    const graph = this.evaluateTerm(quad.graph, options)

    return {
      value: `${subject.value} ${predicate.value} ${object.value} ${graph.value} .`,
      prefixes: [],
    }
  }

  public evaluateLiteral(term: Literal): PartialString {
    return {
      value: ntriples.literal(term),
      prefixes: [],
    }
  }

  public evaluateNamedNode(term: NamedNode): PartialString {
    return {
      value: ntriples.namedNode(term),
      prefixes: [],
    }
  }

  public evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: ntriples.blankNode(term),
      prefixes: [],
    }
  }

  evaluateVariable(): PartialString {
    throw new Error('N-Quads cannot serialize variables')
  }

  getFinalString(result: string): string {
    return result
  }
}

export const nquads = (strings: TemplateStringsArray, ...values: Value<TemplateResult<NQuadsOptions>, NamedNode | Literal | BlankNode>[]): NQuadsTemplateResult =>
  new TemplateResult<NQuadsOptions>({
    strings,
    values,
    tag: nquads,
    strategy: new NQuadsStrategy(),
    defaultOptions: () => ({
      sortGraphs: false,
    }),
  })
