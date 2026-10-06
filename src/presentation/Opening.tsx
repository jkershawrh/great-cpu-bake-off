import { motion } from 'motion/react'
import { Brand } from './Brand'

export function Opening({ onStart }: { onStart: () => void }) {
  return <main className="opening-v2" onClick={onStart} tabIndex={0} onKeyDown={(event) => ['Enter', ' '].includes(event.key) && onStart()}>
    <div className="opening-copy">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Brand /></motion.div>
      <motion.small className="platform-line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>PRESENTS</motion.small>
      <motion.span className="script-kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}>A little taste. A better decision.</motion.span>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }}>The Great<br /><em>CPU Bake Off</em></motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8 }}>Find the right recipe for AI inference.<br />Same workload. Three ways to serve it.</motion.p>
      <motion.button className="primary-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} onClick={(event) => { event.stopPropagation(); onStart() }}>Begin the tasting →</motion.button>
    </div>
    <motion.img className="hero-bake" src="/art/signature-bake-red-hat.png" alt="An illustrated three-layer pastry topped with an edible red fedora with a black band, representing three compute placement policies" initial={{ opacity: 0, x: 35 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .9 }} />
    <footer className="opening-colophon"><span>Crafted with Red Hat AI & OpenShift</span><span>CPU · Accelerator · A blend of both</span></footer>
  </main>
}
