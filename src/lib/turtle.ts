import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term } from 'rdf-js'
import { prefixes as knownPrefixes, shrink } from '@zazuko/rdf-vocabularies'
import { Value } from './value'

export type TurtleValue<T extends Term = Term> = Value<TurtleTemplateResult | DatasetCore | Quad, T>

interface TurtleOptions {
  directives?: boolean
}

function prefixDeclarations(prefixes: Set<string>): string[] {
  return [...prefixes]
    .filter(prefix => prefix in knownPrefixes)
    .map(prefix => `@prefix ${prefix}: <${knownPrefixes[prefix]}> .`)
}

export class TurtleTemplateResult {
  readonly strings: TemplateStringsArray;
  readonly values: readonly TurtleValue[];
  readonly prefixes: Set<string> = new Set()
  private readonly _turtle: (strings: TemplateStringsArray, ...values: TurtleValue[]) => TurtleTemplateResult;

  constructor(strings: TemplateStringsArray, values: TurtleValue[], turtle: (strings: TemplateStringsArray, ...values: TurtleValue<any>[]) => TurtleTemplateResult) {
    this.strings = strings
    this.values = values
    this._turtle = turtle
  }

  toString(options: TurtleOptions = { directives: true }): string {
    const prologue = options.directives || typeof options.directives === 'undefined'

    const l = this.strings.length - 1
    let query = ''

    for (let i = 0; i < l; i++) {
      query += this.strings[i]

      const value = this.values[i]
      if (!value) continue

      if (typeof value === 'string') {
        query += `${value}`
      } else if (value instanceof TurtleTemplateResult) {
        query += value.toString({ ...options, directives: false })
        value.prefixes.forEach(prefix => this.prefixes.add(prefix))
      } else if ('subject' in value) {
        const quadResult = this._turtle`${value.subject} ${value.predicate} ${value.object}`
        query += quadResult.toString({ directives: false })
        quadResult.prefixes.forEach(prefix => this.prefixes.add(prefix))
      } else if ('match' in value) {
        const [first, ...rest] = value
        const datasetResult = rest.reduce((result, quad) => {
          return this._turtle`${result}\n${quad}`
        }, this._turtle`${first}`)

        query += datasetResult.toString({ directives: false })
        datasetResult.prefixes.forEach(prefix => this.prefixes.add(prefix))
      } else {
        switch (value.termType) {
          case 'Literal':
            query += `"${value.value}"`
            if (value.language) {
              query += `@${value.language}`
            } else if (value.datatype) {
              const datatypeResult = this._turtle`^^${value.datatype}`
              query += datatypeResult.toString({ directives: false })
              datatypeResult.prefixes.forEach(prefix => this.prefixes.add(prefix))
            }
            break
          case 'NamedNode': {
            const shrunk = shrink(value.value)
            if (shrunk) {
              this.prefixes.add(shrunk.split(':')[0])
              query += shrunk
            } else {
              query += `<${value.value}>`
            }
          } break
          case 'BlankNode':
            query += `_:${value.value}`
            break
          default:
            query += value.value
        }
      }
    }

    query += this.strings[l]

    let prologueLines: string[] = []
    if (prologue) {
      if (this.prefixes.size > 0) {
        prologueLines = prefixDeclarations(this.prefixes)
        prologueLines.push('\n')
      }
    }

    return `${prologueLines.join('\n')}${query}`
  }
}

export const turtle = (strings: TemplateStringsArray, ...values: TurtleValue<NamedNode | Literal | BlankNode>[]) =>
  new TurtleTemplateResult(strings, values, turtle)
