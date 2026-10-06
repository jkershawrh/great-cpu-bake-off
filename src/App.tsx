import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { BakeoffProvider } from './bakeoff/BakeoffContext'
import { ArchitectureAct } from './presentation/Architecture'
import { ACTS, Header } from './presentation/Header'
import { Opening } from './presentation/Opening'
import { BriefAct, JudgingAct, LiveAct, MenuAct, ResolutionAct, VerdictAct } from './presentation/StoryActs'
import './theme.css'

function readAct() {
  const value = Number(new URLSearchParams(window.location.search).get('act'))
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), ACTS.length - 1) : 0
}

function Presentation() {
  const initial = useMemo(() => ({ started: new URLSearchParams(window.location.search).has('act'), act: readAct() }), [])
  const [started, setStarted] = useState(initial.started)
  const [act, setAct] = useState(initial.act)
  const touch = useRef<number | undefined>(undefined)

  const go = useCallback((index: number, replace = false) => {
    const safe = Math.min(Math.max(index, 0), ACTS.length - 1)
    setStarted(true)
    setAct(safe)
    window.history[replace ? 'replaceState' : 'pushState'](null, '', `?act=${safe}`)
  }, [])
  const next = useCallback(() => go(act + 1), [act, go])
  const previous = useCallback(() => go(act - 1), [act, go])
  const restart = useCallback(() => { setStarted(false); setAct(0); window.history.pushState(null, '', window.location.pathname) }, [])

  useEffect(() => {
    const onPop = () => { const params = new URLSearchParams(window.location.search); setStarted(params.has('act')); setAct(readAct()) }
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('input, select, textarea')) return
      if (['ArrowRight', 'PageDown'].includes(event.key)) next()
      if (['ArrowLeft', 'PageUp'].includes(event.key)) previous()
      if (event.key === 'Home') restart()
      if (event.key.toLowerCase() === 'f') void document.documentElement.requestFullscreen?.()
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('keydown', onKey) }
  }, [next, previous, restart])

  if (!started) return <Opening onStart={() => go(0, true)} />
  const components = [
    <BriefAct onComplete={next} />,
    <MenuAct onComplete={next} />,
    <ArchitectureAct onComplete={next} />,
    <LiveAct onComplete={next} />,
    <JudgingAct onComplete={next} />,
    <ResolutionAct onComplete={next} />,
    <VerdictAct onRestart={restart} />,
  ]
  return <div className="presentation" onTouchStart={(event) => { touch.current = event.changedTouches[0].clientX }} onTouchEnd={(event) => { if (touch.current === undefined) return; const delta = event.changedTouches[0].clientX - touch.current; if (Math.abs(delta) > 80) delta < 0 ? next() : previous(); touch.current = undefined }}>
    <Header act={act} onGo={go} onPrevious={previous} onNext={next} onRestart={restart} onFullscreen={() => document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen?.()} />
    <div className="stage-v2"><AnimatePresence mode="sync"><motion.div className="act-motion" key={act} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: .28 }}>{components[act]}</motion.div></AnimatePresence></div>
    <div className="act-counter">{ACTS[act].number} · 1/1</div>
  </div>
}

export default function App() {
  return <BakeoffProvider><Presentation /></BakeoffProvider>
}
