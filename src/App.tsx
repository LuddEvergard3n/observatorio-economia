import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, BookOpen, ChevronRight, CircleDollarSign, Database, Globe2, Landmark, LayoutDashboard, Menu, Moon, Network, Search, Sun, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { getManifest } from '@/lib/data'
import { languageNames, locales, useTranslation } from '@/lib/i18n'
import { timestamp } from '@/lib/format'
import type { Category, Manifest } from '@/lib/types'
import { Overview } from '@/pages/Overview'
import { CatalogPage, ComparePage } from '@/pages/Explore'
import { IdmiPage } from '@/pages/Idmi'
import { HistoryPage } from '@/pages/History'
import { SourcesPage } from '@/pages/Sources'

const navigation = [
  { id:'overview', label:'nav.overview', icon:LayoutDashboard },
  { id:'activity', label:'nav.activity', icon:Activity },
  { id:'prices', label:'nav.prices', icon:CircleDollarSign },
  { id:'fiscal', label:'nav.fiscal', icon:Landmark },
  { id:'labor', label:'nav.labor', icon:Users },
  { id:'development', label:'nav.development', icon:BarChart3 },
  { id:'infrastructure', label:'nav.infrastructure', icon:Network },
  { id:'compare', label:'nav.compare', icon:Globe2 },
  { id:'history', label:'nav.history', icon:BookOpen },
  { id:'idmi', label:'nav.idmi', icon:BarChart3 },
  { id:'sources', label:'nav.sources', icon:Database },
]

/** Coordinate publication loading, accessible navigation and browser-local display preferences. */
export default function App() {
  const { locale, setLocale, t } = useTranslation()
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
  useEffect(()=>{const refresh=setInterval(()=>{getManifest().then(setManifest).catch(()=>{/* Keep the visible snapshot; its age warning remains active. */})},3600000);return()=>clearInterval(refresh)},[])
  useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setMenu(false)};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[])
  const [path='overview',query='']=(hash.replace(/^#\/?/,'')||'overview').split('?')
  const params=new URLSearchParams(query)
  const category=navigation.slice(1,7).some(n=>n.id===path)?path as Category:undefined
  const label=navigation.find(n=>n.id===path)?.label ? t(navigation.find(n=>n.id===path)!.label) : path.startsWith('indicator/') ? t('app.indicatorDetail') : t('app.catalogLabel')
  const stale=manifest?now-Date.parse(manifest.generatedAt)>3*3600*1000:false
  const indicatorId=path.startsWith('indicator/')?path.slice(10):undefined
  const knownIndicator=manifest?.indicators.some(e=>e.definition.id===indicatorId)
  return <TooltipProvider><a href="#main-content" className="skip-link" onClick={event=>{event.preventDefault();document.getElementById('main-content')?.focus()}}>{t('app.skip')}</a>
    {menu&&<button className="sidebar-backdrop" aria-label={t('app.closeNav')} onClick={()=>setMenu(false)}/>}
    <aside className={`sidebar ${menu?'is-open':''}`} aria-label="Navegação principal"><a href="#overview" className="brand"><span className="brand-mark"><BarChart3 size={24}/></span><span>observatório<small>ECONOMIA BRASILEIRA</small></span></a><Button className="sidebar-close" variant="ghost" size="icon" aria-label={t('app.closeMenu')} onClick={()=>setMenu(false)}><X/></Button><div className="sidebar-label">{t('app.explore')}</div><nav>{navigation.map((item,index)=><a className={`nav-link ${path===item.id?'active':''} ${index===7||index===10?'nav-divider':''}`} href={`#${item.id}`} key={item.id} aria-current={path===item.id?'page':undefined}><item.icon size={17}/><span>{t(item.label)}</span>{item.id==='idmi'&&<span className="nav-beta">BETA</span>}{path===item.id&&<ChevronRight size={13}/>}</a>)}</nav><div className="sidebar-bottom"><div><span className={`live-dot ${stale?'amber':''}`}/><strong>{stale?t('app.stale'):t('app.traceable')}</strong></div><p>{t('app.schedule')}</p><a href="https://github.com/LuddEvergard3n/observatorio-economia" target="_blank" rel="noreferrer">{t('app.code')} <ArrowUpRight size={13}/></a><span className="sidebar-version">{t('app.edition')}</span></div></aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumb"><Button variant="ghost" size="icon" className="mobile-menu" aria-label={t('app.openMenu')} aria-expanded={menu} onClick={()=>setMenu(true)}><Menu/></Button><span>{t('app.observatory')}</span><ChevronRight size={12}/><strong>{label}</strong></div><div className="topbar-actions"><form onSubmit={e=>{e.preventDefault();window.location.hash=`indicators?q=${encodeURIComponent(search)}`}} className="topbar-search"><Search size={15}/><input aria-label={t('app.search')} placeholder={t('app.searchPlaceholder')} value={search} onChange={e=>setSearch(e.target.value)}/></form><label className="language-select"><span className="sr-only">{t('app.language')}</span><Globe2 size={15}/><select aria-label={t('app.language')} value={locale} onChange={event=>setLocale(event.target.value as typeof locale)}>{locales.map(value=><option value={value} key={value}>{languageNames[value]}</option>)}</select></label><span className="country-pill">BR <span>{t('app.brazil')}</span></span><Button variant="ghost" size="icon" aria-label={dark?t('app.light'):t('app.dark')} onClick={()=>setDark(!dark)}>{dark?<Sun size={18}/>:<Moon size={18}/>}</Button></div></header>
      <main id="main-content" tabIndex={-1}><div className="content-container">{error?<div className="empty-state fatal-error"><Database size={36}/><h1>{t('app.catalogFailed')}</h1><p>{error}</p><Button onClick={load}>{t('app.retry')}</Button></div>:!manifest?<div className="initial-loading" role="status"><span className="brand-mark"><BarChart3/></span><h1>{t('app.loadingTitle')}</h1><p>{t('app.loadingText')}</p></div>:<>
        <div className="publication-line"><span className={`live-dot ${stale?'amber':''}`}/><span>{stale?t('app.stale'):t('app.lastCheck')} · {timestamp(manifest.generatedAt)} <span className="publication-zone">({t('app.brasilia')})</span></span><a href="#sources">{t('app.coverage')} <ChevronRight size={12}/></a></div>
        {stale&&<div className="notice warning"><p>{t('app.staleNotice')}</p></div>}
        {path==='overview'?<Overview manifest={manifest} dark={dark}/>:category||path==='indicators'?<CatalogPage manifest={manifest} category={category} query={params.get('q')??''}/>:path==='compare'||knownIndicator?<ComparePage key={hash} manifest={manifest} dark={dark} params={params} indicatorId={indicatorId}/>:path==='idmi'?<IdmiPage manifest={manifest}/>:path==='history'?<HistoryPage selectedEvent={params.get('event')??undefined}/>:path==='sources'?<SourcesPage manifest={manifest}/>:<div className="empty-state"><h1>{t('app.notFound')}</h1><a className="text-link" href="#overview">{t('app.backOverview')}</a></div>}
        <footer className="footer"><div><span className="footer-brand">observatório</span><p>{t('app.footerTagline')}</p></div><div><a href="#sources">{t('app.sourcesCoverage')}</a><a href="#idmi">{t('app.idmiMethod')}</a><span>{t('app.hourlyUpdate')}</span></div></footer>
      </>}</div></main>
    </div>
  </TooltipProvider>
}
