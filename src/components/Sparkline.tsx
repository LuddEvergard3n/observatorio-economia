import type { Observation } from '@/lib/types'

/** Small decorative trend; the card also exposes the exact latest observation as text. */
export function Sparkline({ points }: { points: Observation[] }) {
  const values = points.filter(p => p.value != null).map(p => p.value!)
  if (values.length < 2) return <span className="sparkline-placeholder" />
  const low = Math.min(...values), high = Math.max(...values), span = high - low || 1
  const path = values.map((value, index) => `${index === 0 ? 'M' : 'L'}${index * 100 / (values.length - 1)},${32 - (value - low) / span * 27}`).join(' ')
  return <svg viewBox="0 0 100 38" className="sparkline" aria-hidden="true"><path d={`${path} L100,38 L0,38 Z`} fill="currentColor" opacity=".08" /><path d={path} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
