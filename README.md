# esbuild-analyzer

A visualizer esbuild analyzer

# Examples

- https://shuoshubao.github.io/esbuild-analyzer
- https://shuoshubao.github.io/esbuild-analyzer/demo1

# Install

```sh
npm i D esbuild-analyzer
```

# Usage

## api

### .build

```js
const esbuild = require('esbuild')
const AnalyzerPlugin = require('esbuild-analyzer')

esbuild.build({
  entryPoints: ['lib/index.js'],
  outdir: 'dist',
  bundle: true,
  metafile: true,
  plugins: [AnalyzerPlugin()]
})
```

### .buildSync

```js
const { writeFileSync } = require('fs')
const esbuild = require('esbuild')
const { getEsbuildAnalyzerHtml } = require('esbuild-analyzer')

const result = esbuild.buildSync({
  entryPoints: ['lib/index.js'],
  outdir: 'dist',
  bundle: true,
  metafile: true
})

const html = getEsbuildAnalyzerHtml(result.metafile)

writeFileSync('EsbuildAnalyzer.html', html)
```

## cli

```sh
# https://esbuild.github.io/api/#metafile
esbuild lib/index.js --outdir=dist --bundle --metafile=meta.json
```

```sh
npx esbuild-analyzer

# Custom parameters
npx esbuild-analyzer --metafile=meta.json --outfile=EsbuildAnalyzer.html
```
