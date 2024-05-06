# Changelog

## 1.3.1

### Patch Changes

- 30d5c7f: Explicitly declare return types of tag function to avoid "TS2742: The inferred type of 'X' cannot be named without a reference to '/node_modules/@tpluscode/rdf-string/lib/TemplateResult.js'. This is likely not portable. A type annotation is necessary." errors

## 1.3.0

### Minor Changes

- 2c4b2ce: Re-export `Options` types from each syntax module

## 1.2.1

### Patch Changes

- 4fa006f: This fixes the import of the following modules by explicitly adding the `.js` extension:

  - `@rdfjs/environment/Environment`
  - `@rdfjs/term-map/Factory`

## 1.2.0

### Minor Changes

- 4f51f6b: Remove dependency on `@zazuko/env` to improve browser compatibility

## 1.1.3

### Patch Changes

- 62f331b: Remove usages of `rdf-js`

## 1.1.2

### Patch Changes

- 75d1f4b: More strict dependency on `@rdfjs/environment`

## 1.1.1

### Patch Changes

- 012b73f: Support `@zazuko/env` v2

## 1.1.0

### Minor Changes

- 4135a1f: Use `@zazuko/env` instead of separate packages
- 7ecd35d: Add option to `turtle` and `sparql` to disable prefixed URIs

## 1.0.3

### Patch Changes

- 5cc2988: Relax dependency on `@zazuko/prefixes`

## 1.0.2

### Patch Changes

- 907f149: Export `*Options` interfaces to fix errors like `TS4053 Return type of public method from exported class has or is using name '*Options' from external module "Y" but cannot be named`

## 1.0.1

### Patch Changes

- 1b627ee: Installing from NPM tried to call `patch-package`

## 1.0.0

### Major Changes

- 8b7597c: The package is now only ESM
- 8b7597c: Use `@zazuko/prefixes` instead of `@zazuko/rdf-vocabularies`

## 0.2.27

### Patch Changes

