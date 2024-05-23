---
"@tpluscode/rdf-string": patch
---

In cases when 1.x and 0.x versions were mixed in a project, building an RDF string would fail trying to access the RDF/JS Environment which is required by the latest versions
