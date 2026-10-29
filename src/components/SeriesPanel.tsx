import { lazy, Suspense, useState } from 'react'
import { ArrowDownToLine, CalendarDays, ExternalLink, Info, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable } from './DataTable'
import { useDataset } from '@/lib/data'
import { csv, download, frequencies, number, period, timestamp } from '@/lib/format'
import { eventsForIndicator } from '@/content/events'
import { localizedCountry, localizedIndicator, useTranslation } from '@/lib/i18n'
import type { Country, Entry } from '@/lib/types'

const Chart = lazy(() => import('./Chart'))

/** Show a published series, its audit trail and export controls without manufacturing missing data. */
export function SeriesPanel({ entry, countries, from, to, version, dark, compact = false }: { entry: Entry; countries: Country[]; from: number; to: number; version: string; dark: boolean; compact?: boolean }) {
  const { locale, t } = useTranslation()
  const definition = entry.definition
  const enabled = Object.values(entry.summaries).some(s => s.count > 0)
  const { data, loading, error } = useDataset(definition.id, version, enabled)
  const [annotate, setAnnotate] = useState(true)
  const [message, setMessage] = useState('')
  const applicable = eventsForIndicator(definition.id, definition.category)
  const related = applicable.filter(event => event.type === 'method')
  const periodEvents = applicable.filter(event => Number(event.date.slice(0, 4)) >= from && Number(event.date.slice(0, 4)) <= to)
  const readings = data ? countries.flatMap(country => {
    const latest = data.series.find(series => series.country === country.id)?.observations
      .filter(observation => observation.value != null && Number(observation.period.slice(0, 4)) >= from && Number(observation.period.slice(0, 4)) <= to)
      .sort((a, b) => a.period.localeCompare(b.period)).at(-1)
    return latest ? [{ country, latest }] : []
  }) : []
  return <section className="panel series-panel" aria-label={localizedIndicator(locale, definition.id, definition.name, 'name')}>
    <div className="panel-heading"><div><div className="eyebrow">{compact ? t('series.historical') : t(`frequency.${definition.frequency}`)}</div><h2>{localizedIndicator(locale, definition.id, definition.name, 'name')}</h2><p>{localizedIndicator(locale, definition.id, definition.description, 'description')}</p></div><Badge variant="outline">{definition.unit}</Badge></div>
    {entry.status === 'error' && <div className="notice warning"><Info size={16} /><span>A última consulta à fonte falhou. {entry.lastSuccess ? `Exibindo o conjunto preservado de ${timestamp(entry.lastSuccess)}.` : 'A série ficará disponível após uma coleta válida.'}</span></div>}
    {related.length > 0 && <div className="method-alert"><strong>{t('series.comparisonChanges')}</strong>{related.map(event => <article key={event.id}><div><span>{event.date.slice(0,4)} · {event.title}</span>{event.administration && <small>{t('series.government')} {event.administration}</small>}{event.responsible && <small>{t('series.methodOwner')} {event.responsible}</small>}</div>{event.before && event.after && <p><b>{t('series.before')}</b> {event.before}<br/><b>{t('series.after')}</b> {event.after}</p>}<a href={event.url} target="_blank" rel="noreferrer">{t('series.primarySource')} <ExternalLink size={12}/></a></article>)}</div>}
    {loading ? <div className="chart-loading" role="status"><span className="loading-bar" />{t('series.loading')}</div> : error ? <div className="empty-state"><Info /><h3>{t('app.catalogFailed')}</h3><p>{error}</p><Button variant="outline" onClick={() => window.location.reload()}>{t('app.retry')}</Button></div> : !data ? <div className="empty-state"><Info /><h3>{t('series.unavailable')}</h3><p>{definition.notes}</p><a href={definition.sourceUrl} target="_blank" rel="noreferrer" className="text-link">{t('series.primarySource')} <ExternalLink size={14} /></a></div> : <>
      {!compact && readings.length > 0 && <section className="chart-reading" aria-label={t('chart.quickReading')}><div><span>{t('chart.quickReading')}</span><p>{t('chart.latest')}</p></div><div className="chart-reading-list">{readings.slice(0, 6).map(({ country, latest }) => <article key={country.id}><span style={{ background: country.color }} /><div><strong>{localizedCountry(locale, country.id, country.name)}</strong><small>{period(latest.period, definition.frequency)}</small></div><b>{number(latest.value, definition.id === 'hdi' ? 3 : 2)} <small>{definition.unit}</small></b></article>)}</div>{readings.length > 6 && <p className="small-note">{t('chart.moreCountries', { count: readings.length - 6 })}</p>}</section>}
      <Suspense fallback={<div className="chart-loading">{t('series.preparing')}</div>}><Chart data={data} definition={definition} countries={countries} from={from} to={to} dark={dark} height={compact ? 310 : 420} /></Suspense>
      {!compact && annotate && periodEvents.length > 0 && <section className="chart-context" aria-label={t('chart.events')}><div className="chart-context-heading"><CalendarDays size={15}/><div><strong>{t('chart.events')}</strong><span>{periodEvents.length}</span></div></div><div className="chart-context-list">{periodEvents.map(event => <a href={`#history?event=${event.id}`} key={event.id}><span>{event.date.slice(0, 4)}</span><b>{event.title}</b><small>{event.type === 'method' ? 'Método' : event.type === 'law' ? 'Lei / norma' : 'Contexto'}</small></a>)}</div><p>{t('chart.context')} <a href="#history">{t('chart.history')}</a></p></section>}
      <div className="series-toolbar"><label className="check-label"><input type="checkbox" checked={annotate} onChange={e => setAnnotate(e.target.checked)} /> {t('chart.toggle')}</label><div className="export-actions"><Button variant="ghost" size="sm" onClick={() => download(csv(data, definition, countries.map(c => c.id), from, to), `${definition.id}-${from}-${to}.csv`, 'text/csv;charset=utf-8')}><ArrowDownToLine size={14} /> CSV</Button>{!compact && <Button variant="ghost" size="sm" onClick={() => download(JSON.stringify({ definition, ...data, series: data.series.filter(s => countries.some(c => c.id === s.country)).map(s => ({ ...s, observations: s.observations.filter(p => Number(p.period.slice(0, 4)) >= from && Number(p.period.slice(0, 4)) <= to) })) }, null, 2), `${definition.id}.json`, 'application/json')}>JSON</Button>}<Button variant="ghost" size="sm" onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}#compare?indicator=${definition.id}&countries=${countries.map(c => c.id).join(',')}&from=${from}&to=${to}`
        try { await navigator.clipboard.writeText(url); setMessage(t('series.linkCopied')) } catch { setMessage(url) }
      }}><LinkIcon size={14} /> {t('series.share')}</Button></div></div>
      {message && <p className="feedback" role="status">{message}</p>}
      {!compact && <Tabs defaultValue="table" className="detail-tabs"><TabsList><TabsTrigger value="table">{t('series.data')}</TabsTrigger><TabsTrigger value="method">{t('series.method')}</TabsTrigger><TabsTrigger value="source">{t('series.origin')}</TabsTrigger></TabsList>
        <TabsContent value="table"><DataTable data={data} definition={definition} countries={countries} from={from} to={to} /></TabsContent>
        <TabsContent value="method"><div className="prose-content"><p>{definition.notes || 'Consulte a documentação da fonte para a definição e as revisões desta série.'}</p><p>Lacunas permanecem vazias. A data de coleta não é a data de referência nem necessariamente a data de publicação.</p>{related.map(event => <article className="method-item" key={event.id}><span>{event.date}</span><h3>{event.title}</h3><p>{event.description}</p><a href={event.url} target="_blank" rel="noreferrer">Documento da fonte <ExternalLink size={12} /></a></article>)}</div></TabsContent>
        <TabsContent value="source"><div className="prose-content"><h3>{definition.source}</h3><p>{data.sourceNote}</p><p>Última coleta bem-sucedida: {timestamp(data.retrievedAt)}. As respostas originais são identificadas pelos hashes abaixo.</p><a className="text-link" href={definition.sourceUrl} target="_blank" rel="noreferrer">Abrir documentação <ExternalLink size={13} /></a><details><summary>Requisições e hashes SHA-256</summary>{data.provenance.map(item => <div className="provenance" key={item.url}><a href={item.url} target="_blank" rel="noreferrer">{item.url}</a><code>{item.sha256}</code></div>)}</details></div></TabsContent>
      </Tabs>}
    </>}
    <div className="source-line"><span>Fonte: {definition.source}</span><a href={definition.sourceUrl} target="_blank" rel="noreferrer">Ver origem <ExternalLink size={12} /></a></div>
  </section>
}
