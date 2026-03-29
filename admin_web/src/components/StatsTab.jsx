import { useEffect, useState } from 'react'
import api from '../api'

const CARDS = (s) => [
  {
    label: 'Total Users',
    value: s?.users,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    color: 'bg-blue-50 text-blue-600',
  },
  {
    label: 'Total Bookings',
    value: s?.bookings?.total,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    label: 'Questions',
    value: s?.questions?.total,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    color: 'bg-violet-50 text-violet-600',
  },
  {
    label: 'Answered',
    value: s?.questions?.answered,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-emerald-50 text-emerald-600',
  },
]

const STATUS_BREAKDOWN = (s) => [
  { label: 'Pending',  value: s?.bookings?.pending,  dot: 'bg-amber-400',   text: 'text-amber-700',  bg: 'bg-amber-50' },
  { label: 'Approved', value: s?.bookings?.approved, dot: 'bg-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Rejected', value: s?.bookings?.rejected, dot: 'bg-rose-400',    text: 'text-rose-700',   bg: 'bg-rose-50' },
]

export default function StatsTab() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div className="space-y-6 max-w-full">
      {/* Overview */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {CARDS(stats).map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-gray-900 leading-tight">{card.value ?? '—'}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking status */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Bookings by Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATUS_BREAKDOWN(stats).map((item) => (
            <div key={item.label} className={`rounded-xl border border-gray-200 p-4 bg-white`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                <span className="text-xs font-medium text-gray-500">{item.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Questions breakdown */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Answered</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.questions?.answered ?? '—'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Unanswered</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.questions?.unanswered ?? '—'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  )
}
