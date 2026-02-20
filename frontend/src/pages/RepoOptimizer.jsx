import React, { useState } from 'react'
import { optimizeRepo } from '../api/client'
import Loader from '../components/Loader'

const SEVERITY_STYLES = {
  critical: { label: 'Critical', bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500'    },
  major:    { label: 'Major',    bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  minor:    { label: 'Minor',    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  clean:    { label: 'Clean',    bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400',dot: 'bg-emerald-500'},
}

function RepoScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  React.useEffect(() => { const t = setTimeout(() => setDisplayed(score), 120); return () => clearTimeout(t) }, [score])
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#00d4ff' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="#1e2d45" strokeWidth="6" />
        <circle cx="44" cy="44" r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 44 44)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 5px ${color}88)` }}
        />
        <text x="44" y="44" textAnchor="middle" dy="0.35em" fontSize="18" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">{score}</text>
      </svg>
      <p className="text-xs text-textMuted font-mono">Quality</p>
    </div>
  )
}

function SeverityBadge({ severity }) {
  const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.minor
  return <span className={`text-xs font-mono px-2 py-0.5 rounded border ${s.border} ${s.bg} ${s.text}`}>{s.label}</span>
}

function RepoIssueRow({ issue }) {
  const [open, setOpen] = useState(false)
  const sev = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.minor
  return (
    <div className={`rounded-lg border ${sev.border} ${sev.bg} overflow-hidden`}>
      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left" onClick={() => setOpen(o => !o)}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sev.dot}`} />
        <span className="flex-1 text-sm text-text">{issue.title}</span>
        <span className={`text-xs font-mono ${sev.text} flex-shrink-0`}>{issue.category}</span>
        <svg className={`w-3.5 h-3.5 text-textMuted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-white/5 pt-2.5">
          <p className="text-xs text-textMuted leading-relaxed">{issue.description}</p>
          <div className="flex gap-2">
            <span className="text-xs font-mono text-accent flex-shrink-0">Fix:</span>
            <p className="text-xs text-text leading-relaxed">{issue.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RepoOptimizer() {
  const [repoUrl, setRepoUrl] = useState('')
  const [filePath, setFilePath] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleOptimize(e) {
    e.preventDefault()
    if (!repoUrl.trim() || !filePath.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await optimizeRepo(repoUrl.trim(), filePath.trim())
      setResult(data)
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Repository optimization failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result?.optimizedCode) return
    await navigator.clipboard.writeText(result.optimizedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-10 px-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-700 tracking-tight text-text mb-1.5">Repository Code Review</h1>
        <p className="text-textMuted text-sm">Fetch a file from any GitHub repository, run a full AI code review, and commit the improved version to a new branch.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="glass rounded-2xl p-6 border border-border">
          <h2 className="text-xs font-mono tracking-widest uppercase text-textMuted mb-6">Repository Settings</h2>
          <form onSubmit={handleOptimize} className="space-y-5">
            <InputField
              label="Repository URL"
              placeholder="https://github.com/user/repo"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              hint="Full GitHub repository URL"
            />
            <InputField
              label="File Path"
              placeholder="src/utils/helpers.js"
              value={filePath}
              onChange={e => setFilePath(e.target.value)}
              hint="Relative path to the file in the repository"
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !repoUrl || !filePath}
                className="w-full py-2.5 bg-accent/10 border border-accent/30 text-accent font-medium text-sm rounded-lg
                  hover:bg-accent/20 hover:border-accent/60 hover:shadow-glow transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {loading ? 'Processing...' : 'Review Repository File'}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-6 pt-6 border-t border-border space-y-3">
            <p className="text-xs font-mono tracking-widest uppercase text-textMuted">How it works</p>
            {[
              'Fetches the file content using GitHub API',
              'Runs a full AI code review: correctness, security, performance, readability',
              'Creates a new branch: optimized/{filename}',
              'Commits the reviewed and improved code to that branch',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-textMuted">
                <span className="text-xs font-mono text-accent/70 mt-0.5 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && !error && (
            <div className="glass rounded-2xl border border-border p-12 flex flex-col items-center justify-center gap-3 text-textMuted">
              <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="text-sm">Configure and submit to begin</p>
            </div>
          )}

          {loading && (
            <div className="glass rounded-2xl border border-border p-12">
              <Loader message="Fetching, analyzing and optimizing..." />
            </div>
          )}

          {error && !loading && (
            <div className="glass rounded-2xl border border-error/30 p-6 animate-fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-error mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-error text-sm font-mono">{error}</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-fade-in">
              {/* Branch badge */}
              <div className="glass rounded-xl border border-success/30 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 border border-success/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-success text-sm font-medium">Reviewed and committed</p>
                  <p className="text-textMuted text-xs font-mono mt-0.5">Branch: {result.branch}</p>
                </div>
              </div>

              {/* Score + summary */}
              <div className="glass rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <RepoScoreRing score={result.score} />
                  <div className="flex-1 min-w-0">
                    {result.severity && (
                      <div className="mb-2">
                        <SeverityBadge severity={result.severity} />
                      </div>
                    )}
                    {result.summary && <p className="text-sm text-textMuted leading-relaxed">{result.summary}</p>}
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {result.issues?.filter(i => i.severity === 'critical').length > 0 && (
                        <span className="text-xs font-mono text-red-400">{result.issues.filter(i => i.severity === 'critical').length} Critical</span>
                      )}
                      {result.issues?.filter(i => i.severity === 'major').length > 0 && (
                        <span className="text-xs font-mono text-orange-400">{result.issues.filter(i => i.severity === 'major').length} Major</span>
                      )}
                      {result.issues?.filter(i => i.severity === 'minor').length > 0 && (
                        <span className="text-xs font-mono text-yellow-400">{result.issues.filter(i => i.severity === 'minor').length} Minor</span>
                      )}
                    </div>
                  </div>
                </div>
                {result.complexity && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-bg/60 border border-border rounded px-2.5 py-1">
                      <span className="text-xs text-textMuted font-mono">Time:</span>
                      <span className="text-xs text-accent font-mono font-medium">{result.complexity.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-bg/60 border border-border rounded px-2.5 py-1">
                      <span className="text-xs text-textMuted font-mono">Space:</span>
                      <span className="text-xs text-accent font-mono font-medium">{result.complexity.space}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Issues */}
              {result.issues?.length > 0 && (
                <div className="glass rounded-xl border border-border p-4 space-y-2">
                  <h3 className="text-xs font-mono tracking-widest uppercase text-textMuted mb-3">Review Issues</h3>
                  {result.issues.map((issue, i) => (
                    <RepoIssueRow key={i} issue={issue} />
                  ))}
                </div>
              )}

              {/* Optimized Code */}
              <div className="glass rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                  <h3 className="text-xs font-mono tracking-widest uppercase text-textMuted">Improved Code (committed)</h3>
                  <button onClick={handleCopy} className="text-xs font-mono text-accent hover:text-white transition-colors flex items-center gap-1.5">
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-5 overflow-x-auto text-xs font-mono text-text/90 leading-relaxed whitespace-pre-wrap break-words max-h-72">
                  {result.optimizedCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InputField({ label, placeholder, value, onChange, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono text-textMuted tracking-wide">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-bg border border-border text-text text-sm rounded-lg px-4 py-2.5 
          font-mono placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
      />
      {hint && <p className="text-xs text-textMuted">{hint}</p>}
    </div>
  )
}
