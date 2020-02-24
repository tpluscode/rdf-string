import { BlankNode, DatasetCore, Literal, NamedNode, Quad, Term, Variable } from 'rdf-js'
import { Value } from './value'

type TagFunction<TImpl extends TemplateResult<TImpl, TValue, TOptions>, TValue extends Value<TImpl>, TOptions> = {
  (strings: TemplateStringsArray, ...values: TValue[]): TImpl
}

export interface PartialString {
  value: string
  prefixes: Iterable<string>
}

export abstract class TemplateResult<TImpl extends TemplateResult<TImpl, TValue, TOptions>, TValue extends Value<TImpl>, TOptions> {
  protected readonly strings: TemplateStringsArray;
  protected readonly values: readonly Value<TImpl>[];
  protected readonly _tag: TagFunction<TImpl, DatasetCore | Quad | TImpl | Term | string | undefined | null, TOptions>

  protected constructor(strings: TemplateStringsArray, values: Value<TImpl>[], tag: TagFunction<TImpl, Value<TImpl>, TOptions>) {
    this.strings = strings
    this.values = values
    this._tag = tag
  }

  protected abstract get __defaultOptions(): TOptions;

  protected abstract _getFinalString(result: string, prefixes: Iterable<string>, options?: TOptions): string;
  protected abstract _evaluateLiteral(term: Literal, options: TOptions): PartialString;
  protected abstract _evaluateNamedNode(term: NamedNode): PartialString;
  protected abstract _evaluateVariable(term: Variable): PartialString;
  protected abstract _evaluateBlankNode(term: BlankNode): PartialString;
  protected abstract _evaluateQuad(quad: Quad, options: TOptions): PartialString;
  protected abstract _evaluateDataset(dataset: DatasetCore, options: TOptions): PartialString;

  toString(options?: TOptions): string {
    const { value, prefixes } = this._toPartialString(options || this.__defaultOptions)

    return this._getFinalString(value, prefixes, options || this.__defaultOptions)
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
        result += `${value}`
      } else

      if (value instanceof TemplateResult) {
        partialResult = value._toPartialString(options)
      } else

      if ('subject' in value) {
        partialResult = this._evaluateQuad(value, options)
      } else if ('match' in value) {
        partialResult = this._evaluateDataset(value, options)
      } else {
        partialResult = this._evaluateTerm(value, options)
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

  protected _evaluateTerm(value: Term, options: TOptions): PartialString {
    switch (value.termType) {
      case 'Literal':
        return this._evaluateLiteral(value, options)
      case 'NamedNode':
        return this._evaluateNamedNode(value)
      case 'BlankNode':
        return this._evaluateBlankNode(value)
      case 'Variable':
        return this._evaluateVariable(value)
    }

    return {
      value: '',
      prefixes: [],
    }
  }
}
