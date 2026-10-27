import { useState } from 'react'
import { ArrowUpRight, ArrowRight, CalendarDays, Globe2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkline } from '@/components/Sparkline'
import { SeriesPanel } from '@/components/SeriesPanel'
import { number, period } from '@/lib/format'
import { events } from '@/content/events'
import type { Manifest } from '@/lib/types'

/** Surface the latest national observations while keeping their reference periods prominent. */
export function Overview({ manifest, dark }: { manifest: Manifest; dark: boolean }) {
  const [windowYears, setWindowYears] = useState(10)
  const [metric, setMetric] = useState('gdp-growth')
  const ids = ['gdp-quarter', 'ipca', 'selic', 'unemployment', 'usd', 'debt-gross']
  const entry = manifest.indicators.find(e => e.definition.id === metric)!
  const comparator = manifest.indicators.find(e => e.definition.id === 'gdp-growth')!
  const international = ['BRA', 'USA', 'CHL', 'ARG', 'MEX', 'CHN'].map(id => ({ country: manifest.countries.find(c => c.id === id)!, summary: comparator.summaries[id] }))
  return <>
    <div className="page-intro"><div><div className="eyebrow"><span className="live-dot" /> OBSERVATÓRIO ECONÔMICO · 1988—2026</div><h1>A economia, em perspectiva.</h1><p>Os números do Brasil, seu contexto e o mundo ao redor.</p></div><a className="button-link" href="#compare"><Globe2 size={16} /> Comparar países <ArrowUpRight size={15} /></a></div>
    <div className="kpi-grid">{ids.map(id => {
      const e = manifest.indicators.find(item => item.definition.id === id)!
      const s = e.summaries.BRA
      const digits = id === 'usd' ? 4 : 1
      return <a className="kpi-card" href={`#indicator/${id}`} key={id}><div className="kpi-title"><span>{e.definition.name}</span><ArrowUpRight size={15} /></div><div className="kpi-main"><div><strong>{number(s?.value, digits)}</strong><span className="kpi-unit">{e.definition.unit}</span></div><Sparkline points={s?.sparkline ?? []} /></div><div className="kpi-bottom"><span>{s?.last ? period(s.last, e.definition.frequency) : 'Aguardando fonte'}</span><span className={`tiny-dot ${e.status === 'error' ? 'amber' : ''}`} /></div></a>
    })}</div>
    <div className="overview-columns"><div><div className="chart-controls"><div className="segmented" aria-label="Indicador principal">{[['gdp-growth','PIB real'],['inflation-world','Inflação'],['unemployment-world','Desemprego']].map(([id,label]) => <button className={metric === id ? 'active' : ''} key={id} onClick={() => setMetric(id)}>{label}</button>)}</div><div className="segmented compact" aria-label="Janela de tempo">{[[5,'5 anos'],[10,'10 anos'],[39,'Tudo']].map(([years,label]) => <button key={years} className={windowYears === years ? 'active' : ''} onClick={() => setWindowYears(Number(years))}>{label}</button>)}</div></div>
      <SeriesPanel entry={entry} countries={manifest.countries.filter(c => ['BRA','USA','CHL'].includes(c.id))} from={Math.max(1988, 2026 - windowYears + 1)} to={2026} version={manifest.generatedAt} dark={dark} compact />
    </div><aside className="panel world-panel"><div className="panel-heading"><div><div className="eyebrow">OLHAR INTERNACIONAL</div><h2>Brasil no mundo</h2><p>Crescimento real do PIB · último dado anual</p></div><Globe2 size={20} /></div><div className="world-list">{international.map(({country,summary}) => <a href={`#compare?indicator=gdp-growth&countries=BRA,${country.id}&from=1988&to=2026`} className={`world-row ${country.id === 'BRA' ? 'home-country' : ''}`} key={country.id}><span className="country-code" style={{ color: country.color }}>{country.id}</span><span className="world-name">{country.name}<small>{summary?.last ?? 'Sem dado'}</small></span><strong>{number(summary?.value,1)}<span>%</span></strong></a>)}</div><p className="small-note">Anos de referência podem diferir. Abra a comparação para escolher um período comum.</p><a href="#compare" className="panel-link">Explorar os 12 países <ArrowRight size={15} /></a></aside></div>
    <div className="bottom-grid"><section className="panel context-panel"><div className="panel-heading"><div><div className="eyebrow">POR TRÁS DOS NÚMEROS</div><h2>O método também faz parte da história</h2></div><ShieldCheck size={22} /></div><p>Uma revisão pode alterar o passado de uma série. Aqui, mudanças de pesquisa, base e cobertura acompanham os indicadores.</p><div className="context-list">{events.filter(e => ['pnad2025','ppp2021','ec40'].includes(e.id)).map(e => <a href={`#history?event=${e.id}`} key={e.id}><CalendarDays size={15} /><div><span>{e.title}</span><small>{e.date.slice(0,4)} · {e.source}</small></div><ArrowUpRight size={15} /></a>)}</div></section><section className="idmi-teaser"><div className="eyebrow">UMA LEITURA MULTIDIMENSIONAL</div><Badge variant="outline">Metodologia autoral · experimental</Badge><h2>Além do PIB.<br />Conheça o IDMI.</h2><p>Oito dimensões para investigar as condições materiais e institucionais. Fórmula aberta, limites explícitos e cobertura verificável.</p><Button asChild variant="secondary"><a href="#idmi">Explorar o índice <ArrowRight size={15} /></a></Button><div className="idmi-decoration" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div></section></div>
  </>
}
