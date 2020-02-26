import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term, Variable } from 'rdf-js'
import { Value } from './value'

type TagFunction<TImpl extends TemplateResult<TOptions>, TValue extends Value<TImpl>, TOptions> = {
  (strings: TemplateStringsArray, ...values: TValue[]): TImpl
}

export interface PartialString {
  value: string
  prefixes: Iterable<string>
}

export abstract class SerializationStrategy<TOptions> {
  public abstract evaluateLiteral(term: Literal, options: TOptions): PartialString
  public abstract evaluateNamedNode(term: NamedNode, options: TOptions): PartialString
  public abstract evaluateVariable(term: Variable): PartialString
  public abstract evaluateBlankNode(term: BlankNode): PartialString
  public abstract evaluateQuad(quad: Quad, options: TOptions): PartialString
  public abstract evaluateDataset(dataset: DatasetCore, options: TOptions): PartialString
  public abstract getFinalString(result: string, prefixes: Iterable<string>, options: TOptions): string

  public evaluateTerm(value: Term, options: TOptions): PartialString {
    switch (value.termType) {
      case 'Literal':
        return this.evaluateLiteral(value, options)
      case 'NamedNode':
        return this.evaluateNamedNode(value, options)
      case 'BlankNode':
        return this.evaluateBlankNode(value)
      case 'Variable':
        return this.evaluateVariable(value)
    }

    return {
      value: '',
      prefixes: [],
    }
  }
}

export interface TemplateResultInit<TOptions> {
  strings: TemplateStringsArray
  values: Value<any>[]
  tag: TagFunction<any, Value<any>, TOptions>
  strategy: SerializationStrategy<TOptions>
  defaultOptions: TOptions
}

export class TemplateResult<TOptions> {
  protected readonly strings: TemplateStringsArray;
  protected readonly values: readonly Value<TemplateResult<TOptions>>[];
  protected readonly _tag: TagFunction<TemplateResult<TOptions>, DatasetCore | Quad | Term | string | undefined | null, TOptions>
  private readonly __strategy: SerializationStrategy<TOptions>
  private readonly __defaultOptions: TOptions

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

  toString(options?: Partial<TOptions>): string {
    let actualOptions = this.__defaultOptions
    if (options) {
      actualOptions = { ...actualOptions, ...options }
    }

    const { value, prefixes } = this._toPartialString(actualOptions)

    return this.__strategy.getFinalString(value, prefixes, actualOptions)
  }

  protected _toPartialString(options: TOptions): PartialString {
    const prefixes: Set<string> = new Set()
    const l = this.strings.length - 1
    let result = ''

    for (let i = 0; i < l; i++) {
      let partialResult: PartialString = {
        value: '',
        prefixes: [],
      }
      result += this.strings[i]

      const value = this.values[i]
      if (!value) continue

      if (typeof value === 'string') {
        result += value
      } else

      if (value instanceof TemplateResult) {
        partialResult = value._toPartialString(options)
      } else

      if ('subject' in value) {
        partialResult = this.__strategy.evaluateQuad(value, options)
      } else if ('match' in value) {
        partialResult = this.__strategy.evaluateDataset(value, options)
      } else {
        partialResult = this.__strategy.evaluateTerm(value, options)
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
