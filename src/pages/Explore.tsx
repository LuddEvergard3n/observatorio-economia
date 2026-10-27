import { useEffect, useState } from 'react'
import { ArrowUpRight, Search, SlidersHorizontal, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SeriesPanel } from '@/components/SeriesPanel'
import { categories, frequencies, number, period } from '@/lib/format'
import type { Category, Manifest } from '@/lib/types'

/** Browse the complete catalog, including documented gaps, with independent search and category filters. */
export function CatalogPage({ manifest, category, query = '' }: { manifest: Manifest; category?: Category; query?: string }) {
  const [search, setSearch] = useState(query)
  const [selected, setSelected] = useState(category ?? 'all')
  useEffect(() => { setSelected(category ?? 'all'); setSearch(query) }, [category, query])
  const clean = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const entries = manifest.indicators.filter(e => (selected === 'all' || e.definition.category === selected) && clean(`${e.definition.name} ${e.definition.source} ${e.definition.description}`).includes(clean(search)))
  return <>
    <div className="page-intro"><div><div className="eyebrow">CATÁLOGO DE INDICADORES</div><h1>{category ? categories[category] : 'Explore os dados.'}</h1><p>Definições, séries históricas e fontes para cada leitura da economia.</p></div><Badge variant="outline">{manifest.indicators.length} séries catalogadas</Badge></div>
    <div className="catalog-tools"><div className="search-field"><Search size={17} /><Input aria-label="Buscar indicador" placeholder="Buscar PIB, dívida, salário, infraestrutura…" value={search} onChange={e => setSearch(e.target.value)} /></div><Select value={selected} onValueChange={setSelected}><SelectTrigger aria-label="Área do indicador"><SlidersHorizontal size={15} /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as áreas</SelectItem>{Object.entries(categories).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
    <p className="result-count">{entries.length} resultados · valores mais recentes para o Brasil</p>
    <div className="indicator-grid">{entries.map(entry => {
      const d = entry.definition, summary = entry.summaries.BRA
      return <a className="panel indicator-card" key={d.id} href={`#indicator/${d.id}`}><div className="indicator-card-top"><span className="eyebrow">{categories[d.category]}</span><ArrowUpRight size={16} /></div><h2>{d.name}</h2><p>{d.description}</p><div className="indicator-reading"><strong>{number(summary?.value, d.id === 'hdi' ? 3 : 2, (summary?.value ?? 0) > 100000)}</strong><span>{d.unit}</span></div><div className="indicator-card-meta"><span>{summary?.last ? period(summary.last, d.frequency) : 'Sem dado disponível'}</span><Badge variant="secondary">{frequencies[d.frequency]}</Badge></div><div className="indicator-source">{d.source}</div></a>
    })}</div>
    {!entries.length && <div className="empty-state"><Search /><h2>Nenhum indicador encontrado</h2><p>Experimente outro termo ou escolha todas as áreas.</p><Button variant="outline" onClick={() => { setSearch(''); setSelected('all') }}>Limpar filtros</Button></div>}
  </>
}

/** Compare only countries within one definition, with shareable URL filters and a common year range. */
export function ComparePage({ manifest, dark, params, indicatorId }: { manifest: Manifest; dark: boolean; params: URLSearchParams; indicatorId?: string }) {
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
    <div className="page-intro"><div><div className="eyebrow">{indicatorId ? categories[entry.definition.category] : 'COMPARAÇÃO INTERNACIONAL'}</div><h1>{indicatorId ? entry.definition.name : 'O Brasil em contexto.'}</h1><p>{indicatorId ? 'Série histórica, documentação e dados para download.' : 'Compare trajetórias com o mesmo indicador e veja onde a cobertura difere.'}</p></div>{indicatorId && <a href="#indicators" className="text-link">Todos os indicadores <ArrowUpRight size={15} /></a>}</div>
    <section className="panel filter-panel" aria-label="Filtros da comparação"><div className="filter-row"><label><span>Indicador</span><Select value={id} onValueChange={value => { setId(value); setFeedback('') }}><SelectTrigger aria-label="Indicador"><SelectValue /></SelectTrigger><SelectContent>{manifest.indicators.map(e => <SelectItem key={e.definition.id} value={e.definition.id}>{e.definition.name}</SelectItem>)}</SelectContent></Select></label><label><span>De</span><Select value={String(Math.min(from,to))} onValueChange={value => { const next = Number(value); setFrom(next); if(next > to) setTo(next) }}><SelectTrigger aria-label="Ano inicial"><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></label><label><span>Até</span><Select value={String(Math.max(from,to))} onValueChange={value => { const next=Number(value); setTo(next); if(next < from) setFrom(next) }}><SelectTrigger aria-label="Ano final"><SelectValue /></SelectTrigger><SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></label></div>
      <div className="country-filters"><span className="field-label">Países</span><div>{manifest.countries.map(country => <button key={country.id} aria-pressed={countryIds.includes(country.id)} className={`country-chip ${countryIds.includes(country.id) ? 'selected' : ''}`} onClick={() => {
        if (countryIds.includes(country.id)) { if(countryIds.length > 1) setCountryIds(current => current.filter(c => c !== country.id)); else setFeedback('Mantenha ao menos um país selecionado.') }
        else setCountryIds(current => [...current, country.id])
      }}><span style={{ background: country.color }} />{country.name}{!availableCountries.includes(country.id) && <span className="no-data-dot" title="Sem cobertura nesta série">—</span>}</button>)}</div></div>
      {feedback && <p role="status" className="feedback">{feedback}</p>}
      {countries.some(c => !availableCountries.includes(c.id)) && <p className="small-note"><Info size={13} /> Países sem observação nesta série permanecem sem linha. Não são representados como zero.</p>}
    </section>
    <SeriesPanel entry={entry} countries={countries} from={Math.min(from,to)} to={Math.max(from,to)} version={manifest.generatedAt} dark={dark} />
    <div className="notice"><Info size={17} /><p><strong>Uma comparação justa começa pela definição.</strong> Tamanho, população e estrutura econômica diferem entre países. Uma fonte internacional pode harmonizar dados nacionais; isso não a torna uma medição independente. {entry.definition.notes}</p></div>
  </>
}
