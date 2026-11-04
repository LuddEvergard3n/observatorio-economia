import { useState } from 'react'
import { Info } from 'lucide-react'
import { SeriesPanel } from '@/components/SeriesPanel'
import { localizedIndicator, useTranslation } from '@/lib/i18n'
import type { Manifest } from '@/lib/types'

/** Reuse the audited series panel for a focused group of related indicators. */
export function IndicatorModulePage({ manifest, dark, ids, titleKey, descriptionKey, noteKey, from = 1988 }: { manifest: Manifest; dark: boolean; ids: string[]; titleKey: string; descriptionKey: string; noteKey: string; from?: number }) {
  const { locale, t } = useTranslation()
  const entries = ids.flatMap(id => manifest.indicators.filter(entry => entry.definition.id === id))
  const [id, setId] = useState(entries[0]?.definition.id ?? '')
  const entry = entries.find(item => item.definition.id === id) ?? entries[0]
  const brazil = manifest.countries.filter(country => country.id === 'BRA')
  if (!entry) return <div className="empty-state"><h1>{t(titleKey)}</h1><p>{t('series.unavailable')}</p></div>
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t(titleKey.replace('.title', '.eyebrow'))}</div><h1>{t(titleKey)}</h1><p>{t(descriptionKey)}</p></div></div>
    <section className="panel module-picker" aria-label={t('compare.indicator')}>
      <span className="field-label">{t('compare.indicator')}</span>
      <div>{entries.map(item => <button key={item.definition.id} className={`country-chip ${item.definition.id === entry.definition.id ? 'selected' : ''}`} aria-pressed={item.definition.id === entry.definition.id} onClick={() => setId(item.definition.id)}>{localizedIndicator(locale, item.definition.id, item.definition.name, 'name')}</button>)}</div>
    </section>
    <SeriesPanel key={entry.definition.id} entry={entry} countries={brazil} from={from} to={2026} version={manifest.generatedAt} dark={dark}/>
    <div className="notice"><Info size={17}/><p>{t(noteKey)}</p></div>
  </>
}
