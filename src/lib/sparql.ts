import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term, Variable } from 'rdf-js'
import knownPrefixes from '@zazuko/prefixes'
import RDF from '@rdfjs/data-model'
import TermMap from '@rdfjs/term-map'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import { Value } from './value.js'
import { PartialString, SerializationStrategy, TemplateResult } from './TemplateResult.js'
import * as turtleSyntax from './syntax/turtle.js'
import { getNamespaces, mapBuilders } from './prefixes.js'

export interface SparqlOptions {
  base?: string
  prologue: boolean
  prefixes?: Record<string, string | NamespaceBuilder>
  noPrefixedNames?: boolean
}

function prefixDeclarations(prefixes: Iterable<string>, prefixMap: Record<string, string>): string[] {
  return getNamespaces(prefixes, prefixMap)
    .map(([prefix, ns]) => `PREFIX ${prefix}: <${ns}>`)
}

function toTriple({ subject, predicate, object }: Quad) {
  return RDF.quad(subject, predicate, object)
}

export type SparqlTemplateResult = TemplateResult<SparqlOptions>
export type SparqlValue<T extends Term = Term> = Value<SparqlTemplateResult, T>

export class SparqlStrategy extends SerializationStrategy<SparqlOptions> {
  public evaluateLiteral(term: Literal, options: SparqlOptions): PartialString {
    return turtleSyntax.literal(term, options)
  }

  public evaluateNamedNode(term: NamedNode, options: SparqlOptions): PartialString {
    return turtleSyntax.namedNode(term, options)
  }

  public evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: turtleSyntax.blankNode(term),
      prefixes: [],
    }
  }

  public evaluateVariable(term: Variable): PartialString {
    return {
      value: `?${term.value}`,
      prefixes: [],
    }
  }

  public getFinalString(result: string, prefixes: Iterable<string>, options: SparqlOptions): string {
    const prologue = options.prologue || typeof options.prologue === 'undefined'
    let prologueLines: string[] = []
    if (prologue) {
      prologueLines = prefixDeclarations(prefixes, {
        ...knownPrefixes,
        ...mapBuilders(options.prefixes),
      })
      if (options.base) {
        prologueLines = [`BASE <${options.base}>`, ...prologueLines]
      }
      if (prologueLines.length > 0) {
        prologueLines.push('\n')
      }
    }

    return `${prologueLines.join('\n')}${result}`
  }

  public evaluateDataset(dataset: DatasetCore, options: SparqlOptions): PartialString {
    const graphs = [...dataset]
      .reduce((graphs, quad) => {
        const namedGraph = graphs.get(quad.graph) || []
        graphs.set(quad.graph, [
          ...namedGraph,
          toTriple(quad),
        ])

        return graphs
      }, new TermMap<Term, Quad[]>())

    return [...graphs.entries()].reduce<PartialString>((previous, [graph, quads]) => {
      const triplePatterns = this.__evaluateTripleArray(quads, options)

      if (RDF.defaultGraph().equals(graph)) {
        return {
          value: `${previous.value}\n${triplePatterns.value}`,
          prefixes: [...previous.prefixes, ...triplePatterns.prefixes],
        }
      } else {
        const graphStr = this.evaluateTerm(graph, options)

        return {
          value: `${previous.value}\nGRAPH ${graphStr.value} {\n${triplePatterns.value}\n}`,
          prefixes: [...previous.prefixes, ...graphStr.prefixes, ...triplePatterns.prefixes],
        }
      }
    }, {
      value: '',
      prefixes: [],
    })
  }

  public evaluateQuad(quad: Quad, options: SparqlOptions): PartialString {
    const subject = this.evaluateTerm(quad.subject, options)
    const predicate = this.evaluateTerm(quad.predicate, options)
    const object = this.evaluateTerm(quad.object, options)

    let pattern = `${subject.value} ${predicate.value} ${object.value} .`
    let prefixes = [
      ...subject.prefixes,
      ...predicate.prefixes,
      ...object.prefixes,
    ]

    if (!RDF.defaultGraph().equals(quad.graph)) {
      const graph = this.evaluateTerm(quad.graph, options)
      pattern = `GRAPH ${graph.value} { ${pattern} }`
      prefixes = [...prefixes, ...graph.prefixes]
    }

    return {
      value: pattern,
      prefixes,
    }
  }

  private __evaluateTripleArray(quads: Quad[], options: SparqlOptions): PartialString {
    return quads.reduce<PartialString>((previous, quad) => {
      const next = this.evaluateQuad(quad, options)
      return {
        value: `${previous.value}\n${next.value}`,
        prefixes: [...previous.prefixes, ...next.prefixes],
      }
    }, { value: '', prefixes: [] })
  }
}

export const sparql = (strings: TemplateStringsArray, ...values: SparqlValue[]) =>
  new TemplateResult<SparqlOptions>({
    strings,
    values,
    tag: sparql,
    strategy: new SparqlStrategy(),
    defaultOptions: {
      prologue: true,
    },
  })
