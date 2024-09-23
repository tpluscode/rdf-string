import { BlankNode, Literal, NamedNode } from '@rdfjs/types'
import { shrink } from '@zazuko/prefixes'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import { xsd } from '@tpluscode/rdf-ns-builders'
import TermMap from '@rdfjs/term-map'
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

export function namedNode(term: Pick<NamedNode, 'value'>, { base = '', prefixes = {}, noPrefixedNames }: NamedNodeOptions): PartialString {
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

const buildInTypes = new TermMap<NamedNode, RegExp>([
  [xsd.integer, /^-?[0-9]+$/],
  [xsd.decimal, /^-?[0-9]+\.[0-9]+$/],
  [xsd.boolean, /^(true|false)$/],
])

export function literal(term: Literal, { base = '', prefixes = {} }: NamedNodeOptions): PartialString {
  if (!term.language && term.datatype) {
    const shorthandSyntax = buildInTypes.get(term.datatype)
    if (shorthandSyntax && shorthandSyntax.test(term.value)) {
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
