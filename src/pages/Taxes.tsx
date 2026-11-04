import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ExternalLink, Info, Landmark, ReceiptText, Scale, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SeriesPanel } from '@/components/SeriesPanel'
import { taxChanges } from '@/content/taxes'
import { useDataset } from '@/lib/data'
import { annualPurchasingPower, linearAnnualEstimate, number } from '@/lib/format'
import { localizedIndicator, useTranslation } from '@/lib/i18n'
import type { Dataset, Indicator, Manifest } from '@/lib/types'

const Chart = lazy(() => import('@/components/Chart'))
const StateFiscalChart = lazy(() => import('@/components/StateFiscalChart'))
const brazil = [{ id: 'BRA', name: 'Brasil', region: 'Latin America', color: '#08745a' }]
const taxBurden2025 = 4_127_232_000_000
const definition: Indicator = { id: 'purchasing-power-year', name: 'Variação anual do poder de compra', code: 'derived:ipca-monthly', category: 'prices', unit: '% no ano', frequency: 'annual', provider: 'derived', source: 'IBGE · IPCA', sourceUrl: 'https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-ipca.html', description: 'Quanto o mesmo valor nominal ganhou ou perdeu em capacidade de comprar a cesta do IPCA em cada ano.', notes: 'Cálculo: 1 dividido pelo fator acumulado do IPCA no ano, menos 1. Exige os 12 meses; não soma taxas.', statusDefault: 'derived' }

