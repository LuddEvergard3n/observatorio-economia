import { describe, expect, it } from 'vitest'
import { calculateIdmi, geometric, normalize, publicScore } from '../../src/lib/idmi'
import { chartPoints, compound, csvCell, number } from '../../src/lib/format'
import type { Dataset } from '../../src/lib/types'

describe('IDMI: fixed bounds, missing inputs and reference years', () => {
  it('clips endpoints without converting absent data to zero', () => {
    expect(normalize(-1, 0, 100)).toBe(1)
    expect(normalize(101, 0, 100)).toBe(100)
    expect(normalize(0, 0, 100, true)).toBe(100)
    expect(normalize(null, 0, 100)).toBeNull()
    expect(normalize(NaN, 0, 100)).toBeNull()
    expect(normalize(1000, 100, 10000, false, true)).toBeCloseTo(50.5)
    expect(() => normalize(1, 0, 0)).toThrow()
  })
  it('aggregates on the internal scale before conversion', () => {
    expect(publicScore(geometric([1, 1]))).toBe(0)
    expect(publicScore(geometric([100, 100]))).toBeCloseTo(100)
    expect(geometric([1, 100])).toBeCloseTo(10)
    expect(geometric([1, 100], [.65, .35])).toBeCloseTo(100 ** .35)
    expect(geometric([100, null])).toBeNull()
    expect(geometric([geometric([100, 100]), 100])).toBe(100)
    expect(() => geometric([100], [0])).toThrow()
  })
  it('does not carry observations across years or publish incomplete totals', () => {
    const data: Dataset = { schemaVersion: 1, id: 'life-undp', retrievedAt: '2026-01-01T00:00:00Z', sourceNote: '', provenance: [], series: [{ country: 'BRA', observations: [{ period: '2023', value: 85, status: 'published' }] }] }
    expect(calculateIdmi([data], 'BRA', 2023).available).toBe(1)
    expect(calculateIdmi([data], 'BRA', 2024).available).toBe(0)
    expect(calculateIdmi([data], 'BRA', 2023, true).total).toBeNull()
    expect(calculateIdmi([data], 'USA', 2023).available).toBe(0)
  })
  it('uses five infrastructure components and incorporates logistics into transport', () => {
    const values: Record<string, number> = { 'roads-paved': 80, logistics: 4, 'water-safe': 90, 'sanitation-safe': 80, electricity: 95, 'clean-cooking': 90, 'electric-consumption': 2000, 'electric-losses': 10, 'waste-collection': 80, 'waste-controlled': 70, internet: 90, broadband: 25 }
    const data = Object.entries(values).map(([id, value]): Dataset => ({ schemaVersion: 1, id, retrievedAt: '2026-01-01T00:00:00Z', sourceNote: '', provenance: [], series: [{ country: 'BRA', observations: [{ period: '2023', value, status: 'published' }] }] }))
    const result = calculateIdmi(data, 'BRA', 2023)
    expect(result.infrastructure.map(component => component.key)).toEqual(['T', 'A', 'E', 'W', 'D'])
    expect(result.dimensions.find(dimension => dimension.key === 'I')?.score).not.toBeNull()
  })
})

describe('statistical presentation and exports', () => {
  it('compounds rates instead of adding them and preserves gaps', () => {
    expect(compound([10, 10])).toBeCloseTo(21)
    expect(compound([10, null])).toBeNull()
    expect(compound([-101])).toBeNull()
    expect(number(null)).toBe('—')
    expect(number(0)).toBe('0,00')
  })
  it('inserts null chart coordinates between available years', () => {
    const points = chartPoints([{ period: '2020', value: 5, status: 'published' }, { period: '2022', value: 7, status: 'published' }], 'annual', 2020, 2022)
    expect(points.map(p => p[1])).toEqual([5, null, 7])
  })
  it('neutralizes spreadsheet formulas without altering negative measurements', () => {
    expect(csvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"')
    expect(csvCell(-5)).toBe('"-5"')
    expect(csvCell(null)).toBe('""')
  })
})
