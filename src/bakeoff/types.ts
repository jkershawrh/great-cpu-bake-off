export type Policy = 'cpu_only' | 'gpu_only' | 'heterogeneous'
export type SourceState = 'live' | 'mixed' | 'rehearsal' | 'offline' | 'unavailable'

export interface BakeoffStep {
  node: string
  model: string
  accelerator: 'cpu' | 'gpu' | 'tool'
  hardware_provider: string
  latency_ms: number
  route: string
  prompt: string
  output: string
  source_state: 'live' | 'rehearsal'
}

export interface EvaluationComponent {
  name: string
  earned: number
  possible: number
  detail: string
}

export interface BakeoffRun {
  policy: Policy
  status: 'running' | 'completed' | 'unavailable' | 'failed'
  source_state: SourceState
  error?: string
  modeled_cost?: { cost_per_task_usd: number; cost_per_1000_tasks_usd: number; label?: string; method?: string; exclusions?: string[] }
  evaluation?: { score_pct: number; threshold_pct: number; passed: boolean; scope: string; components?: EvaluationComponent[] }
  result?: {
    classification: string
    entities: Array<{ text: string; type: string }>
    tool_evidence: Array<Record<string, unknown>>
    summary: string
    inference_log: BakeoffStep[]
    execution_ms: number
    routing_ms: number
    total_ms: number
  }
}

export interface BakeoffResponse {
  sourceState?: 'live' | 'mixed' | 'rehearsal' | 'offline'
  run_id?: string
  vertical: string
  case_id: string
  case_title: string
  collected_at: string
  policies_run: number
  environment?: { id: string; label: string; vendors: string[] }
  runs: BakeoffRun[]
}

export interface ModelChoice {
  id: string
  label: string
  provider: string
  runtime: string
  vendor?: string
  product?: string
  identity_source?: string
  support_status?: string
  target_id?: string
  available: boolean
}

export interface BakeoffCatalog {
  verticals: Array<{ id: string; label: string; description: string; cases: Array<{ id: string; title: string }> }>
  cpu_models: ModelChoice[]
  accelerator_models: ModelChoice[]
}

export interface BakeoffSelection {
  vertical: string
  cpuModel: string
  acceleratorModel: string
  cpuAlreadyProvisioned: boolean
  cpuHourly: number
  acceleratorHourly: number
}

export const POLICIES: Policy[] = ['cpu_only', 'gpu_only', 'heterogeneous']
export const POLICY_LABELS: Record<Policy, string> = {
  cpu_only: 'CPU only',
  gpu_only: 'Accelerator only',
  heterogeneous: 'Heterogeneous',
}
