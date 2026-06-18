import { useEffect, useState } from 'react'
import { HTTP_URL } from './lib/utils'
import Landing from './pages/Landing'
import Briefing from './pages/Briefing'
import Dashboard from './pages/Dashboard'

// Lightweight hash-based navigation between the three screens.
//   #/        → landing (marketing hero)
//   #/new     → experiment briefing / setup
//   #/monitor → live dashboard
// Hash routing keeps deep links working on static hosts (Vercel) without
// needing server rewrites.

const VIEWS = { '': 'landing', '#/': 'landing', '#/new': 'briefing', '#/monitor': 'dashboard' }

function viewFromHash() {
  return VIEWS[window.location.hash] || 'landing'
}

function post(path, body) {
  return fetch(`${HTTP_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {})
}

export default function App() {
  const [view, setView] = useState(viewFromHash())
  const [experimentName, setExperimentName] = useState('')

  // Keep state in sync with the URL hash (back/forward buttons, refresh).
  useEffect(() => {
    const onHash = () => setView(viewFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (hash) => {
    window.location.hash = hash
    setView(VIEWS[hash] || 'landing')
  }

  const runDemo = async () => {
    await post('/mode', { mode: 'demo' })
    setExperimentName('')
    go('#/monitor')
  }

  const openBriefing = () => go('#/new')

  const goHome = () => go('#/')

  // From the briefing's "Begin monitoring": configure the backend, then open
  // the dashboard. Mode is set first; /config rebuilds the engines in that mode.
  const beginMonitoring = async ({ name, mode, p0, p1, alpha, beta, events_per_second }) => {
    setExperimentName(name)
    await post('/mode', { mode })
    await post('/config', { p0, p1, alpha, beta, events_per_second })
    go('#/monitor')
  }

  if (view === 'briefing') {
    return <Briefing onBegin={beginMonitoring} onBack={goHome} />
  }
  if (view === 'dashboard') {
    return <Dashboard experimentName={experimentName} onHome={goHome} />
  }
  return <Landing onRunDemo={runDemo} onConfigure={openBriefing} />
}
