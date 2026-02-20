import React, { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { optimizeCode } from '../api/client'
import Loader from '../components/Loader'

const LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Go', value: 'go' },
]

const DEFAULT_CODE = {
  javascript: `function findDuplicates(arr) {
  let duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        if (!duplicates.includes(arr[i])) {
          duplicates.push(arr[i]);
        }
      }
    }
  }
  return duplicates;
}`,
  python: `def find_duplicates(lst):
    duplicates = []
    for i in range(len(lst)):
        for j in range(i + 1, len(lst)):
            if lst[i] == lst[j]:
                if lst[i] not in duplicates:
                    duplicates.append(lst[i])
    return duplicates`,
  cpp: `#include <vector>
using namespace std;
vector<int> findDuplicates(vector<int> arr) {
    vector<int> dups;
    for(int i = 0; i < arr.size(); i++) {
        for(int j = i+1; j < arr.size(); j++) {
            if(arr[i] == arr[j]) {
                bool found = false;
                for(int k = 0; k < dups.size(); k++) {
                    if(dups[k] == arr[i]) found = true;
                }
                if(!found) dups.push_back(arr[i]);
            }
        }
    }
    return dups;
}`,
  java: `public List<Integer> findDuplicates(int[] arr) {
    List<Integer> duplicates = new ArrayList<>();
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j] && !duplicates.contains(arr[i])) {
                duplicates.add(arr[i]);
            }
        }
    }
    return duplicates;
}`,
  go: `func findDuplicates(arr []int) []int {
    duplicates := []int{}
    for i := 0; i < len(arr); i++ {
        for j := i + 1; j < len(arr); j++ {
            if arr[i] == arr[j] {
                found := false
                for _, d := range duplicates {
                    if d == arr[i] { found = true }
                }
                if !found { duplicates = append(duplicates, arr[i]) }
            }
        }
    }
    return duplicates
}`,
}

