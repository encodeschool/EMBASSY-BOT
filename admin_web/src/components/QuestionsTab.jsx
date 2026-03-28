import { useEffect, useState } from 'react'
import api from '../api'

const FILTERS = ['all', 'unanswered', 'answered']

export default function QuestionsTab() {
  const [questions, setQuestions] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // question object being replied to
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/questions')
      .then(({ data }) => setQuestions(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openModal = (q) => { setModal(q); setReply('') }
  const closeModal = () => { setModal(null); setReply('') }

  const sendReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await api.post(`/questions/${modal.id}/reply`, { answer: reply.trim() })
      setQuestions((prev) =>
        prev.map((q) => q.id === modal.id ? { ...q, answer: reply.trim(), answered: true } : q)
      )
      showToast('Reply sent successfully!')
      closeModal()
    } catch {
      showToast('Failed to send reply.')
    } finally {
      setSending(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const filtered =
    filter === 'all' ? questions
    : filter === 'answered' ? questions.filter((q) => q.answered)
    : questions.filter((q) => !q.answered)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Questions</h2>
        <button onClick={load} className="text-sm text-blue-600 hover:underline self-start sm:self-auto">
          ↻ Refresh
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
              ${filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty text="No questions found." />
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-700">{q.user_name}</span>
                    {q.answered
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Answered</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                    }
                  </div>
                  <p className="text-gray-900 text-sm">{q.text}</p>
                  {q.answer && (
                    <div className="mt-2 pl-3 border-l-2 border-blue-200">
                      <p className="text-xs text-gray-500 mb-0.5">Admin reply:</p>
                      <p className="text-sm text-gray-700">{q.answer}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => openModal(q)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition-colors"
                >
                  {q.answered ? '✏️ Edit' : '✍️ Reply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-gray-900">Reply to {modal.user_name}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              {/* Original question */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Question:</p>
                <p className="text-sm text-gray-800">{modal.text}</p>
              </div>

              {/* Reply textarea */}
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-xl text-sm shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-4xl mb-2">💬</p>
      <p className="text-sm">{text}</p>
    </div>
  )
}
