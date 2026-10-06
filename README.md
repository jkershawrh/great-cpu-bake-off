# The Great CPU Bake Off

A separate presentation frontend for the Cost-Aware Inference proof. It keeps
the existing engineering application and proof API intact while presenting the
same architecture, policies, source state, and measurements through a clean
Red Hat AI pâtisserie competition.

## Experience

The rebuilt experience uses the Triforce presentation cadence without coupling
to the Triforce application. Seven full-screen acts move through a progressive
business brief, selectable workload menu, question-and-answer architecture
walkthrough, concurrent three-policy run, deterministic judging, placement
resolution, and evidence-derived close. **Le Menu** provides direct access to
each act.

The culinary layer is framing only. Model identities, hardware identities,
MCP evidence, prompts, outputs, evaluation scores, latency, and modeled cost
remain technically labeled and originate from the Cost-Aware Inference API.
The architecture and live-lane animations are rendered in React and Motion;
they are not static screenshots. The opening confection is an original local
illustration used only as supporting campaign art.

The workload menu includes healthcare, financial services, and industrial
manufacturing. The manufacturing case uses an edge equipment vibration event,
maintenance-history MCP evidence, and a reliability-engineer handoff so the
placement story connects naturally to Red Hat OpenShift at the edge.

### Presenter controls

- Use the header arrows, left/right arrow keys, or Page Up/Page Down to change acts.
- Open **Le Menu** to jump directly to any act.
- Press `F` or use the fullscreen control to enter fullscreen.
- Swipe horizontally in a rehearsal viewport.
- Click inside the Brief and Architecture acts to reveal their internal steps.

## Local development

Run `npm ci`, then `npm run dev`.

The development server proxies `/proof` to `http://localhost:8090`. The
production Nginx configuration expects the existing proof API at
`http://proof-api:8090`.

## Verification

Run `npm run check` and `npm run test:visual`.

The visual suite covers 1920×1080, 1440×900, and a narrow rehearsal viewport.
The production build bundles all fonts and logos for offline presentation.
Functional coverage includes deep links, history-safe navigation, guided
architecture sequencing, keyboard/fullscreen controls, fallback labeling, and
prompt/response/MCP evidence inspection.

## Evidence rules

- Live responses are labeled `LIVE`.
- Checked-in fallback data is labeled `REHEARSAL`.
- An unavailable lane is never silently replaced by another hardware tier.
- Quality is the deterministic score for the selected named case.
- Cost is an execution-cost proxy based on measured inference time and visible assumptions, not a supplier quote.
- Red Hat AI and OpenShift remain the platform and application contract across every lane.
- The current reference environment is Intel Xeon plus Intel Gaudi 3.
- AMD EPYC plus AMD Instinct and NVIDIA Grace plus NVIDIA GPU are visible qualification targets, not simulated live hardware.
- A provider becomes selectable and may be labeled `LIVE` only after its target environment returns current-session evidence.

## Project boundary

This repository is the campaign and event experience. The engineering
reference, proof API, qualification workflow, contracts, and deployment
evidence remain in `cost-aware-inference-demo`.

The public campaign title and final calligraphic typeface require brand and
trademark review before external launch.
