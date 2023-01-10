import React, { useRef, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider, Layout, Typography, Checkbox, theme } from 'antd'
import { Resizable } from 're-resizable'
import * as echarts from 'echarts/core'
import { map, add } from 'lodash-es'
import {
  StatsData,
  SiderWidthKey,
  CollapsedKey,
  getFileSize,
  isDark,
  addListenerPrefersColorScheme,
  renderChart
} from './util'

const { Sider, Content } = Layout
const { Title, Text } = Typography
const { Group: CheckboxGroup } = Checkbox

const { defaultAlgorithm, darkAlgorithm } = theme

const chunksList = Object.keys(StatsData)

const App = () => {
  const resizableRef = useRef()
  const chartRef = useRef()

  const [dark, setDark] = useState(isDark())

  const [collapsed, setCollapsed] = useState(JSON.parse(window.localStorage.getItem(CollapsedKey)))

  const [siderWidth, setSiderWidth] = useState(JSON.parse(window.localStorage.getItem(SiderWidthKey)) || 300)

  const [checkedChunks, setCheckedChunks] = useState(chunksList)
  const [indeterminate, setIndeterminate] = useState(false)
  const [checkAll, setCheckAll] = useState(true)

  const onCheckedChange = list => {
    setCheckedChunks(list)
    setIndeterminate(!!list.length && list.length < chunksList.length)
    setCheckAll(list.length === chunksList.length)
    renderChart(chartRef, {
      checkedChunks: list
    })
  }

  const onCheckAllChange = e => {
    const { checked } = e.target
    setCheckedChunks(checked ? [...chunksList] : [])
    setIndeterminate(false)
    setCheckAll(checked)
    renderChart(chartRef, {
      checkedChunks: checked ? chunksList : []
    })
  }

  useEffect(() => {
    addListenerPrefersColorScheme(value => {
      setDark(value)
    })
  }, [setDark])

  useEffect(() => {
    setTimeout(() => {
      renderChart(chartRef, { checkedChunks })
    }, 0)
  }, [chartRef])

  useEffect(() => {
    const myObserver = new ResizeObserver(() => {
      echarts.getInstanceByDom(chartRef.current)?.resize()
    })
    myObserver.observe(chartRef.current)
  }, [chartRef])

  return (
    <ConfigProvider
      componentSize="small"
      theme={{
        algorithm: dark ? darkAlgorithm : defaultAlgorithm
      }}
    >
      <Layout>
        <Resizable
          ref={resizableRef}
          defaultSize={{ width: collapsed ? 0 : siderWidth }}
          onResizeStop={(event, direction, refToElement, delta) => {
            const width = siderWidth + delta.width
            setSiderWidth(width)
            window.localStorage.setItem(SiderWidthKey, width)
          }}
          minWidth={collapsed ? 0 : 200}
          maxWidth={500}
          enable={{
            right: true,
            top: false,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
        >
          <Sider
            theme="light"
            width="100%"
            collapsible
            collapsedWidth={0}
            collapsed={collapsed}
            onCollapse={collapsed => {
              setCollapsed(collapsed)
              resizableRef.current.updateSize({
                width: collapsed ? 0 : siderWidth
              })
              window.localStorage.setItem(CollapsedKey, collapsed)
            }}
            zeroWidthTriggerStyle={{ top: 'auto', bottom: 50, opacity: 0.8 }}
          >
            <div style={{ height: '100vh', padding: 12, overflowY: 'auto' }}>
              <Title level={4}>Show chunks:</Title>
              <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                <Text>All (</Text>
                <Text strong>{getFileSize(map(Object.values(StatsData), 'bytes').reduce(add, 0))}</Text>
                <Text>)</Text>
                <Text italic> {chunksList.length}</Text>
              </Checkbox>
              <CheckboxGroup value={checkedChunks} onChange={onCheckedChange} style={{ display: 'block' }}>
                {Object.entries(StatsData).map(([k, v]) => {
                  const { bytes } = v
                  return (
                    <div key={k}>
                      <Checkbox value={k}>
                        <Text>{k}</Text>
                        <Text> (</Text>
                        <Text strong>{getFileSize(bytes)}</Text>
                        <Text>)</Text>
                      </Checkbox>
                    </div>
                  )
                })}
              </CheckboxGroup>
            </div>
          </Sider>
        </Resizable>
        <Content>
          <div ref={chartRef} style={{ height: '100vh' }} />
        </Content>
      </Layout>
    </ConfigProvider>
  )
}

createRoot(document.querySelector('#app')).render(<App />)
