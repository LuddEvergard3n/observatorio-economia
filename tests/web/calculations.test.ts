import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { completedIdmiDimensions, isIdmiProfilePackage, type IdmiProfile } from '../../src/lib/idmi'
import { chartPoints, compound, csvCell, number } from '../../src/lib/format'

describe('IDMI 2023: profiles, variants and missing evidence', () => {
  it('accepts only the frozen 2023 profile schema and retains missing dimensions', () => {
    const profile: IdmiProfile = { country: 'BRA', variant: 'gold_market', reference_year: 2023, method: 'IDMI9-candidate-2023-rail-access', score: null, lower: 8, upper: 80, complete: false, missing_dimensions: ['D2'], tax_dimension: 'separate_context_not_in_index', dimensions: { D1: { score: 50, lower: 50, upper: 50, complete: true, missing: [] }, D2: { score: null, lower: 0, upper: 100, complete: false, missing: ['basket'] } } }
    expect(isIdmiProfilePackage([profile])).toBe(true)
    expect(completedIdmiDimensions(profile)).toBe(1)
    expect(isIdmiProfilePackage([{ ...profile, reference_year: 2024 }])).toBe(false)
  })

  it('ships the frozen package without a fabricated Brazilian score', () => {
    const packageData: unknown = JSON.parse(readFileSync(new URL('../../public/data/idmi-2023-profiles.json', import.meta.url), 'utf8'))
    expect(isIdmiProfilePackage(packageData)).toBe(true)

    const brazil = (packageData as IdmiProfile[]).find(profile => profile.country === 'BRA' && profile.variant === 'gold_market')
    expect(brazil).toMatchObject({ complete: false, score: null, reference_year: 2023 })
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
