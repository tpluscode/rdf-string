import $rdf from 'rdf-ext'
import namespace from '@rdfjs/namespace'
import { schema, xsd } from '@tpluscode/rdf-ns-builders'
import { expect } from 'chai'
import { nquads } from '../src/index.js'
import './matchers.js'

const ex = namespace('http://example.com/')

describe('nquads', () => {
  describe('interpolating JS types', () => {
    it('leaves strings intact', () => {
      // when
      const foo = 'foo'
      const str = nquads`<http://example.com/${foo}>`.toString()

      // then
      expect(str).to.equal('<http://example.com/foo>')
    })
  })

  describe('interpolating dataset', () => {
    it('writes all graphs', function () {
      // given
      const salary = $rdf.blankNode('salary')
      const dataset = $rdf.dataset()
        .add($rdf.quad(ex.John, schema.name, $rdf.literal('John'), ex.John))
        .add($rdf.quad(ex.Jane, schema.name, $rdf.literal('Jane'), ex.Jane))
        .add($rdf.quad(ex.Jane, schema.spouse, ex.Jane))
        .add($rdf.quad(ex.John, schema.baseSalary, salary, ex.John))
        .add($rdf.quad(salary, schema.value, $rdf.literal('20000', xsd.int), ex.John))

      // when
      const str = nquads`${dataset}`.toString()

      // then
      expect(str).to.matchSnapshot(this)
      expect(str).to.be.validNQuads()
    })

    it('does not break on empty dataset', () => {
      // given
      const dataset = $rdf.dataset()

      // when
      const str = nquads`${dataset}`.toString()

      // then
      expect(str).to.equal('')
    })
  })
})
