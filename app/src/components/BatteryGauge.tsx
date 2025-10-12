type Props = {
  percent: number // 0..100
  color?: string
  label?: string
}

export default function BatteryGauge({ percent, color = '#10B981', label }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const fillWidth = Math.max(0, Math.min(100, pct));
  return (
    <div className="flex items-center gap-3">
      <svg width="72" height="36" viewBox="0 0 72 36" aria-hidden>
        <defs>
          <clipPath id="b">
            <rect x="2" y="6" width="56" height="24" rx="4" />
          </clipPath>
        </defs>
        <rect x="2" y="6" width="56" height="24" rx="4" fill="#e6f4ef" stroke="#cbd5df"/>
        <rect x="60" y="12" width="8" height="12" rx="2" fill="#cbd5df" />
        <g clipPath="url(#b)">
          <rect x="2" y="6" width={`${(fillWidth/100)*56}`} height="24" rx="4" fill={color} />
        </g>
      </svg>
      <div className="text-sm">
        <div className="font-medium">{label ?? 'Desempenho'}</div>
        <div className="text-xs text-slate-600">{pct}%</div>
      </div>
    </div>
  )
}
