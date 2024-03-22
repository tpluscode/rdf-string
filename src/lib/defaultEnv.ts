import Environment from '@rdfjs/environment'
import DataFactory from '@rdfjs/data-model/Factory.js'
import TermMapFactory from '@rdfjs/term-map/Factory.js'

export default new Environment([
  DataFactory,
  TermMapFactory,
])
