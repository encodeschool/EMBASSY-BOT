import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatsTab from '../components/StatsTab'
import BookingsTab from '../components/BookingsTab'
import QuestionsTab from '../components/QuestionsTab'
import BroadcastTab from '../components/BroadcastTab'

const TABS = {
  stats:     <StatsTab />,
  bookings:  <BookingsTab />,
  questions: <QuestionsTab />,
  broadcast: <BroadcastTab />,
}

const TAB_LABELS = {
  stats:     'Dashboard',
  bookings:  'Bookings',
  questions: 'Questions',
  broadcast: 'Broadcast',
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('stats')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const adminName = localStorage.getItem('adminName') || 'Admin'

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminName')
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        active={activeTab}
        onSelect={setActiveTab}
        onLogout={logout}
        adminName={adminName}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900">{TAB_LABELS[activeTab]}</h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-gray-500 font-medium">Live</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {TABS[activeTab]}
        </main>
      </div>
    </div>
  )
}
