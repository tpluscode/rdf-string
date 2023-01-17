import type { NamespaceBuilder } from '@rdfjs/namespace'

export function mapBuilders(prefixes: Record<string, string | NamespaceBuilder> = {}) {
  return Object.fromEntries(
    Object.entries(prefixes).map(([prefix, ns]) => [
      prefix,
      typeof ns === 'string' ? ns : ns().value,
    ]),
  )
}

export function getNamespaces(prefixes: Iterable<string>, prefixMap: Record<string, string>): [string, string][] {
  return [...prefixes]
    .filter(prefix => prefix in prefixMap)
    .map(prefix => [prefix, prefixMap[prefix]])
}
