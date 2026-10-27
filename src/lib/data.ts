import { useEffect, useState } from 'react'
import type { Dataset, Manifest } from './types'

const cache = new Map<string, Promise<Dataset>>()

/** Load the published manifest; retries always request the current deployment. */
export async function getManifest(): Promise<Manifest> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/manifest.json`, { cache: 'no-cache' })
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo. Tente novamente.')
  const result = await response.json() as Manifest
  if (result.schemaVersion !== 1 || !Array.isArray(result.indicators)) throw new Error('Formato de dados incompatível.')
  return result
}

/** Memoize a dataset only within its publication version; rejected requests can be retried. */
export function getDataset(id: string, version: string): Promise<Dataset> {
  if (!/^[a-z0-9-]+$/.test(id)) return Promise.reject(new Error('Indicador inválido.'))
  const key = `${version}/${id}`
  if (!cache.has(key)) cache.set(key, fetch(`${import.meta.env.BASE_URL}data/series/${id}.json?v=${encodeURIComponent(version)}`)
    .then(async response => {
      if (!response.ok) throw new Error('A série está temporariamente indisponível.')
      const data = await response.json() as Dataset
      if (data.schemaVersion !== 1 || data.id !== id || !Array.isArray(data.series)) throw new Error('Série com formato incompatível.')
      return data
    }).catch(error => { cache.delete(key); throw error }))
  return cache.get(key)!
}

/** Ignore late responses when the selected series changes or the page unmounts. */
export function useDataset(id: string, version: string, enabled = true) {
  const [state, setState] = useState<{ data: Dataset | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: enabled })
  useEffect(() => {
    let active = true
    setState({ data: null, error: null, loading: enabled })
    if (enabled) getDataset(id, version).then(data => { if (active) setState({ data, error: null, loading: false }) })
      .catch(error => { if (active) setState({ data: null, error: String(error.message), loading: false }) })
    return () => { active = false }
  }, [id, version, enabled])
  return state
}
