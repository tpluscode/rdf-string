import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term } from 'rdf-js'
import { prefixes as knownPrefixes, shrink } from '@zazuko/rdf-vocabularies'
import { Value } from './value'
import { PartialString, TemplateResult } from './TemplateResult'

export type TurtleValue<T extends Term = Term> = Value<TurtleTemplateResult, T>

interface TurtleOptions {
  directives?: boolean
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
    }
  }

  protected _evaluateBlankNode(term: BlankNode): PartialString {
    return {
      value: `_:${term.value}`,
      prefixes: [],
    }
  }

  protected _evaluateLiteral(term: Literal): PartialString {
    const literalString = `"${term.value}"`
    if (term.language) {
      return {
        value: literalString + `@${term.language}`,
        prefixes: [],
      }
    }

    if (term.datatype) {
      const datatypeResult = this._evaluateNamedNode(term.datatype)

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

  protected _evaluateNamedNode(term: NamedNode): PartialString {
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
      value: `<${term.value}>`,
      prefixes: [],
    }
  }

  protected _evaluateDataset(dataset: DatasetCore, options: TurtleOptions): PartialString {
    return [...dataset].reduce<PartialString>((result, quad) => {
      const quadResult = this._evaluateQuad(quad, options)
      return {
        value: result.value + '\n' + quadResult,
        prefixes: [...result.prefixes, ...quadResult.prefixes],
      }
    }, { value: '', prefixes: [] })
  }

  protected _evaluateQuad(quad: Quad, options: TurtleOptions): PartialString {
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
