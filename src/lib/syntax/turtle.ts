import { BlankNode, Literal, NamedNode } from 'rdf-js'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { shrink } from '@zazuko/rdf-vocabularies'
import * as ntriples from './ntriples'
import { PartialString } from '../TemplateResult'

const xsdString = xsd.string

export function blankNode(term: BlankNode): string {
  return ntriples.blankNode(term)
}

export function namedNode(term: NamedNode, base = ''): PartialString {
  const baseRegex = new RegExp('^' + base)
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

export function literal(term: Literal, base = ''): PartialString {
  if (!term.language && term.datatype && !term.datatype.equals(xsdString)) {
    const datatypeResult = namedNode(term.datatype, base)

    return {
      value: `"${term.value}"^^${datatypeResult.value}`,
      prefixes: datatypeResult.prefixes,
    }
  }

  return {
    value: ntriples.literal(term),
    prefixes: [],
  }
}
