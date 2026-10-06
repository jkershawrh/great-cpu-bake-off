import { useState } from 'react'
import { Brand } from './Brand'

export const ACTS = [
  { id: 'brief', number: '01', title: 'The Brief' },
  { id: 'menu', number: '02', title: 'Le Menu' },
  { id: 'architecture', number: '03', title: 'The Kitchens' },
  { id: 'live', number: '04', title: 'The Live Bake' },
  { id: 'judging', number: '05', title: 'The Judging Table' },
  { id: 'resolution', number: '06', title: 'The Recipe' },
  { id: 'verdict', number: '07', title: 'The Verdict' },
]

export function Header({ act, onGo, onPrevious, onNext, onRestart, onFullscreen }: { act: number; onGo: (index: number) => void; onPrevious: () => void; onNext: () => void; onRestart: () => void; onFullscreen: () => void }) {
  const [open, setOpen] = useState(false)
  return <>
    <header className="topbar">
      <button className="brand-button" onClick={onRestart} aria-label="Restart presentation"><Brand compact /></button>
      <button className="menu-script" onClick={() => setOpen(true)}>Le Menu</button>
      <nav className="top-controls" aria-label="Presentation navigation">
        <button onClick={onPrevious} aria-label="Previous act">←</button>
        <div className="act-dots">{ACTS.map((item, index) => <button key={item.id} aria-label={`Go to ${item.title}`} title={`${item.number} ${item.title}`} className={index === act ? 'active' : index < act ? 'done' : ''} onClick={() => onGo(index)} />)}</div>
        <button onClick={onNext} aria-label="Next act">→</button>
        <button onClick={onFullscreen} aria-label="Toggle fullscreen">⛶</button>
      </nav>
    </header>
    {open && <div className="menu-overlay" onClick={() => setOpen(false)}>
      <section className="menu-card" onClick={(event) => event.stopPropagation()} aria-label="Presentation menu">
        <span className="menu-overline">Red Hat AI presents</span>
        <h2>Le Menu</h2>
        <p>One business task, tested through three compute recipes.</p>
        <ol>{ACTS.map((item, index) => <li key={item.id}><button className={index === act ? 'active' : ''} onClick={() => { onGo(index); setOpen(false) }}><span>{item.number}</span><strong>{item.title}</strong><i>{index < act ? 'served' : index === act ? 'now serving' : 'up next'}</i></button></li>)}</ol>
        <button className="quiet-button" onClick={() => setOpen(false)}>Return to presentation</button>
      </section>
    </div>}
  </>
}
