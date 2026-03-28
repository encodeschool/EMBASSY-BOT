import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AuthPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle') // idle | verifying | error
  const [error, setError] = useState('')

  useEffect(() => {
    // Already logged in → go straight to panel
    if (localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true })
      return
    }

    // Check for ?token= in URL (from /webadmin bot command)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      verifyToken(token)
    }
  }, [navigate])

  const verifyToken = async (token) => {
    setStatus('verifying')
    try {
      const { data } = await api.post('/auth/token-login', { token })
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminName', data.name || 'Admin')
      navigate('/admin', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Link is invalid or expired.'
      setError(msg)
      setStatus('error')
      // Clean the token from URL so user sees a clean error
      window.history.replaceState({}, '', '/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
              🤖
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HelpBot Admin</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Secure admin panel for your Telegram bot
            </p>
          </div>

          {/* States */}
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-600">Verifying your identity…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-red-700 font-medium text-sm">❌ {error}</p>
            </div>
          )}

          {/* How to access */}
          {status !== 'verifying' && (
            <div className="bg-blue-50 rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-blue-800">How to access the panel:</p>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                <p className="text-sm text-blue-900">Open your Telegram bot</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                <div>
                  <p className="text-sm text-blue-900">Send the command:</p>
                  <code className="inline-block mt-1 bg-white border border-blue-200 text-blue-700 font-mono text-sm px-3 py-1 rounded-lg">
                    /webadmin
                  </code>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                <p className="text-sm text-blue-900">Click the <strong>Open Admin Panel</strong> button the bot sends you</p>
              </div>

              <div className="mt-2 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  🔒 Each link is single-use and expires in 5 minutes.
                  Only registered admins can generate a link.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Only registered admins can access this panel.
        </p>
      </div>
    </div>
  )
}
