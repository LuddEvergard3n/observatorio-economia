export type Category = 'activity' | 'prices' | 'fiscal' | 'labor' | 'development' | 'infrastructure'
export interface Country { id: string; name: string; region: string; color: string }
export interface Indicator {
  id: string; name: string; code: string; category: Category; unit: string;
  frequency: string; provider: string; source: string; sourceUrl: string;
  description: string; notes: string; statusDefault: string; start?: string;
}
export interface Observation { period: string; value: number | null; status: string }
export interface Summary { first: string | null; last: string | null; value: number | null; count: number; sparkline: Observation[] }
export interface Entry { definition: Indicator; status: string; lastAttempt: string; lastSuccess: string | null; error: string | null; summaries: Record<string, Summary> }
export interface Manifest { schemaVersion: number; generatedAt: string; asOf: string; startYear: number; endYear: number; countries: Country[]; indicators: Entry[]; observationCount: number; failedSources: number }
export interface Dataset {
  schemaVersion: number; id: string; retrievedAt: string; sourceNote: string | null;
  provenance: { url: string; sha256: string; eTag: string | null; lastModified: string | null }[];
  series: { country: string; observations: Observation[] }[];
}
export interface TimelineEvent { id: string; date: string; title: string; type: 'method' | 'law' | 'context'; description: string; source: string; url: string; categories: Category[]; indicators?: string[]; effective?: string }
export interface Revision { indicator: string; country: string; period: string; previous: number | null; current: number | null; detectedAt: string }
