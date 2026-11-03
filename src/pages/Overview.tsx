import { useState } from 'react'
import { ArrowUpRight, ArrowRight, CalendarDays, Globe2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkline } from '@/components/Sparkline'
import { SeriesPanel } from '@/components/SeriesPanel'
import { number, period } from '@/lib/format'
import { localizedCountry, localizedIndicator, useTranslation } from '@/lib/i18n'
import { events } from '@/content/events'
import type { Manifest } from '@/lib/types'

/** Surface the latest national observations while keeping their reference periods prominent. */
export function Overview({ manifest, dark }: { manifest: Manifest; dark: boolean }) {
  const { locale, t } = useTranslation()
  const [windowYears, setWindowYears] = useState(10)
  const [metric, setMetric] = useState('gdp-growth')
  const ids = ['gdp-quarter', 'ipca', 'selic', 'unemployment', 'usd', 'debt-gross']
  const entry = manifest.indicators.find(e => e.definition.id === metric)!
  const comparator = manifest.indicators.find(e => e.definition.id === 'gdp-growth')!
  const international = ['BRA', 'USA', 'CHL', 'ARG', 'MEX', 'CHN'].map(id => ({ country: manifest.countries.find(c => c.id === id)!, summary: comparator.summaries[id] }))
  return <>
    <div className="page-intro"><div><div className="eyebrow"><span className="live-dot" /> {t('overview.eyebrow')}</div><h1>{t('overview.title')}</h1><p>{t('overview.description')}</p></div><a className="button-link" href="#compare"><Globe2 size={16} /> {t('overview.compare')} <ArrowUpRight size={15} /></a></div>
    <div className="kpi-grid">{ids.map(id => {
      const e = manifest.indicators.find(item => item.definition.id === id)!
      const s = e.summaries.BRA
      const digits = id === 'usd' ? 4 : ['selic', 'ipca', 'debt-gross'].includes(id) ? 2 : 1
      return <a className="kpi-card" href={`#indicator/${id}`} key={id}><div className="kpi-title"><span>{localizedIndicator(locale, e.definition.id, e.definition.name, 'name')}</span><ArrowUpRight size={15} /></div><div className="kpi-main"><div><strong>{number(s?.value, digits)}</strong><span className="kpi-unit">{e.definition.unit}</span></div><Sparkline points={s?.sparkline ?? []} /></div><div className="kpi-bottom"><span>{s?.last ? period(s.last, e.definition.frequency) : t('table.unavailable')}</span><span className={`tiny-dot ${e.status === 'error' ? 'amber' : ''}`} /></div></a>
    })}</div>
    <div className="overview-columns"><div><div className="chart-controls"><div className="segmented" aria-label={t('compare.indicator')}>{['gdp-growth','inflation-world','unemployment-world'].map(id => <button className={metric === id ? 'active' : ''} key={id} onClick={() => setMetric(id)}>{t(`overview.metric.${id}`)}</button>)}</div><div className="segmented compact" aria-label={t('overview.timeWindow')}>{[[5,'5'],[10,'10'],[39,t('overview.all')]].map(([years,label]) => <button key={years} className={windowYears === years ? 'active' : ''} onClick={() => setWindowYears(Number(years))}>{years === 39 ? label : t('overview.years', { count: label })}</button>)}</div></div>
      <SeriesPanel entry={entry} countries={manifest.countries.filter(c => ['BRA','USA','CHL'].includes(c.id))} from={Math.max(1988, 2026 - windowYears + 1)} to={2026} version={manifest.generatedAt} dark={dark} compact />
    </div><aside className="panel world-panel"><div className="panel-heading"><div><div className="eyebrow">{t('compare.international')}</div><h2>{t('overview.worldTitle')}</h2><p>{localizedIndicator(locale, comparator.definition.id, comparator.definition.name, 'name')} · {t('overview.latestAnnual')}</p></div><Globe2 size={20} /></div><div className="world-list">{international.map(({country,summary}) => <a href={`#compare?indicator=gdp-growth&countries=BRA,${country.id}&from=1988&to=2026`} className={`world-row ${country.id === 'BRA' ? 'home-country' : ''}`} key={country.id}><span className="country-code" style={{ color: country.color }}>{country.id}</span><span className="world-name">{localizedCountry(locale, country.id, country.name)}<small>{summary?.last ?? t('table.unavailable')}</small></span><strong>{number(summary?.value,1)}<span>%</span></strong></a>)}</div><p className="small-note">{t('overview.referenceNote')}</p><a href="#compare" className="panel-link">{t('overview.exploreCountries')} <ArrowRight size={15} /></a></aside></div>
    <div className="bottom-grid"><section className="panel context-panel"><div className="panel-heading"><div><div className="eyebrow">{t('history.eyebrow')}</div><h2>{t('history.title')}</h2></div><ShieldCheck size={22} /></div><p>{t('history.description')}</p><div className="context-list">{events.filter(e => ['pnad2025','ppp2021','ec40'].includes(e.id)).map(e => <a href={`#history?event=${e.id}`} key={e.id}><CalendarDays size={15} /><div><span>{e.title}</span><small>{e.date.slice(0,4)} · {e.source}</small></div><ArrowUpRight size={15} /></a>)}</div></section><section className="idmi-teaser"><div className="eyebrow">{t('nav.idmi')}</div><Badge variant="outline">{t('idmi.experimental')}</Badge><h2>{t('idmi.title')}</h2><p>{t('idmi.description')}</p><Button asChild variant="secondary"><a href="#idmi">{t('nav.idmi')} <ArrowRight size={15} /></a></Button><div className="idmi-decoration" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div></section></div>
  </>
}
