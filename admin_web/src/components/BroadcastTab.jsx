import { useState } from 'react'
import api from '../api'

const MAX_LEN = 4096

export default function BroadcastTab() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const send = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    setError('')
    try {
      const { data } = await api.post('/broadcast', { message: message.trim() })
      setResult(data)
      setMessage('')
    } catch (e) {
      setError(e.response?.data?.detail || 'Broadcast failed.')
    } finally {
      setSending(false)
    }
  }

  const pct = (message.length / MAX_LEN) * 100
  const isNearLimit = message.length > MAX_LEN * 0.9

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Broadcast</h2>
        <p className="text-sm text-gray-500 mt-0.5">Send a message to all registered users at once.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        {/* Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
            <span className={`text-xs font-medium ${isNearLimit ? 'text-rose-500' : 'text-gray-400'}`}>
              {message.length} / {MAX_LEN.toLocaleString()}
            </span>
          </div>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
              placeholder="Write the message to broadcast to all users…"
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none transition-all"
            />
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isNearLimit ? 'bg-rose-400' : 'bg-indigo-400'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        {message.trim() && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{message}</p>
            </div>
          </div>
        )}

        {/* Send */}
        <button
          onClick={send}
          disabled={sending || !message.trim()}
          className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              Send Broadcast
            </>
          )}
        </button>
      </div>

      {/* Success */}
      {result && (
        <div className="bg-white rounded-xl border border-emerald-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-sm">Broadcast complete</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: result.total, color: 'text-gray-900' },
              { label: 'Sent',   value: result.sent,  color: 'text-emerald-600' },
              { label: 'Failed', value: result.failed, color: 'text-rose-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
    </div>
  )
}
