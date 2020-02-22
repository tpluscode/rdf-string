import { Parser } from 'sparqljs'
import { SparqlTemplateResult } from '../src/lib/sparql'

const sparqlParser = new Parser()

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toMatchQuery(expected: string): R
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
})
