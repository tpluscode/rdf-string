import { BlankNode, Literal, NamedNode } from 'rdf-js'
import xsd from './xsd'

export function blankNode(term: BlankNode): string {
  return `_:${term.value}`
}

export function namedNode(term: NamedNode): string {
  return `<${term.value}>`
}

export function literal(term: Literal): string {
  const value = `"${term.value}"`
  if (term.language) {
    return `${value}@${term.language}`
  }

  if (term.datatype && !term.datatype.equals(xsd.string)) {
    return `${value}^^${namedNode(term.datatype)}`
  }

  return value
}
