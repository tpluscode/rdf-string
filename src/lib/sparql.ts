import { prefixes as knownPrefixes, shrink } from '@zazuko/rdf-vocabularies'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { BlankNode, Literal, NamedNode, Term, Variable } from 'rdf-js'
import { Value } from './value'
import { PartialString, TemplateResult } from './TemplateResult'

const xsdString = xsd.string

export type SparqlValue<T extends Term = Term> = Value<SparqlTemplateResult, T>

interface SparqlOptions {
  base?: string
  prologue?: boolean
}

function prefixDeclarations(prefixes: Iterable<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `PREFIX ${prefix}: <${knownPrefixes[prefix]}>`)
}

export class SparqlTemplateResult extends TemplateResult<SparqlTemplateResult, SparqlValue, SparqlOptions> {
  // eslint-disable-next-line no-useless-constructor
  public constructor(strings: TemplateStringsArray, values: SparqlValue[], turtle: (strings: TemplateStringsArray, ...values: SparqlValue<any>[]) => SparqlTemplateResult) {
    super(strings, values, turtle)
  }

  protected get __defaultOptions(): SparqlOptions {
    return {
      prologue: true,
    }
  }

  protected _evaluateLiteral(term: Literal, options: SparqlOptions): PartialString {
    const literalString = `"${term.value}"`
    if (term.language) {
      return {
        value: literalString + `@${term.language}`,
        prefixes: [],
      }
    }

    if (term.datatype && !term.datatype.equals(xsdString)) {
      const datatypeResult = this._evaluateNamedNode(term.datatype, options)

      return {
        value: `${literalString}^^${datatypeResult.value}`,
        prefixes: datatypeResult.prefixes,
      }
    }

    return {
      value: literalString,
      prefixes: [],
    }
  }

  protected _evaluateNamedNode(term: NamedNode, options: SparqlOptions): PartialString {
    const baseRegex = new RegExp('^' + options.base)
    const shrunk = shrink(term.value)
    if (shrunk) {
      return {
        value: shrunk,
        prefixes: [
          shrunk.split(':')[0],
        ],
      }
    }

    return {
      value: `<${term.value.replace(baseRegex, '')}>`,
      prefixes: [],
    }
  }

  protected _evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: `_:${term.value}`,
      prefixes: [],
    }
  }

  protected _evaluateVariable(term: Variable): PartialString {
    return {
      value: `?${term.value}`,
      prefixes: [],
    }
  }

  protected _getFinalString(result: string, prefixes: Iterable<string>, options: SparqlOptions): string {
    const prologue = options.prologue || typeof options.prologue === 'undefined'
    let prologueLines: string[] = []
    if (prologue) {
      prologueLines = prefixDeclarations(prefixes)
      if (options.base) {
        prologueLines = [`BASE <${options.base}>`, ...prologueLines]
      }
      prologueLines.push('\n')
    }

    return `${prologueLines.join('\n')}${result}`
  }
}

export const sparql = (strings: TemplateStringsArray, ...values: SparqlValue[]) =>
  new SparqlTemplateResult(strings, values, sparql)
