import { useEffect, useState } from 'react'
import api from '../api'

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>

      {/* Users */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users"     value={stats?.users}                color="bg-blue-50" />
        <StatCard icon="📅" label="Total Bookings"  value={stats?.bookings?.total}       color="bg-indigo-50" />
        <StatCard icon="❓" label="Total Questions" value={stats?.questions?.total}      color="bg-purple-50" />
        <StatCard icon="✅" label="Answered"        value={stats?.questions?.answered}   color="bg-green-50" />
      </div>

      {/* Booking breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Bookings by Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon="⏳" label="Pending"  value={stats?.bookings?.pending}  color="bg-amber-50" />
          <StatCard icon="✅" label="Approved" value={stats?.bookings?.approved} color="bg-green-50" />
          <StatCard icon="❌" label="Rejected" value={stats?.bookings?.rejected} color="bg-red-50" />
        </div>
      </div>

      {/* Questions breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Questions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon="✅" label="Answered"   value={stats?.questions?.answered}   color="bg-green-50" />
          <StatCard icon="🕐" label="Unanswered" value={stats?.questions?.unanswered} color="bg-orange-50" />
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    </div>
  )
}