- 3cbfa26: Add `prefixes` argument to turtle and SPARQL option (closes #3)

## 0.2.26

### Patch Changes

- 0e2d234: Updated `@tpluscode/rdf-ns-builders` to v2

## 0.2.25

### Patch Changes

- b0e69ef: Support for interpolating any iterator types

## 0.2.24

### Patch Changes

- 4628196: Update `@tpluscode/rdf-ns-builders` and typescript RDF/JS types

## 0.2.23

### Patch Changes

- 388fdd0: Array: remove recursion from interpolating arrays

## 0.2.22

### Patch Changes

- b98d78c: Relax dependency on @zazuko/rdf-vocabularies

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.2.21](https://github.com/tpluscode/rdf-string/compare/v0.2.20...v0.2.21) (2020-11-02)

### [0.2.20](https://github.com/tpluscode/rdf-string/compare/v0.2.19...v0.2.20) (2020-09-18)

### [0.2.19](https://github.com/tpluscode/rdf-string/compare/v0.2.18...v0.2.19) (2020-09-18)

### [0.2.18](https://github.com/tpluscode/rdf-string/compare/v0.2.17...v0.2.18) (2020-08-24)

### [0.2.17](https://github.com/tpluscode/rdf-string/compare/v0.2.16...v0.2.17) (2020-08-03)

### Features

- **sparql:** interpolating quads and datasets with patterns ([bc0a32f](https://github.com/tpluscode/rdf-string/commit/bc0a32f8f89773bce79c19d48eda1a4a71e001b5))

### [0.2.16](https://github.com/tpluscode/rdf-string/compare/v0.2.15...v0.2.16) (2020-07-01)

### [0.2.15](https://github.com/tpluscode/rdf-string/compare/v0.2.14...v0.2.15) (2020-06-11)

### [0.2.14](https://github.com/tpluscode/rdf-string/compare/v0.2.13...v0.2.14) (2020-06-08)

### [0.2.13](https://github.com/tpluscode/rdf-string/compare/v0.2.12...v0.2.13) (2020-06-07)

### [0.2.12](https://github.com/tpluscode/rdf-string/compare/v0.2.11...v0.2.12) (2020-05-21)

### [0.2.11](https://github.com/tpluscode/rdf-string/compare/v0.2.10...v0.2.11) (2020-04-18)

### Bug Fixes

- properly escape multiple literals and sepcial chars ([eb420cc](https://github.com/tpluscode/rdf-string/commit/eb420cc3869861844a49b0518589feb9f884c48b))

### [0.2.10](https://github.com/tpluscode/rdf-string/compare/v0.2.9...v0.2.10) (2020-04-08)

### Features

- reduce arrays by interpolating individual items ([3c47ccc](https://github.com/tpluscode/rdf-string/commit/3c47ccc1cf18778de1d4a82291f2875885bed610))

### [0.2.9](https://github.com/tpluscode/rdf-string/compare/v0.2.8...v0.2.9) (2020-04-03)

### Features

- **turtle:** support base URI ([d5eb53c](https://github.com/tpluscode/rdf-string/commit/d5eb53c5006faca7bb23ce4f4f67dc7353edf58a))

### [0.2.8](https://github.com/tpluscode/rdf-string/compare/v0.2.7...v0.2.8) (2020-02-27)

### Features

- make it possible to create custom interpolatable objects ([24c60b1](https://github.com/tpluscode/rdf-string/commit/24c60b101ad7c5080dc0d46c624e4651677f8825))

### Bug Fixes

- allow any object to be interpolated value ([87184eb](https://github.com/tpluscode/rdf-string/commit/87184ebe55909bdd0cb7e1348bf61d8ef8709a49))

### [0.2.7](https://github.com/tpluscode/rdf-string/compare/v0.2.6...v0.2.7) (2020-02-27)

### Features

- interpolating built-in JS types ([85151cc](https://github.com/tpluscode/rdf-string/commit/85151ccfea147a165d7aa3c7f9bee815e401eaab))

### [0.2.6](https://github.com/tpluscode/rdf-string/compare/v0.2.5...v0.2.6) (2020-02-27)

### Features

- **turtle:** compress output by removing subject/predicate repetition ([0d2f121](https://github.com/tpluscode/rdf-string/commit/0d2f121c510cd3327f56fc7317116db7e34685ca))
- **turtle:** options to do cheap compression ([618ffa0](https://github.com/tpluscode/rdf-string/commit/618ffa0d1ee12bc961fb95023b20b8c11f4c1959))
- added ntriples support ([62aef77](https://github.com/tpluscode/rdf-string/commit/62aef77774bcbe545cde840ca0492bb750fec108))

### [0.2.5](https://github.com/tpluscode/rdf-string/compare/v0.2.4...v0.2.5) (2020-02-26)

### Bug Fixes

- **dep:** now data model package is missing completely 😖 ([8aade7c](https://github.com/tpluscode/rdf-string/commit/8aade7cf944a8d5c443c750c2c9830a590ed6eb2))

### [0.2.4](https://github.com/tpluscode/rdf-string/compare/v0.2.3...v0.2.4) (2020-02-26)

### Bug Fixes

- **dep:** data model package was not a runtime dependency ([7582da1](https://github.com/tpluscode/rdf-string/commit/7582da16bda1fd7e687288e439ca38b15185a013))

### [0.2.3](https://github.com/tpluscode/rdf-string/compare/v0.2.2...v0.2.3) (2020-02-26)

### Bug Fixes

- **dep:** namespace builder package was not a runtime dependency ([6196216](https://github.com/tpluscode/rdf-string/commit/61962165f112957c3cd2d1aa981c4aca299c257c))

### [0.2.2](https://github.com/zazuko/rdf-string/compare/v0.2.1...v0.2.2) (2020-02-25)

### [0.2.1](https://github.com/zazuko/rdf-string/compare/v0.2.0...v0.2.1) (2020-02-25)

### Features

- **turtle:** defaultGraph is serialized with option for named ([1f087c1](https://github.com/zazuko/rdf-string/commit/1f087c14bce87741fae4d10f2ae4cda6aa43b868))
- turtle initial version ([fc83c08](https://github.com/zazuko/rdf-string/commit/fc83c08086b8c7f3ff6a9f43363915982f18bb74))

### Bug Fixes

- **sparql:** remove superfluous blank lines added in head ([d4b5f0f](https://github.com/zazuko/rdf-string/commit/d4b5f0f99cfd24111822b1b3817cf05395c6d7bd))

## [0.2.0](https://github.com/zazuko/rdf-string/compare/v0.1.0...v0.2.0) (2020-02-24)

### ⚠ BREAKING CHANGES

- renamed parameter of SparqlOptions

### Bug Fixes

- base was not applied to nested templates ([7b443e4](https://github.com/zazuko/rdf-string/commit/7b443e48a1cbdd1ab1f03105486fe6e4156409ee))

## [0.1.0](https://github.com/zazuko/rdf-string/compare/v0.0.8...v0.1.0) (2020-02-24)

### ⚠ BREAKING CHANGES

- plain string will not be wrapped as RDF/JS literal

### Bug Fixes

- it's not possible to interpolate plain string ([1fc417a](https://github.com/zazuko/rdf-string/commit/1fc417a11e4340a3e41c53bbff3bb0500902e7bb))

### [0.0.8](https://github.com/zazuko/rdf-string/compare/v0.0.7...v0.0.8) (2020-02-23)

### [0.0.8](https://github.com/zazuko/rdf-string/compare/v0.0.7...v0.0.8) (2020-02-23)

### [0.0.7](https://github.com/zazuko/rdf-string/compare/v0.0.6...v0.0.7) (2020-02-23)

### Bug Fixes

- **sparql:** variables were stringified without question mark ([0b05db7](https://github.com/zazuko/rdf-string/commit/0b05db7b3fcef2912e122cd087034deed6a0560e))

### [0.0.6](https://github.com/zazuko/rdf-string/compare/v0.0.5...v0.0.6) (2020-02-22)

### Features

- support BASE ([5cca6c7](https://github.com/zazuko/rdf-string/commit/5cca6c7d8474095dd500288c25b8d985d5d19b4e))

### [0.0.5](https://github.com/zazuko/rdf-string/compare/v0.0.4...v0.0.5) (2020-02-21)

### [0.0.4](https://github.com/zazuko/rdf-string/compare/v0.0.3...v0.0.4) (2020-02-21)

### Bug Fixes

- type SparqlValue must be generic ([32ab34e](https://github.com/zazuko/rdf-string/commit/32ab34e21d444876ffa76be1071b25a9bb55164d))

### [0.0.3](https://github.com/zazuko/rdf-string/compare/v0.0.2...v0.0.3) (2020-02-21)

### Bug Fixes

- improve exports ([ed96c92](https://github.com/zazuko/rdf-string/commit/ed96c92b0c84cd3b185b3f5e2f1fc146c626e774))

### [0.0.2](https://github.com/zazuko/rdf-string/compare/v0.0.1...v0.0.2) (2020-02-21)

### 0.0.1 (2020-02-21)

### Features

- **sparql:** first features for SPARQL template string ([5d68055](https://github.com/zazuko/rdf-string/commit/5d68055650ea5d753cd893dc94c0692b5e105528))
- **sparql:** nested templates and null/undefined ([56f5549](https://github.com/zazuko/rdf-string/commit/56f5549265cf4059e74f6d76df550d22b1e456c4))
- **sparql:** shrink URIs and extract prefixes ([5da6aef](https://github.com/zazuko/rdf-string/commit/5da6aefbe5ba637bf3fdfab9296b788bb41ef21d))
