import { BlankNode, Literal, NamedNode } from 'rdf-js'
import { shrink } from '@zazuko/rdf-vocabularies'
import * as ntriples from './ntriples'
import { PartialString } from '../TemplateResult'
import xsd from './xsd'

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

function isBuiltInType(datatype: NamedNode): boolean {
  return datatype.equals(xsd.integer) || datatype.equals(xsd.boolean) || datatype.equals(xsd.decimal)
}

export function literal(term: Literal, base = ''): PartialString {
  if (!term.language && term.datatype) {
    if (isBuiltInType(term.datatype)) {
      return {
        value: term.value,
        prefixes: [],
      }
    }

    if (!term.datatype.equals(xsd.string)) {
      const datatypeResult = namedNode(term.datatype, base)

      return {
        value: `"${term.value}"^^${datatypeResult.value}`,
        prefixes: datatypeResult.prefixes,
      }
    }
  }

  return {
    value: ntriples.literal(term),
    prefixes: [],
  }
}
