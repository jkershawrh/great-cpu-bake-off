import type { BakeoffCatalog, BakeoffResponse, BakeoffRun, Policy } from './types'

const caseProfiles = {
  food_manufacturing: {
    caseId: 'bakery-batch-001', title: 'Why did this bakery batch miss its quality target?', classification: 'batch_quality_alert',
    classifyPrompt: 'Classify this synthetic bakery production incident. Return only the category.',
    extractPrompt: 'Extract batch ID, line, temperatures and quality observation as JSON.',
    entities: [{ text: 'B-204', type: 'batch_id' }, { text: 'Oven-2', type: 'line' }, { text: '168', type: 'observed_temperature' }, { text: '180', type: 'target_temperature' }, { text: 'uneven browning', type: 'observation' }],
    toolEvidence: [{ tool: 'bakery_batch_evidence', source_state: 'rehearsal', result: { data_origin: 'synthetic_demo', procedure_id: 'BAKE-QA-01/v1', action_authority: 'human_review_required' } }],
    summaryPrompt: 'Summarize the incident and procedure evidence for human quality review; do not authorize release.',
    summary: 'Synthetic demo batch B-204 shows uneven browning: 168 C recorded versus a 180 C target. BAKE-QA-01/v1 calls for a sensor check and human quality review. Root cause is unconfirmed; no adjustment or batch release is authorized.',
  },
  healthcare: {
    caseId: 'discharge-stemi-001', title: 'Cardiac discharge summary with medication interaction context', classification: 'discharge_summary',
    classifyPrompt: 'Classify this clinical document into exactly one category. Return only the category.',
    extractPrompt: 'Extract all medications, conditions, and procedures as structured JSON.',
    entities: [{ text: 'STEMI', type: 'condition' }, { text: 'PCI', type: 'procedure' }, { text: 'Aspirin', type: 'medication' }, { text: 'Clopidogrel', type: 'medication' }],
    toolEvidence: [{ tool: 'drug_interaction_check', source_state: 'rehearsal', result: { pair: 'Aspirin + Clopidogrel', severity: 'moderate' } }],
    summaryPrompt: 'Using only the supplied case and MCP evidence, draft a concise physician handoff.',
    summary: 'Following STEMI, the patient underwent RCA PCI and was discharged on Aspirin and Clopidogrel. Monitor bleeding risk and renal function.',
  },
  financial_services: {
    caseId: 'wire-alert-001', title: 'High-value international wire with a new beneficiary', classification: 'enhanced_due_diligence',
    classifyPrompt: 'Classify this wire alert into the required review tier. Return only the tier.',
    extractPrompt: 'Extract the transaction amount, beneficiary, destination, account age, and risk indicators as structured JSON.',
    entities: [{ text: '$2.4M', type: 'amount' }, { text: 'Baltic Components', type: 'beneficiary' }, { text: 'Latvia', type: 'destination' }, { text: 'new beneficiary', type: 'risk_indicator' }],
    toolEvidence: [{ tool: 'sanctions_and_customer_history', source_state: 'rehearsal', result: { sanctions_match: false, prior_payments: 0, account_tenure_years: 8 } }],
    summaryPrompt: 'Using only the wire alert and MCP evidence, draft a concise analyst handoff without approving or blocking the transaction.',
    summary: 'The $2.4M wire introduces a new Latvian beneficiary with no prior payment history. No sanctions match was returned; enhanced due diligence and analyst review remain required.',
  },
  industrial_manufacturing: {
    caseId: 'line-vibration-001', title: 'Packaging-line vibration anomaly with an at-risk production window', classification: 'predictive_maintenance_alert',
    classifyPrompt: 'Classify this equipment event into exactly one maintenance category. Return only the category.',
    extractPrompt: 'Extract the asset, component, vibration, temperature, production window, and fault indicators as structured JSON.',
    entities: [{ text: 'Line 4', type: 'asset' }, { text: 'drive-end bearing', type: 'component' }, { text: '9.2 mm/s', type: 'vibration' }, { text: '87°C', type: 'temperature' }, { text: '6 hours', type: 'production_window' }],
    toolEvidence: [{ tool: 'maintenance_history_and_thresholds', source_state: 'rehearsal', result: { last_bearing_service_months: 14, vibration_limit_mm_s: 7.1, spare_on_site: true } }],
    summaryPrompt: 'Using only the equipment event and MCP evidence, draft a concise reliability-engineer handoff without stopping the line automatically.',
    summary: 'Line 4 drive-end bearing vibration is above its 7.1 mm/s threshold and temperature is elevated. A spare is on site; inspect during the six-hour production window before authorizing intervention.',
  },
} as const

