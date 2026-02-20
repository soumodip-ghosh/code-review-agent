import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import CodeOptimizer from './pages/CodeOptimizer'
import RepoOptimizer from './pages/RepoOptimizer'

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<CodeOptimizer />} />
          <Route path="/repo" element={<RepoOptimizer />} />
        </Routes>
      </main>
    </div>
  )
}

function Navbar() {
  const linkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 
    ${isActive
      ? 'text-accent after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-accent'
      : 'text-textMuted hover:text-text'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border h-16 flex items-center px-8">
      <div className="flex items-center gap-3 mr-12">
        <div className="w-7 h-7 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center">
          <span className="text-accent text-xs font-mono font-bold">CO</span>
        </div>
        <span className="font-display text-base font-700 tracking-tight text-text">
          Code<span className="text-accent">Optim</span>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>
          Code Review
        </NavLink>
        <NavLink to="/repo" className={linkClass}>
          Repository Review
        </NavLink>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-textMuted font-mono bg-surface border border-border px-2 py-1 rounded">
          AI Agent v1.0
        </span>
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>
    </nav>
  )
}
