import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { conditions, number, period } from '@/lib/format'
import { useTranslation } from '@/lib/i18n'
import type { Country, Dataset, Indicator } from '@/lib/types'

/** Paginate all selected observations, retaining nulls and source status for auditable exports. */
export function DataTable({ data, definition, countries, from, to }: { data: Dataset; definition: Indicator; countries: Country[]; from: number; to: number }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const rows = useMemo(() => data.series.filter(s => countries.some(c => c.id === s.country)).flatMap(s => s.observations
    .filter(p => Number(p.period.slice(0, 4)) >= from && Number(p.period.slice(0, 4)) <= to)
    .map(p => ({ ...p, country: countries.find(c => c.id === s.country)!.name })))
    .sort((a, b) => b.period.localeCompare(a.period) || a.country.localeCompare(b.country)), [data, countries, from, to])
  useEffect(() => setPage(0), [data.id, countries.map(c => c.id).join(','), from, to])
  const pages = Math.max(1, Math.ceil(rows.length / 20))
  return <div>
    <div className="table-scroll"><table className="data-table"><caption className="sr-only">Observações de {definition.name}, de {from} a {to}</caption><thead><tr><th>{t('table.reference')}</th><th>{t('table.country')}</th><th className="numeric">{t('table.value')}</th><th>{t('table.condition')}</th></tr></thead><tbody>
      {rows.slice(page * 20, page * 20 + 20).map(row => <tr key={`${row.country}/${row.period}`}><td>{period(row.period, definition.frequency)}</td><td>{row.country}</td><td className="numeric">{number(row.value, definition.id === 'hdi' ? 3 : 2)} <span className="muted">{definition.unit}</span></td><td><span className="table-status">{row.value == null ? t('table.unavailable') : conditions[row.status] ?? row.status}</span></td></tr>)}
      {!rows.length && <tr><td colSpan={4} className="empty-table">{t('table.unavailable')}</td></tr>}
    </tbody></table></div>
    <div className="pagination"><span>{t('table.records', { count:number(rows.length, 0), page:page + 1, pages })}</span><div><Button variant="outline" size="icon" aria-label={t('table.previous')} disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label={t('table.next')} disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight /></Button></div></div>
  </div>
}