type CaseProfile = (typeof caseProfiles)[keyof typeof caseProfiles]

export const catalogFixture: BakeoffCatalog = {
  verticals: [
    { id: 'food_manufacturing', label: 'Food Manufacturing', description: 'Investigate an inconsistent bakery batch using synthetic records, procedure evidence and human quality review.', cases: [{ id: 'bakery-batch-001', title: 'Why did this bakery batch miss its quality target?' }] },
    { id: 'healthcare', label: 'Healthcare', description: 'Clinical discharge triage with medication evidence and physician handoff.', cases: [{ id: 'discharge-stemi-001', title: 'Cardiac discharge summary with medication interaction context' }] },
    { id: 'financial_services', label: 'Financial Services', description: 'Wire-alert triage with risk, regulatory, and sanctions evidence.', cases: [{ id: 'wire-alert-001', title: 'High-value international wire with a new beneficiary' }] },
    { id: 'industrial_manufacturing', label: 'Industrial Manufacturing', description: 'Edge equipment triage with sensor thresholds, maintenance history, and a reliability-engineer handoff.', cases: [{ id: 'line-vibration-001', title: 'Packaging-line vibration anomaly with an at-risk production window' }] },
  ],
  cpu_models: [
    { id: 'qwen25-3b-cpu', label: 'Qwen 2.5 3B · Intel Xeon', provider: 'Intel Xeon CPU', runtime: 'Red Hat AI Inference vLLM CPU runtime', vendor: 'intel', product: 'Xeon', identity_source: 'declared', support_status: 'qualified_here', available: true },
    { id: 'redhataillama-31-8b-instruct', label: 'Llama 3.1 8B · Intel Xeon', provider: 'Intel Xeon CPU', runtime: 'Red Hat AI Inference vLLM CPU runtime', vendor: 'intel', product: 'Xeon', identity_source: 'declared', support_status: 'qualified_here', available: true },
    { id: 'qwen25-3b-amd-epyc', label: 'Qwen 2.5 3B · AMD EPYC · qualification target', provider: 'AMD EPYC CPU', runtime: 'Red Hat AI Inference vLLM CPU runtime', vendor: 'amd', product: 'EPYC', identity_source: 'planned', support_status: 'qualification_target', available: false },
    { id: 'qwen25-3b-nvidia-grace', label: 'Qwen 2.5 3B · NVIDIA Grace · qualification target', provider: 'NVIDIA Grace CPU', runtime: 'Red Hat AI Inference vLLM CPU runtime', vendor: 'nvidia', product: 'Grace', identity_source: 'planned', support_status: 'qualification_target', available: false },
  ],
  accelerator_models: [
    { id: 'gaudi-llama-31-8b', label: 'Llama 3.1 8B · Gaudi 3', provider: 'Intel Gaudi 3', runtime: 'Red Hat AI Inference vLLM accelerator runtime', vendor: 'intel', product: 'Gaudi 3', identity_source: 'observed', support_status: 'technology_preview', available: true },
    { id: 'gaudi-granite-31-8b', label: 'Granite 3.1 8B LAB · Gaudi 3', provider: 'Intel Gaudi 3', runtime: 'Red Hat AI Inference vLLM accelerator runtime', vendor: 'intel', product: 'Gaudi 3', identity_source: 'observed', support_status: 'technology_preview', available: true },
    { id: 'amd-instinct-qualified-model', label: 'AMD Instinct · qualification target', provider: 'AMD Instinct', runtime: 'Red Hat AI Inference vLLM accelerator runtime', vendor: 'amd', product: 'Instinct', identity_source: 'planned', support_status: 'qualification_target', available: false },
    { id: 'nvidia-gpu-qualified-model', label: 'NVIDIA GPU · qualification target', provider: 'NVIDIA GPU', runtime: 'Red Hat AI Inference vLLM accelerator runtime', vendor: 'nvidia', product: 'GPU', identity_source: 'planned', support_status: 'qualification_target', available: false },
  ],
}

