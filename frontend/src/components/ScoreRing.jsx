import React, { useEffect, useState } from 'react'

export default function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#00d4ff' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="#1e2d45"
          strokeWidth="8"
        />
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
          className="score-ring"
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
        <text x="64" y="64" textAnchor="middle" dy="0.3em" fontSize="26" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
          {score}
        </text>
      </svg>
      <p className="text-xs text-textMuted font-mono tracking-widest uppercase">Optimization Score</p>
    </div>
  )
}
