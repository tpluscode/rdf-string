import { BlankNode, Literal, NamedNode } from 'rdf-js'
import { shrink } from '@zazuko/rdf-vocabularies/shrink'
import type { NamespaceBuilder } from '@rdfjs/namespace'
import TermMap from '@rdf-esm/term-map'
import { PartialString } from '../TemplateResult'
import { mapBuilders } from '../prefixes'
import * as ntriples from './ntriples'
import xsd from './xsd'

export function blankNode(term: BlankNode): string {
  return ntriples.blankNode(term)
}

interface NamedNodeOptions {
  base?: string | NamedNode
  prefixes?: Record<string, string | NamespaceBuilder>
}

export function namedNode(term: NamedNode, { base = '', prefixes = {} }: NamedNodeOptions): PartialString {
  const baseStr = (typeof base === 'string') ? base : base.value

  const baseRegex = new RegExp('^' + baseStr)
  const shrunk = shrink(term.value, mapBuilders(prefixes))
  if (shrunk) {
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
