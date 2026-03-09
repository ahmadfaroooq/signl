interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 120 120"
        style={{ display: 'block', flexShrink: 0 }}
        aria-label="SIGNL logo"
      >
        <circle cx="60" cy="60" r="60" fill="#0D1117" />
        <text
          x="60"
          y="64"
          fill="#F5A623"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="20"
          letterSpacing="1"
          textAnchor="middle"
        >
          SIGNL
        </text>
        <circle cx="93.5" cy="62.8" r="1.3" fill="#FFFFFF" />
      </svg>
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          color: '#ffffff',
          letterSpacing: '0.08em',
        }}
      >
        SIGNL
      </span>
    </div>
  )
}
