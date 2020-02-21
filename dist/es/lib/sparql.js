import { prefixes as knownPrefixes, shrink } from '@zazuko/rdf-vocabularies';
function prefixDeclarations(prefixes) {
    return [...prefixes]
        .filter(prefix => prefix in knownPrefixes)
        .map(prefix => `PREFIX ${prefix}: <${knownPrefixes[prefix]}>`)
        .join('\n');
}
export class SparqlTemplateResult {
    constructor(strings, values) {
        this.prefixes = new Set();
        this.strings = strings;
        this.values = values;
    }
    toString({ prefixes } = { prefixes: true }) {
        const l = this.strings.length - 1;
        let query = '';
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            const value = this.values[i];
            let valueStr;
            if (typeof value === 'string') {
                valueStr = value;
            }
            else {
                switch (value.termType) {
                    case 'Literal':
                        valueStr = `"${value.value}"`;
                        break;
                    case 'NamedNode':
                        {
                            const shrunk = shrink(value.value);
                            if (shrunk) {
                                this.prefixes.add(shrunk.split(':')[0]);
                                valueStr = shrunk;
                            }
                            else {
                                valueStr = `<${value.value}>`;
                            }
                        }
                        break;
                    default:
                        valueStr = value.value;
                }
            }
            query = s + valueStr;
        }
        query += this.strings[l];
        if (prefixes && this.prefixes.size > 0) {
            return `${prefixDeclarations(this.prefixes)}

${query}`;
        }
        return query;
    }
}
export const sparql = (strings, ...values) => new SparqlTemplateResult(strings, values);
