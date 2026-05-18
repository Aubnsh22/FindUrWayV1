import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sparkles, ArrowRight, Brain, TrendingUp, Users, Briefcase,
  Zap, Target, Upload, MapPin, Cpu, BarChart3, Database,
  Code2, Globe, Compass, ChevronRight, BookOpen, Layers,
  Terminal
} from 'lucide-react'
import { analyzeProfile, getTrendingSkills, analyzeCV } from '../services/api.js'
import { SectionHeader } from '../components/ui/SharedUI.jsx'

const quickSkills = [
  'Python, Machine Learning, TensorFlow',
  'SQL, Power BI, Data Analysis',
  'React, Node.js, JavaScript',
  'NLP, Deep Learning, PyTorch',
  'AWS, Docker, DevOps',
]

// Animated left-side "AI workspace" NLP visualizer
function NlpWorkspace() {
  const profiles = [
    {
      input: "I am a Data Scientist with 2+ years of experience in Python, PyTorch, and SQL. I have built predictive models and PostgreSQL databases.",
      skills: ["Python", "PyTorch", "SQL", "Machine Learning"],
      role: "ML Research Engineer",
      confidence: "94.6%",
      location: "Casablanca, Morocco",
      trajectory: "Lead AI Practitioner"
    },
    {
      input: "Full Stack Engineer specializing in React, Node.js, and TypeScript. I build high-performance web apps and deploy on AWS Docker containers.",
      skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
      role: "Senior Full Stack Architect",
      confidence: "91.8%",
      location: "Rabat, Morocco",
      trajectory: "Engineering Lead"
    },
    {
      input: "Business Intelligence Analyst with strong SQL and Power BI experience. I design financial dashboards and report market trends.",
      skills: ["SQL", "Power BI", "Data Analysis", "BI"],
      role: "Data Insights Specialist",
      confidence: "88.5%",
      location: "Casablanca, Morocco",
      trajectory: "Analytics Director"
    }
  ]

  const [profileIndex, setProfileIndex] = useState(0)
  const [typedInput, setTypedInput] = useState('')
  const [phase, setPhase] = useState('typing') // 'typing' | 'detecting' | 'correlating' | 'aligning' | 'done'
  const [visibleSkills, setVisibleSkills] = useState([])
  const [visibleDetails, setVisibleDetails] = useState(false)

  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const xc = rect.width / 2
    const yc = rect.height / 2
    
    const tiltX = -(y - yc) / yc * 7.5
    const tiltY = (x - xc) / xc * 7.5
    
    setTilt({ x: tiltX, y: tiltY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const currentProfile = profiles[profileIndex]

  // Typing phase loop
  useEffect(() => {
    if (phase === 'typing') {
      const fullText = currentProfile.input
      if (typedInput.length < fullText.length) {
        const timeout = setTimeout(() => {
          setTypedInput(fullText.slice(0, typedInput.length + 1))
        }, 15)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setPhase('detecting')
        }, 600)
        return () => clearTimeout(timeout)
      }
    }
  }, [phase, typedInput, currentProfile])

  // Detecting skills loop
  useEffect(() => {
    if (phase === 'detecting') {
      if (visibleSkills.length < currentProfile.skills.length) {
        const timeout = setTimeout(() => {
          setVisibleSkills(prev => [...prev, currentProfile.skills[prev.length]])
        }, 400)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setPhase('correlating')
        }, 500)
        return () => clearTimeout(timeout)
      }
    }
  }, [phase, visibleSkills, currentProfile])

  // Correlating phase loop
  useEffect(() => {
    if (phase === 'correlating') {
      const timeout = setTimeout(() => {
        setPhase('aligning')
      }, 1200)
      return () => clearTimeout(timeout)
    }
  }, [phase])

  // Aligning details loop
  useEffect(() => {
    if (phase === 'aligning') {
      setVisibleDetails(true)
      const timeout = setTimeout(() => {
        setPhase('done')
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [phase])

  // Reset and repeat loop
  useEffect(() => {
    if (phase === 'done') {
      const timeout = setTimeout(() => {
        setTypedInput('')
        setVisibleSkills([])
        setVisibleDetails(false)
        setProfileIndex(prev => (prev + 1) % profiles.length)
        setPhase('typing')
      }, 4500)
      return () => clearTimeout(timeout)
    }
  }, [phase])
  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full rounded-2xl border border-black/[0.04] bg-white/80 backdrop-blur-xl p-6 font-mono text-xs text-text-mid leading-relaxed select-none relative overflow-hidden transition-all duration-300 ease-out"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${tilt.x === 0 && tilt.y === 0 ? '1, 1, 1' : '1.015, 1.015, 1.015'})`,
        boxShadow: tilt.x === 0 && tilt.y === 0 
          ? '0 20px 50px rgba(0, 0, 0,0.02)'
          : '0 30px 60px rgba(0, 0, 0,0.08), 0 0 30px rgba(0, 0, 0, 0.01)',
      }}
    >
      
      {/* Sleek macOS top header bar */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/[0.03]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
        </div>
        <span className="text-[9px] font-bold text-text-dim tracking-widest uppercase">NLP_SEMANTIC_ENGINE</span>
        <div className="w-3.5 h-3.5 rounded-full border border-cyber-cyan/15 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-ping" />
        </div>
      </div>

      {/* 1. Live Input stream */}
      <div className="mb-4">
        <span className="text-cyber-cyan font-bold">&gt; INGESTING_PROFILE:</span>
        <p className="mt-1 text-text-light font-sans text-xs italic bg-white/60 p-3 rounded-lg border border-black/[0.03] min-h-[56px]">
          {typedInput}
          {phase === 'typing' && <span className="animate-pulse">|</span>}
        </p>
      </div>

      {/* 2. Skill Extraction */}
      <div className="mb-4 min-h-[42px]">
        {visibleSkills.length > 0 && (
          <>
            <span className="text-text-dim uppercase tracking-wider text-[9px] font-bold">&gt; Skills Extracted:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {visibleSkills.map((sk) => (
                <span key={sk} className="px-2 py-0.5 rounded border border-cyber-cyan/20 bg-cyber-cyan/[0.03] text-cyber-cyan font-bold text-[9px] animate-fade-in">
                  {sk}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Thinking / Vector correlation stage */}
      <div className="mb-4 min-h-[20px]">
        {phase === 'correlating' && (
          <span className="text-neon-green/90 font-bold uppercase tracking-wider text-[9px] animate-pulse flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
            <span>Correlating local vector space... (0.892 Cosine)</span>
          </span>
        )}
      </div>

      {/* 4. AI Reasoning & Trajectory */}
      <div className="min-h-[92px] border-t border-black/[0.03] pt-4 mt-2">
        {visibleDetails && (
          <div className="grid grid-cols-2 gap-3.5 text-[9px]">
            <div>
              <span className="text-text-dim uppercase tracking-wider font-bold">Classified Trajectory</span>
              <p className="text-text-light font-bold text-xs mt-0.5">{currentProfile.role}</p>
            </div>
            <div>
              <span className="text-text-dim uppercase tracking-wider font-bold">Model Confidence</span>
              <p className="text-cyber-cyan font-bold text-xs mt-0.5 font-mono">{currentProfile.confidence}</p>
            </div>
            <div>
              <span className="text-text-dim uppercase tracking-wider font-bold">Market Hub Alignment</span>
              <p className="text-text-light font-bold text-xs mt-0.5">{currentProfile.location}</p>
            </div>
            <div>
              <span className="text-text-dim uppercase tracking-wider font-bold">Suggested Path</span>
              <p className="text-cyber-cyan font-bold text-xs mt-0.5">{currentProfile.trajectory}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function StatsBar() {
  const stats = [
    { icon: Briefcase, value: '2,500+', label: 'Local Job Listings' },
    { icon: Users, value: '850+', label: 'Successful Matches' },
    { icon: TrendingUp, value: '94.6%', label: 'Match Precision' },
    { icon: MapPin, value: 'Morocco Tech', label: 'Regional Focus' },
  ]

  // Quadruple items to make sure the loop spans past the screen width with absolute seamless alignment
  const doubledStats = [...stats, ...stats, ...stats, ...stats]

  return (
    <div className="relative py-12 select-none overflow-hidden -mx-4 md:-mx-8 lg:-mx-12">
      {/* Heavy Edge Masks: Absolute solid masking at the extreme edges to prevent any hard lines */}
      <div className="absolute inset-y-0 left-0 w-48 md:w-64 bg-gradient-to-r from-[var(--color-void)] via-[var(--color-void)] via-[var(--color-void)]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-48 md:w-64 bg-gradient-to-l from-[var(--color-void)] via-[var(--color-void)] via-[var(--color-void)]/80 to-transparent z-20 pointer-events-none" />

      <div className="flex gap-6 w-max animate-marquee-ltr relative z-0 pl-16">
        {doubledStats.map((s, i) => (
          <div 
            key={i} 
            className="glass-card p-4.5 px-6 border border-black/[0.04] bg-white/70 flex items-center gap-5 min-w-[280px]"
          >
            <div className="w-10 h-10 rounded-xl bg-cyber-cyan/[0.03] border border-cyber-cyan/10 flex items-center justify-center text-cyber-cyan">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-text-dim font-bold tracking-wider uppercase font-mono block leading-none">{s.label}</span>
              <span className="text-xl font-bold font-mono text-text-white tracking-tight block mt-1.5 leading-none">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendingSkills({ skills, loading }) {
  const iconMap = { Python: Code2, SQL: Database, 'Machine Learning': Brain, 'Power BI': BarChart3, Docker: Layers, React: Globe, TensorFlow: Cpu, AWS: Zap }
  const list = skills?.length ? skills : [
    { name: 'Python', growth: 15.2 }, { name: 'Machine Learning', growth: 28.5 },
    { name: 'Power BI', growth: 32.1 }, { name: 'SQL', growth: 5.8 },
    { name: 'Docker', growth: 22.4 }, { name: 'React', growth: 12.7 },
    { name: 'TensorFlow', growth: 18.9 }, { name: 'AWS', growth: 25.3 },
  ]
  return (
    <section className="py-20 relative">
      <div className="container-app">
        <SectionHeader 
          badge="Market Demand Matrix" 
          badgeIcon={TrendingUp}
          title="High Growth" 
          titleHighlight="Tech Skills"
          description="Real-time statistical tracking of high-growth skills in the Moroccan ecosystem" 
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? [...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-5"><div className="skeleton h-8 w-8 rounded-lg mb-4" /><div className="skeleton h-4 w-20 mb-2" /><div className="skeleton h-3 w-12" /></div>
          )) : list.map((skill, i) => {
            const Icon = iconMap[skill.name] || Sparkles
            return (
              <motion.div 
                key={skill.name} 
                initial={{ opacity: 0, scale: 0.96 }} 
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.4 }} 
                viewport={{ once: true }} 
                whileHover={{ y: -3 }}
                className="glass-card p-5 bg-white/80 border border-black/[0.04] cursor-default group"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.04] transition-colors">
                    <Icon className="w-4 h-4 text-text-light" />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-cyber-cyan">+{Number(skill.growth).toFixed(0)}% growth</span>
                </div>
                <div className="text-sm font-bold text-text-white mb-2">{skill.name}</div>
                <div className="h-[2px] rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    whileInView={{ width: `${Math.min(skill.growth * 3, 100)}%` }}
                    viewport={{ once: true }} 
                    transition={{ duration: 1, delay: i * 0.04 }}
                    className="h-full rounded-full bg-cyber-cyan/40" 
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CareerPaths() {
  const categories = [
    { name: 'Data Science', icon: Brain, count: 85, color: '#999999' },
    { name: 'AI / Machine Learning', icon: Cpu, count: 62, color: '#999999' },
    { name: 'Data Analytics', icon: BarChart3, count: 104, color: '#999999' },
    { name: 'Business Intelligence', icon: TrendingUp, count: 78, color: '#999999' },
    { name: 'Software Engineering', icon: Code2, count: 156, color: '#999999' },
    { name: 'Data Engineering', icon: Database, count: 54, color: '#999999' },
  ]
  return (
    <section className="py-20 relative">
      <div className="container-app">
        <SectionHeader 
          badge="Regional Domains" 
          badgeIcon={Compass}
          title="Explore" 
          titleHighlight="Career Tracks"
          description="Navigate demand distribution and career opportunities across Morocco" 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.name} 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }} 
              viewport={{ once: true }} 
              whileHover={{ y: -3 }}
              className="glass-card p-6 bg-white/80 border border-black/[0.04] cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all border border-white/[0.04] bg-white/[0.01] text-text-light">
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-text-white mb-1">{cat.name}</h3>
                  <p className="text-xs text-text-dim font-medium">{cat.count} local positions open</p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-cyber-cyan transition-colors mt-1" />
              </div>
              <div className="mt-4 h-[2px] rounded-full bg-white/[0.03] overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  whileInView={{ width: `${(cat.count / 156) * 100}%` }}
                  viewport={{ once: true }} 
                  transition={{ duration: 1.2, delay: i * 0.08 }}
                  className="h-full rounded-full bg-cyber-cyan/30" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { step: '01', icon: BookOpen, title: 'Describe Profile', desc: 'Share your stack, projects, and career preferences in our developer editor console.', color: 'var(--color-warm-accent)' },
    { step: '02', icon: Brain, title: 'Semantic Alignment', desc: 'Our offline NLP engine extracts skills and correlates them against regional demand.', color: 'var(--color-neon-purple)' },
    { step: '03', icon: Target, title: 'Correlated Matches', desc: 'Get clean, ranked opportunities with transparent matching scores and regional boosts.', color: 'var(--color-cyber-cyan)' },
  ]
  return (
    <section className="py-20 relative">
      <div className="container-app">
        <SectionHeader 
          title="Workflow" 
          titleHighlight="Structure" 
          description="How our platform aligns your skills with local job markets" 
        />
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((item, i) => (
            <motion.div 
              key={item.step} 
              initial={{ opacity: 0, y: 15 }} 
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }} 
              viewport={{ once: true }}
              className="glass-card p-8 text-center relative group"
            >
              <div className="w-14 h-14 rounded-full border border-glass-border flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110"
                   style={{ backgroundColor: `color-mix(in srgb, ${item.color} 10%, transparent)`, borderColor: `color-mix(in srgb, ${item.color} 30%, transparent)`, color: item.color }}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-[10px] font-bold font-mono tracking-widest"
                   style={{ color: item.color }}>
                {item.step}
              </div>
              <h3 className="text-base font-bold text-text-white mb-3 tracking-tight">{item.title}</h3>
              <p className="text-sm text-text-light leading-relaxed max-w-[240px] mx-auto opacity-90">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [profileText, setProfileText] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendingSkills, setTrendingSkills] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [profileFocused, setProfileFocused] = useState(false)
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  const handleProfileFocus = () => {
    if (!profileFocused) {
      setProfileFocused(true)
    }
  }

  useEffect(() => {
    let active = true
    getTrendingSkills()
      .then(d => { if (active) setTrendingSkills(d) })
      .catch(() => {})
      .finally(() => { if (active) setTrendingLoading(false) })
    return () => { active = false }
  }, [])

  // Restore pre-filled profile text from history click
  useEffect(() => {
    const prefill = sessionStorage.getItem('prefillProfile')
    if (prefill) {
      setProfileText(prefill)
      sessionStorage.removeItem('prefillProfile')
    }
  }, [])

  const handleAnalyze = async () => {
    if (profileText.trim().length < 20) {
      toast.error('Please describe your profile in at least 20 characters')
      return
    }
    setLoading(true)
    try {
      const results = await analyzeProfile(profileText)
      sessionStorage.setItem('analysisResults', JSON.stringify(results))
      sessionStorage.setItem('profileText', profileText)
      navigate('/results')
      toast.success('Analysis complete!')
    } catch {
      toast.error('Analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (text) => {
    setProfileText(prev =>
      prev ? `${prev}\nSkills: ${text}` : `Professional in ${text}. Solid experience with these technologies. Looking for high-impact matching roles in Morocco (Casablanca/Rabat preferred).`
    )
    textareaRef.current?.focus()
  }

  // Smooth scroll down to interactive indexing console
  const handleScrollToTerminal = () => {
    document.getElementById('profile-terminal')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative">
      
      {/* Editorial Split-Screen Hero Section (Swiss Design / OpenAI style) */}
      <section className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden">
        <div className="container-app relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT SIDE: AI workspace NLP engine panel */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="lg:col-span-6 w-full"
            >
              <NlpWorkspace />
            </motion.div>

            {/* RIGHT SIDE: Large bold typography */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="lg:col-span-6 text-left flex flex-col items-start pr-0 lg:pr-8"
            >
              {/* Intro Line */}
              <span className="text-cyber-cyan tracking-[0.2em] uppercase text-[10px] font-bold mb-4 block select-none">
                Your career is more than a resume.
              </span>

              {/* Bold Headline with Serifs */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight text-text-white mb-6">
                Understand it
                <br />
                with <span className="text-cyber-cyan italic font-serif font-normal pr-1 select-none">intelligence</span>.
              </h1>

              {/* Spacious Body Paragraph */}
              <p className="text-sm md:text-base text-text-mid max-w-lg mb-10 leading-relaxed">
                FindUrWay correlates your actual technical experience and stack against high-value tech hubs in Morocco. We bypass generic resume keyword filters to align your core capability to regional opportunities in Casablanca and Rabat.
              </p>

              {/* Solid Monochrome CTA Button */}
              <button 
                onClick={handleScrollToTerminal}
                className="btn-primary flex items-center gap-2.5 px-7 py-3.5 text-xs tracking-wider uppercase font-bold text-white cursor-pointer select-none"
              >
                <span>Begin Profile Alignment</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Structured metrics bar */}
      <section className="pb-12 relative z-10">
        <div className="container-app">
          <StatsBar />
        </div>
      </section>

      {/* Interactive Profile Analysis Console (Clean, centered segment) */}
      <section id="profile-terminal" className="py-20 relative z-10 border-t border-white/[0.03] bg-void/10">
        <div className="container-app max-w-3xl">
          
          <SectionHeader 
            badge="Ingestion Terminal"
            badgeIcon={Terminal}
            title="Index Your" 
            titleHighlight="Expertise" 
            description="Submit your skills or attach a CV to execute high-contrast vector alignment." 
          />

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            animate={{ scale: profileFocused ? 1.02 : 1 }}
            className="w-full rounded-2xl border border-black/[0.04] bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0, 0, 0,0.02)] overflow-hidden"
          >
            {/* macOS Window Title bar */}
            <div className="px-4 py-3 border-b border-black/[0.03] bg-black/[0.005] flex items-center justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black/10" />
                <span className="w-2 h-2 rounded-full bg-black/10" />
                <span className="w-2 h-2 rounded-full bg-black/10" />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-text-dim tracking-wide uppercase">
                <Terminal className="w-3.5 h-3.5 text-text-dim" />
                <span>profile_indexer.sh</span>
              </div>
              <span className="text-[9px] font-mono text-text-dim font-bold">{profileText.length} / 5000 chars</span>
            </div>

            {/* IDE Editor Textarea */}
            <div className="relative">
              <textarea 
                id="profile-input" 
                ref={textareaRef} 
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                onFocus={handleProfileFocus}
                placeholder="Input your tech stack, production experience, and preferred locations..."
                className="w-full min-h-[180px] p-5 bg-transparent border-0 text-sm leading-relaxed text-text-light placeholder:text-text-dim focus:outline-none resize-none font-mono text-[12px]" 
                maxLength={5000} 
              />
            </div>

            {/* Minimal CV Upload Attachment strip */}
            <div className="px-5 py-3.5 border-t border-black/[0.03] bg-black/[0.002] flex flex-wrap items-center justify-between gap-3">
              <input 
                type="file" 
                id="cv-upload" 
                accept=".pdf,.txt,.png,.jpg,.jpeg" 
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setLoading(true)
                  try {
                    const results = await analyzeCV(file)
                    sessionStorage.setItem('analysisResults', JSON.stringify(results))
                    sessionStorage.setItem('profileText', `[CV Upload: ${file.name}]`)
                    navigate('/results')
                    toast.success('CV analyzed!')
                  } catch {
                    toast.error('CV analysis failed.')
                  } finally {
                    setLoading(false)
                  }
                }} 
              />
              
              <label 
                htmlFor="cv-upload"
                className="flex items-center gap-2 text-xs font-bold text-text-mid hover:text-cyber-cyan transition-colors cursor-pointer select-none"
              >
                <Upload className="w-3.5 h-3.5 text-text-dim" />
                <span>Attach Resume / CV</span>
              </label>

              {/* Quick Add keywords */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[9px] text-text-dim font-bold uppercase tracking-wider font-mono mr-1">Quick add:</span>
                {quickSkills.slice(0, 3).map((skill) => (
                  <button 
                    key={skill} 
                    onClick={() => handleQuickFill(skill)}
                    className="px-2.5 py-1 rounded border border-black/[0.04] bg-white/60 hover:bg-white/80 text-[9px] font-semibold text-text-mid hover:text-cyber-cyan transition-all cursor-pointer font-mono"
                  >
                    {skill.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Execute analysis CTA Bar */}
            <div className="p-3 border-t border-black/[0.03] bg-black/[0.005]">
              <button 
                onClick={handleAnalyze}
                disabled={loading || profileText.trim().length < 20}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-text-white border border-cyber-cyan/20 bg-cyber-cyan/[0.03] hover:bg-cyber-cyan/[0.08] hover:border-cyber-cyan/40 shadow-[0_2px_15px_rgba(203,187,160,0.02)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                    <span>AI indexing is active...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Execute Profile Alignment</span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-dim" />
                  </>
                )}
              </button>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Ecosystem components */}
      <TrendingSkills skills={trendingSkills} loading={trendingLoading} />
      <CareerPaths />
      <HowItWorks />

      {/* Minimal Footer */}
      <footer className="py-12 border-t border-white/[0.04] relative z-10 bg-void/20">
        <div className="container-app text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <Compass className="w-4 h-4 text-cyber-cyan" />
            <span className="text-sm font-bold text-text-white">Find<span className="gradient-text font-black">Ur</span>Way</span>
          </div>
          <p className="text-[10px] font-bold text-text-dim tracking-wider uppercase font-mono">Moroccan Tech Opportunity Classifier</p>
          <p className="text-[10px] text-text-dim font-mono mt-1.5">Offline Semantics · PyTorch & Fastapi · Zero External Tracking</p>
        </div>
      </footer>
    </div>
  )
}
