import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, AriaComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chartPoints, number } from '@/lib/format'
import type { Country, Dataset, Indicator } from '@/lib/types'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, AriaComponent, CanvasRenderer])

interface Props { data: Dataset; definition: Indicator; countries: Country[]; from: number; to: number; dark: boolean; height?: number }

/** Render country series with explicit null gaps, zoom, source-aware units, and accessible description. */
export default function Chart({ data, definition, countries, from, to, dark, height = 360 }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const instance = useRef<echarts.EChartsType | null>(null)
  useEffect(() => {
    if (!container.current) return
    const chart = echarts.init(container.current, undefined, { renderer: 'canvas' })
    instance.current = chart
    const resize = new ResizeObserver(() => chart.resize())
    resize.observe(container.current)
    return () => { resize.disconnect(); chart.dispose(); instance.current = null }
  }, [])
  useEffect(() => {
    if (!instance.current) return
    const ink = dark ? '#d8e4df' : '#52645e'
    const grid = dark ? '#2c4038' : '#e6ece7'
    instance.current.setOption({
      animation: false,
      aria: { enabled: true, label: { description: `${definition.name}, em ${definition.unit}. Países: ${countries.map(c => c.name).join(', ')}. Período de ${from} a ${to}. Lacunas não são preenchidas. Eventos documentados e valores completos estão abaixo do gráfico.` } },
      color: countries.map(c => c.color),
      grid: { left: 24, right: 30, top: countries.length > 1 ? 54 : 24, bottom: 42, containLabel: true },
      tooltip: { trigger: 'axis', confine: true, padding: [12, 14], backgroundColor: dark ? '#1b3027' : '#fff', borderColor: grid, textStyle: { color: ink, fontSize: 13 }, axisPointer: { type: 'line', lineStyle: { color: '#7b9186', type: 'dashed' } }, valueFormatter: (value: number) => number(value, definition.id === 'hdi' ? 3 : 2) },
      legend: { show: countries.length > 1, top: 6, left: 12, textStyle: { color: ink, fontSize: 12 }, icon: 'roundRect', itemHeight: 5, itemWidth: 20, itemGap: 16, type: 'scroll' },
      xAxis: { type: 'time', min: Date.UTC(from, 0, 1), max: Date.UTC(to, 11, 31), axisLine: { lineStyle: { color: grid, width: 1.2 } }, axisTick: { show: false }, axisLabel: { color: ink, fontSize: 12, fontWeight: 550, hideOverlap: true, margin: 14 }, splitLine: { show: false } },
      yAxis: { type: 'value', scale: true, axisLabel: { color: ink, fontSize: 12, fontWeight: 550, margin: 14, formatter: (value: number) => number(value, Math.abs(value) < 1 ? 2 : 0, Math.abs(value) >= 10000) }, splitLine: { lineStyle: { color: grid, type: 'solid', opacity: .9 } } },
      series: countries.map((country, index) => ({
        name: country.name, type: 'line', showSymbol: false, symbolSize: 5, connectNulls: false,
        lineStyle: { width: country.id === 'BRA' ? 3.5 : 2.4, type: index > 5 ? 'dashed' : 'solid' },
        emphasis: { focus: 'series', lineStyle: { width: 4 } },
        data: chartPoints(data.series.find(s => s.country === country.id)?.observations ?? [], definition.frequency, from, to),
      })),
    }, true)
  }, [data, definition, countries, from, to, dark])
  return <div className="chart-wrapper">
    <div ref={container} style={{ height }} className="chart-canvas" role="img" aria-label={`${definition.name}. Consulte a tabela para os valores.`} />
    <div className="chart-foot"><span>{definition.unit}</span><Button variant="ghost" size="sm" onClick={() => {
      const url = instance.current?.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: dark ? '#15271f' : '#ffffff' })
      if (url) { const a = document.createElement('a'); a.href = url; a.download = `${definition.id}.png`; a.click() }
    }}><Download size={13} /> PNG</Button></div>
  </div>
}