const steps = (profile: CaseProfile, policy: Policy, cpuModel: string, acceleratorModel: string) => {
  const hardware = policy === 'cpu_only' ? ['cpu', 'cpu', 'cpu'] : policy === 'gpu_only' ? ['gpu', 'gpu', 'gpu'] : ['cpu', 'cpu', 'gpu']
  return [
    { node: 'classify', model: hardware[0] === 'cpu' ? cpuModel : acceleratorModel, accelerator: hardware[0], latency_ms: hardware[0] === 'cpu' ? 640 : 390, route: policy === 'heterogeneous' ? 'simple' : `forced_${hardware[0]}`, prompt: profile.classifyPrompt, output: profile.classification },
    { node: 'extract_entities', model: hardware[1] === 'cpu' ? cpuModel : acceleratorModel, accelerator: hardware[1], latency_ms: hardware[1] === 'cpu' ? 12400 : 2490, route: policy === 'heterogeneous' ? 'medium' : `forced_${hardware[1]}`, prompt: profile.extractPrompt, output: JSON.stringify(profile.entities) },
    { node: 'summarize', model: hardware[2] === 'cpu' ? cpuModel : acceleratorModel, accelerator: hardware[2], latency_ms: hardware[2] === 'cpu' ? 14200 : 2900, route: policy === 'heterogeneous' ? 'complex' : `forced_${hardware[2]}`, prompt: profile.summaryPrompt, output: profile.summary },
  ].map((step) => ({ ...step, accelerator: step.accelerator as 'cpu' | 'gpu', hardware_provider: step.accelerator === 'cpu' ? 'Intel Xeon CPU · declared' : 'Intel Gaudi 3 accelerator · observed', source_state: 'rehearsal' as const }))
}

function lane(profile: CaseProfile, policy: Policy, execution: number, cost: number, score: number): BakeoffRun {
  const log = steps(profile, policy, 'qwen25-3b-cpu', 'gaudi-llama-31-8b')
  return {
    policy, status: 'completed', source_state: 'rehearsal',
    modeled_cost: { cost_per_task_usd: cost / 1000, cost_per_1000_tasks_usd: cost, label: 'Execution-cost proxy' },
    evaluation: { score_pct: score, threshold_pct: 80, passed: score >= 80, scope: 'This checked-in case only', components: [
      { name: 'Classification', earned: 25, possible: 25, detail: `Expected ${profile.classification}; received ${profile.classification}.` },
      { name: 'Entity recall', earned: 30, possible: 30, detail: 'All required named-case entities found.' },
      { name: 'MCP evidence', earned: 15, possible: 15, detail: 'Required medication evidence returned.' },
      { name: 'Summary coverage', earned: 30, possible: 30, detail: 'All required case facts preserved.' },
    ] },
    result: { classification: profile.classification, entities: [...profile.entities], tool_evidence: [...profile.toolEvidence], summary: profile.summary, inference_log: log, execution_ms: execution, routing_ms: policy === 'heterogeneous' ? 1 : 0, total_ms: execution + (policy === 'heterogeneous' ? 1 : 0) },
  }
}

export function rehearsalResponseFor(verticalId: string): BakeoffResponse {
  const profile = caseProfiles[verticalId as keyof typeof caseProfiles] ?? caseProfiles.healthcare
  return {
    sourceState: 'rehearsal', vertical: verticalId in caseProfiles ? verticalId : 'healthcare', case_id: profile.caseId, case_title: profile.title, collected_at: '2026-10-02T00:00:00Z', policies_run: 3,
    environment: { id: 'rehearsal', label: 'Checked-in rehearsal evidence', vendors: ['intel'] },
    runs: [lane(profile, 'cpu_only', 27280, 0, 100), lane(profile, 'gpu_only', 5820, 58.02, 100), lane(profile, 'heterogeneous', 16900, 35.66, 100)],
  }
}

export const bakeoffFixture = rehearsalResponseFor('healthcare')
