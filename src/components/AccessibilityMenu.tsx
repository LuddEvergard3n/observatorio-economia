import { useEffect, useRef, useState } from 'react'
import { Accessibility, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n'

type Preference = 'largeText' | 'highContrast' | 'reduceMotion'
const classes: Record<Preference, string> = { largeText:'a11y-large-text', highContrast:'a11y-high-contrast', reduceMotion:'a11y-reduce-motion' }

function stored(key: Preference) {
  try { return localStorage.getItem(`observatorio:a11y:${key}`) === 'true' } catch { return false }
}

/** Offer persistent display preferences without accounts, tracking or external services. */
export function AccessibilityMenu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<Record<Preference, boolean>>(() => ({ largeText:stored('largeText'), highContrast:stored('highContrast'), reduceMotion:stored('reduceMotion') }))
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    for (const [key, className] of Object.entries(classes) as [Preference, string][]) document.documentElement.classList.toggle(className, preferences[key])
    try { for (const key of Object.keys(classes) as Preference[]) localStorage.setItem(`observatorio:a11y:${key}`, String(preferences[key])) } catch { /* The current session still works when storage is blocked. */ }
  }, [preferences])
  useEffect(() => {
    const close = (event: KeyboardEvent | MouseEvent) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
      if (event instanceof MouseEvent && root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', close); window.addEventListener('mousedown', close)
    return () => { window.removeEventListener('keydown', close); window.removeEventListener('mousedown', close) }
  }, [])
  const toggle = (key: Preference) => setPreferences(current => ({ ...current, [key]:!current[key] }))
  const reset = () => setPreferences({ largeText:false, highContrast:false, reduceMotion:false })
  return <div className="accessibility-menu" ref={root}>
    <Button ref={trigger} variant="ghost" size="icon" aria-label={t('accessibility.open')} aria-expanded={open} aria-controls="accessibility-panel" onClick={() => setOpen(current => !current)}><Accessibility size={19}/></Button>
    {open && <section id="accessibility-panel" className="accessibility-panel" aria-labelledby="accessibility-title">
      <div><span className="eyebrow">{t('accessibility.eyebrow')}</span><h2 id="accessibility-title">{t('accessibility.title')}</h2><p>{t('accessibility.description')}</p></div>
      <div className="accessibility-options">
        {(['largeText','highContrast','reduceMotion'] as Preference[]).map(key => <button type="button" role="switch" aria-checked={preferences[key]} key={key} onClick={() => toggle(key)}><span><strong>{t(`accessibility.${key}`)}</strong><small>{t(`accessibility.${key}Hint`)}</small></span><i aria-hidden="true"><b/></i></button>)}
      </div>
      <Button variant="ghost" size="sm" onClick={reset}><RotateCcw size={14}/>{t('accessibility.reset')}</Button>
    </section>}
  </div>
}
