import React from 'react'
import { motion } from 'motion/react'

const layers = [
  { id: 'case', label: 'The order', question: 'What are we actually trying to complete?', answer: 'A named workload enters with its acceptance rule.', detail: 'The case, prompts, evidence requirements, and 80% quality threshold stay constant across all three policies.', nodes: ['workload', 'proof'] },
  { id: 'contract', label: 'One pass', question: 'How can placement change without rewriting the app?', answer: 'Every model tier presents one OpenAI-compatible contract.', detail: 'The request shape stays fixed while Red Hat AI Inference changes the selected endpoint.', nodes: ['proof', 'cpu', 'accelerator'] },
  { id: 'router', label: 'The head chef', question: 'Who decides where each step belongs?', answer: 'The semantic router classifies each heterogeneous step.', detail: 'CPU-only and accelerator-only are fixed baselines. The heterogeneous policy routes classification, extraction, and synthesis independently.', nodes: ['router', 'cpu', 'accelerator'] },
  { id: 'evidence', label: 'The pantry', question: 'What keeps the result grounded?', answer: 'MCP tools collect domain evidence before synthesis.', detail: 'Tool evidence carries its own live or rehearsal source state. A model response cannot silently substitute for missing evidence.', nodes: ['mcp', 'proof'] },
  { id: 'judge', label: 'The judging table', question: 'What makes a recipe eligible to win?', answer: 'A deterministic evaluator gates the result before cost is considered.', detail: 'Classification, entity recall, MCP evidence, and summary coverage are scored for this named case. The workload owner retains the verdict.', nodes: ['evaluator', 'human'] },
]

const nodes = [
  { id: 'workload', kind: 'INPUT', title: 'Named workload', note: 'case + acceptance rule' },
  { id: 'proof', kind: 'RED HAT APP', title: 'Proof API', note: 'three isolated policies' },
  { id: 'router', kind: 'POLICY', title: 'Semantic router', note: 'step complexity' },
  { id: 'cpu', kind: 'MODEL TIER', title: 'CPU endpoint', note: 'Red Hat AI Inference' },
  { id: 'accelerator', kind: 'MODEL TIER', title: 'Accelerator endpoint', note: 'Red Hat AI Inference' },
  { id: 'mcp', kind: 'EVIDENCE', title: 'MCP tools', note: 'domain facts + provenance' },
  { id: 'evaluator', kind: 'QUALITY', title: 'Named-case evaluator', note: 'deterministic checks' },
  { id: 'human', kind: 'AUTHORITY', title: 'Workload owner', note: 'accepts placement recipe' },
]

export function ArchitectureDiagram({ active = [] }: { active?: string[] }) {
  return <div className="architecture-diagram" aria-label="Technical architecture flow">
    <div className="architecture-boundary-label">OpenShift project · Red Hat AI</div>
    <div className="diagram-watermark">architecture<br />mise en place</div>
    <div className="architecture-main">
      {nodes.slice(0, 3).map((node, index) => <div className="arch-unit" key={node.id}>
        <motion.div className={`arch-node ${active.includes(node.id) ? 'active' : ''}`} animate={active.includes(node.id) ? { y: [0, -3, 0] } : {}} transition={{ duration: .35 }}><span>{node.kind}</span><strong>{node.title}</strong><small>{node.note}</small></motion.div>
        {index < 4 && <div className={`arch-arrow ${active.includes(node.id) && active.includes(nodes[index + 1].id) ? 'active' : ''}`}><i /><b>→</b></div>}
      </div>)}
      <div className="arch-tiers" aria-label="Alternative inference routes">{nodes.slice(3, 5).map((node) => <div key={node.id} className={`arch-node ${active.includes(node.id) ? 'active' : ''}`}><span>{node.kind}</span><strong>{node.title}</strong><small>{node.note}</small></div>)}</div>
    </div>
    <div className="architecture-support">
      {nodes.slice(5).map((node, index) => <div className="arch-unit" key={node.id}>
        <motion.div className={`arch-node support ${active.includes(node.id) ? 'active' : ''}`}><span>{node.kind}</span><strong>{node.title}</strong><small>{node.note}</small></motion.div>
        {index < 2 && <div className={`arch-arrow ${active.includes(node.id) && active.includes(nodes[index + 6].id) ? 'active' : ''}`}><i /><b>→</b></div>}
      </div>)}
    </div>
  </div>
}

export function ArchitectureAct({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = React.useState(0)
  const [answer, setAnswer] = React.useState(false)
  const layer = layers[step]
  const done = step === layers.length - 1 && answer
  const advance = () => answer ? (step < layers.length - 1 ? (setStep(step + 1), setAnswer(false)) : onComplete()) : setAnswer(true)
  return <ActShell number="03" eyebrow="Guided architecture" title="Every component must earn its place">
    <div className="architecture-guide">
      <nav className="architecture-steps">{layers.map((item, index) => <button key={item.id} className={index === step ? 'active' : index < step ? 'done' : ''} onClick={() => { if (index <= step) { setStep(index); setAnswer(index < step) } }}><span>{index < step ? '✓' : index + 1}</span><b>{item.label}</b></button>)}</nav>
      <div className="architecture-story">
        <motion.div key={`${step}-${answer}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="micro-label">{answer ? 'ARCHITECTURE ANSWER' : 'WORKLOAD QUESTION'}</span>
          <h2>{answer ? layer.answer : layer.question}</h2>
          {answer && <p>{layer.detail}</p>}
        </motion.div>
        <button className="primary-button" onClick={advance}>{done ? 'Run the live bake →' : answer ? 'Next question →' : 'Reveal the answer →'}</button>
      </div>
    </div>
    <ArchitectureDiagram active={answer ? layer.nodes : []} />
  </ActShell>
}

export function ActShell({ number, eyebrow, title, sub, children, className = '' }: { number: string; eyebrow: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return <main className={`act-shell ${className}`} data-act={number}><div className="act-ornament" aria-hidden="true"><span>{number}</span><i /></div><div className="act-heading"><span>{number} · {eyebrow}</span><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{children}</main>
}
