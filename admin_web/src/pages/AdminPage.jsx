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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        active={activeTab}
        onSelect={setActiveTab}
        onLogout={logout}
        adminName={adminName}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3 flex-shrink-0">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {TAB_LABELS[activeTab]}
            </h1>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-2 text-sm text-gray-600 flex-shrink-0">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block truncate max-w-32">{adminName}</span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {TABS[activeTab]}
        </main>
      </div>
    </div>
  )
}
