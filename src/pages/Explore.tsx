import { useEffect, useState } from 'react'
import { ArrowUpRight, Search, SlidersHorizontal, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeriesPanel } from '@/components/SeriesPanel'
import { categories, frequencies, number, period } from '@/lib/format'
import { localizedCountry, localizedIndicator, useTranslation } from '@/lib/i18n'
import type { Category, Manifest } from '@/lib/types'

/** Browse the complete catalog, including documented gaps, with independent search and category filters. */
export function CatalogPage({ manifest, category, query = '' }: { manifest: Manifest; category?: Category; query?: string }) {
  const { locale, t } = useTranslation()
  const [search, setSearch] = useState(query)
  const [selected, setSelected] = useState(category ?? 'all')
  useEffect(() => { setSelected(category ?? 'all'); setSearch(query) }, [category, query])
  const clean = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const entries = manifest.indicators.filter(e => (selected === 'all' || e.definition.category === selected) && clean(`${e.definition.name} ${e.definition.source} ${e.definition.description}`).includes(clean(search)))
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t('app.catalogLabel')}</div><h1>{category ? t(`category.${category}`) : t('catalog.title')}</h1><p>{t('catalog.description')}</p></div><Badge variant="outline">{t('catalog.count', { count: manifest.indicators.length })}</Badge></div>
    <div className="catalog-tools"><div className="search-field"><Search size={17} /><Input aria-label={t('app.search')} placeholder={t('catalog.search')} value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={selected} onValueChange={setSelected}><SelectTrigger aria-label="Área do indicador"><SlidersHorizontal size={15} /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t('catalog.allAreas')}</SelectItem>{Object.keys(categories).map(key => <SelectItem key={key} value={key}>{t(`category.${key}`)}</SelectItem>)}</SelectContent></Select></div>
    <p className="result-count">{t('catalog.results', { count: entries.length })}</p>
    <div className="indicator-grid">{entries.map(entry => {
      const d = entry.definition, summary = entry.summaries.BRA
      return <a className="panel indicator-card" key={d.id} href={`#indicator/${d.id}`}><div className="indicator-card-top"><span className="eyebrow">{t(`category.${d.category}`)}</span><ArrowUpRight size={16} /></div><h2>{localizedIndicator(locale, d.id, d.name, 'name')}</h2><p>{localizedIndicator(locale, d.id, d.description, 'description')}</p><div className="indicator-reading"><strong>{number(summary?.value, d.id === 'hdi' ? 3 : 2, (summary?.value ?? 0) > 100000)}</strong><span>{d.unit}</span></div><div className="indicator-card-meta"><span>{summary?.last ? period(summary.last, d.frequency) : t('table.unavailable')}</span><Badge variant="secondary">{t(`frequency.${d.frequency}`)}</Badge></div><div className="indicator-source">{d.source}</div></a>
    })}</div>
    {!entries.length && <div className="empty-state"><Search /><h2>{t('catalog.empty')}</h2><p>{t('catalog.emptyHint')}</p><Button variant="outline" onClick={() => { setSearch(''); setSelected('all') }}>{t('catalog.clear')}</Button></div>}
  </>
}

/** Compare only countries within one definition, with shareable URL filters and a common year range. */
export function ComparePage({ manifest, dark, params, indicatorId }: { manifest: Manifest; dark: boolean; params: URLSearchParams; indicatorId?: string }) {
  const { locale, t } = useTranslation()
  const initialId = indicatorId ?? params.get('indicator') ?? 'gdp-growth'
  const [id, setId] = useState(manifest.indicators.some(e => e.definition.id === initialId) ? initialId : 'gdp-growth')
  const initialCountries = (params.get('countries') ?? (indicatorId ? 'BRA' : 'BRA,USA,ARG,CHL')).split(',').filter(c => manifest.countries.some(country => country.id === c))
  const [countryIds, setCountryIds] = useState(initialCountries.length ? [...new Set(initialCountries)] : ['BRA'])
  const validYear = (raw: string | null, fallback: number) => raw && /^\d{4}$/.test(raw) ? Math.max(1988, Math.min(2026, Number(raw))) : fallback
  const [from, setFrom] = useState(validYear(params.get('from'), 1988))
  const [to, setTo] = useState(validYear(params.get('to'), 2026))
  const entry = manifest.indicators.find(e => e.definition.id === id)!
  const countries = manifest.countries.filter(c => countryIds.includes(c.id))
  const availableCountries = Object.entries(entry.summaries).filter(([, summary]) => summary.count > 0).map(([country]) => country)
  const [feedback, setFeedback] = useState('')
  const years = Array.from({ length: 39 }, (_, i) => 1988 + i)
  return <>
    <div className="page-intro"><div><div className="eyebrow">{indicatorId ? t(`category.${entry.definition.category}`) : t('compare.international')}</div><h1>{indicatorId ? localizedIndicator(locale, entry.definition.id, entry.definition.name, 'name') : t('compare.title')}</h1><p>{indicatorId ? t('compare.seriesDescription') : t('compare.description')}</p></div>{indicatorId && <a href="#indicators" className="text-link">{t('compare.allIndicators')} <ArrowUpRight size={15} /></a>}</div>
    <section className="panel filter-panel" aria-label="Filtros da comparação"><div className="filter-row"><label><span>{t('compare.indicator')}</span><Select value={id} onValueChange={value => { setId(value); setFeedback('') }}><SelectTrigger aria-label={t('compare.indicator')}><SelectValue /></SelectTrigger><SelectContent>{manifest.indicators.map(e => <SelectItem key={e.definition.id} value={e.definition.id}>{localizedIndicator(locale, e.definition.id, e.definition.name, 'name')}</SelectItem>)}</SelectContent></Select></label><label><span>{t('compare.from')}</span><Select value={String(Math.min(from,to))} onValueChange={value => { const next = Number(value); setFrom(next); if(next > to) setTo(next) }}><SelectTrigger aria-label={t('compare.startYear')}><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></label><label><span>{t('compare.to')}</span><Select value={String(Math.max(from,to))} onValueChange={value => { const next=Number(value); setTo(next); if(next < from) setFrom(next) }}><SelectTrigger aria-label={t('compare.endYear')}><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></label></div>
      <div className="country-filters"><span className="field-label">{t('compare.countries')}</span><div>{manifest.countries.map(country => <button key={country.id} aria-pressed={countryIds.includes(country.id)} className={`country-chip ${countryIds.includes(country.id) ? 'selected' : ''}`} onClick={() => {
        if (countryIds.includes(country.id)) { if(countryIds.length > 1) setCountryIds(current => current.filter(c => c !== country.id)); else setFeedback(t('compare.keepOne')) }
        else setCountryIds(current => [...current, country.id])
      }}><span style={{ background: country.color }} />{localizedCountry(locale, country.id, country.name)}{!availableCountries.includes(country.id) && <span className="no-data-dot" title={t('compare.noCoverage')}>—</span>}</button>)}</div></div>
      {feedback && <p role="status" className="feedback">{feedback}</p>}
      {countries.some(c => !availableCountries.includes(c.id)) && <p className="small-note"><Info size={13} /> {t('compare.noDataLine')}</p>}
    </section>
    <SeriesPanel entry={entry} countries={countries} from={Math.min(from,to)} to={Math.max(from,to)} version={manifest.generatedAt} dark={dark} />
    <div className="notice"><Info size={17} /><p><strong>{t('compare.fairTitle')}</strong> {t('compare.fairText')} {entry.definition.notes}</p></div>
  </>
}
