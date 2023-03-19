import namespace from '@rdfjs/namespace'

const xsd = namespace('http://www.w3.org/2001/XMLSchema#')

export default {
  string: xsd.string,
  integer: xsd.integer,
  decimal: xsd.decimal,
  boolean: xsd.boolean,
  dateTime: xsd.dateTime,
}
