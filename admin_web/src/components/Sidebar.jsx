const NAV = [
  { id: 'stats',     label: 'Dashboard',  icon: '📊' },
  { id: 'bookings',  label: 'Bookings',   icon: '📅' },
  { id: 'questions', label: 'Questions',  icon: '❓' },
  { id: 'broadcast', label: 'Broadcast',  icon: '📢' },
]

export default function Sidebar({ active, onSelect, onLogout, adminName, mobileOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30
          transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-lg flex-shrink-0">
            🤖
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">HelpBot Admin</p>
            <p className="text-xs text-slate-400 truncate">{adminName}</p>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item.id); onClose() }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${active === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-colors"
          >
            <span>🚪</span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
