import { prefixes as knownPrefixes } from '@zazuko/rdf-vocabularies'
import { BlankNode, Literal, NamedNode, Term, Variable } from 'rdf-js'
import { Value } from './value'
import { PartialString, SerializationStrategy, TemplateResult } from './TemplateResult'
import * as turtleSyntax from './syntax/turtle'

export type SparqlValue<T extends Term = Term> = Value<SparqlTemplateResult, T>

interface SparqlOptions {
  base?: string
  prologue: boolean
}

function prefixDeclarations(prefixes: Iterable<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `PREFIX ${prefix}: <${knownPrefixes[prefix]}>`)
}

export type SparqlTemplateResult = TemplateResult<SparqlOptions>

export class SparqlStrategy extends SerializationStrategy<SparqlOptions> {
  protected get __defaultOptions(): SparqlOptions {
    return {
      prologue: true,
    }
  }

  public evaluateLiteral(term: Literal, options: SparqlOptions): PartialString {
    return turtleSyntax.literal(term, options.base)
  }

  public evaluateNamedNode(term: NamedNode, options: SparqlOptions): PartialString {
    return turtleSyntax.namedNode(term, options.base)
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
      prologueLines = prefixDeclarations(prefixes)
      if (options.base) {
        prologueLines = [`BASE <${options.base}>`, ...prologueLines]
      }
      if (prologueLines.length > 0) {
        prologueLines.push('\n')
      }
    }

    return `${prologueLines.join('\n')}${result}`
  }

  public evaluateDataset(): PartialString {
    throw new Error('Method not implemented')
  }

  public evaluateQuad(): PartialString {
    throw new Error('Method not implemented')
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
