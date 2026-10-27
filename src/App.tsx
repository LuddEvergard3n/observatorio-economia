import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, BookOpen, ChevronRight, CircleDollarSign, Database, Globe2, Landmark, LayoutDashboard, Menu, Moon, Network, Search, Sun, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getManifest } from '@/lib/data'
import { timestamp } from '@/lib/format'
import type { Category, Manifest } from '@/lib/types'
import { Overview } from '@/pages/Overview'
import { CatalogPage, ComparePage } from '@/pages/Explore'
import { IdmiPage } from '@/pages/Idmi'
import { HistoryPage } from '@/pages/History'
import { SourcesPage } from '@/pages/Sources'

const navigation = [
  { id:'overview', label:'Panorama Brasil', icon:LayoutDashboard },
  { id:'activity', label:'Atividade econômica', icon:Activity },
  { id:'prices', label:'Preços, juros e câmbio', icon:CircleDollarSign },
  { id:'fiscal', label:'Contas públicas', icon:Landmark },
  { id:'labor', label:'Trabalho e renda', icon:Users },
  { id:'development', label:'Desenvolvimento', icon:BarChart3 },
  { id:'infrastructure', label:'Infraestrutura', icon:Network },
  { id:'compare', label:'Comparar países', icon:Globe2 },
  { id:'history', label:'História econômica', icon:BookOpen },
  { id:'idmi', label:'Índice IDMI', icon:BarChart3 },
  { id:'sources', label:'Fontes e metodologia', icon:Database },
]

