// Pulsing live indicator.
//   running   -> indigo, slow pulse
//   winner    -> green, fast celebratory pulse
//   no_effect -> red, solid (no pulse)

const COLORS = {
  running: '#6366F1',
  winner: '#10B981',
  no_effect: '#EF4444',
}

export default function StatusOrb({ status = 'running' }) {
  const color = COLORS[status] || '#52525B'
  const isRunning = status === 'running'
  const isWinner = status === 'winner'
  const showPulse = isRunning || isWinner

  return (
    <span className="relative flex h-3 w-3" aria-label={`status: ${status}`}>
      {showPulse && (
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ background: color, animationDuration: isRunning ? '1.4s' : '0.6s' }}
        />
      )}
      <span
        className="relative inline-flex rounded-full h-3 w-3"
        style={{ background: color }}
      />
    </span>
  )
}
