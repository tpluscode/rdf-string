import rdf from '@zazuko/env'

const { xsd } = rdf.ns

export default {
  string: xsd.string,
  integer: xsd.integer,
  decimal: xsd.decimal,
  boolean: xsd.boolean,
  dateTime: xsd.dateTime,
}
