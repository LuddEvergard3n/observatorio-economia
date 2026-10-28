import { useState } from 'react'
import { ExternalLink, Scale, FlaskConical, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { events } from '@/content/events'
import { categories } from '@/lib/format'

/** Distinguish legal changes, statistical revisions and economic context without asserting causality. */
export function HistoryPage({ selectedEvent }: { selectedEvent?: string }) {
  const [type, setType] = useState('all')
  const visible = events.filter(e => type === 'all' || e.type === type).slice().sort((a,b)=>b.date.localeCompare(a.date))
  return <>
    <div className="page-intro"><div><div className="eyebrow">1988—2026 · CONTEXTO DOCUMENTADO</div><h1>Os números têm uma história.</h1><p>Legislação, revisões estatísticas e mudanças econômicas, com acesso aos documentos.</p></div></div>
    <div className="notice"><Scale size={18} /><p>Uma lei pode alterar incentivos, regras e instituições. Sua proximidade com uma mudança no gráfico não demonstra causalidade. Publicação, vigência e implementação podem ocorrer em datas diferentes.</p></div>
    <div className="history-filter segmented">{[['all','Todos os eventos'],['law','Leis e normas'],['method','Mudanças metodológicas'],['context','Contexto econômico']].map(([key,label])=><button key={key} onClick={()=>setType(key)} className={type===key?'active':''}>{label}</button>)}</div>
    <div className="timeline">{visible.map(event=><article id={event.id} key={event.id} className={`timeline-item ${selectedEvent===event.id?'highlighted':''}`}><div className="timeline-date"><strong>{event.date.slice(0,4)}</strong><span>{event.date.slice(8,10)}/{event.date.slice(5,7)}</span></div><div className="timeline-marker">{event.type==='law'?<Scale size={17}/>:event.type==='method'?<FlaskConical size={17}/>:<CalendarDays size={17}/>}</div><div className="panel timeline-card"><div className="timeline-tags"><Badge variant={event.type==='method'?'secondary':'outline'}>{event.type==='method'?'Revisão metodológica':event.type==='law'?'Legislação':'Contexto'}</Badge>{event.categories.map(c=><span key={c}>{categories[c]}</span>)}</div><h2>{event.title}</h2><p>{event.description}</p>{event.administration && <p className="event-accountability"><strong>Governo em exercício:</strong> {event.administration}<br/><strong>Responsável:</strong> {event.responsible}</p>}{event.before && <p className="event-accountability"><strong>Antes:</strong> {event.before}<br/><strong>Depois:</strong> {event.after}</p>}{event.effective && <p className="small-note">Início de aplicação indicado: {event.effective}</p>}<a href={event.url} target="_blank" rel="noreferrer" className="text-link">{event.source} <ExternalLink size={13}/></a>{event.id==='ec40' && <a className="text-link secondary-link" href="https://portal.stf.jus.br/jurisprudencia/sumariosumulas.asp?base=26&sumula=1205" target="_blank" rel="noreferrer">Súmula Vinculante 7 do STF <ExternalLink size={13}/></a>}</div></article>)}</div>
  </>
}
