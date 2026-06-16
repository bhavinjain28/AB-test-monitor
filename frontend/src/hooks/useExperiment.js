import { useState, useEffect, useRef, useCallback } from 'react'
import { HTTP_URL, WS_URL } from '../lib/utils'

/**
 * WebSocket hook that owns all live experiment state.
 *
 * Returns:
 *   data     — latest full snapshot from the server (or null)
 *   history  — rolling [{ t, llr }] series for the chart (last ~300 points)
 *   events   — most recent real observations from the backend
 *   status   — connection status: connecting | connected | disconnected | error
 *   reset    — POST /reset and clear local series
 *   configure(config) — POST /config and clear local series
 *   setMode(mode)     — POST /mode ("demo" | "live") and clear local series
 */
export function useExperiment(url = WS_URL) {
  const [data, setData] = useState(null)
  const [history, setHistory] = useState([]) // [{ t, llr }]
  const [events, setEvents] = useState([]) // mirror of data.recent_events
  const [status, setStatus] = useState('connecting')

  const ws = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    let closedByUs = false

    const connect = () => {
      const socket = new WebSocket(url)
      ws.current = socket

      socket.onopen = () => setStatus('connected')
      socket.onerror = () => setStatus('error')
      socket.onclose = () => {
        if (closedByUs) return
        setStatus('disconnected')
        reconnectTimer.current = setTimeout(connect, 1500) // auto-reconnect
      }

      socket.onmessage = (msg) => {
        const d = JSON.parse(msg.data)
        setData(d)
        // The chart line grows one point per snapshot.
        setHistory((h) => [...h.slice(-299), { t: h.length, llr: d.treatment.llr }])
        // The event feed mirrors the real events the backend reports.
        if (d.recent_events) setEvents(d.recent_events)
      }
    }

    connect()

    return () => {
      closedByUs = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [url])

  const clearSeries = () => {
    setHistory([])
    setEvents([])
  }

  const post = (path, body) =>
    fetch(`${HTTP_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => {})

  const reset = useCallback(() => {
    post('/reset')
    clearSeries()
  }, [])

  const configure = useCallback((config) => {
    post('/config', config)
    clearSeries()
  }, [])

  const setMode = useCallback((mode) => {
    post('/mode', { mode })
    clearSeries()
  }, [])

  return { data, history, events, status, reset, configure, setMode }
}
