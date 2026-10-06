import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { mergeCatalog } from './bakeoff/BakeoffContext'
import { catalogFixture } from './bakeoff/fixture'

describe('Triforce-style presentation runtime', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline in unit test'))))
  })

  it('opens cinematically and begins from the primary action', () => {
    render(<App />)
    expect(screen.getByText('CPU Bake Off')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /begin the tasting/i }))
    expect(new URLSearchParams(window.location.search).get('act')).toBe('0')
    expect(screen.getByText('A better placement question')).toBeInTheDocument()
    expect(screen.getByText('CPUs run AI, too.')).toBeInTheDocument()
    expect(screen.getByText(/Let’s measure which belongs where/)).toBeInTheDocument()
  })

  it('deep-links directly to guided architecture', () => {
    window.history.replaceState(null, '', '/?act=2')
    render(<App />)
    expect(screen.getByText('Every component must earn its place')).toBeInTheDocument()
    expect(screen.getByText('What are we actually trying to complete?')).toBeInTheDocument()
  })

  it('keeps the closing Red Hat-led and future qualification explicitly proposed', () => {
    window.history.replaceState(null, '', '/?act=6')
    render(<App />)
    expect(screen.getByText('Your workload. Your hardware. Red Hat AI.')).toBeInTheDocument()
    expect(screen.getByText('Provider qualification → repeatable benchmarks → full TCO')).toBeInTheDocument()
    expect(screen.getByText(/PROPOSED NEXT STEPS · NOT COMPLETED QUALIFICATION/)).toBeInTheDocument()
    expect(screen.getByText(/successful demo does not establish product support/)).toBeInTheDocument()
  })

  it('reveals each architecture answer before the next question', async () => {
    window.history.replaceState(null, '', '/?act=2')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /reveal the answer/i }))
    expect(await screen.findByText('A named workload enters with its acceptance rule.')).toBeInTheDocument()
    expect(screen.getByLabelText('Technical architecture flow')).toBeInTheDocument()
  })

  it('opens the tasting menu and jumps to live proof', async () => {
    window.history.replaceState(null, '', '/?act=0')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Le Menu' }))
    expect(screen.getByRole('region', { name: 'Presentation menu' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /04The Live Bake/i }))
    expect(new URLSearchParams(window.location.search).get('act')).toBe('3')
    expect(await screen.findByText('One order. Three kitchens. In parallel.')).toBeInTheDocument()
  })

  it('restarts from the brand control', () => {
    window.history.replaceState(null, '', '/?act=4')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Restart presentation' }))
    expect(window.location.search).toBe('')
  })

  it('keeps Red Hat primary while distinguishing current and future hardware providers', () => {
    window.history.replaceState(null, '', '/?act=1')
    render(<App />)
    expect(screen.getByLabelText('Red Hat AI')).toBeInTheDocument()
    const targets = screen.getByLabelText('Red Hat AI hardware qualification targets')
    expect(targets).toHaveTextContent('Intel')
    expect(targets).toHaveTextContent('CURRENT EVIDENCE')
    expect(targets).toHaveTextContent('AMD')
    expect(targets).toHaveTextContent('NVIDIA')
    expect(screen.getByRole('option', { name: /AMD EPYC/i })).toBeDisabled()
    expect(screen.getByRole('option', { name: /NVIDIA GPU/i })).toBeDisabled()
  })

  it('offers an industrial manufacturing workload with matching evidence language', async () => {
    window.history.replaceState(null, '', '/?act=1')
    render(<App />)
    fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'industrial_manufacturing' } })
    expect(screen.getByText('Packaging-line vibration anomaly with an at-risk production window')).toBeInTheDocument()
    expect(screen.getByText(/sensor thresholds, maintenance history/i)).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(await screen.findByText('One order. Three kitchens. In parallel.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /run all three/i }))
    expect(await screen.findAllByText('rehearsal')).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Prompts + responses' }))
    expect(screen.getByText(/classify this equipment event/i)).toBeInTheDocument()
    expect(screen.getByText('predictive_maintenance_alert')).toBeInTheDocument()
  })

  it('preserves Red Hat qualification targets when a live catalog is narrower', () => {
    const merged = mergeCatalog({ verticals: [catalogFixture.verticals[0]], cpu_models: [catalogFixture.cpu_models[0]], accelerator_models: [catalogFixture.accelerator_models[0]] })
    expect(merged.verticals.map((item) => item.id)).toContain('industrial_manufacturing')
    expect(merged.cpu_models.some((item) => item.vendor === 'amd')).toBe(true)
    expect(merged.accelerator_models.some((item) => item.vendor === 'nvidia')).toBe(true)
    expect(merged.cpu_models.find((item) => item.id === 'redhataillama-31-8b-instruct')?.available).toBe(false)
    expect(merged.accelerator_models.find((item) => item.id === 'gaudi-granite-31-8b')?.available).toBe(false)
  })

  it('provides fullscreen and keyboard act navigation', async () => {
    Object.defineProperty(document.documentElement, 'requestFullscreen', { value: vi.fn(), configurable: true })
    window.history.replaceState(null, '', '/?act=0')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle fullscreen' }))
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    await waitFor(() => expect(new URLSearchParams(window.location.search).get('act')).toBe('1'))
  })

  it('labels fallback evidence and exposes prompts, responses, and MCP data', async () => {
    window.history.replaceState(null, '', '/?act=3')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /run all three/i }))
    expect(await screen.findAllByText('rehearsal')).toHaveLength(4)
    expect(screen.getByText(/used checked-in rehearsal evidence/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Prompts + responses' }))
    expect(screen.getByText('PROMPT IN')).toBeInTheDocument()
    expect(screen.getByText('RESPONSE OUT')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /MCP evidence/i }))
    expect(screen.getByText('TOOL REQUEST')).toBeInTheDocument()
    expect(screen.getByText('TOOL RESPONSE')).toBeInTheDocument()
  })
})
