#!/usr/bin/env node

const { existsSync, readFileSync, writeFileSync } = require('fs')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const { defaultOptions, resolveRootPath, getEsbuildAnalyzerHtml } = require('./util')

const { argv } = yargs(hideBin(process.argv))

const { metafile, outfile } = { ...argv, ...defaultOptions }

const metafilePath = resolveRootPath(metafile)

const outfilePath = resolveRootPath(outfile)

if (existsSync(metafilePath)) {
  writeFileSync(outfilePath, getEsbuildAnalyzerHtml(JSON.parse(readFileSync(metafilePath).toString())))
} else {
  console.error('Error: ENOENT: no such file or directory, open ', metafilePath)
}
