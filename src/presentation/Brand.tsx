export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={`brand ${compact ? 'brand-compact' : ''}`} aria-label="Red Hat AI">
    <img src="/logos/redhat.svg" alt="Red Hat" />
    <span>AI</span>
  </div>
}
