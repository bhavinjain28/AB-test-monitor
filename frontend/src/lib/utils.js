// Centralised API configuration.
//
// In dev this points at the local FastAPI server. For deployment, set
// VITE_API_URL (e.g. "https://ab-monitor-api.onrender.com") at build time and
// the WebSocket URL is derived automatically.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const HTTP_URL = API_URL
export const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws'

/** Join class names, dropping falsy values. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

/** Format a number of seconds as MM:SS. */
export function formatElapsed(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
