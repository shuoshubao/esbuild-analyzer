const { readFileSync } = require('fs')
const { resolve } = require('path')
const { deflateRaw } = require('pako')
const { name, version } = require('../package')

const cwd = process.cwd()

const resolveRootPath = (to = '') => {
  return resolve(cwd, to)
}

const getFileContent = fileName => {
  return readFileSync(resolve(__dirname, fileName)).toString()
}

const deflateData = data => {
  return deflateRaw(JSON.stringify(data || {}).toString())
}

const toPascalCase = str => {
  return `${str}`
    .toLowerCase()
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(new RegExp(/\s+(.)(\w*)/, 'g'), ($1, $2, $3) => `${$2.toUpperCase() + $3}`)
    .replace(new RegExp(/\w/), s => s.toUpperCase())
}

const defaultOptions = {
  metafile: 'meta.json',
  outfile: `${toPascalCase(name)}.html`
}

const getEsbuildAnalyzerHtml = metafile => {
  const { outputs } = metafile
  return getFileContent('../index.html')
    .replace('dist/index.js', `https://unpkg.com/${name}@${version}/dist/index.js`)
    .replace('<script src="docs/meta.js">', `<script>window.StatsData = '${deflateData(outputs)}'`)
}

module.exports = {
  resolveRootPath,
  defaultOptions,
  toPascalCase,
  getEsbuildAnalyzerHtml
}
