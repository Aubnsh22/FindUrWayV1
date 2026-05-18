import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, History, BarChart3, Brain, ChevronRight, Clock, LogOut } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getHistory } from '../services/api'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="orb orb-cyan w-[600px] h-[600px] top-0 right-[-20%]" />
      <div className="orb orb-purple w-[500px] h-[500px] bottom-0 left-[-20%]" />

      <div className="container-app max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C46B4D]/10 to-[#C46B4D]/5 border border-[#C46B4D]/15 flex items-center justify-center">
                <Compass className="w-7 h-7 text-[#C46B4D]" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-text-white">{user?.username}</h1>
                <p className="text-sm text-text-mid">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-text-mid hover:text-neon-red hover:bg-black/[0.02] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Analysis History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-cyber-cyan" />
            <h2 className="text-lg font-extrabold text-text-white">Analysis History</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 skeleton rounded-xl" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-text-dim mx-auto mb-3" />
              <p className="text-text-mid font-semibold">No analyses yet</p>
              <p className="text-text-dim text-sm mt-1">
                Run your first profile analysis to see it here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mt-4 btn-primary text-sm"
              >
                Analyze Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                  <Link
                  key={item.id}
                  to="/"
                  onClick={() => sessionStorage.setItem('prefillProfile', item.profile_text)}
                  className="glass-card-light block p-4 hover:bg-white/90 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-text-white truncate">
                          {item.profile_name || 'Profile Analysis'}
                        </span>
                        <span className="text-xs font-bold text-[#C46B4D] bg-[#C46B4D]/[0.06] px-2 py-0.5 rounded-md">
                          {Math.round(item.avg_match_score)}% avg match
                        </span>
                      </div>
                      <p className="text-xs text-text-dim line-clamp-2">
                        {item.profile_text.slice(0, 200)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[11px] text-text-dim">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-text-dim">
                          <BarChart3 className="w-3 h-3" />
                          {item.jobs_matched} jobs
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {(item.top_categories || []).slice(0, 3).map(cat => (
                            <span key={cat} className="text-[10px] font-semibold text-text-mid bg-black/[0.02] px-1.5 py-0.5 rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-dim flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