/** Present audited tax creations separately from increases, replacements and aggregate household purchasing power. */
export function TaxesPage({ manifest, dark }: { manifest: Manifest; dark: boolean }) {
  const { locale, t } = useTranslation()
  const [now, setNow] = useState(() => new Date())
  const householdEntries = ['household-income-mean', 'household-income-median', 'household-debt'].flatMap(id => manifest.indicators.filter(entry => entry.definition.id === id))
  const [householdId, setHouseholdId] = useState(householdEntries[0]?.definition.id ?? '')
  const householdEntry = householdEntries.find(entry => entry.definition.id === householdId) ?? householdEntries[0]
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer) }, [])
  const meter = linearAnnualEstimate(taxBurden2025, now)
  const money = (value: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
  const { data, error, loading } = useDataset('ipca-monthly', manifest.generatedAt)
  const purchasingPower = useMemo<Dataset | null>(() => data ? { schemaVersion: 1, id: definition.id, retrievedAt: data.retrievedAt, sourceNote: definition.notes, provenance: data.provenance, series: [{ country: 'BRA', observations: annualPurchasingPower(data.series.find(series => series.country === 'BRA')?.observations ?? []) }] } : null, [data])
  const earlyYears = purchasingPower?.series[0].observations.filter(point => Number(point.period) < 1995) ?? []
  const latestYear = Math.min(2026, Number(purchasingPower?.series[0].observations.at(-1)?.period ?? 2026))
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t('taxes.eyebrow')}</div><h1>{t('taxes.title')}</h1><p>{t('taxes.description')}</p></div></div>
    <div className="notice"><Scale size={18}/><p><strong>{t('taxes.scopeTitle')}</strong> {t('taxes.scope')}</p></div>
    <section className="panel state-fiscal-panel">
      <div className="panel-heading"><div><div className="eyebrow">{t('taxes.statesEyebrow')}</div><h2>{t('taxes.statesTitle')}</h2><p>{t('taxes.statesDescription')}</p></div><Landmark size={21}/></div>
      <Suspense fallback={<div className="chart-loading">{t('series.preparing')}</div>}><StateFiscalChart dark={dark}/></Suspense>
      <div className="state-fiscal-sources"><p>{t('taxes.statesCaution')}</p><div><a href="https://www.gov.br/receitafederal/dados/arrecadacao-estado.csv/view" target="_blank" rel="noreferrer">{t('taxes.revenueSource')} <ExternalLink size={11}/></a><a href="https://www.tesourotransparente.gov.br/ckan/dataset/transferencias-da-uniao-total-por-estado" target="_blank" rel="noreferrer">{t('taxes.transferSource')} <ExternalLink size={11}/></a></div></div>
    </section>
    <section className="tax-meter" aria-labelledby="tax-meter-title">
      <div className="tax-meter-top"><div><div className="eyebrow">{t('taxes.meterEyebrow')}</div><h2 id="tax-meter-title">{t('taxes.meterTitle', { year: now.getFullYear() })}</h2></div><Badge variant="outline">{t('taxes.estimate')}</Badge></div>
      <strong className="tax-meter-value" aria-label={money(meter.accumulated)}>{money(meter.accumulated)}</strong>
      <div className="tax-meter-track" aria-hidden="true"><span style={{ width: `${meter.progress * 100}%` }}/></div>
      <div className="tax-meter-stats"><div><span>{t('taxes.perSecond')}</span><strong>{money(meter.perSecond)}</strong></div><div><span>{t('taxes.perDay')}</span><strong>{money(meter.perDay)}</strong></div><div><span>{t('taxes.yearProgress')}</span><strong>{number(meter.progress * 100, 1)}%</strong></div></div>
      <p>{t('taxes.meterMethod')} <a href="https://cdn.tesouro.gov.br/sistemas-internos/apex/producao/sistemas/thot/arquivos/publicacoes/54334_1699660/Boletim_CTB_2025.pdf" target="_blank" rel="noreferrer">{t('taxes.openBasis')} <ExternalLink size={11}/></a></p>
    </section>
    <section className="tax-summary" aria-label={t('taxes.burdenTitle')}>
      <article className="panel"><span>1991</span><strong>25,24%</strong><small>{t('taxes.gdp')}</small></article>
      <article className="panel"><span>2024</span><strong>32,32%</strong><small>{t('taxes.gdp')}</small></article>
      <article className="panel"><span>2025</span><strong>32,40%</strong><small>{t('taxes.gdp')}</small></article>
      <article className="panel accent"><span>1991–2025</span><strong>+7,16 p.p.</strong><small>{t('taxes.change')}</small></article>
    </section>
    <p className="small-note tax-summary-note">{t('taxes.burdenNote')} <a href="https://portalantigo.ipea.gov.br/agencia/images/stories/PDFs/TDs/td_0583.pdf" target="_blank" rel="noreferrer">Ipea 1991 <ExternalLink size={11}/></a> · <a href="https://www.gov.br/tesouronacional/pt-br/noticias/carga-tributaria-bruta-do-governo-geral-atinge-32-40-do-pib-em-2025" target="_blank" rel="noreferrer">Tesouro 2025 <ExternalLink size={11}/></a></p>

    <section className="panel purchasing-panel">
      <div className="panel-heading"><div><div className="eyebrow">{t('taxes.wallet')}</div><h2>{t('taxes.powerTitle')}</h2><p>{t('taxes.powerDescription')}</p></div><WalletCards size={21}/></div>
      {loading ? <div className="chart-loading">{t('series.loading')}</div> : error || !purchasingPower ? <div className="notice warning"><Info size={16}/><p>{error ?? t('series.unavailable')}</p></div> : <><div className="early-power"><span>{t('taxes.earlyYears')}</span>{earlyYears.map(point => <div key={point.period}><small>{point.period}</small><strong>{number(point.value, 1)}%</strong></div>)}</div><Suspense fallback={<div className="chart-loading">{t('series.preparing')}</div>}><Chart data={purchasingPower} definition={definition} countries={brazil} from={1995} to={latestYear} dark={dark} height={360}/></Suspense></>}
      <p className="small-note power-note">{t('taxes.powerNote')}</p>
    </section>

    {householdEntry && <section className="household-section" aria-labelledby="household-title">
      <div className="section-title"><span>{t('taxes.householdEyebrow')}</span><h2 id="household-title">{t('taxes.householdTitle')}</h2><p>{t('taxes.householdDescription')}</p></div>
      <div className="panel module-picker"><span className="field-label">{t('compare.indicator')}</span><div>{householdEntries.map(entry => <button key={entry.definition.id} className={`country-chip ${entry.definition.id === householdEntry.definition.id ? 'selected' : ''}`} aria-pressed={entry.definition.id === householdEntry.definition.id} onClick={() => setHouseholdId(entry.definition.id)}>{localizedIndicator(locale, entry.definition.id, entry.definition.name, 'name')}</button>)}</div></div>
      <SeriesPanel key={householdEntry.definition.id} entry={householdEntry} countries={manifest.countries.filter(country => country.id === 'BRA')} from={2005} to={2026} version={manifest.generatedAt} dark={dark}/>
    </section>}

    <div className="section-title tax-ledger-title"><span>{t('taxes.ledgerEyebrow')}</span><h2>{t('taxes.ledgerTitle')}</h2><p>{t('taxes.ledgerDescription')}</p></div>
    <div className="tax-ledger">{taxChanges.map(item => {
      const translated = locale !== 'pt-BR'
      const proposer = !translated ? item.proposer : item.year === 2002 ? 'Álvaro Dias; Juquinha' : item.year === 2023 ? `Baleia Rossi; ${t('taxes.executive')}` : t('taxes.executive')
      const rates: Record<number, string> = { 1991:'2% · 1991', 1993:'0.25%', 1996:'0.20% → 0.38%', 2000:'10%', 2001:t('taxes.variableRate'), 2002:t('taxes.localLaw'), 2003:t('taxes.constitutionalThreshold'), 2004:'1.65% + 7.6% · 2004', 2023:'2026–2033', 2024:t('taxes.upTo15') }
      const costs: Record<string, string> = { 'Sem total isolado':t('taxes.noSeparateTotal'), 'Repasse indireto':t('taxes.indirect'), 'Varia por município':t('taxes.variesLocally'), 'Sem total nacional isolado':t('taxes.noSeparateTotal'), 'Embutido na importação':t('taxes.inImports'), 'Ainda não observado integralmente':t('taxes.notFullyObserved'), 'Não recai diretamente sobre famílias':t('taxes.notDirectHousehold') }
      return <article className="panel tax-card" key={`${item.year}-${item.name}`}>
      <div className="tax-card-head"><span className="tax-year">{item.year}</span><div><h3>{item.name}</h3><Badge variant="outline">{t(`taxes.kind.${item.kind}`)}</Badge></div><ReceiptText size={18}/></div>
      <dl><div><dt>{t('taxes.proposal')}</dt><dd>{item.proposal}</dd></div><div><dt>{t('taxes.proposer')}</dt><dd>{proposer}</dd></div><div><dt>{t('taxes.president')}</dt><dd>{item.president}</dd></div><div><dt>{t('taxes.law')}</dt><dd>{item.law}</dd></div><div><dt>{t('taxes.rate')}</dt><dd>{translated ? rates[item.year] : item.rate}</dd></div></dl>
      <div className="tax-impact"><Landmark size={15}/><div><span>{t('taxes.observedCost')}</span><strong>{translated ? costs[item.observedCost] ?? item.observedCost : item.observedCost}</strong><small>{translated ? t('taxes.costCaution') : item.costReference}</small></div></div>
      <a className="text-link" href={item.url} target="_blank" rel="noreferrer">{t('series.primarySource')} <ExternalLink size={12}/></a>
    </article>})}</div>
  </>
}
