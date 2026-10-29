import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, AriaComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chartPoints, number } from '@/lib/format'
import type { Country, Dataset, Indicator, TimelineEvent } from '@/lib/types'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, AriaComponent, CanvasRenderer])

interface Props { data: Dataset; definition: Indicator; countries: Country[]; from: number; to: number; events?: TimelineEvent[]; dark: boolean; height?: number }

/** Render country series with explicit null gaps, zoom, source-aware units, and accessible description. */
export default function Chart({ data, definition, countries, from, to, events = [], dark, height = 360 }: Props) {
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
    const relevant = events.filter(e => Number(e.date.slice(0, 4)) >= from && Number(e.date.slice(0, 4)) <= to).slice(-8)
    instance.current.setOption({
      animation: false,
      aria: { enabled: true, label: { description: `${definition.name}, em ${definition.unit}. Países: ${countries.map(c => c.name).join(', ')}. Período de ${from} a ${to}. Lacunas não são preenchidas. Eventos documentados são marcadores de contexto, não de causalidade. Os valores completos estão na tabela abaixo do gráfico.` } },
      color: countries.map(c => c.color),
      grid: { left: 20, right: 28, top: 48, bottom: 72, containLabel: true },
      tooltip: { trigger: 'axis', confine: true, padding: [10, 12], backgroundColor: dark ? '#1b3027' : '#fff', borderColor: grid, textStyle: { color: ink, fontSize: 12 }, axisPointer: { type: 'line', lineStyle: { color: '#7b9186', type: 'dashed' } }, valueFormatter: (value: number) => number(value, definition.id === 'hdi' ? 3 : 2) },
      legend: { top: 4, left: 12, textStyle: { color: ink, fontSize: 11 }, icon: 'roundRect', itemHeight: 4, itemWidth: 18, itemGap: 14, type: 'scroll' },
      xAxis: { type: 'time', min: Date.UTC(from, 0, 1), max: Date.UTC(to, 11, 31), axisLine: { lineStyle: { color: grid } }, axisTick: { show: false }, axisLabel: { color: ink, fontSize: 10, hideOverlap: true, margin: 12 }, splitLine: { show: false } },
      yAxis: { type: 'value', scale: true, axisLabel: { color: ink, fontSize: 10, margin: 12, formatter: (value: number) => number(value, Math.abs(value) < 1 ? 2 : 0, Math.abs(value) >= 10000) }, splitLine: { lineStyle: { color: grid, type: 'dashed', opacity: .85 } } },
      dataZoom: [{ type: 'inside', filterMode: 'none' }, { type: 'slider', bottom: 12, height: 20, borderColor: 'transparent', backgroundColor: dark ? '#263c31' : '#f1f4f0', fillerColor: '#39775b20', textStyle: { color: ink }, showDetail: false }],
      series: countries.map((country, index) => ({
        name: country.name, type: 'line', showSymbol: false, symbolSize: 5, connectNulls: false,
        lineStyle: { width: country.id === 'BRA' ? 3 : 2, type: index > 5 ? 'dashed' : 'solid' },
        emphasis: { focus: 'series', lineStyle: { width: 3.5 } },
        data: chartPoints(data.series.find(s => s.country === country.id)?.observations ?? [], definition.frequency, from, to),
        ...(index === 0 && relevant.length ? { markLine: { silent: true, symbol: 'none', lineStyle: { color: '#b79650', type: 'dashed', width: 1 }, label: { show: true, formatter: '{b}', color: ink, fontSize: 9, backgroundColor: dark ? '#1b3027dd' : '#fffffff2', padding: [2, 4], borderRadius: 3 }, data: relevant.map(e => ({ xAxis: Date.parse(e.date + 'T00:00:00Z'), name: e.date.slice(0, 4) })) } } : {}),
      })),
    }, true)
  }, [data, definition, countries, from, to, events, dark])
  return <div className="chart-wrapper">
    <div ref={container} style={{ height }} className="chart-canvas" role="img" aria-label={`${definition.name}. Consulte a tabela para os valores.`} />
    <div className="chart-foot"><span>{definition.unit} <span className="muted">· arraste a faixa para ampliar</span></span><Button variant="ghost" size="sm" onClick={() => {
      const url = instance.current?.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: dark ? '#15271f' : '#ffffff' })
      if (url) { const a = document.createElement('a'); a.href = url; a.download = `${definition.id}.png`; a.click() }
    }}><Download size={13} /> PNG</Button></div>
  </div>
}
