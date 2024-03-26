/* eslint-disable no-use-before-define,@typescript-eslint/no-explicit-any */
import { BlankNode, DatasetCore, Literal, NamedNode, BaseQuad, Term, Variable, DataFactory } from '@rdfjs/types'
import type { Environment } from '@rdfjs/environment/Environment.js'
import { xsd } from '@tpluscode/rdf-ns-builders'
import type { TermMapFactory } from '@rdfjs/term-map/Factory.js'
import defaultEnv from './defaultEnv.js'
import { Value } from './value.js'

interface Options {
  env: Environment<DataFactory | TermMapFactory>
}

type TagFunction<TImpl extends TemplateResult<TOptions>, TValue extends Value<TImpl>, TOptions extends Options> = {
  (strings: TemplateStringsArray, ...values: TValue[]): TImpl
}

export interface PartialString {
  value: string
  prefixes: Iterable<string>
}

export abstract class SerializationStrategy<TOptions> {
  public abstract evaluateLiteral(term: Literal, options: TOptions): PartialString
  public abstract evaluateNamedNode(term: NamedNode, options: TOptions): PartialString
  public abstract evaluateVariable(term: Variable, options: TOptions): PartialString
  public abstract evaluateBlankNode(term: BlankNode, options: TOptions): PartialString
  public abstract evaluateQuad(quad: BaseQuad, options: TOptions): PartialString
  public abstract evaluateDataset(dataset: DatasetCore, options: TOptions): PartialString
  public abstract getFinalString(result: string, prefixes: Iterable<string>, options: TOptions): string

  public evaluateTerm(value: Term, options: TOptions): PartialString {
    switch (value.termType) {
      case 'Literal':
        return this.evaluateLiteral(value, options)
      case 'NamedNode':
        return this.evaluateNamedNode(value, options)
      case 'BlankNode':
        return this.evaluateBlankNode(value, options)
      case 'Variable':
        return this.evaluateVariable(value, options)
    }

    return {
      value: '',
      prefixes: [],
    }
  }
}

export interface TemplateResultInit<TOptions extends Options> {
  strings: TemplateStringsArray
  values: Value<TemplateResult<TOptions>>[]
  tag: TagFunction<any, Value<any>, TOptions>
  strategy: SerializationStrategy<TOptions>
  defaultOptions(env: TOptions['env']): Omit<TOptions, 'env'>
}

function isIterable(obj: unknown): obj is Iterable<any> {
  return Symbol.iterator in Object(obj) && typeof obj !== 'string'
}

export class TemplateResult<TOptions extends Options> {
  protected readonly strings: TemplateStringsArray
  protected readonly values: readonly (Value<TemplateResult<TOptions>> | object)[]
  protected readonly _tag: TagFunction<TemplateResult<TOptions>, Value<TemplateResult<TOptions>>, TOptions>
  private readonly __strategy: SerializationStrategy<TOptions>
  private readonly __defaultOptions: (env: TOptions['env']) => Omit<TOptions, 'env'>

  public constructor({
    strings,
    values,
    tag,
    strategy,
    defaultOptions,
  }: TemplateResultInit<TOptions>) {
    this.strings = strings
    this.values = values
    this._tag = tag
    this.__strategy = strategy
    this.__defaultOptions = defaultOptions
  }

  toString({ env = defaultEnv, ...options }: Partial<TOptions> = {}): string {
    let actualOptions = {
      ...this.__defaultOptions(env),
      env,
    } as unknown as TOptions
    if (options) {
      actualOptions = { ...actualOptions, ...options }
    }

    const { value, prefixes } = this._toPartialString(actualOptions)

    return this.__strategy.getFinalString(value, prefixes, actualOptions)
  }

  public _toPartialString(options: TOptions): PartialString {
    const RDF = options.env
    const prefixes: Set<string> = new Set()
    const l = this.strings.length - 1
    let result = ''

    for (let i = 0; i < l; i++) {
      let partialResult: PartialString | null = null
      result += this.strings[i]

      const value = this.values[i]
      if (typeof value === 'undefined' || value === null) continue

      if (typeof value === 'boolean') {
        partialResult = this.__strategy.evaluateLiteral(RDF.literal(value.toString(), xsd.boolean), options)
      } else if (typeof value === 'number') {
        const datatype = Number.isInteger(value) ? xsd.integer : xsd.decimal

        partialResult = this.__strategy.evaluateLiteral(RDF.literal(value.toString(), datatype), options)
      } else if (value instanceof Date) {
        partialResult = this.__strategy.evaluateLiteral(RDF.literal(value.toISOString(), xsd.dateTime), options)
      } else if (typeof value === 'object') {
        if ('_toPartialString' in value) {
          partialResult = value._toPartialString(options)
        } else if ('subject' in value) {
          partialResult = this.__strategy.evaluateQuad(value, options)
        } else if ('match' in value) {
          partialResult = this.__strategy.evaluateDataset(value, options)
        } else if ('termType' in value) {
          partialResult = this.__strategy.evaluateTerm(value, options)
        } else if (isIterable(value)) {
          const [first, ...rest] = value
          partialResult = this._tag`${first}`._toPartialString(options)

          for (const item of rest) {
            const itemResult = this._tag`${item}`._toPartialString(options)
            partialResult.value += `\n${itemResult.value}`
            partialResult.prefixes = [...partialResult.prefixes, ...itemResult.prefixes]
          }
        }
      }

      if (partialResult === null) {
        partialResult = {
          value: value.toString(),
          prefixes: [],
        }
      }

      result += partialResult.value
      ;[...partialResult.prefixes].forEach(prefix => prefixes.add(prefix))
    }

    result += this.strings[l]

    return {
      value: result,
      prefixes,
    }
  }
}
