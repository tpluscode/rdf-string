import { BlankNode, Literal, NamedNode } from 'rdf-js'
import xsd from './xsd'

const echarRegEx = new RegExp('["\\\\\n\r]') // eslint-disable-line no-control-regex, prefer-regex-literals
const echarRegExAll = new RegExp('["\\\\\n\r]', 'g') // eslint-disable-line no-control-regex, prefer-regex-literals

const echarReplacement: Record<string, string> = {
  '"': '\\"',
  '\\': '\\\\',
  '\n': '\\n',
  '\r': '\\r',
}

function echarReplacer(char: string) {
  return echarReplacement[char]
}

function escapeValue(value: string) {
  if (echarRegEx.test(value)) {
    return value.replace(echarRegExAll, echarReplacer)
  }

  return value
}

export function blankNode(term: BlankNode): string {
  return `_:${term.value}`
}

export function namedNode(term: NamedNode): string {
  return `<${term.value}>`
}

export function literalValue(term: Literal) {
  return `"${escapeValue(term.value)}"`
}

export function literal(term: Literal): string {
  const value = literalValue(term)
  if (term.language) {
    return `${value}@${term.language}`
  }

  if (term.datatype && !term.datatype.equals(xsd.string)) {
    return `${value}^^${namedNode(term.datatype)}`
  }

  return value
}
