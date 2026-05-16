import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3, Brain, Target, TrendingUp, Briefcase, Award,
  ArrowRight, Sparkles, Users, MapPin, Cpu, Code2, Database
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#14B8A6', '#0EA5E9', '#22C55E', '#38BDF8', '#F59E0B', '#EF4444']

export default function DashboardPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResults')
    if (stored) {
      try { setResults(JSON.parse(stored)) } catch {}
    }
  }, [])

  // Empty state
  if (!results) {
    return (
      <div className="pt-20 pb-16 min-h-screen">
        <div className="container-app">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Analysis Data</h2>
            <p className="text-text-secondary mb-6 max-w-md">
              Run a profile analysis first to see your dashboard with skill charts, career insights, and match analytics.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Analyze Your Profile <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const skillCategories = [
    { subject: 'Technical', A: results.skills.technical_skills.length * 8, fullMark: 100 },
    { subject: 'Frameworks', A: results.skills.frameworks.length * 12, fullMark: 100 },
    { subject: 'Languages', A: results.skills.languages.length * 15, fullMark: 100 },
    { subject: 'Soft Skills', A: results.skills.soft_skills.length * 18, fullMark: 100 },
    { subject: 'Tools', A: (results.skills.frameworks.length + results.skills.technical_skills.length) * 5, fullMark: 100 },
  ].map(d => ({ ...d, A: Math.min(d.A, 100) }))

  const categoryData = results.top_categories.map((cat, i) => ({
    name: cat.length > 15 ? cat.slice(0, 15) + '...' : cat,
    jobs: results.jobs.filter(j => j.category === cat).length,
    color: COLORS[i % COLORS.length],
  }))

  const matchDistribution = [
    { name: '80-100%', value: results.jobs.filter(j => j.match_percentage >= 80).length, color: '#22C55E' },
    { name: '60-80%', value: results.jobs.filter(j => j.match_percentage >= 60 && j.match_percentage < 80).length, color: '#14B8A6' },
    { name: '40-60%', value: results.jobs.filter(j => j.match_percentage >= 40 && j.match_percentage < 60).length, color: '#F59E0B' },
    { name: '<40%', value: results.jobs.filter(j => j.match_percentage < 40).length, color: '#EF4444' },
  ].filter(d => d.value > 0)

  return (
    <div className="pt-20 pb-16">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Career <span className="gradient-text">Dashboard</span></h1>
          <p className="text-text-secondary">Your personalized career analytics and insights</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Briefcase, label: 'Jobs Matched', value: results.jobs.length, color: '#14B8A6' },
            { icon: Target, label: 'Avg Match', value: `${results.avg_match_score.toFixed(0)}%`, color: '#22C55E' },
            { icon: Award, label: 'Skills Found', value: results.skills.technical_skills.length + results.skills.frameworks.length, color: '#3B82F6' },
            { icon: TrendingUp, label: 'Categories', value: results.top_categories.length, color: '#0EA5E9' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} className="glass-card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-xs text-text-muted mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skill Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" /> Skill Radar
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillCategories}>
                  <PolarGrid stroke="rgba(148,163,184,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar name="Skills" dataKey="A" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Match Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Match Distribution
            </h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={matchDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100} paddingAngle={4} strokeWidth={0}>
                    {matchDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', color: '#F8FAFC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {matchDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </motion.div>

          {/* Jobs by Category */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Jobs by Category
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94A3B8', fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '8px', color: '#F8FAFC' }} />
                  <Bar dataKey="jobs" radius={[0, 6, 6, 0]}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Career Insights */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }} className="glass-card p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Career Insights
            </h3>
            <div className="space-y-4">
              {results.career_insights.map((ci, i) => (
                <div key={i} className="p-4 rounded-xl bg-bg-primary/50 border border-border">
                  <div className="font-semibold text-text-primary mb-1">{ci.title}</div>
                  <p className="text-sm text-text-secondary leading-relaxed">{ci.description}</p>
                </div>
              ))}
            </div>
            {results.learning_paths?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-warning" /> Recommended Learning Paths
                </h4>
                <div className="space-y-2">
                  {results.learning_paths.slice(0, 4).map((lp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-primary/30">
                      <div className={`w-2 h-2 rounded-full ${lp.priority === 'high' ? 'bg-danger' : 'bg-warning'}`} />
                      <div className="flex-1"><span className="text-sm font-medium text-text-primary">{lp.skill}</span></div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${lp.priority === 'high' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{lp.priority}</span>
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
