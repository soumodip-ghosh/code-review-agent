import React from 'react'

export default function Loader({ message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
      </div>
      <p className="text-textMuted text-sm font-mono">{message}</p>
    </div>
  )
}