/** Coordinate publication loading, accessible navigation and browser-local display preferences. */
export default function App() {
  const [manifest,setManifest]=useState<Manifest|null>(null)
  const [error,setError]=useState<string|null>(null)
  const [hash,setHash]=useState(window.location.hash)
  const [menu,setMenu]=useState(false)
  const [dark,setDark]=useState(()=>{try{return localStorage.getItem('observatorio:theme')==='dark'}catch{return false}})
  const [search,setSearch]=useState('')
  const [now,setNow]=useState(Date.now())
  const load=()=>{setError(null);getManifest().then(setManifest).catch(e=>setError(String(e.message)))}
  useEffect(()=>{load();const change=()=>{setHash(window.location.hash);setMenu(false);window.scrollTo({top:0})};window.addEventListener('hashchange',change);const timer=setInterval(()=>setNow(Date.now()),60000);return()=>{window.removeEventListener('hashchange',change);clearInterval(timer)}},[])
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark);try{localStorage.setItem('observatorio:theme',dark?'dark':'light')}catch{/* Storage may be disabled; the current session still works. */}},[dark])
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[])
  const [path='overview',query='']=(hash.replace(/^#\/?/,'')||'overview').split('?')
  const params=new URLSearchParams(query)
  const category=navigation.slice(1,7).some(n=>n.id===path)?path as Category:undefined
  const label=navigation.find(n=>n.id===path)?.label??(path.startsWith('indicator/')?'Detalhe do indicador':'Catálogo de indicadores')
  const stale=manifest?now-Date.parse(manifest.generatedAt)>3*3600*1000:false
  const indicatorId=path.startsWith('indicator/')?path.slice(10):undefined
  const knownIndicator=manifest?.indicators.some(e=>e.definition.id===indicatorId)
  return <TooltipProvider><a href="#main-content" className="skip-link" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus()}}>Pular para o conteúdo</a>
    {menu&&<button className="sidebar-backdrop" aria-label="Fechar navegação" onClick={()=>setMenu(false)}/>}
    <aside className={`sidebar ${menu?'is-open':''}`} aria-label="Navegação principal"><a href="#overview" className="brand"><span className="brand-mark"><BarChart3 size={24}/></span><span>observatório<small>ECONOMIA BRASILEIRA</small></span></a><Button className="sidebar-close" variant="ghost" size="icon" aria-label="Fechar menu" onClick={()=>setMenu(false)}><X/></Button><div className="sidebar-label">EXPLORE O PANORAMA</div><nav>{navigation.map((item,index)=><a className={`nav-link ${path===item.id?'active':''} ${index===7||index===10?'nav-divider':''}`} href={`#${item.id}`} key={item.id} aria-current={path===item.id?'page':undefined}><item.icon size={17}/><span>{item.label}</span>{item.id==='idmi'&&<span className="nav-beta">BETA</span>}{path===item.id&&<ChevronRight size={13}/>}</a>)}</nav><div className="sidebar-bottom"><div><span className={`live-dot ${stale?'amber':''}`}/><strong>{stale?'Verificação atrasada':'Dados com rastreabilidade'}</strong></div><p>Consulta programada a cada hora.<br/>Cada fonte tem seu calendário.</p><a href="https://github.com/LuddEvergard3n/observatorio-economia" target="_blank" rel="noreferrer">Código e documentação <ArrowUpRight size={13}/></a><span className="sidebar-version">EDIÇÃO 0.1 · 12 PAÍSES</span></div></aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Abrir menu" aria-expanded={menu} onClick={()=>setMenu(true)}><Menu/></Button><span>Observatório</span><ChevronRight size={12}/><strong>{label}</strong></div><div className="topbar-actions"><form onSubmit={e=>{e.preventDefault();window.location.hash=`indicators?q=${encodeURIComponent(search)}`}} className="topbar-search"><Search size={15}/><input aria-label="Pesquisar no catálogo" placeholder="Buscar indicador…" value={search} onChange={e=>setSearch(e.target.value)}/></form><span className="country-pill">BR <span>Brasil</span></span><Button variant="ghost" size="icon" aria-label={dark?'Ativar tema claro':'Ativar tema escuro'} onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</Button></div></header>
      <main id="main-content" tabIndex={-1}><div className="content-container">{error?<div className="empty-state fatal-error"><Database size={36}/><h1>O catálogo não pôde ser carregado.</h1><p>{error}</p><Button onClick={load}>Tentar novamente</Button></div>:!manifest?<div className="initial-loading" role="status"><span className="brand-mark"><BarChart3/></span><h1>Preparando o observatório</h1><p>Carregando o catálogo e os indicadores publicados…</p></div>:<>
        <div className="publication-line"><span className={`live-dot ${stale?'amber':''}`}/><span>{stale?'Última verificação há mais de 3 horas':'Última verificação'} · {timestamp(manifest.generatedAt)} <span className="publication-zone">(Brasília)</span></span><a href="#sources">Ver cobertura <ChevronRight size={12}/></a></div>
        {stale&&<div className="notice warning"><p>O agendamento pode estar atrasado. Os dados preservados continuam disponíveis; consulte o período de referência de cada série.</p></div>}
        {path==='overview'?<Overview manifest={manifest} dark={dark}/>:category||path==='indicators'?<CatalogPage manifest={manifest} category={category} query={params.get('q')??''}/>:path==='compare'||knownIndicator?<ComparePage key={hash} manifest={manifest} dark={dark} params={params} indicatorId={indicatorId}/>:path==='idmi'?<IdmiPage manifest={manifest}/>:path==='history'?<HistoryPage selectedEvent={params.get('event')??undefined}/>:path==='sources'?<SourcesPage manifest={manifest}/>:<div className="empty-state"><h1>Página não encontrada</h1><a className="text-link" href="#overview">Voltar ao panorama</a></div>}
        <footer className="footer"><div><span className="footer-brand">observatório</span><p>Dados públicos. Métodos visíveis. Comparações com contexto.</p></div><div><a href="#sources">Fontes e cobertura</a><a href="#idmi">Metodologia do IDMI</a><span>1988—2026 · Atualização programada por hora</span></div></footer>
      </>}</div></main>
    </div>
  </TooltipProvider>
}
