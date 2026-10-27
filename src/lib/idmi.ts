import type { Dataset } from './types'

export interface Dimension { key: string; name: string; score: number | null; inputs: { id: string; value: number | null; label: string }[]; note: string }
export const idmiVersion = '0.1-experimental'

/** Normalize to the internal 1–100 scale; absent values never become the minimum score. */
export function normalize(value: number | null, lower: number, upper: number, inverse = false, logarithmic = false): number | null {
  if (!(upper > lower) || (logarithmic && lower <= 0)) throw new Error('Invalid normalization bounds.')
  if (value == null || !Number.isFinite(value)) return null
  const bounded = Math.max(lower, Math.min(upper, value))
  const fraction = logarithmic ? (Math.log(bounded) - Math.log(lower)) / (Math.log(upper) - Math.log(lower)) : (bounded - lower) / (upper - lower)
  return 1 + 99 * (inverse ? 1 - fraction : fraction)
}

/** Require every component and positive weights; compute in log space for numerical stability. */
export function geometric(values: (number | null)[], weights = values.map(() => 1)): number | null {
  if (!values.length || weights.length !== values.length || weights.some(w => !Number.isFinite(w) || w <= 0)) throw new Error('Invalid weights.')
  if (values.some(v => v == null || !Number.isFinite(v) || v < 1 || v > 100)) return null
  const total = weights.reduce((sum, w) => sum + w, 0)
  return Math.exp(values.reduce<number>((sum, value, index) => sum + weights[index] * Math.log(value!), 0) / total)
}

/** Convert an internal score only after aggregation, including component display values. */
export function publicScore(internal: number | null): number | null {
  return internal == null ? null : Math.max(0, Math.min(100, 100 * (internal - 1) / 99))
}

/** Use exact reference years. No carry-forward, interpolation, or denominator substitution. */
export function calculateIdmi(datasets: Dataset[], country: string, year: number, fraserPublicationAllowed = false) {
  const raw = (id: string) => datasets.find(d => d.id === id)?.series.find(s => s.country === country)?.observations.find(p => p.period === String(year))?.value ?? null
  const input = (id: string, label: string) => ({ id, label, value: raw(id) })
  const pct = (id: string) => normalize(raw(id), 0, 100)
  const energy = geometric([pct('electricity'), pct('clean-cooking'), normalize(raw('electric-consumption'), 500, 8000, false, true), normalize(raw('electric-losses'), 5, 25, true)])
  const transport = geometric([pct('roads-paved'), normalize(raw('rail-efficiency'), 0.02, 0.5, true)])
  const water = geometric([pct('water-safe'), pct('sanitation-safe')], [0.65, 0.35])
  const ports = normalize(raw('port-efficiency'), -500, 500)
  const waste = geometric([pct('waste-collection'), pct('waste-controlled')])
  const digital = geometric([pct('internet'), normalize(raw('broadband'), 0, 40)])
  const meanSchool = normalize(raw('schooling-mean'), 0, 15)
  const expectedSchool = normalize(raw('schooling-expected'), 0, 18)
  const infrastructure = [
    { key: 'T', name: 'Transportes', score: transport }, { key: 'A', name: 'Água e saneamento', score: water },
    { key: 'P', name: 'Portos', score: ports }, { key: 'E', name: 'Energia', score: energy },
    { key: 'W', name: 'Resíduos', score: waste }, { key: 'D', name: 'Digital', score: digital },
  ]
  const dimensions: Dimension[] = [
    { key: 'W', name: 'Riqueza', score: normalize(raw('wealth'), 10000, 1000000, false, true), inputs: [input('wealth', 'Riqueza não humana por habitante')], note: 'Patrimônio produzido, natural e ativos externos líquidos, sem capital humano. Não somar componentes reais encadeados.' },
    { key: 'P', name: 'Poder de compra', score: normalize(raw('gni-ppp'), 100, 75000, false, true), inputs: [input('gni-ppp', 'RNB por habitante em PPC')], note: 'Limites de 100 a 75 mil dólares internacionais, em escala logarítmica. Base PPC vinculada à edição HDR 2025.' },
    { key: 'S', name: 'Saúde', score: normalize(raw('life-undp'), 20, 85), inputs: [input('life-undp', 'Expectativa de vida')], note: 'Expectativa de vida ao nascer; limites de 20 a 85 anos.' },
    { key: 'E', name: 'Educação', score: meanSchool == null || expectedSchool == null ? null : (meanSchool + expectedSchool) / 2, inputs: [input('schooling-mean', 'Média de anos de estudo'), input('schooling-expected', 'Anos esperados de escolaridade')], note: 'Média aritmética das pontuações normalizadas em 0–15 e 0–18 anos.' },
    { key: 'V', name: 'Segurança', score: geometric([normalize(raw('homicides'), 0.5, 30, true, true), normalize(raw('road-deaths'), 2, 30, true, true)]), inputs: [input('homicides', 'Homicídios por 100 mil'), input('road-deaths', 'Mortes no trânsito por 100 mil')], note: 'Média geométrica de escalas logarítmicas inversas. Limites: 0,5–30 e 2–30 por 100 mil.' },
    { key: 'H', name: 'Habitação', score: normalize(raw('slums'), 0, 50, true), inputs: [input('slums', 'População urbana em assentamentos precários')], note: 'Escala inversa de 0% a 50%. Mede precariedade urbana, não o custo do aluguel.' },
    { key: 'I', name: 'Infraestrutura', score: geometric(infrastructure.map(c => c.score)), inputs: ['roads-paved','rail-efficiency','water-safe','sanitation-safe','port-efficiency','electricity','clean-cooking','electric-consumption','electric-losses','waste-collection','waste-controlled','internet','broadband'].map(id => input(id, id)), note: 'Seis componentes obrigatórios, combinados geometricamente. Portos permanecem como componente separado.' },
    { key: 'L', name: 'Liberdade econômica', score: fraserPublicationAllowed ? normalize(raw('fraser'), 0, 10) : null, inputs: [input('fraser', 'Economic Freedom of the World')], note: 'Fraser Institute. Publicação condicionada à confirmação dos direitos de uso e redistribuição. Sem proxy substituta.' },
  ]
  return { dimensions, infrastructure, total: fraserPublicationAllowed ? publicScore(geometric(dimensions.map(d => d.score))) : null, available: dimensions.filter(d => d.score != null).length }
}
