import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, Brain, Target, TrendingUp, Briefcase, Award,
  ArrowRight, Sparkles, MapPin, Activity, Zap
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import { MatchRing } from '../components/ui/SharedUI.jsx'

const COLORS = ['#000000', '#111111', '#1A1A1A', '#333333', '#666666', '#999999']

const tooltipStyle = {
  contentStyle: {
    background: 'rgba(255, 255, 255, 0.96)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    borderRadius: '12px',
    color: '#000000',
    fontSize: '11px',
    fontFamily: 'monospace',
    boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
  }
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} className="glass-card p-5 group cursor-default">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110"
          style={{ background: `${color}08`, borderColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      </div>
      <div className="text-2xl font-bold font-mono text-text-white">{value}</div>
      <div className="text-[10px] text-text-dim mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResults')
    if (stored) { try { setResults(JSON.parse(stored)) } catch {} }
  }, [])

  if (!results) {
    return (
      <div className="pt-20 pb-16 min-h-screen">
        <div className="container-app">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-2xl bg-cyber-cyan/5 border border-cyber-cyan/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-cyber-cyan" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full border border-cyber-cyan/[0.06]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-text-white mb-2">No Analysis Data</h2>
            <p className="text-text-mid mb-8 max-w-md text-sm">Run a profile analysis first to unlock your career dashboard with AI-powered insights.</p>
            <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Analyze Profile</span>
              <ArrowRight className="w-5 h-5 relative z-10" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const avgMatch = results.avg_match_score
  const skillCategories = [
    { subject: 'Technical', A: Math.min(results.skills.technical_skills.length * 8, 100) },
    { subject: 'Frameworks', A: Math.min(results.skills.frameworks.length * 12, 100) },
    { subject: 'Languages', A: Math.min(results.skills.languages.length * 15, 100) },
    { subject: 'Soft Skills', A: Math.min(results.skills.soft_skills.length * 18, 100) },
    { subject: 'Tools', A: Math.min((results.skills.frameworks.length + results.skills.technical_skills.length) * 5, 100) },
  ]

  const categoryData = results.top_categories.map((cat, i) => ({
    name: cat.length > 15 ? cat.slice(0, 15) + '…' : cat,
    jobs: results.jobs.filter(j => j.category === cat).length,
    color: COLORS[i % COLORS.length],
  }))

  const matchDistribution = [
    { name: '80-100%', value: results.jobs.filter(j => j.match_percentage >= 80).length, color: '#000000' },
    { name: '60-80%', value: results.jobs.filter(j => j.match_percentage >= 60 && j.match_percentage < 80).length, color: '#111111' },
    { name: '40-60%', value: results.jobs.filter(j => j.match_percentage >= 40 && j.match_percentage < 60).length, color: '#1A1A1A' },
    { name: '<40%', value: results.jobs.filter(j => j.match_percentage < 40).length, color: '#333333' },
  ].filter(d => d.value > 0)

  const momentumData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    demand: Math.round(40 + Math.random() * 40 + i * 3),
    match: Math.round(30 + Math.random() * 30 + i * 2),
  }))

  return (
    <div className="pt-20 pb-16">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text-white">Career <span className="italic font-serif text-cyber-cyan">Dashboard</span></h1>
          <p className="text-text-mid text-sm">Your AI-powered career analytics and intelligence</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card-glow p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyber-cyan" />
            </div>
            <span className="text-sm font-semibold text-text-white">AI Career Summary</span>
            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/[0.06] border border-cyber-cyan/10">
              <MapPin className="w-3 h-3 text-cyber-cyan" />
              <span className="text-[10px] font-medium text-cyber-cyan uppercase tracking-wider">Morocco Focus</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <MatchRing percentage={avgMatch} size={80} strokeWidth={4} />
              <div>
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Role Fit Signal</div>
                <div className="text-lg font-bold text-text-white">Strong Alignment</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/[0.06] border border-cyber-cyan/10 flex items-center justify-center">
                <span className="text-lg font-bold font-mono text-cyber-cyan">{results.skills.technical_skills.length}</span>
              </div>
              <div>
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Skill Coverage</div>
                <div className="text-lg font-bold text-text-white">{results.skills.technical_skills.length + results.skills.frameworks.length} detected</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/[0.06] border border-cyber-cyan/10 flex items-center justify-center">
                <Activity className="w-7 h-7 text-cyber-cyan" />
              </div>
              <div>
                <div className="text-xs text-text-dim uppercase tracking-wider mb-1">Market Momentum</div>
                <div className="text-lg font-bold text-cyber-cyan">+22% ↑</div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Briefcase} label="Jobs Matched" value={results.jobs.length} color="#000000" delay={0.1} />
          <StatCard icon={Target} label="Avg Match" value={`${avgMatch.toFixed(0)}%`} color="#111111" delay={0.15} />
          <StatCard icon={Award} label="Skills Found" value={results.skills.technical_skills.length + results.skills.frameworks.length} color="#1A1A1A" delay={0.2} />
          <StatCard icon={TrendingUp} label="Categories" value={results.top_categories.length} color="#333333" delay={0.25} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyber-cyan" /> Skill Radar
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillCategories}>
                  <PolarGrid stroke="rgba(0, 0, 0, 0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#768278', fontSize: 10, fontFamily: 'monospace' }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#000000" fill="#000000" fillOpacity={0.12} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyber-cyan" /> Match Distribution
            </h3>
            <div className="h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={matchDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90} paddingAngle={4} strokeWidth={0}>
                    {matchDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {matchDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-[11px] text-text-mid">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-green" /> Market Momentum
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={momentumData}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000000" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#768278', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#768278', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="demand" stroke="#000000" fill="url(#demandGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="match" stroke="#1A1A1A" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-cyan" /> AI Career Insights
            </h3>
            <div className="space-y-3">
              {results.career_insights.map((ci, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/60 border border-black/[0.03] shadow-[0_4px_20px_rgba(0, 0, 0,0.01)]">
                  <div className="font-semibold text-text-white text-sm mb-1">{ci.title}</div>
                  <p className="text-xs text-text-mid leading-relaxed">{ci.description}</p>
                </div>
              ))}
            </div>
            {results.learning_paths?.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                  <Zap className="w-3.5 h-3.5 text-cyber-cyan" /> Learning Paths
                </h4>
                <div className="space-y-2">
                  {results.learning_paths.slice(0, 4).map((lp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-black/[0.03]">
                      <div className={`w-2 h-2 rounded-full ${lp.priority === 'high' ? 'bg-[#000000]' : 'bg-[#333333]'}`} />
                      <span className="text-sm font-medium text-text-white flex-1">{lp.skill}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${lp.priority === 'high' ? 'bg-[#000000]/[0.06] text-[#000000]' : 'bg-[#333333]/[0.06] text-[#333333]'}`}>{lp.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
