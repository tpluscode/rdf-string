import { Parser } from 'sparqljs'
import { parsers } from '@rdfjs/formats-common'
import toStream from 'string-to-stream'
import { SparqlTemplateResult } from '../src/lib/sparql'

const sparqlParser = new Parser()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchQuery(expected: string): R
      toBeValidTurtle(): Promise<R>
    }
  }
}

expect.extend({
  toMatchQuery(received: SparqlTemplateResult, expected: string) {
    let expectedQuery: any
    try {
      expectedQuery = sparqlParser.parse(expected)
    } catch (e) {
      return {
        pass: false,
        message: () => `Failed to parse expected query:\n ${expected}`,
      }
    }
    let actualQuery: any
    try {
      actualQuery = sparqlParser.parse(received.toString())
    } catch (e) {
      return {
        pass: false,
        message: () => `Failed to parse actual query. 
 ${e.message}.
 
 Query was:
 ${received.toString()}`,
      }
    }

    expect(actualQuery).toEqual(expectedQuery)

    return {
      pass: true,
      message: () => 'Queries match',
    }
  },

  toBeValidTurtle(received: SparqlTemplateResult) {
    const stream = parsers.import('text/turtle', toStream(received.toString())) as any

    stream.on('data', () => {
      // force the stream to consume all input
    })
    return new Promise((resolve, reject) => {
      stream.on('end', resolve)
      stream.on('error', reject)
    })
      .then(() => {
        return {
          pass: true,
          message: () => 'Turtle is valid',
        }
      }).catch((e) => {
        return {
          pass: false,
          message: () => `Value is not valid turtle ${e.message}`,
        }
      })
  },
})
