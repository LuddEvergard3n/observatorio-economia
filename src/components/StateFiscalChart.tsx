import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { stateFiscalSnapshot, stateFiscalYear } from '@/content/stateFiscal'
import { useTranslation } from '@/lib/i18n'

echarts.use([BarChart, AriaComponent, GridComponent, TooltipComponent, CanvasRenderer])

type View = 'revenue' | 'transfers' | 'share'

/** Compare state-attributed federal collection with Union cash transfers using one readable ranking at a time. */
export default function StateFiscalChart({ dark }: { dark: boolean }) {
  const { locale, t } = useTranslation()
  const [view, setView] = useState<View>('revenue')
  const container = useRef<HTMLDivElement>(null)
  const chart = useRef<echarts.EChartsType | null>(null)
  const rows = useMemo(() => stateFiscalSnapshot.map(row => ({ ...row, share: row.transferMillions / row.revenueMillions * 100 })).sort((a, b) => (view === 'share' ? b.share - a.share : view === 'transfers' ? b.transferMillions - a.transferMillions : b.revenueMillions - a.revenueMillions)), [view])
  const money = (millions: number) => new Intl.NumberFormat(locale, { style:'currency', currency:'BRL', notation:'compact', maximumFractionDigits:1 }).format(millions * 1_000_000)
  const value = (row: typeof rows[number]) => view === 'share' ? row.share : view === 'transfers' ? row.transferMillions : row.revenueMillions

  useEffect(() => {
    if (!container.current) return
    const instance = echarts.init(container.current, undefined, { renderer:'canvas' })
    chart.current = instance
    const resize = new ResizeObserver(() => instance.resize())
    resize.observe(container.current)
    return () => { resize.disconnect(); instance.dispose(); chart.current = null }
  }, [])
  useEffect(() => {
    if (!chart.current) return
    const ink = dark ? '#d8e4df' : '#52645e'
    const grid = dark ? '#2c4038' : '#e6ece7'
    const mobile = window.matchMedia('(max-width: 760px)').matches
    chart.current.setOption({
      animation:false,
      aria:{ enabled:true, label:{ description:t('taxes.statesAria', { year:stateFiscalYear }) } },
      grid:{ left:mobile ? 82 : 112, right:mobile ? 56 : 72, top:10, bottom:mobile ? 10 : 28 },
      tooltip:{ trigger:'axis', axisPointer:{ type:'shadow' }, confine:true, backgroundColor:dark ? '#1b3027' : '#fff', borderColor:grid, textStyle:{ color:ink }, formatter:(items: unknown) => {
        const item = (items as Array<{ dataIndex:number }>)[0]
        const row = rows[item.dataIndex]
        return `<strong>${row.uf} · ${row.name}</strong><br/>${t('taxes.revenue')}: ${money(row.revenueMillions)}<br/>${t('taxes.transfers')}: ${money(row.transferMillions)}<br/>${t('taxes.returnRate')}: ${new Intl.NumberFormat(locale, { maximumFractionDigits:1 }).format(row.share)}%`
      } },
      xAxis:{ type:'value', axisLine:{ show:false }, axisTick:{ show:false }, splitLine:{ lineStyle:{ color:grid } }, axisLabel:{ show:!mobile, color:ink, formatter:(amount:number) => view === 'share' ? `${Math.round(amount)}%` : money(amount) } },
      yAxis:{ type:'category', inverse:true, data:rows.map(row => `${row.uf} · ${row.name}`), axisTick:{ show:false }, axisLine:{ lineStyle:{ color:grid } }, axisLabel:{ color:ink, fontSize:mobile ? 9 : 11, width:mobile ? 72 : 98, overflow:'truncate' } },
      series:[{ type:'bar', data:rows.map(value), barMaxWidth:15, itemStyle:{ color:view === 'revenue' ? '#08745a' : view === 'transfers' ? '#b79650' : '#5276a7', borderRadius:[0,3,3,0] }, label:{ show:true, position:'right', color:ink, fontSize:10, formatter:({ value:amount }: { value:number }) => view === 'share' ? `${new Intl.NumberFormat(locale, { maximumFractionDigits:0 }).format(amount)}%` : money(amount) } }],
    }, true)
  }, [dark, locale, rows, t, view])

  return <>
    <div className="state-fiscal-controls segmented" role="group" aria-label={t('taxes.chartView')}>
      {(['revenue','transfers','share'] as View[]).map(item => <button type="button" key={item} className={view === item ? 'active' : ''} aria-pressed={view === item} onClick={() => setView(item)}>{t(`taxes.${item === 'share' ? 'returnRate' : item}`)}</button>)}
    </div>
    <div ref={container} className="state-fiscal-chart" role="img" aria-label={t('taxes.statesAria', { year:stateFiscalYear })}/>
  </>
}
