import { prefixes as knownPrefixes, shrink } from '@zazuko/rdf-vocabularies'
import { Term } from 'rdf-js'
import { Value } from './value'

export type SparqlValue<T extends Term = Term> = Value<SparqlTemplateResult, T>

interface SparqlOptions {
  base?: string
  prologue?: boolean
}

function prefixDeclarations(prefixes: Set<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `PREFIX ${prefix}: <${knownPrefixes[prefix]}>`)
}

export class SparqlTemplateResult {
  readonly strings: TemplateStringsArray;
  readonly values: readonly SparqlValue[];
  readonly prefixes: Set<string> = new Set()

  constructor(strings: TemplateStringsArray, values: SparqlValue[]) {
    this.strings = strings
    this.values = values
  }

  public toString(options: SparqlOptions = {}): string {
    const prologue = options.prologue || typeof options.prologue === 'undefined'
    const baseRegex = new RegExp('^' + options.base)

    const l = this.strings.length - 1
    let query = ''

    for (let i = 0; i < l; i++) {
      const s = this.strings[i]

      const value = this.values[i]
      let valueStr: string
      if (typeof value === 'string') {
        valueStr = `${value}`
      } else if (typeof value === 'undefined' || value === null) {
        valueStr = ''
      } else if (value instanceof SparqlTemplateResult) {
        valueStr = value.toString({ ...options, prologue: false })
        value.prefixes.forEach(prefix => this.prefixes.add(prefix))
      } else {
        switch (value.termType) {
          case 'Literal':
            valueStr = `"${value.value}"`
            break
          case 'NamedNode': {
            const shrunk = shrink(value.value)
            if (shrunk) {
              this.prefixes.add(shrunk.split(':')[0])
              valueStr = shrunk
            } else {
              valueStr = `<${value.value.replace(baseRegex, '')}>`
            }
          } break
          case 'Variable':
            valueStr = `?${value.value}`
            break
          default:
            valueStr = value.value
        }
      }

      query += s + valueStr
    }

    query += this.strings[l]

    let prologueLines: string[] = []
    if (prologue) {
      prologueLines = prefixDeclarations(this.prefixes)
      if (options.base) {
        prologueLines = [`BASE <${options.base}>`, ...prologueLines]
      }
      prologueLines.push('\n')
    }

    return `${prologueLines.join('\n')}${query}`
  }
}

export const sparql = (strings: TemplateStringsArray, ...values: SparqlValue[]) =>
  new SparqlTemplateResult(strings, values)
