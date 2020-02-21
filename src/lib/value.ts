import { Term } from 'rdf-js'

export type Value<TResult, TTerm extends Term = Term> = TResult | TTerm | string | undefined | null
