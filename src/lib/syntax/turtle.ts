import { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import { shrink } from '@zazuko/prefixes'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import { xsd } from '@tpluscode/rdf-ns-builders'
import { PartialString } from '../TemplateResult.js'
import { mapBuilders } from '../prefixes.js'
import * as ntriples from './ntriples.js'

export function blankNode(term: BlankNode): string {
  return ntriples.blankNode(term)
}

interface NamedNodeOptions {
  base?: string | NamedNode
  prefixes?: Record<string, string | NamespaceBuilder>
  noPrefixedNames?: boolean
}

export function namedNode(term: NamedNode, { base = '', prefixes = {}, noPrefixedNames }: NamedNodeOptions): PartialString {
  const baseStr = (typeof base === 'string') ? base : base.value
  const baseRegex = new RegExp('^' + baseStr)

  let shrunk: string | undefined

  if (noPrefixedNames !== true && (shrunk = shrink(term.value, mapBuilders(prefixes)))) {
    return {
      value: shrunk.replaceAll(/[/#]/g, s => `\\${s}`),
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

export function literal(term: Literal, { base = '', prefixes = {} }: NamedNodeOptions): PartialString {
  if (!term.language && term.datatype) {
    if (isBuiltInType(term.datatype)) {
      return {
        value: term.value,
        prefixes: [],
      }
    }

    if (!term.datatype.equals(xsd.string)) {
      const datatypeResult = namedNode(term.datatype, { base, prefixes })

      return {
        value: `${ntriples.literalValue(term)}^^${datatypeResult.value}`,
        prefixes: datatypeResult.prefixes,
      }
    }
  }

  return {
    value: ntriples.literal(term),
    prefixes: [],
  }
}
