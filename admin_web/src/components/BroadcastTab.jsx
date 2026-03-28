import { useState } from 'react'
import api from '../api'

const MAX_LEN = 4096  // Telegram message limit

export default function BroadcastTab() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)  // { sent, failed, total }
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

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">Broadcast Message</h2>
      <p className="text-sm text-gray-500">
        Send a message to all registered users at once.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        {/* Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
            placeholder="Write the message to broadcast to all users..."
            rows={6}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className={`text-xs mt-1 text-right ${message.length > MAX_LEN * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
            {message.length} / {MAX_LEN}
          </p>
        </div>

        {/* Preview */}
        {message.trim() && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 mb-1">Preview</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{message}</p>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={send}
          disabled={sending || !message.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending…
            </>
          ) : (
            <>📢 Send Broadcast</>
          )}
        </button>
      </div>

      {/* Success result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-800 mb-1">✅ Broadcast complete</p>
          <div className="grid grid-cols-3 gap-3 mt-2 text-center">
            <div className="bg-white rounded-lg p-2">
              <p className="text-lg font-bold text-gray-900">{result.total}</p>
              <p className="text-xs text-gray-500">Total users</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="text-lg font-bold text-green-600">{result.sent}</p>
              <p className="text-xs text-gray-500">Sent</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <p className="text-lg font-bold text-red-500">{result.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          ❌ {error}
        </div>
      )}
    </div>
  )
}
