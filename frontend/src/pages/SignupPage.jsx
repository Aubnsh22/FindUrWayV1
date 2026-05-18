import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'sonner'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !username || !password) return toast.error('Fill in all fields')
    if (password !== confirmPw) return toast.error('Passwords do not match')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setSubmitting(true)
    try {
      await signup(email, username, password)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
      <div className="orb orb-cyan w-[500px] h-[500px] top-0 right-[-10%]" />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-0 left-[-10%]" />

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
            <h1 className="text-xl font-extrabold text-text-white">Create Account</h1>
            <p className="text-sm text-text-mid">Join FindUrWay today</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-mid mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="profile-textarea min-h-0 h-12"
              placeholder="you@example.com"
            />
          </div>

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

          <div>
            <label className="block text-sm font-semibold text-text-mid mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              className="profile-textarea min-h-0 h-12"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full gap-2"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-mid">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C46B4D] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
