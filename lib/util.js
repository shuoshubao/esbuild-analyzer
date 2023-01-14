import * as echarts from 'echarts/core'
import { TreemapChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { get, map, add, cloneDeep, isPlainObject, pick } from 'lodash-es'
import traverse from 'traverse'
import filesize from 'filesize'
import { inflateRaw } from 'pako/dist/pako_inflate.js'
import { name as pkgName } from '../package'

echarts.use([TreemapChart, TooltipComponent, CanvasRenderer])

export const getFileSize = size => {
  return filesize(size || 0, { base: 2, standard: 'jedec' })
}

const inflateData = str => {
  return JSON.parse(inflateRaw(new Uint8Array(str.split(',')), { to: 'string' }))
}

export const SiderWidthKey = [pkgName, 'sider-width'].join('-')

export const CollapsedKey = [pkgName, 'sider-collapsed'].join('-')

window.OriginalStatsData = window.StatsData

window.StatsData = inflateData(window.OriginalStatsData)

const { StatsData } = window

export { StatsData }

export const AllSize = map(Object.values(StatsData), 'bytes').reduce(add, 0)

const perf = obj => {
  const temp = cloneDeep(obj)
  traverse(temp).forEach(function () {
    if (this.notRoot) {
      this.after(function () {
        if (this.node?.children?.length === 1) {
          this.update(this.node.children[0])
        }
      })
    }
  })

  traverse(temp).forEach(function () {
    if (this.notRoot) {
      this.before(function () {
        if (isPlainObject(this.node)) {
          const name = this.node.path.replace(get(temp, [...this.path.slice(0, -2), 'path'].join('.')) + '/', '')
          this.update({ name, ...this.node })
        }
      })
    }
  })
  return temp
}

const pathsToTree = (paths = [], inputs = {}) => {
  const resultKey = Symbol()
  const result = []
  const level = { [resultKey]: result }

  paths.sort().forEach(path => {
    path.split('/').reduce((prev, cur, index, arr) => {
      if (!prev[cur]) {
        prev[cur] = {
          [resultKey]: []
        }
        const curPath = arr.slice(0, index + 1).join('/')
        const item = inputs[curPath]

        prev[resultKey].push({
          path: curPath,
          value: item?.bytesInOutput,
          children: prev[cur][resultKey]
        })
      }

      return prev[cur]
    }, level)
  })
  return perf(result)
}

export const isDark = () => {
  const { matchMedia } = window
  return matchMedia('(prefers-color-scheme: dark)').matches
}

export const addListenerPrefersColorScheme = callback => {
  const { matchMedia } = window
  matchMedia('(prefers-color-scheme: dark)').addListener(mediaQueryList => {
    callback(mediaQueryList.matches)
  })
  matchMedia('(prefers-color-scheme: light)').addListener(mediaQueryList => {
    callback(!mediaQueryList.matches)
  })
}

export const renderChart = (chartRef, { checkedChunks, query }) => {
  if (!checkedChunks.length) {
    echarts.getInstanceByDom(chartRef.current)?.dispose()
    return
  }

  const treeData = Object.entries(pick(StatsData, checkedChunks)).map(([k, v]) => {
    const { inputs, bytes } = v
    const moduleNameList = Object.keys(inputs).filter(v => {
      if (query) {
        return v.toLowerCase().includes(query.toLowerCase())
      }
      return true
    })
    return {
      name: k,
      path: k,
      value: bytes,
      children: pathsToTree(moduleNameList, inputs)
    }
  })

  if (treeData.map(v => v.children.length).reduce(add, 0) === 0) {
    echarts.getInstanceByDom(chartRef.current)?.dispose()
    return
  }

  const option = {
    tooltip: {
      formatter: function (info) {
        const { value, data } = info
        const { path } = data
        return [
          '<div style="color: #000000d9;">',
          `<div>Size: <strong>${getFileSize(value)}</strong></div>`,
          `<div>Path: <strong>${path}</strong></div>`,
          '</div>'
        ].join('')
      }
    },
    series: [
      {
        name: 'Root',
        type: 'treemap',
        leafDepth: query ? null : 5,
        width: '100%',
        height: '100%',
        label: {
          padding: 0
        },
        upperLabel: {
          show: true,
          height: 30,
          textBorderColor: 'inherit',
          backgroundColor: 'transparent'
        },
        breadcrumb: {
          show: true,
          height: 30,
          bottom: 10
        },
        roam: false,
        itemStyle: {
          borderColor: 'transparent'
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#999',
              borderWidth: 5,
              gapWidth: 5
            },
            upperLabel: {
              show: false
            }
          },
          {
            itemStyle: {
              borderWidth: 3,
              gapWidth: 3,
              borderColorSaturation: 0.55
            }
          },
          {
            itemStyle: {
              borderWidth: 3,
              gapWidth: 3,
              borderColorSaturation: 0.6
            }
          },
          {
            itemStyle: {
              borderWidth: 3,
              gapWidth: 3,
              borderColorSaturation: 0.65
            }
          },
          {
            itemStyle: {
              borderWidth: 3,
              gapWidth: 3,
              borderColorSaturation: 0.7
            }
          },
          {
            itemStyle: {
              borderWidth: 3,
              gapWidth: 3,
              borderColorSaturation: 0.75
            }
          }
        ],
        data: treeData
      }
    ]
  }

  const myChart = echarts.init(chartRef.current)

  setTimeout(() => {
    myChart.setOption(option)
  }, 0)

  window.addEventListener('resize', () => {
    myChart.resize()
  })
}
