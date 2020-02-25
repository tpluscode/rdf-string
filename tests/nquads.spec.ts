import RDF from '@rdfjs/dataset'
import { blankNode, literal, quad } from '@rdfjs/data-model'
import namespace from '@rdfjs/namespace'
import { schema, xsd } from '@tpluscode/rdf-ns-builders'
import { nquads } from '../src'

const ex = namespace('http://example.com/')

describe('nquads', () => {
  describe('interpolating JS types', () => {
    it('leaves strings intact', () => {
      // when
      const foo = 'foo'
      const str = nquads`<http://example.com/${foo}>`.toString()

      // then
      expect(str).toEqual('<http://example.com/foo>')
    })
  })

  describe('interpolating dataset', () => {
    it('writes all graphs', () => {
      // given
      const salary = blankNode('salary')
      const dataset = RDF.dataset()
        .add(quad(ex.John, schema.name, literal('John'), ex.John))
        .add(quad(ex.Jane, schema.name, literal('Jane'), ex.Jane))
        .add(quad(ex.Jane, schema.spouse, ex.Jane))
        .add(quad(ex.John, schema.baseSalary, salary, ex.John))
        .add(quad(salary, schema.value, literal('20000', xsd.int), ex.John))

      // when
      const str = nquads`${dataset}`.toString()

      // then
      expect(str).toMatchSnapshot()
      expect(str).toBeValidNQuads()
    })
  })
})
