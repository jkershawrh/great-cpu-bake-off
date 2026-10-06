import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { bestPassingRun, useBakeoff } from '../bakeoff/BakeoffContext'
import { POLICY_LABELS, POLICIES, type BakeoffRun, type Policy } from '../bakeoff/types'
import { ActShell } from './Architecture'

const PROVIDER_TARGETS = [
  { vendor: 'Intel', cpu: 'Xeon', accelerator: 'Gaudi', status: 'CURRENT EVIDENCE', current: true },
  { vendor: 'AMD', cpu: 'EPYC', accelerator: 'Instinct', status: 'QUALIFICATION TARGET', current: false },
  { vendor: 'NVIDIA', cpu: 'Grace', accelerator: 'GPU', status: 'QUALIFICATION TARGET', current: false },
]

export function BriefAct({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const moments = [
    { kicker: 'THE CPU OPPORTUNITY', title: 'CPUs run AI, too.', detail: 'Some inference steps can use existing CPU capacity. Others benefit from an accelerator. Let’s measure which belongs where.' },
    { kicker: 'THE EXPENSIVE QUESTION', title: 'Not “CPU or accelerator?”', detail: 'Which step belongs where?' },
    { kicker: 'THE BUSINESS OUTCOME', title: 'Optimize the completed task.', detail: 'Quality qualifies. Cost and latency break the tie.' },
  ]
  const current = moments[step]
  return <ActShell number="01" eyebrow="The brief" title="A better placement question">
    <button className={`brief-reveal brief-step-${step}`} onClick={() => step < moments.length - 1 ? setStep(step + 1) : onComplete()}>
      <div className="brief-art" aria-hidden="true"><img src="/art/signature-bake.png" alt="" /></div>
      <AnimatePresence mode="wait"><motion.div key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
        <span className="micro-label">{current.kicker}</span><h2>{current.title}</h2><p>{current.detail}</p>
      </motion.div></AnimatePresence>
      <small>{step + 1} / {moments.length} · click to continue</small>
    </button>
  </ActShell>
}

export function MenuAct({ onComplete }: { onComplete: () => void }) {
  const { catalog, selection, setSelection } = useBakeoff()
  const vertical = catalog.verticals.find((item) => item.id === selection.vertical) ?? catalog.verticals[0]
  return <ActShell number="02" eyebrow="Today’s challenge" title="The tasting menu" sub="One case enters three kitchens under one acceptance rule.">
    <div className="challenge-menu">
      <div className="menu-order"><span className="script-kicker">L’ordre du jour</span><h2>{vertical.cases[0].title}</h2><p>{vertical.description}</p><div className="recipe-preview"><div><i>01</i><b>CPU only</b><small>The pantry staple</small></div><div><i>02</i><b>Accelerator only</b><small>The showpiece</small></div><div><i>03</i><b>Heterogeneous</b><small>The chef’s blend</small></div></div><div className="task-ribbon"><b>CLASSIFY</b><i>→</i><b>EXTRACT</b><i>→</i><b>MCP EVIDENCE</b><i>→</i><b>SUMMARIZE</b></div></div>
      <div className="menu-settings">
        <label><span>Industry</span><select value={selection.vertical} onChange={(event) => setSelection({ ...selection, vertical: event.target.value })}>{catalog.verticals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <label><span>CPU model</span><select value={selection.cpuModel} onChange={(event) => setSelection({ ...selection, cpuModel: event.target.value })}>{catalog.cpu_models.map((item) => <option key={item.id} value={item.id} disabled={!item.available}>{item.label}</option>)}</select></label>
        <label><span>Accelerator model</span><select value={selection.acceleratorModel} onChange={(event) => setSelection({ ...selection, acceleratorModel: event.target.value })}>{catalog.accelerator_models.map((item) => <option key={item.id} value={item.id} disabled={!item.available}>{item.label}</option>)}</select></label>
        <div className="cost-assumptions"><button className={selection.cpuAlreadyProvisioned ? 'active' : ''} onClick={() => setSelection({ ...selection, cpuAlreadyProvisioned: !selection.cpuAlreadyProvisioned })}>{selection.cpuAlreadyProvisioned ? 'CPU capacity already provisioned' : 'Dedicated CPU capacity'}</button><label><span>CPU $/HR</span><input aria-label="CPU hourly assumption" type="number" min="0" step=".5" value={selection.cpuHourly} onChange={(event) => setSelection({ ...selection, cpuHourly: Number(event.target.value) })} /></label><label><span>ACCELERATOR $/HR</span><input aria-label="Accelerator hourly assumption" type="number" min="0" step="1" value={selection.acceleratorHourly} onChange={(event) => setSelection({ ...selection, acceleratorHourly: Number(event.target.value) })} /></label></div>
        <div className="provider-targets" aria-label="Red Hat AI hardware qualification targets">{PROVIDER_TARGETS.map((provider) => <div className={provider.current ? 'current' : ''} key={provider.vendor}><span>{provider.vendor}</span><strong>{provider.cpu} + {provider.accelerator}</strong><small>{provider.status}</small></div>)}</div>
        <div className="acceptance"><span>ACCEPTANCE RULE</span><strong>≥ 80% named-case quality</strong><small>Same prompt family · same evidence rule · same evaluator</small></div>
      </div>
    </div>
    <div className="bottom-action"><button className="primary-button" onClick={onComplete}>Walk the architecture →</button></div>
  </ActShell>
}

function SourceBadge({ source }: { source?: string }) { return <span className={`source-pill source-${source ?? 'unavailable'}`}>{source ?? 'not run'}</span> }
function fmt(ms?: number) { return ms === undefined ? '—' : ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s` }

function Lane({ run, policy, selected, onSelect }: { run?: BakeoffRun; policy: Policy; selected: boolean; onSelect: () => void }) {
  const steps = run?.result?.inference_log ?? []
  const identity = policy === 'cpu_only' ? { number: '01', line: 'The pantry staple' } : policy === 'gpu_only' ? { number: '02', line: 'The showpiece' } : { number: '03', line: 'The chef’s blend' }
  return <button className={`proof-lane ${selected ? 'selected' : ''} ${run?.status ?? 'waiting'}`} onClick={onSelect}>
    <header><div className="lane-title"><i>{identity.number}</i><div><span>{POLICY_LABELS[policy]}</span><small>{identity.line}</small></div></div><SourceBadge source={run?.source_state} /></header>
    <div className="lane-metrics"><div><span>Execution</span><strong>{fmt(run?.result?.execution_ms)}</strong></div><div><span>Proxy / 1K</span><strong>{run?.modeled_cost ? `$${run.modeled_cost.cost_per_1000_tasks_usd.toFixed(2)}` : '—'}</strong></div><div><span>Quality</span><strong className={run?.evaluation?.passed ? 'pass' : ''}>{run?.evaluation ? `${Math.round(run.evaluation.score_pct)}%` : '—'}</strong></div></div>
    <div className="lane-flow">{['classify', 'extract_entities', 'mcp', 'summarize'].map((node, index) => {
      const step = steps.find((item) => item.node === node)
      const tool = node === 'mcp'
      return <div className={`lane-step ${step || (tool && run?.result?.tool_evidence.length) ? 'done' : run?.status === 'running' && index === steps.length ? 'active' : ''}`} key={node}><i>{tool ? 'MCP' : !step ? '—' : step.accelerator === 'gpu' ? 'ACC' : 'CPU'}</i><b>{node.replace('_entities', '')}</b><small>{tool ? (run?.result?.tool_evidence.length ? `${run.result.tool_evidence.length} evidence result` : 'domain tool') : step ? `${step.model} · ${fmt(step.latency_ms)}` : 'waiting'}</small></div>
    })}</div>
  </button>
}

export function LiveAct({ onComplete }: { onComplete: () => void }) {
  const { catalog, selection, setSelection, proof, source, running, completed, error, run } = useBakeoff()
  const [selected, setSelected] = useState<Policy>('heterogeneous')
  const [view, setView] = useState<'lanes' | 'evidence'>('lanes')
  const selectedRun = proof?.runs.find((item) => item.policy === selected)
  return <ActShell number="04" eyebrow="Live proof" title="One order. Three kitchens. In parallel." sub="Compare quality, latency, and modeled cost. Open a recipe to inspect its evidence." className="live-act">
    <div className="proof-toolbar">
      <div className="proof-selectors">
        <label><span>INDUSTRY</span><select value={selection.vertical} onChange={(event) => setSelection({ ...selection, vertical: event.target.value })}>{catalog.verticals.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        <label><span>CPU MODEL</span><select value={selection.cpuModel} onChange={(event) => setSelection({ ...selection, cpuModel: event.target.value })}>{catalog.cpu_models.map((item) => <option value={item.id} key={item.id} disabled={!item.available}>{item.label}</option>)}</select></label>
        <label><span>ACCELERATOR MODEL</span><select value={selection.acceleratorModel} onChange={(event) => setSelection({ ...selection, acceleratorModel: event.target.value })}>{catalog.accelerator_models.map((item) => <option value={item.id} key={item.id} disabled={!item.available}>{item.label}</option>)}</select></label>
      </div>
      <button className="primary-button" onClick={() => void run()} disabled={running}>{running ? `Baking · ${completed}/3 complete` : proof ? 'Run again' : 'Run all three →'}</button>
    </div>
    <div className="view-tabs"><button className={view === 'lanes' ? 'active' : ''} onClick={() => setView('lanes')}>Measured comparison</button><button className={view === 'evidence' ? 'active' : ''} onClick={() => setView('evidence')} disabled={!selectedRun?.result}>Prompts + responses</button>{proof && <SourceBadge source={running ? 'live' : source} />}</div>
    {error && <div className="fallback-banner">{error}</div>}
    {view === 'lanes' ? <div className="proof-grid">{POLICIES.map((policy) => <Lane key={policy} policy={policy} run={proof?.runs.find((item) => item.policy === policy)} selected={selected === policy} onSelect={() => setSelected(policy)} />)}</div> : <EvidencePanel run={selectedRun} />}
    <div className="bottom-action split"><span>{proof ? `${proof.case_title} · collected ${new Date(proof.collected_at).toLocaleTimeString()}` : 'No metrics are shown until a live run or labeled rehearsal fallback completes.'}</span><button className="primary-button" onClick={onComplete} disabled={!proof || running}>Take it to judging →</button></div>
  </ActShell>
}

function EvidencePanel({ run }: { run?: BakeoffRun }) {
  const [stepIndex, setStepIndex] = useState(0)
  const steps = run?.result?.inference_log ?? []
  const step = steps[stepIndex]
  if (!run?.result || !steps.length) return <div className="evidence-empty">Run a policy before opening its evidence.</div>
  const showingTool = stepIndex === steps.length
  const toolEvidence = run.result.tool_evidence
  return <div className="evidence-panel">
    <nav>{steps.map((item, index) => <button className={index === stepIndex ? 'active' : ''} key={`${item.node}-${index}`} onClick={() => setStepIndex(index)}><span>{index + 1}</span><b>{item.node.replaceAll('_', ' ')}</b><small>{item.accelerator.toUpperCase()} · {fmt(item.latency_ms)}</small></button>)}<button className={showingTool ? 'active' : ''} onClick={() => setStepIndex(steps.length)}><span>{steps.length + 1}</span><b>MCP evidence</b><small>TOOL · {toolEvidence.length} result</small></button></nav>
    {showingTool ? <section><div className="evidence-route"><div><span>PROTOCOL</span><strong>MCP · JSON-RPC</strong></div><div><span>SOURCE</span><strong>{run.source_state}</strong></div><div><span>ROLE</span><strong>Ground the response before synthesis</strong></div></div><div className="prompt-response"><article><span>TOOL REQUEST</span><p>Collect the case-specific evidence required by the named evaluation.</p></article><article><span>TOOL RESPONSE</span><p>{JSON.stringify(toolEvidence, null, 2)}</p></article></div></section> : <section><div className="evidence-route"><div><span>ROUTE</span><strong>{step.route}</strong></div><div><span>MODEL</span><strong>{step.model}</strong></div><div><span>HARDWARE</span><strong>{step.hardware_provider}</strong></div></div><div className="prompt-response"><article><span>PROMPT IN</span><p>{step.prompt}</p></article><article><span>RESPONSE OUT</span><p>{step.output}</p></article></div></section>}
  </div>
}

export function JudgingAct({ onComplete }: { onComplete: () => void }) {
  const { proof, source } = useBakeoff()
  const [selected, setSelected] = useState<Policy>('heterogeneous')
  if (!proof) return <ActShell number="05" eyebrow="The judging table" title="The judges need a completed bake" sub="Return to live proof and run all three policies."><div className="center-message"><button className="secondary-button" onClick={onComplete}>Continue with the story →</button></div></ActShell>
  const run = proof.runs.find((item) => item.policy === selected)
  return <ActShell number="05" eyebrow="The judging table" title="Every recipe must pass the taste test." sub="Select a recipe to inspect exactly how its named-case score was earned.">
    <div className="judge-layout"><nav>{POLICIES.map((policy) => { const lane = proof.runs.find((item) => item.policy === policy); return <button key={policy} onClick={() => setSelected(policy)} className={selected === policy ? 'active' : ''}><span>{POLICY_LABELS[policy]}</span><strong>{lane?.evaluation ? `${Math.round(lane.evaluation.score_pct)}%` : '—'}</strong><small>{lane?.evaluation?.passed ? 'QUALIFIED' : 'NOT QUALIFIED'}</small></button> })}</nav><section><div className="judge-heading"><div><span>NAMED-CASE EVALUATION</span><h2>{POLICY_LABELS[selected]}</h2></div><SourceBadge source={source} /></div><div className="score-components">{run?.evaluation?.components?.map((component) => <div key={component.name}><span>{component.name}</span><div><i style={{ width: `${component.possible ? component.earned / component.possible * 100 : 0}%` }} /></div><strong>{component.earned}/{component.possible}</strong><small>{component.detail}</small></div>)}</div><div className={`judge-total ${run?.evaluation?.passed ? 'qualified' : ''}`}><div><span>JUDGES’ SCORE</span><strong>{run?.evaluation ? `${Math.round(run.evaluation.score_pct)}` : '—'}<i>/100</i></strong></div><p>{run?.evaluation?.passed ? 'This recipe clears the named-case quality gate. It advances to the cost-and-latency decision.' : 'This recipe does not clear the named-case quality gate. Cost cannot rescue it.'}</p></div></section></div>
    <div className="bottom-action"><button className="primary-button" onClick={onComplete}>Resolve the placement →</button></div>
  </ActShell>
}

export function ResolutionAct({ onComplete }: { onComplete: () => void }) {
  const { proof, source } = useBakeoff()
  const runs = proof?.runs.filter((item) => item.status === 'completed') ?? []
  const winner = bestPassingRun(runs)
  return <ActShell number="06" eyebrow="The recipe" title="What stayed constant—and what changed" sub="Same task and quality gate. Different placement, time, and modeled cost.">
    <div className="resolution-grid"><section className="constant-card"><span>HELD CONSTANT</span><h2>{proof?.case_title ?? 'Named workload case'}</h2><ul><li>Same business input</li><li>Same prompt family</li><li>Same MCP evidence rule</li><li>Same 80% quality gate</li><li>Same OpenAI-compatible contract</li></ul><SourceBadge source={source} /></section><section className="changed-card"><span>PLACEMENT CHANGED</span>{runs.map((run) => { const cpu = run.result?.inference_log.filter((step) => step.accelerator === 'cpu').length ?? 0; const acc = run.result?.inference_log.filter((step) => step.accelerator === 'gpu').length ?? 0; return <div key={run.policy} className={winner?.policy === run.policy ? 'winner' : ''}><b>{POLICY_LABELS[run.policy]}</b><p>{cpu} CPU calls · {acc} accelerator calls</p><strong>{fmt(run.result?.execution_ms)} · ${run.modeled_cost?.cost_per_1000_tasks_usd.toFixed(2) ?? '—'} / 1K · {Math.round(run.evaluation?.score_pct ?? 0)}%</strong>{winner?.policy === run.policy && <i>LOWEST-PROXY PASS</i>}</div> })}</section></div>
    <div className="decision-strip"><span>INTERPRETATION</span><strong>{winner ? `${POLICY_LABELS[winner.policy]} produced the lowest execution-cost proxy among policies that passed this named case.` : 'No placement can be selected until a policy passes quality.'}</strong><small>The proxy excludes acquisition, utilization, queueing, power, cooling, and operations unless the source service explicitly models them.</small></div>
    <div className="bottom-action"><button className="primary-button" onClick={onComplete}>Deliver the verdict →</button></div>
  </ActShell>
}

export function VerdictAct({ onRestart }: { onRestart: () => void }) {
  const { proof, source } = useBakeoff()
  const runs = proof?.runs.filter((item) => item.status === 'completed') ?? []
  const winner = bestPassingRun(runs)
  return <ActShell number="07" eyebrow="The verdict" title="Your workload. Your hardware. Red Hat AI." sub="Prove placement first. Build the business case from measured evidence.">
    <div className="verdict-card"><span className="script-kicker">The judges’ decision</span><h2>{winner ? `${POLICY_LABELS[winner.policy]} is the current recipe to qualify further.` : 'Run your workload before naming a recipe.'}</h2><div className="verdict-metrics"><div><span>Quality gate</span><strong>{winner?.evaluation ? `${Math.round(winner.evaluation.score_pct)}%` : 'Not run'}</strong></div><div><span>Execution</span><strong>{fmt(winner?.result?.execution_ms)}</strong></div><div><span>Proxy / 1K</span><strong>{winner?.modeled_cost ? `$${winner.modeled_cost.cost_per_1000_tasks_usd.toFixed(2)}` : '—'}</strong></div><div><span>Source</span><strong>{source?.toUpperCase() ?? 'NOT RUN'}</strong></div></div><p>Next: bring one workload, one eval set, and your real cost assumptions to a target Red Hat AI environment.</p></div>
    <div className="qualification-next" aria-label="Proposed next steps">
      <span className="micro-label">PROPOSED NEXT STEPS · NOT COMPLETED QUALIFICATION</span>
      <p><strong>Intel · AMD · NVIDIA</strong><span>Provider qualification → repeatable benchmarks → full TCO</span></p>
      <small>Intel demo evidence today. AMD and NVIDIA are targets. Execution-cost estimates are not full TCO; a successful demo does not establish product support.</small>
    </div>
    <div className="bottom-action"><button className="primary-button" onClick={onRestart}>Restart</button></div>
  </ActShell>
}
