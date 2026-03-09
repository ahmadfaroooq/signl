interface PlaceholderProps {
  title: string
  icon: string
  description: string
}

export function Placeholder({ title, icon, description }: PlaceholderProps) {
  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{title}</h1>
      <div
        className="card"
        style={{
          marginTop: 20,
          padding: 48,
          textAlign: 'center',
          borderLeft: '3px solid var(--color-amber)',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-muted)', display: 'block', marginBottom: 12 }}>
          {icon}
        </span>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', maxWidth: 360, margin: '0 auto' }}>{description}</p>
        <p style={{ fontSize: 10, color: 'var(--color-amber)', marginTop: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Coming in next phase
        </p>
      </div>
    </div>
  )
}
