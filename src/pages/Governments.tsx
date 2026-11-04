import { useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDataset } from '@/lib/data'
import { administrations, governmentStatistics } from '@/lib/governments'
import { number } from '@/lib/format'
import { localizedIndicator, useTranslation } from '@/lib/i18n'
import type { Manifest } from '@/lib/types'

const indicatorIds = ['gdp-growth', 'gdp-per-capita', 'inflation-world', 'unemployment-world', 'primary-imf', 'debt-imf']

/** Compare published Brazilian annual observations without implying that a president alone caused them. */
export function GovernmentsPage({ manifest }: { manifest: Manifest }) {
  const { locale, t } = useTranslation()
  const entries = indicatorIds.flatMap(id => manifest.indicators.filter(entry => entry.definition.id === id))
  const [id, setId] = useState(entries[0]?.definition.id ?? 'gdp-growth')
  const entry = entries.find(item => item.definition.id === id) ?? entries[0]
  const { data, loading, error } = useDataset(entry.definition.id, manifest.generatedAt)
  const rows = useMemo(() => administrations.map(item => governmentStatistics(data?.series.find(series => series.country === 'BRA')?.observations ?? [], item)), [data])
  const growth = entry.definition.id === 'gdp-growth'
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t('governments.eyebrow')}</div><h1>{t('governments.title')}</h1><p>{t('governments.description')}</p></div></div>
    <section className="panel government-filter"><label><span>{t('compare.indicator')}</span><Select value={entry.definition.id} onValueChange={setId}><SelectTrigger aria-label={t('compare.indicator')}><SelectValue/></SelectTrigger><SelectContent>{entries.map(item => <SelectItem value={item.definition.id} key={item.definition.id}>{localizedIndicator(locale, item.definition.id, item.definition.name, 'name')}</SelectItem>)}</SelectContent></Select></label></section>
    <section className="panel government-table-panel">
      <div className="panel-heading"><div><div className="eyebrow">{t('governments.brazil')}</div><h2>{localizedIndicator(locale, entry.definition.id, entry.definition.name, 'name')}</h2><p>{t('governments.rule')}</p></div></div>
      {loading ? <div className="chart-loading">{t('series.loading')}</div> : error ? <div className="notice warning"><Info size={16}/><p>{error}</p></div> : <div className="table-scroll"><table className="government-table"><thead><tr><th>{t('governments.administration')}</th><th>{t('governments.period')}</th><th>{t('governments.average')}</th>{growth && <th>{t('governments.cumulative')}</th>}<th>{t('governments.firstLast')}</th><th>{t('governments.coverage')}</th></tr></thead><tbody>{rows.map(row => <tr key={row.label}><th>{row.label}</th><td>{row.start === row.end ? row.start : `${row.start}–${row.end}`}</td><td>{number(row.average, 2)} {entry.definition.unit}</td>{growth && <td>{number(row.cumulative, 2)}%</td>}<td>{number(row.first, 2)} → {number(row.last, 2)} {entry.definition.unit}</td><td>{row.count}/{row.expected}</td></tr>)}</tbody></table></div>}
    </section>
    <div className="notice"><Info size={17}/><p><strong>{t('governments.cautionTitle')}</strong> {t('governments.caution')}</p></div>
  </>
}
