import { useEffect, useState } from 'react'
import api from '../api'

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const FILTERS = ['all', 'pending', 'approved', 'rejected']

export default function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // booking id being updated

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
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      )
    } catch (e) {
      alert('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Bookings</h2>
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
            {f !== 'all' && (
              <span className="ml-1 opacity-70">
                ({bookings.filter((b) => b.status === f).length})
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
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'User', 'Date', 'Time', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">#{b.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{b.user_name}</td>
                    <td className="px-4 py-3 text-gray-600">{b.date}</td>
                    <td className="px-4 py-3 text-gray-600">{b.time}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
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
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{b.user_name}</p>
                    <p className="text-sm text-gray-500">{b.date} · {b.time}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-3">
                  <ActionButtons
                    current={b.status}
                    disabled={updating === b.id}
                    onApprove={() => changeStatus(b.id, 'approved')}
                    onReject={() => changeStatus(b.id, 'rejected')}
                    onPending={() => changeStatus(b.id, 'pending')}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
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
          className="px-2.5 py-1 text-xs rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 font-medium transition-colors"
        >
          ✅ Approve
        </button>
      )}
      {current !== 'rejected' && (
        <button
          onClick={onReject}
          disabled={disabled}
          className="px-2.5 py-1 text-xs rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 font-medium transition-colors"
        >
          ❌ Reject
        </button>
      )}
      {current !== 'pending' && (
        <button
          onClick={onPending}
          disabled={disabled}
          className="px-2.5 py-1 text-xs rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50 font-medium transition-colors"
        >
          ⏳ Pending
        </button>
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
      <p className="text-4xl mb-2">📭</p>
      <p className="text-sm">{text}</p>
    </div>
  )
}
