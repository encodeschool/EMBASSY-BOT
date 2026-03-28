import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || ''

export default function AuthPage() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect immediately
  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin', { replace: true })
  }, [navigate])

  // Inject Telegram Login Widget script
  useEffect(() => {
    if (!BOT_USERNAME) return

    window.onTelegramAuth = async (user) => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.post('/auth/login', user)
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminName', data.name)
        navigate('/admin', { replace: true })
      } catch (err) {
        const msg = err.response?.data?.detail || 'Authentication failed.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }

    const container = document.getElementById('tg-login-btn')
    if (container && !container.hasChildNodes()) {
      const script = document.createElement('script')
      script.src = 'https://telegram.org/js/telegram-widget.js?22'
      script.setAttribute('data-telegram-login', BOT_USERNAME)
      script.setAttribute('data-size', 'large')
      script.setAttribute('data-radius', '8')
      script.setAttribute('data-onauth', 'onTelegramAuth(user)')
      script.setAttribute('data-request-access', 'write')
      script.async = true
      container.appendChild(script)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl mb-4 shadow-lg">
              🤖
            </div>
            <h1 className="text-2xl font-bold text-gray-900">HelpBot Admin</h1>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Sign in with Telegram to access the admin panel
            </p>
          </div>

          {/* Steps */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">How it works</p>
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <span className="font-bold">1.</span>
              <span>Click the Telegram button below</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <span className="font-bold">2.</span>
              <span>Authorize with your Telegram account</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <span className="font-bold">3.</span>
              <span>Access is granted if you are an admin</span>
            </div>
          </div>

          {/* Telegram Login Widget or placeholder */}
          <div className="flex flex-col items-center gap-3">
            {!BOT_USERNAME ? (
              <div className="text-center py-4">
                <p className="text-amber-600 text-sm font-medium">⚠️ BOT_USERNAME not configured</p>
                <p className="text-gray-400 text-xs mt-1">
                  Set <code className="bg-gray-100 px-1 rounded">VITE_BOT_USERNAME</code> in{' '}
                  <code className="bg-gray-100 px-1 rounded">admin_web/.env</code>
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center gap-2 text-blue-600">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-sm">Verifying…</span>
              </div>
            ) : (
              <div id="tg-login-btn" />
            )}

            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Only registered admins can access this panel.
        </p>
      </div>
    </div>
  )
}
