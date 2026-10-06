import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { catalogFixture, rehearsalResponseFor } from './fixture'
import { POLICIES, type BakeoffCatalog, type BakeoffResponse, type BakeoffRun, type BakeoffSelection, type Policy, type SourceState } from './types'

interface ContextValue {
  catalog: BakeoffCatalog
  selection: BakeoffSelection
  setSelection: (next: BakeoffSelection) => void
  proof?: BakeoffResponse
  source?: SourceState
  running: boolean
  completed: number
  error?: string
  run: () => Promise<void>
  cancel: () => void
}

const Context = createContext<ContextValue | null>(null)

export function mergeCatalog(live: BakeoffCatalog, baseline: BakeoffCatalog = catalogFixture): BakeoffCatalog {
  const mergeById = <T extends { id: string }>(preferred: T[], fallback: T[]) => [
    ...preferred,
    ...fallback.filter((candidate) => !preferred.some((item) => item.id === candidate.id)),
  ]
  return {
    verticals: mergeById(live.verticals, baseline.verticals),
    cpu_models: mergeById(live.cpu_models, baseline.cpu_models.map((item) => ({ ...item, available: false }))),
    accelerator_models: mergeById(live.accelerator_models, baseline.accelerator_models.map((item) => ({ ...item, available: false }))),
  }
}

export function BakeoffProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState(catalogFixture)
  const [selection, setSelection] = useState<BakeoffSelection>({ vertical: 'food_manufacturing', cpuModel: catalogFixture.cpu_models[0].id, acceleratorModel: catalogFixture.accelerator_models[0].id, cpuAlreadyProvisioned: true, cpuHourly: 4, acceleratorHourly: 36 })
  const [proof, setProof] = useState<BakeoffResponse>()
  const [source, setSource] = useState<SourceState>()
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [error, setError] = useState<string>()
  const active = useRef<AbortController | undefined>(undefined)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/proof/api/v1/catalog', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('catalog unavailable')))
      .then((data) => setCatalog(mergeCatalog(data as BakeoffCatalog)))
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const cancel = useCallback(() => active.current?.abort(), [])
  const run = useCallback(async () => {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    const vertical = catalog.verticals.find((item) => item.id === selection.vertical) ?? catalog.verticals[0]
    const initial: BakeoffResponse = { sourceState: 'live', vertical: vertical.id, case_id: vertical.cases[0].id, case_title: vertical.cases[0].title, collected_at: new Date().toISOString(), policies_run: 3, runs: POLICIES.map((policy) => ({ policy, status: 'running', source_state: 'unavailable' })) }
    setProof(initial); setSource('live'); setRunning(true); setCompleted(0); setError(undefined)
    let liveCount = 0
    let fallbackCount = 0
    await Promise.allSettled(POLICIES.map(async (policy) => {
      let lane: BakeoffRun
      const laneController = new AbortController()
      const cancelLane = () => laneController.abort()
      controller.signal.addEventListener('abort', cancelLane, { once: true })
      const timeout = window.setTimeout(() => laneController.abort(), 180_000)
      try {
        const response = await fetch('/proof/api/v1/bakeoff', { method: 'POST', signal: laneController.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vertical: selection.vertical, case_id: vertical.cases[0].id, cpu_model: selection.cpuModel, accelerator_model: selection.acceleratorModel, policies: [policy], quality_threshold_pct: 80, cost_assumptions: { cpu_already_provisioned: selection.cpuAlreadyProvisioned, cpu_hourly_usd: selection.cpuHourly, accelerator_hourly_usd: selection.acceleratorHourly } }) })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json() as BakeoffResponse
        const returned = data.runs.find((item) => item.policy === policy)
        if (!returned) throw new Error('Missing requested policy in response')
        lane = returned
        if (lane.status === 'completed' && lane.source_state === 'live') liveCount += 1
        if (lane.status === 'failed' || lane.status === 'unavailable') setError(lane.error || 'A live lane could not complete.')
      } catch (caught) {
        if (controller.signal.aborted) return
        lane = structuredClone(rehearsalResponseFor(vertical.id).runs.find((item) => item.policy === policy)!)
        fallbackCount += 1
        setError('One or more lanes used checked-in rehearsal evidence because a live endpoint was unavailable.')
      } finally {
        window.clearTimeout(timeout)
        controller.signal.removeEventListener('abort', cancelLane)
      }
      setProof((current) => current && ({ ...current, collected_at: new Date().toISOString(), runs: current.runs.map((item) => item.policy === policy ? lane : item) }))
      setCompleted((value) => value + 1)
    }))
    if (!controller.signal.aborted) {
      setSource(liveCount === 3 ? 'live' : fallbackCount === 3 ? (navigator.onLine ? 'rehearsal' : 'offline') : 'mixed')
      setProof((current) => current && ({ ...current, sourceState: liveCount === 3 ? 'live' : fallbackCount === 3 ? 'rehearsal' : 'mixed' }))
    }
    setRunning(false)
    active.current = undefined
  }, [catalog, selection])

  const value = useMemo(() => ({ catalog, selection, setSelection, proof, source, running, completed, error, run, cancel }), [catalog, selection, proof, source, running, completed, error, run, cancel])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useBakeoff() {
  const value = useContext(Context)
  if (!value) throw new Error('useBakeoff must be used inside BakeoffProvider')
  return value
}

export function bestPassingRun(runs: BakeoffRun[] = []) {
  return runs.filter((run) => run.status === 'completed' && run.evaluation?.passed).sort((a, b) => (a.modeled_cost?.cost_per_1000_tasks_usd ?? Infinity) - (b.modeled_cost?.cost_per_1000_tasks_usd ?? Infinity) || (a.result?.execution_ms ?? Infinity) - (b.result?.execution_ms ?? Infinity))[0]
}

export function runFor(proof: BakeoffResponse | undefined, policy: Policy) {
  return proof?.runs.find((run) => run.policy === policy)
}
