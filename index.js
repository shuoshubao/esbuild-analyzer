const { writeFileSync } = require('fs')
const { defaultOptions, resolveRootPath, getEsbuildAnalyzerHtml } = require('./bin/util')
const { name } = require('./package')

const AnalyzerPlugin = options => {
  const { outfile = defaultOptions.outfile } = options || {}
  const outfilePath = resolveRootPath(outfile)
  return {
    name,
    setup(build) {
      if (build.initialOptions.metafile) {
        build.onEnd(result => {
          const { metafile } = result
          if (metafile) {
            writeFileSync(outfilePath, getEsbuildAnalyzerHtml(metafile))
          }
        })
      } else {
        console.log('please set:', { metafile: true })
      }
    }
  }
}

AnalyzerPlugin.getEsbuildAnalyzerHtml = getEsbuildAnalyzerHtml

module.exports = AnalyzerPlugin
