import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) return toast.error('Fill in all fields')
    setSubmitting(true)
    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="orb orb-cyan w-[500px] h-[500px] top-0 left-[-10%]" />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-0 right-[-10%]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C46B4D]/10 to-[#C46B4D]/5 border border-[#C46B4D]/15 flex items-center justify-center">
            <Compass className="w-5 h-5 text-[#C46B4D]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-white">Welcome Back</h1>
            <p className="text-sm text-text-mid">Sign in to FindUrWay</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-mid mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="profile-textarea min-h-0 h-12"
              placeholder="your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-mid mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="profile-textarea min-h-0 h-12 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-mid cursor-pointer"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full gap-2"
          >
            <LogIn className="w-4 h-4" />
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-mid">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#C46B4D] font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
