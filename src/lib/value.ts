import { DatasetCore, Quad, Term } from '@rdfjs/types'

export type Value<TResult, TTerm extends Term = Term> = DatasetCore | Quad | TResult | TTerm | string | undefined | null | number | boolean | Date | object
