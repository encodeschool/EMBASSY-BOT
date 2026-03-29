import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function AuthPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('adminToken')) {
      navigate('/admin', { replace: true })
      return
    }
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) verifyToken(token)
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
      window.history.replaceState({}, '', '/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-slate-900/40" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent line */}
          <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-white">Embassy Bot Admin</h1>
              <p className="text-sm text-slate-400 mt-0.5">Secure admin panel</p>
            </div>

            {/* Verifying state */}
            {status === 'verifying' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Verifying your identity…</p>
              </div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <svg className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-rose-300">{error}</p>
              </div>
            )}

            {/* Instructions */}
            {status !== 'verifying' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">How to access</p>
                {[
                  { step: '1', text: 'Open your Telegram bot' },
                  { step: '2', text: <>Send <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">/webadmin</code></> },
                  { step: '3', text: 'Tap the link the bot sends you' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs flex items-center justify-center font-semibold flex-shrink-0">
                      {step}
                    </span>
                    <p className="text-sm text-slate-300">{text}</p>
                  </div>
                ))}

                <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <p className="text-xs text-slate-500">Single-use link · expires in 5 minutes</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
