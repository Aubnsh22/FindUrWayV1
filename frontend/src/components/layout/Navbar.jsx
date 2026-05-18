import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Compass, BarChart3, Bookmark, Home, Menu, X,
  Brain, Activity, Award, LogIn, User
} from 'lucide-react'
import { useAuth } from '../../lib/AuthContext'

const navLinks = [
  { path: '/', label: 'Analyze', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/results', label: 'Matches', icon: Brain },
  { path: '/insights', label: 'Insights', icon: Activity },
  { path: '/saved', label: 'Saved', icon: Bookmark },
  { path: '/test', label: 'Skill Test', icon: Award },
]

function MobileAuthButtons({ close }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return (
      <div className="flex flex-col gap-1 mb-2 pb-2 border-b border-black/[0.04]">
        <Link
          to="/profile"
          onClick={close}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-mid hover:text-cyber-cyan transition-colors"
        >
          <User className="w-4 h-4" />
          {user.username}
        </Link>
        <button
          onClick={() => { logout(); close(); navigate('/') }}          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-text-mid hover:text-neon-red hover:bg-black/[0.02] transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-1 mb-2 pb-2 border-b border-black/[0.04]">
      <Link
        to="/login"
        onClick={close}
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-[#C46B4D] border border-[#C46B4D]/15 bg-[#C46B4D]/[0.04] hover:bg-[#C46B4D]/[0.08]"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Link>
    </div>
  )
}

function AuthButtonsDesktop() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return (
      <div className="hidden md:flex items-center gap-2">
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-text-mid hover:text-[#C46B4D] transition-all duration-300 hover:bg-[#C46B4D]/[0.04]"
        >
          <User className="w-3.5 h-3.5" />
          {user.username}
        </Link>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="px-3 py-2 rounded-xl text-[13px] font-bold text-text-mid hover:text-neon-red transition-all duration-300 hover:bg-black/[0.02] cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="hidden md:flex items-center gap-1">
      <Link
        to="/login"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-text-mid hover:text-[#C46B4D] transition-all duration-300 hover:bg-[#C46B4D]/[0.04]"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Link>
    </div>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Track window scroll to trigger floating morph animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className={`fixed z-50 flex justify-center transition-all duration-500 ease-out ${
        scrolled 
          ? 'top-4 left-0 right-0 px-4 md:px-6' 
          : 'top-0 left-0 right-0 px-0'
      }`}
    >
      <nav 
        className={`w-full relative transition-all duration-500 ease-out group/nav ${
          scrolled 
            ? 'max-w-[1350px] rounded-2xl border border-black/[0.04] hover:border-cyber-cyan/15 shadow-[0_12px_40px_rgba(42,54,43,0.03)]' 
            : 'max-w-full rounded-none border-b border-black/[0.04]'
        }`}
        id="main-nav"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.35)',
          backdropFilter: scrolled ? 'blur(28px) saturate(1.3)' : 'blur(30px) saturate(1.4)',
          WebkitBackdropFilter: scrolled ? 'blur(28px) saturate(1.3)' : 'blur(30px) saturate(1.4)',
        }}
      >
        {/* Sleek subtle color backdrop flow (only visible when floating) */}
        <div 
          className={`absolute inset-0 rounded-inherit bg-gradient-to-r from-cyber-cyan/[0.01] to-neon-purple/[0.01] opacity-50 pointer-events-none transition-all duration-500`} 
        />

        <div 
          className={`py-3.5 flex items-center justify-between relative z-10 transition-all duration-500 ${
            scrolled ? 'px-5 md:px-8' : 'container-app'
          }`}
        >
          
          {/* Logo brand */}
          <Link to="/" className="flex items-center gap-3 group" id="logo-link">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-cyber-cyan/10 blur-md group-hover:bg-cyber-cyan/20 transition-all duration-500" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan/10 to-neon-purple/10 border border-cyber-cyan/15 flex items-center justify-center group-hover:border-cyber-cyan/35 transition-all duration-300">
                <Compass className="w-[18px] h-[18px] text-[#C46B4D] group-hover:rotate-[45deg] transition-transform duration-500 ease-out" />
              </div>
            </div>
            <span className="text-base md:text-lg font-extrabold tracking-tight text-text-white flex items-center gap-1 select-none">
              Find<span className="gradient-text font-black">Ur</span>Way
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse shadow-[0_0_8px_rgba(42,54,43,0.3)]" />
            </span>
          </Link>

          {/* Nav links for desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-[13px] font-bold
                    transition-all duration-300 group/link
                    ${isActive
                      ? 'text-[#C46B4D]'
                      : 'text-text-mid hover:text-text-light hover:bg-black/[0.015]'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#C46B4D]/[0.06] to-[#C46B4D]/[0.02] border border-[#C46B4D]/10 shadow-[0_2px_8px_rgba(196,107,77,0.03)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 relative z-10 transition-transform duration-300 group-hover/link:scale-110 ${isActive ? 'text-[#C46B4D]' : 'text-text-dim group-hover/link:text-text-light'}`} />
                  <span className="relative z-10">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            
            {/* Heartbeat radar ping status widget */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#C46B4D]/[0.04] border border-[#C46B4D]/12 hover:bg-[#C46B4D]/[0.08] transition-colors cursor-default select-none">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C46B4D] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C46B4D]" />
              </div>
              <span className="text-[10px] font-bold text-[#C46B4D] tracking-wider uppercase font-mono">AI core online</span>
            </div>

            {/* Auth buttons — desktop */}
            <AuthButtonsDesktop />

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-text-mid hover:text-text-white hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu for Mobile */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`md:hidden absolute left-0 right-0 overflow-hidden border border-black/[0.04] shadow-[0_16px_40px_rgba(0,0,0,0.05)] transition-all duration-500 ${
                scrolled 
                  ? 'top-[calc(100%+8px)] rounded-2xl mx-0' 
                  : 'top-full rounded-none mx-0'
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
              }}
            >
              <div className="p-4 flex flex-col gap-1">
                {navLinks.map(({ path, label, icon: Icon }) => {
                  const isActive = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold
                        transition-all duration-300
                        ${isActive
                          ? 'bg-[#C46B4D]/[0.06] text-[#C46B4D] border border-[#C46B4D]/10'
                          : 'text-text-mid hover:text-text-light hover:bg-black/[0.015]'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  )
                })}
                <MobileAuthButtons close={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  )
}
