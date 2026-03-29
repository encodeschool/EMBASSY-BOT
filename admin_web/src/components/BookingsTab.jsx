import { useEffect, useState } from 'react'
import api from '../api'

const STATUS = {
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50',   ring: 'ring-amber-200',   label: 'Pending'  },
  approved: { dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', label: 'Approved' },
  rejected: { dot: 'bg-rose-400',    text: 'text-rose-700',    bg: 'bg-rose-50',    ring: 'ring-rose-200',    label: 'Rejected' },
}

const FILTERS = ['all', 'pending', 'approved', 'rejected']

export default function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/bookings')
      .then(({ data }) => setBookings(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const changeStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.patch(`/bookings/${id}/status`, { status })
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    } catch {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const counts = Object.fromEntries(FILTERS.slice(1).map((f) => [f, bookings.filter((b) => b.status === f).length]))

  return (
    <div className="space-y-5 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Bookings</h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {f === 'all' ? 'All' : STATUS[f]?.label}
            {f !== 'all' && counts[f] > 0 && (
              <span className={`ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <Empty text={filter === 'all' ? 'No bookings yet.' : `No ${filter} bookings.`} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['#', 'User', 'Date', 'Time', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-400">{b.id}</td>
                    <td className="px-4 py-3.5 font-medium text-gray-800">{b.user_name}</td>
                    <td className="px-4 py-3.5 text-gray-500">{b.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-700">{b.time}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionButtons
                        current={b.status}
                        disabled={updating === b.id}
                        onApprove={() => changeStatus(b.id, 'approved')}
                        onReject={() => changeStatus(b.id, 'rejected')}
                        onPending={() => changeStatus(b.id, 'pending')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.user_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.date} · {b.time}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <ActionButtons
                  current={b.status}
                  disabled={updating === b.id}
                  onApprove={() => changeStatus(b.id, 'approved')}
                  onReject={() => changeStatus(b.id, 'rejected')}
                  onPending={() => changeStatus(b.id, 'pending')}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const s = STATUS[status] || { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200', label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function ActionButtons({ current, disabled, onApprove, onReject, onPending }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {current !== 'approved' && (
        <button
          onClick={onApprove}
          disabled={disabled}
          className="px-2.5 py-1 text-xs rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 font-medium transition-colors"
        >
          Approve
        </button>
      )}
      {current !== 'rejected' && (
        <button
          onClick={onReject}
          disabled={disabled}
          className="px-2.5 py-1 text-xs rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 font-medium transition-colors"
        >
          Reject
        </button>
      )}
      {current !== 'pending' && (
        <button
          onClick={onPending}
          disabled={disabled}
          className="px-2.5 py-1 text-xs rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-40 font-medium transition-colors"
        >
          Pending
        </button>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-400">{text}</p>
    </div>
  )
}
