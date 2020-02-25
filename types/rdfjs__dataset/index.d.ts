declare module '@rdfjs/dataset' {
  import { DatasetCore, DataFactory, DefaultGraph } from 'rdf-js'

  const Dataset: {
    dataset(): DatasetCore
    defaultGraphInstance: DefaultGraph
  } & Required<DataFactory>
  export default Dataset
}
