import { useState, useRef, useEffect } from 'react'
import api from '../api'

const MAX_LEN = 4096

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function BroadcastTab() {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([]) // { id, text, result, error, time }
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, sending])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [input])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return

    const id = Date.now()
    setHistory((h) => [...h, { id, text, time: new Date(), pending: true }])
    setInput('')
    setSending(true)

    try {
      const { data } = await api.post('/broadcast', { message: text })
      setHistory((h) =>
        h.map((m) => m.id === id ? { ...m, pending: false, result: data } : m)
      )
    } catch (e) {
      const error = e.response?.data?.detail || 'Broadcast failed.'
      setHistory((h) =>
        h.map((m) => m.id === id ? { ...m, pending: false, error } : m)
      )
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isNearLimit = input.length > MAX_LEN * 0.9

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
        {history.length === 0 ? (
          <EmptyState />
        ) : (
          history.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        {/* Sending indicator */}
        {sending && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Sending to all users…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="pt-3">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
            onKeyDown={onKeyDown}
            placeholder="Write a broadcast message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="w-full px-4 pt-3.5 pb-2 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none bg-transparent"
            style={{ minHeight: '52px' }}
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <span className={`text-xs font-medium ${isNearLimit ? 'text-rose-500' : 'text-gray-300'}`}>
              {input.length > 0 && `${input.length} / ${MAX_LEN.toLocaleString()}`}
            </span>
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="w-8 h-8 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              <svg className={`w-4 h-4 ${input.trim() ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Messages are delivered instantly to all registered users via Telegram.
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  return (
    <div className="flex flex-col items-end gap-2">
      {/* Bubble */}
      <div className="max-w-[85%]">
        <div className={`rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          msg.error
            ? 'bg-rose-50 border border-rose-200 text-rose-800'
            : 'bg-indigo-500 text-white'
        }`}>
          {msg.text}
        </div>

        {/* Timestamp + status */}
        <div className="flex items-center justify-end gap-1.5 mt-1 px-1">
          <span className="text-[11px] text-gray-400">{formatTime(msg.time)}</span>
          {msg.pending && (
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {msg.result && (
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
          {msg.error && (
            <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Delivery stats */}
      {msg.result && (
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs shadow-sm">
          <Stat label="Total"  value={msg.result.total}  color="text-gray-700" />
          <div className="w-px h-4 bg-gray-200" />
          <Stat label="Sent"   value={msg.result.sent}   color="text-emerald-600" dot="bg-emerald-400" />
          <div className="w-px h-4 bg-gray-200" />
          <Stat label="Failed" value={msg.result.failed} color="text-rose-500"    dot="bg-rose-400" />
        </div>
      )}

      {/* Error note */}
      {msg.error && (
        <p className="text-xs text-rose-500 px-1">{msg.error}</p>
      )}
    </div>
  )
}

function Stat({ label, value, color, dot }) {
  return (
    <div className="flex items-center gap-1.5">
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      <span className={`font-semibold ${color}`}>{value}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-20 select-none">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">Broadcast to all users</p>
      <p className="text-xs text-gray-400 max-w-xs">
        Type a message below and press Enter to send it instantly to every registered user via Telegram.
      </p>
    </div>
  )
}
