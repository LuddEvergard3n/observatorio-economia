import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import type { Dataset, Manifest } from '../../src/lib/types'

it('published snapshot summaries match valid, unique, traceable observations', () => {
  const manifest = JSON.parse(readFileSync('public/data/manifest.json', 'utf8')) as Manifest
  let count = 0
  for (const entry of manifest.indicators) {
    if (!Object.values(entry.summaries).some(s => s.count > 0)) continue
    const data = JSON.parse(readFileSync(`public/data/series/${entry.definition.id}.json`, 'utf8')) as Dataset
    expect(data.id).toBe(entry.definition.id)
    expect(data.provenance.length).toBeGreaterThan(0)
    for (const evidence of data.provenance) {
      expect(evidence.url).toMatch(/^https:\/\//)
      expect(evidence.sha256).toMatch(/^[a-f0-9]{64}$/)
    }
    for (const series of data.series) {
      expect(manifest.countries.some(c => c.id === series.country)).toBe(true)
      expect(new Set(series.observations.map(p => p.period)).size).toBe(series.observations.length)
      const observed = series.observations.filter(p => p.value != null)
      expect(entry.summaries[series.country].count).toBe(observed.length)
      expect(entry.summaries[series.country].value).toBe(observed.at(-1)?.value ?? null)
      expect(entry.summaries[series.country].last).toBe(observed.at(-1)?.period ?? null)
      for (const point of observed) {
        expect(Number.isFinite(point.value)).toBe(true)
        expect(Number(point.period.slice(0, 4))).toBeGreaterThanOrEqual(1988)
        expect(Number(point.period.slice(0, 4))).toBeLessThanOrEqual(2026)
      }
      count += observed.length
    }
  }
  expect(count).toBe(manifest.observationCount)
})
