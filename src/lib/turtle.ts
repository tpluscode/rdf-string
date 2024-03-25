import { BlankNode, DataFactory, DatasetCore, DefaultGraph, Literal, NamedNode, Quad, Term } from '@rdfjs/types'
import knownPrefixes from '@zazuko/prefixes'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import type { Environment } from '@rdfjs/environment/Environment.d.ts'
import type { TermMapFactory } from '@rdfjs/term-map/Factory.d.ts'
import { Value } from './value.js'
import { PartialString, SerializationStrategy, TemplateResult } from './TemplateResult.js'
import * as syntax from './syntax/turtle.js'
import { mapBuilders, getNamespaces } from './prefixes.js'

export interface TurtleOptions {
  env: Environment<DataFactory | TermMapFactory>
  base?: string | NamedNode
  directives: boolean
  graph: NamedNode | DefaultGraph
  cheapCompression: boolean
  prefixes?: Record<string, string | NamespaceBuilder>
  noPrefixedNames?: boolean
}

function prefixDeclarations(prefixes: Iterable<string>, prefixMap: Record<string, string>): string[] {
  return getNamespaces(prefixes, prefixMap)
    .map(([prefix, ns]) => `@prefix ${prefix}: <${ns}> .`)
}

export type TurtleTemplateResult = TemplateResult<TurtleOptions>
export type TurtleValue<T extends Term = Term> = Value<TurtleTemplateResult, T>

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

  public evaluateLiteral(term: Literal, options: TurtleOptions): PartialString {
    return syntax.literal(term, options)
  }

  public evaluateNamedNode(term: NamedNode, options: TurtleOptions): PartialString {
    return syntax.namedNode(term, options)
  }

  public evaluateVariable(): PartialString {
    throw new Error('Turtle cannot serialize variables')
  }

  public evaluateDataset(dataset: DatasetCore, options: TurtleOptions): PartialString {
    const graphQuads = [...dataset.match(null, null, null, options.graph)]
    if (options.cheapCompression) {
      return this.__evaluateQuads(graphQuads, options)
    }

    const subjectMap = graphQuads.reduce((map, quad) => {
      let quads = map.get(quad.subject.value)
      if (!quads) {
        quads = new Set()
        map.set(quad.subject.value, quads)
      }

      quads.add(quad)

      return map
    }, new Map<string, Set<Quad>>())

    return [...subjectMap.values()].reduce<PartialString>((result, quads, index) => {
      const nextSubject = this.__evaluateQuads([...quads], options)
      const separator = index ? '\n' : ''

      return {
        value: `${result.value}${separator}${nextSubject.value}`,
        prefixes: [...result.prefixes, ...nextSubject.prefixes],
      }
    }, { value: '', prefixes: [] })
  }

  public evaluateQuad(quad: Quad, options: TurtleOptions, { terminate = true, newLineAfterSubject = false } = {}): PartialString {
    if (!options.graph.equals(quad.graph)) {
      return {
        value: '',
        prefixes: [],
      }
    }

    const subject = this.evaluateTerm(quad.subject, options)
    const predicate = this.evaluateTerm(quad.predicate, options)
    const object = this.evaluateTerm(quad.object, options)

    const predicateSeparator = newLineAfterSubject ? '\n   ' : ' '

    return {
      value: `${subject.value}${predicateSeparator}${predicate.value} ${object.value}${terminate ? ' .' : ''}`,
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
      prologueLines = prefixDeclarations(prefixes, {
        ...knownPrefixes,
        ...mapBuilders(options.prefixes),
      })

      if (options.base) {
        const baseStr = typeof options.base === 'string' ? options.base : options.base.value
        prologueLines.push(`@base <${baseStr}> .`)
      }

      if (prologueLines.length > 0) {
        prologueLines.push('\n')
      }
    }

    return `${prologueLines.join('\n')}${result}`
  }

  private __evaluateQuads(quads: Quad[], options: TurtleOptions) {
    if (quads.length === 0) {
      return {
        value: '',
        prefixes: [],
      }
    }

    let orderedQuads = quads
    if (!options.cheapCompression) {
      orderedQuads = quads.sort((left, right) => left.predicate.value.localeCompare(right.predicate.value))
    }

    const result = orderedQuads.reduce<PartialString & DatasetEvaluationContext>((context, quad) => {
      if (!context.previous) {
        return {
          ...this.evaluateQuad(quad, options, {
            terminate: false,
            newLineAfterSubject: true,
          }),
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

      const quadResult = this.evaluateQuad(quad, options, {
        terminate: false,
        newLineAfterSubject: true,
      })

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
    defaultOptions: (RDF: Environment<DataFactory>) => ({
      directives: true,
      graph: RDF.defaultGraph(),
      cheapCompression: false,
    }),
  })
