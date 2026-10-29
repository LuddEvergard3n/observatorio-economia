import type { Dataset, Indicator, Observation } from './types'

export const categories = { activity: 'Atividade econômica', prices: 'Preços, juros e câmbio', fiscal: 'Contas públicas', labor: 'Trabalho e renda', development: 'Desenvolvimento', infrastructure: 'Infraestrutura' }
export const frequencies: Record<string, string> = { annual: 'Anual', monthly: 'Mensal', daily: 'Diária', quarterly: 'Trimestral', 'rolling-quarter': 'Trimestre móvel' }
export const conditions: Record<string, string> = { published: 'Publicado pela fonte', estimate: 'Estimativa / base mista', modeled: 'Estimativa modelada' }

const localeTags: Record<string, string> = { 'pt-BR':'pt-BR', en:'en-US', es:'es-ES', de:'de-DE', fr:'fr-FR', ru:'ru-RU', 'zh-CN':'zh-CN', ja:'ja-JP', ko:'ko-KR', pl:'pl-PL' }
const localeText: Record<string, { noObservation: string; rollingQuarter: string; quarter: string }> = {
  'pt-BR': { noObservation:'Sem observação', rollingQuarter:'Tri. móvel até', quarter:'º tri.' }, en:{ noObservation:'No observation', rollingQuarter:'Rolling quarter through', quarter:'Q' }, es:{ noObservation:'Sin observación', rollingQuarter:'Trimestre móvil hasta', quarter:'T' }, de:{ noObservation:'Keine Beobachtung', rollingQuarter:'Gleitendes Quartal bis', quarter:'Q' }, fr:{ noObservation:'Aucune observation', rollingQuarter:'Trimestre mobile jusqu’à', quarter:'T' }, ru:{ noObservation:'Нет наблюдения', rollingQuarter:'Скользящий квартал по', quarter:'кв.' }, 'zh-CN':{ noObservation:'无观测值', rollingQuarter:'滚动季度截至', quarter:'季度' }, ja:{ noObservation:'観測値なし', rollingQuarter:'移動四半期（終了）', quarter:'第四半期' }, ko:{ noObservation:'관측치 없음', rollingQuarter:'이동 분기 기준', quarter:'분기' }, pl:{ noObservation:'Brak obserwacji', rollingQuarter:'Kwartał kroczący do', quarter:'kw.' },
}

function currentLocale(): string { return typeof document === 'undefined' ? 'pt-BR' : document.documentElement.lang || 'pt-BR' }
function intlLocale(): string { return localeTags[currentLocale()] ?? 'pt-BR' }

/** Format a measured value, preserving the difference between zero and absence. */
export function number(value: number | null | undefined, digits = 2, compact = false): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: digits, minimumFractionDigits: compact ? 0 : digits, notation: compact ? 'compact' : 'standard' }).format(value)
}

/** Format an observation's reference period independently of the retrieval date. */
export function period(value?: string | null, frequency?: string): string {
  const text = localeText[currentLocale()] ?? localeText['pt-BR']
  if (!value) return text.noObservation
  if (value.length === 4) return value
  if (value.includes('-Q')) return currentLocale() === 'en' ? `${text.quarter}${value.slice(-1)} ${value.slice(0, 4)}` : `${value.slice(-1)}${text.quarter} ${value.slice(0, 4)}`
  const date = new Date(`${value.length === 7 ? value + '-01' : value}T12:00:00Z`)
  const formatted = new Intl.DateTimeFormat(intlLocale(), { month: 'short', year: 'numeric', ...(value.length === 10 ? { day: '2-digit' as const } : {}), timeZone: 'UTC' }).format(date)
  return frequency === 'rolling-quarter' ? `${text.rollingQuarter} ${formatted}` : formatted
}

export function timestamp(value: string): string {
  return new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(value))
}

/** Convert a series period into an unambiguous UTC chart coordinate. */
export function periodTime(value: string): number {
  if (value.includes('-Q')) return Date.UTC(Number(value.slice(0, 4)), (Number(value.slice(-1)) - 1) * 3, 1)
  return Date.parse(value.length === 4 ? `${value}-01-01T00:00:00Z` : value.length === 7 ? `${value}-01T00:00:00Z` : `${value}T00:00:00Z`)
}

/** Fill missing annual/monthly/quarterly coordinates with null, never estimated values. */
export function chartPoints(points: Observation[], frequency: string, from: number, to: number): [number, number | null][] {
  const selected = points.filter(p => Number(p.period.slice(0, 4)) >= from && Number(p.period.slice(0, 4)) <= to)
  if (!selected.length) return []
  if (frequency === 'daily') return selected.map(p => [periodTime(p.period), p.value])
  const values = new Map(selected.map(p => [p.period, p.value]))
  const result: [number, number | null][] = []
  for (let year = from; year <= to; year++) {
    const count = frequency === 'annual' ? 1 : frequency === 'quarterly' ? 4 : 12
    for (let part = 1; part <= count; part++) {
      const key = frequency === 'annual' ? String(year) : frequency === 'quarterly' ? `${year}-Q${part}` : `${year}-${String(part).padStart(2, '0')}`
      result.push([periodTime(key), values.get(key) ?? null])
    }
  }
  return result
}

/** Compound inflation rates; a missing month makes the accumulated result unavailable. */
export function compound(rates: (number | null)[]): number | null {
  if (!rates.length || rates.some(v => v == null || !Number.isFinite(v) || v < -100)) return null
  return (rates.reduce<number>((factor, rate) => factor * (1 + rate! / 100), 1) - 1) * 100
}

/** Escape both CSV syntax and spreadsheet formula prefixes in external text. */
export function csvCell(value: string | number | null): string {
  const text = value == null ? '' : typeof value === 'number' ? String(value) : /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return `"${text.replaceAll('"', '""')}"`
}

export function csv(data: Dataset, definition: Indicator, countries: string[], from: number, to: number): string {
  const header = ['country', 'period', 'value', 'unit', 'frequency', 'status', 'source', 'source_url', 'retrieved_at', 'notes']
  const rows = data.series.filter(s => countries.includes(s.country)).flatMap(s => s.observations.filter(p => Number(p.period.slice(0, 4)) >= from && Number(p.period.slice(0, 4)) <= to)
    .map(p => [s.country, p.period, p.value, definition.unit, definition.frequency, p.status, definition.source, definition.sourceUrl, data.retrievedAt, definition.notes].map(csvCell).join(',')))
  return '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n')
}

/** Start a local file download and release the object URL after the click. */
export function download(content: string, name: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a'); link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
