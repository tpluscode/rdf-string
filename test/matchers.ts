/* eslint-disable import/no-extraneous-dependencies */
import { Assertion, AssertionError } from 'chai'
import { Parser } from 'sparqljs'
import { parsers } from '@rdfjs/formats-common'
import toStream from 'string-to-stream'
import 'chai-snapshot-matcher'

const sparqlParser = new Parser()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Chai {
    interface TypeComparison {
      query(expected: string): void
      validTurtle(): Promise<void>
      validNQuads(): Promise<void>
    }
  }
}

function parsingMatcher(mediaType: string) {
  return function (this: Chai.AssertionStatic) {
    const stream = parsers.import(mediaType, toStream(this._obj.toString())) as any

    stream.on('data', () => {
      // force the stream to consume all input
    })
    return new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })
      .catch((e: any) => {
        throw new AssertionError(`Value is not valid ${mediaType} ${e.message}`)
      })
  }
}

Assertion.addMethod('query',
  function (this: Chai.AssertionStatic, expected: string) {
    let expectedQuery: any
    try {
      expectedQuery = sparqlParser.parse(expected)
    } catch (e: any) {
      throw new AssertionError(`Failed to parse expected query:\n ${expected}`)
    }
    let actualQuery: any
    try {
      actualQuery = sparqlParser.parse(this._obj.toString())
    } catch (e: any) {
      throw new AssertionError(`Failed to parse actual query. 
 ${e.message}.
 
 Query was:
 ${this._obj.toString()}`)
    }

    new Assertion(actualQuery).to.deep.eq(expectedQuery)
  })

Assertion.addMethod('validTurtle', parsingMatcher('text/turtle'))
Assertion.addMethod('validNQuads', parsingMatcher('application/n-quads'))
