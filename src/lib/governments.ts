import type { Observation } from './types'

export interface Administration { label: string; start: number; end: number }

export const administrations: Administration[] = [
  { label: 'Collor', start: 1991, end: 1991 },
  { label: 'Itamar Franco', start: 1992, end: 1994 },
  { label: 'FHC I', start: 1995, end: 1998 },
  { label: 'FHC II', start: 1999, end: 2002 },
  { label: 'Lula I', start: 2003, end: 2006 },
  { label: 'Lula II', start: 2007, end: 2010 },
  { label: 'Dilma I', start: 2011, end: 2014 },
  { label: 'Dilma II', start: 2015, end: 2015 },
  { label: 'Temer', start: 2016, end: 2018 },
  { label: 'Bolsonaro', start: 2019, end: 2022 },
  { label: 'Lula III', start: 2023, end: 2026 },
]

/** Summarize annual observations by the president in office on 31 December. */
export function governmentStatistics(observations: Observation[], administration: Administration) {
  const points = observations.filter(point => /^\d{4}$/.test(point.period) && point.value != null && Number(point.period) >= administration.start && Number(point.period) <= administration.end)
  const values = points.map(point => point.value as number)
  const cumulative = values.length === administration.end - administration.start + 1 && values.every(value => value > -100)
    ? (values.reduce((factor, value) => factor * (1 + value / 100), 1) - 1) * 100 : null
  return {
    ...administration,
    count: values.length,
    expected: administration.end - administration.start + 1,
    average: values.length ? values.reduce((total, value) => total + value, 0) / values.length : null,
    cumulative,
    first: values.at(0) ?? null,
    last: values.at(-1) ?? null,
  }
}
