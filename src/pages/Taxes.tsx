import { lazy, Suspense, useMemo } from 'react'
import { ExternalLink, Info, Landmark, ReceiptText, Scale, WalletCards } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { taxChanges } from '@/content/taxes'
import { useDataset } from '@/lib/data'
import { annualPurchasingPower, number } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import type { Dataset, Indicator, Manifest } from '@/lib/types'

const Chart = lazy(() => import('@/components/Chart'))
const brazil = [{ id: 'BRA', name: 'Brasil', region: 'Latin America', color: '#08745a' }]
const definition: Indicator = { id: 'purchasing-power-year', name: 'Variação anual do poder de compra', code: 'derived:ipca-monthly', category: 'prices', unit: '% no ano', frequency: 'annual', provider: 'derived', source: 'IBGE · IPCA', sourceUrl: 'https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-ipca.html', description: 'Quanto o mesmo valor nominal ganhou ou perdeu em capacidade de comprar a cesta do IPCA em cada ano.', notes: 'Cálculo: 1 dividido pelo fator acumulado do IPCA no ano, menos 1. Exige os 12 meses; não soma taxas.', statusDefault: 'derived' }

/** Present audited tax creations separately from increases, replacements and aggregate household purchasing power. */
export function TaxesPage({ manifest, dark }: { manifest: Manifest; dark: boolean }) {
  const { t } = useTranslation()
  const { data, error, loading } = useDataset('ipca-monthly', manifest.generatedAt)
  const purchasingPower = useMemo<Dataset | null>(() => data ? { schemaVersion: 1, id: definition.id, retrievedAt: data.retrievedAt, sourceNote: definition.notes, provenance: data.provenance, series: [{ country: 'BRA', observations: annualPurchasingPower(data.series.find(series => series.country === 'BRA')?.observations ?? []) }] } : null, [data])
  const earlyYears = purchasingPower?.series[0].observations.filter(point => Number(point.period) < 1995) ?? []
  const latestYear = Math.min(2026, Number(purchasingPower?.series[0].observations.at(-1)?.period ?? 2026))
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t('taxes.eyebrow')}</div><h1>{t('taxes.title')}</h1><p>{t('taxes.description')}</p></div></div>
    <div className="notice"><Scale size={18}/><p><strong>{t('taxes.scopeTitle')}</strong> {t('taxes.scope')}</p></div>
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

    <div className="section-title tax-ledger-title"><span>{t('taxes.ledgerEyebrow')}</span><h2>{t('taxes.ledgerTitle')}</h2><p>{t('taxes.ledgerDescription')}</p></div>
    <div className="tax-ledger">{taxChanges.map(item => <article className="panel tax-card" key={`${item.year}-${item.name}`}>
      <div className="tax-card-head"><span className="tax-year">{item.year}</span><div><h3>{item.name}</h3><Badge variant="outline">{t(`taxes.kind.${item.kind}`)}</Badge></div><ReceiptText size={18}/></div>
      <dl><div><dt>{t('taxes.proposal')}</dt><dd>{item.proposal}</dd></div><div><dt>{t('taxes.proposer')}</dt><dd>{item.proposer}</dd></div><div><dt>{t('taxes.president')}</dt><dd>{item.president}</dd></div><div><dt>{t('taxes.law')}</dt><dd>{item.law}</dd></div><div><dt>{t('taxes.rate')}</dt><dd>{item.rate}</dd></div></dl>
      <div className="tax-impact"><Landmark size={15}/><div><span>{t('taxes.observedCost')}</span><strong>{item.observedCost}</strong><small>{item.costReference}</small></div></div>
      <a className="text-link" href={item.url} target="_blank" rel="noreferrer">{t('series.primarySource')} <ExternalLink size={12}/></a>
    </article>)}</div>
  </>
}
