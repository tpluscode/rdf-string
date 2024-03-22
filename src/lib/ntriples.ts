import { BlankNode, DatasetCore, DefaultGraph, Literal, NamedNode, Quad, Term } from '@rdfjs/types'
import type { Environment } from '@rdfjs/environment/Environment'
import type DataFactory from '@rdfjs/data-model/Factory.js'
import type { TermMapFactory } from '@rdfjs/term-map/Factory'
import { NQuadsStrategy } from './nquads.js'
import { Value } from './value.js'
import { PartialString, TemplateResult } from './TemplateResult.js'

export interface NTriplesOptions {
  env: Environment<DataFactory | TermMapFactory>
  graph: NamedNode | DefaultGraph
  sortGraphs: false
}

export type NTriplesTemplateResult = TemplateResult<NTriplesOptions>
export type NTriplesValue<T extends Term = Term> = Value<NTriplesTemplateResult, T>

export class NTriplesStrategy extends NQuadsStrategy<NTriplesOptions> {
  public evaluateDataset(dataset: DatasetCore, options: NTriplesOptions): PartialString {
    const singleGraph = dataset.match(null, null, null, options.graph)
    return super.evaluateDataset(singleGraph, options)
  }

  public evaluateQuad(quad: Quad, options: NTriplesOptions): PartialString {
    if (!options.graph.equals(quad.graph)) {
      return {
        value: '',
        prefixes: [],
      }
    }

    return super.evaluateQuad(options.env.quad(quad.subject, quad.predicate, quad.object), options)
  }
}

export const ntriples = (strings: TemplateStringsArray, ...values: Value<NTriplesTemplateResult, NamedNode | Literal | BlankNode>[]) =>
  new TemplateResult<NTriplesOptions>({
    strings,
    values,
    tag: ntriples,
    strategy: new NTriplesStrategy(),
    defaultOptions: (RDF) => ({
      graph: RDF.defaultGraph(),
      sortGraphs: false,
    }),
  })
