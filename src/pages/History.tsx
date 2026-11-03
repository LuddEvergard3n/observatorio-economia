import { useState } from 'react'
import { ExternalLink, Scale, FlaskConical, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { events } from '@/content/events'
import { useTranslation } from '@/lib/i18n'

/** Distinguish legal changes, statistical revisions and economic context without asserting causality. */
export function HistoryPage({ selectedEvent }: { selectedEvent?: string }) {
  const { t } = useTranslation()
  const [type, setType] = useState('all')
  const visible = events.filter(e => type === 'all' || e.type === type).slice().sort((a,b)=>b.date.localeCompare(a.date))
  return <>
    <div className="page-intro"><div><div className="eyebrow">{t('history.eyebrow')}</div><h1>{t('history.title')}</h1><p>{t('history.description')}</p></div></div>
    <div className="notice"><Scale size={18} /><p>{t('history.caution')}</p></div>
    <div className="history-filter segmented">{[['all','history.all'],['law','history.laws'],['method','history.methods'],['context','history.context']].map(([key,label])=><button key={key} onClick={()=>setType(key)} className={type===key?'active':''}>{t(label)}</button>)}</div>
    <div className="timeline">{visible.map(event=><article id={event.id} key={event.id} className={`timeline-item ${selectedEvent===event.id?'highlighted':''}`}><div className="timeline-date"><strong>{event.date.slice(0,4)}</strong><span>{event.date.slice(8,10)}/{event.date.slice(5,7)}</span></div><div className="timeline-marker">{event.type==='law'?<Scale size={17}/>:event.type==='method'?<FlaskConical size={17}/>:<CalendarDays size={17}/>}</div><div className="panel timeline-card"><div className="timeline-tags"><Badge variant={event.type==='method'?'secondary':'outline'}>{event.type==='method'?t('history.revision'):event.type==='law'?t('history.legislation'):t('event.context')}</Badge>{event.categories.map(c=><span key={c}>{t(`category.${c}`)}</span>)}</div><h2>{event.title}</h2><p>{event.description}</p>{event.administration && <p className="event-accountability"><strong>{t('history.government')}</strong> {event.administration}<br/><strong>{t('history.responsible')}</strong> {event.responsible}</p>}{event.before && <p className="event-accountability"><strong>{t('series.before')}</strong> {event.before}<br/><strong>{t('series.after')}</strong> {event.after}</p>}{event.effective && <p className="small-note">{t('history.effective', { date: event.effective })}</p>}<a href={event.url} target="_blank" rel="noreferrer" className="text-link">{event.source} <ExternalLink size={13}/></a>{event.id==='ec40' && <a className="text-link secondary-link" href="https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1205" target="_blank" rel="noreferrer">{t('history.stf')} <ExternalLink size={13}/></a>}</div></article>)}</div>
  </>
}
