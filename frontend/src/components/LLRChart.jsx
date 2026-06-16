import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
} from 'recharts'

// Live streaming LLR chart — the hero of the dashboard.
//
// We disable Recharts' built-in animation and instead let the line grow
// naturally as new points are appended to `history`. Decision boundaries are
// dashed green (winner) / red (no-effect); a glowing dot marks the current tip.

export default function LLRChart({ history = [], bounds = { A: -2.77, B: 2.77 } }) {
  const tip = history.length ? history[history.length - 1] : null

  // Pad the y-domain a little beyond the boundaries so they're always visible.
  const pad = Math.max(0.5, (bounds.B - bounds.A) * 0.15)
  const domain = [bounds.A - pad, bounds.B + pad]

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={history} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="llrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis
            domain={domain}
            tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: '#52525B' }}
            axisLine={false}
            tickLine={false}
            width={44}
          />

          {/* Decision boundaries */}
          <ReferenceLine
            y={bounds.B}
            stroke="#10B981"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: 'Winner threshold',
              fill: '#10B981',
              fontSize: 11,
              fontFamily: 'Inter',
              position: 'insideTopLeft',
            }}
          />
          <ReferenceLine
            y={bounds.A}
            stroke="#EF4444"
            strokeDasharray="6 4"
            strokeWidth={1}
            label={{
              value: 'No-effect threshold',
              fill: '#EF4444',
              fontSize: 11,
              fontFamily: 'Inter',
              position: 'insideBottomLeft',
            }}
          />

          {/* Zero reference line */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

          {/* The LLR line with gradient fill */}
          <Area
            type="monotone"
            dataKey="llr"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#llrGrad)"
            dot={false}
            isAnimationActive={false}
          />

          {/* Glowing dot at the current tip */}
          {tip && (
            <ReferenceDot
              x={tip.t}
              y={tip.llr}
              r={4}
              fill="#6366F1"
              stroke="#09090B"
              strokeWidth={2}
              isFront
            />
          )}

          <Tooltip
            contentStyle={{
              background: '#18181F',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontFamily: 'JetBrains Mono',
              fontSize: 12,
            }}
            labelStyle={{ color: '#A1A1AA' }}
            itemStyle={{ color: '#6366F1' }}
            formatter={(v) => [Number(v).toFixed(3), 'LLR']}
            labelFormatter={(t) => `t = ${t}`}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