const SEVERITY_STYLES = {
  critical: { label: 'Critical', bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500'    },
  major:    { label: 'Major',    bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  minor:    { label: 'Minor',    bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  clean:    { label: 'Clean',    bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400',dot: 'bg-emerald-500'},
}

const CATEGORY_ICONS = {
  correctness:      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  security:         'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  performance:      'M13 10V3L4 14h7v7l9-11h-7z',
  'error-handling': 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  readability:      'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  maintainability:  'M4 6h16M4 12h16M4 18h7',
  'best-practices': 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
}

function ScoreGauge({ score }) {
  const [displayed, setDisplayed] = useState(0)

  React.useEffect(() => {
    const t = setTimeout(() => setDisplayed(score), 120)
    return () => clearTimeout(t)
  }, [score])

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#00d4ff' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : score >= 40 ? 'Needs Work' : 'Poor'
  const arc = (displayed / 100) * 188

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="82" viewBox="0 0 140 82">
        <path d="M 10 76 A 60 60 0 0 1 130 76" fill="none" stroke="#1e2d45" strokeWidth="10" strokeLinecap="round"/>
        <path d="M 10 76 A 60 60 0 0 1 130 76" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${arc} 188`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
        <text x="70" y="70" textAnchor="middle" fontSize="28" fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">{score}</text>
      </svg>
      <p className="text-xs font-mono tracking-widest uppercase -mt-1" style={{ color }}>{label}</p>
    </div>
  )
}

function IssueCard({ issue }) {
  const [open, setOpen] = useState(false)
  const sev = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.minor
  const iconPath = CATEGORY_ICONS[issue.category] || CATEGORY_ICONS['best-practices']
  return (
    <div className={`rounded-lg border ${sev.border} ${sev.bg} overflow-hidden`}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={() => setOpen(o => !o)}>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sev.dot}`} />
        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${sev.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
        </svg>
        <span className="flex-1 text-sm text-text font-medium">{issue.title}</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${sev.bg} ${sev.text} border ${sev.border} flex-shrink-0`}>{sev.label}</span>
        <svg className={`w-4 h-4 text-textMuted transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          <p className="text-sm text-textMuted leading-relaxed">{issue.description}</p>
          <div className="flex gap-2 items-start pt-1">
            <span className="text-xs font-mono text-accent mt-0.5 flex-shrink-0">Fix:</span>
            <p className="text-sm text-text leading-relaxed">{issue.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CodeReviewer() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(DEFAULT_CODE.javascript)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('report')
  const editorRef = useRef(null)

  function handleLanguageChange(e) {
    const lang = e.target.value
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang] || '')
    setResult(null); setError(null)
  }

  async function handleReview() {
    const currentCode = editorRef.current?.getValue() || code
    if (!currentCode.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await optimizeCode(currentCode, LANGUAGES.find(l => l.value === language)?.label || language)
      setResult(data); setActiveTab('report')
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Review failed.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result?.optimizedCode) return
    await navigator.clipboard.writeText(result.optimizedCode)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const severityOverall = result ? (SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.minor) : null
  const criticalCount = result?.issues?.filter(i => i.severity === 'critical').length || 0
  const majorCount   = result?.issues?.filter(i => i.severity === 'major').length || 0
  const minorCount   = result?.issues?.filter(i => i.severity === 'minor').length || 0

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg font-semibold tracking-tight">Code Review</h1>
          <select value={language} onChange={handleLanguageChange}
            className="bg-bg border border-border text-text text-sm rounded-md px-3 py-1.5 font-mono focus:outline-none focus:border-accent/50 cursor-pointer">
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        <button onClick={handleReview} disabled={loading}
          className="px-5 py-2 bg-accent/10 border border-accent/30 text-accent text-sm font-medium rounded-md hover:bg-accent/20 hover:border-accent/60 hover:shadow-glow transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
          {loading ? 'Reviewing...' : 'Review Code'}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 min-w-0 border-r border-border relative">
          <div className="absolute top-3 left-4 z-10 text-xs text-textMuted font-mono tracking-wider uppercase select-none">Source Code</div>
          <Editor height="100%" language={language} value={code} onChange={v => setCode(v || '')}
            onMount={editor => { editorRef.current = editor }} theme="vs-dark"
            options={{ fontSize: 13, fontFamily: '"JetBrains Mono", monospace', fontLigatures: true, minimap: { enabled: false },
              scrollBeyondLastLine: false, lineNumbers: 'on', renderLineHighlight: 'gutter',
              padding: { top: 36, bottom: 16 }, scrollbar: { verticalScrollbarSize: 6 }, overviewRulerLanes: 0 }}
          />
        </div>

        {/* Report Panel */}
        <div className="w-[520px] flex-shrink-0 bg-surface flex flex-col overflow-hidden">
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 text-textMuted">
              <svg className="w-10 h-10 opacity-25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-sm">Submit code to receive a full review report</p>
            </div>
          )}

          {loading && <div className="flex items-center justify-center flex-1"><Loader message="Agent reviewing code..." /></div>}

          {error && !loading && (
            <div className="m-4 p-4 bg-error/10 border border-error/30 rounded-lg animate-fade-in">
              <p className="text-error text-sm font-mono">{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
              {/* Header: score + summary */}
              <div className="p-5 border-b border-border bg-bg/40 flex-shrink-0">
                <div className="flex items-start gap-4">
                  <ScoreGauge score={result.score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${severityOverall.border} ${severityOverall.bg} ${severityOverall.text}`}>
                        {severityOverall.label}
                      </span>
                      <span className="text-xs text-textMuted">Overall Quality</span>
                    </div>
                    <p className="text-sm text-textMuted leading-relaxed">{result.summary}</p>
                    <div className="flex gap-4 mt-3">
                      {criticalCount > 0 && <span className="text-xs font-mono text-red-400">{criticalCount} Critical</span>}
                      {majorCount   > 0 && <span className="text-xs font-mono text-orange-400">{majorCount} Major</span>}
                      {minorCount   > 0 && <span className="text-xs font-mono text-yellow-400">{minorCount} Minor</span>}
                      {result.issues?.length === 0 && <span className="text-xs font-mono text-emerald-400">No Issues Found</span>}
                    </div>
                  </div>
                </div>
                {result.complexity && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-bg/60 border border-border rounded px-2.5 py-1">
                      <span className="text-xs text-textMuted font-mono">Time:</span>
                      <span className="text-xs text-accent font-mono font-medium">{result.complexity.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-bg/60 border border-border rounded px-2.5 py-1">
                      <span className="text-xs text-textMuted font-mono">Space:</span>
                      <span className="text-xs text-accent font-mono font-medium">{result.complexity.space}</span>
                    </div>
                    {result.complexity.analysis && (
                      <p className="text-xs text-textMuted leading-relaxed flex-1">{result.complexity.analysis}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border flex-shrink-0">
                {[{ id: 'report', label: `Issues (${result.issues?.length || 0})` }, { id: 'optimized', label: 'Optimized Code' }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'text-accent border-accent' : 'text-textMuted border-transparent hover:text-text'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'report' && (
                  <div className="space-y-2">
                    {result.issues?.length === 0
                      ? <div className="text-center py-10 text-textMuted text-sm">No issues found. Code looks solid.</div>
                      : result.issues.map((issue, i) => <IssueCard key={i} issue={issue} />)
                    }
                  </div>
                )}
                {activeTab === 'optimized' && (
                  <div className="glass rounded-xl overflow-hidden border border-border">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-mono tracking-widest uppercase text-textMuted">Suggested Rewrite</span>
                      <button onClick={handleCopy} className="text-xs font-mono text-accent hover:text-white transition-colors flex items-center gap-1.5">
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-text/90 leading-relaxed whitespace-pre-wrap break-words">
                      {result.optimizedCode}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
