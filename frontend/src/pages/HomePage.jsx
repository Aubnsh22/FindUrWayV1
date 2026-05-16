import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sparkles, ArrowRight, Brain, TrendingUp, Users, Briefcase,
  Zap, Target, BookOpen, ChevronRight, MapPin,
  Cpu, BarChart3, Database, Code2, Layers, Globe, Compass
} from 'lucide-react'
import { analyzeProfile, getTrendingSkills, searchJobs } from '../services/api.js'
import { formatSalary, timeAgo } from '../lib/utils.js'

// ─── Animated Background ────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(20,184,166,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

// ─── Stats Counter ──────────────────────────────────────────
function StatsCounter() {
  const stats = [
    { icon: Briefcase, value: '2,500+', label: 'Jobs Analyzed', color: '#14B8A6' },
    { icon: Users, value: '850+', label: 'Profiles Matched', color: '#3B82F6' },
    { icon: TrendingUp, value: '94%', label: 'Match Accuracy', color: '#22C55E' },
    { icon: MapPin, value: 'Morocco', label: 'Market Focus', color: '#8B5CF6' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          viewport={{ once: true }}
          className="glass-card p-5 text-center group"
        >
          <div
            className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: `${stat.color}15` }}
          >
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
          <div className="text-xs text-text-muted mt-1">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Trending Skills ────────────────────────────────────────
function TrendingSkills({ skills, loading }) {
  const iconMap = {
    Python: Code2,
    SQL: Database,
    'Machine Learning': Brain,
    'Power BI': BarChart3,
    Docker: Layers,
    React: Globe,
    TensorFlow: Cpu,
    AWS: Zap,
    Sparkles: Sparkles,
  }

  const list = skills?.length
    ? skills
    : [
        { name: 'Python', growth: 15.2 },
        { name: 'Machine Learning', growth: 28.5 },
        { name: 'Power BI', growth: 32.1 },
        { name: 'SQL', growth: 5.8 },
        { name: 'Docker', growth: 22.4 },
        { name: 'React', growth: 12.7 },
        { name: 'TensorFlow', growth: 18.9 },
        { name: 'AWS', growth: 25.3 },
      ]

  return (
    <section className="py-20">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Trending in Morocco
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Most Demanded Skills
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Skills driving the Moroccan tech job market right now
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="skeleton h-8 w-8 rounded-lg mb-4" />
                  <div className="skeleton h-4 w-20 mb-2" />
                  <div className="skeleton h-3 w-12" />
                </div>
              ))
            : list.map((skill, i) => {
                const Icon = iconMap[skill.name] || Sparkles
                return (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="glass-card p-5 cursor-default group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-[18px] h-[18px] text-primary" />
                </div>
                <span className="text-xs font-semibold text-success">+{Number(skill.growth).toFixed(0)}%</span>
              </div>
              <div className="text-sm font-semibold text-text-primary">{skill.name}</div>
            </motion.div>
                )
              })}
        </div>
      </div>
    </section>
  )
}

// ─── Categories Section ─────────────────────────────────────
function CategoriesSection() {
  const categories = [
    { name: 'Data Science', icon: Brain, count: 85, color: '#14B8A6' },
    { name: 'AI / Machine Learning', icon: Cpu, count: 62, color: '#0EA5E9' },
    { name: 'Data Analytics', icon: BarChart3, count: 104, color: '#3B82F6' },
    { name: 'Business Intelligence', icon: TrendingUp, count: 78, color: '#F59E0B' },
    { name: 'Software Engineering', icon: Code2, count: 156, color: '#22C55E' },
    { name: 'Data Engineering', icon: Database, count: 54, color: '#EF4444' },
  ]

  return (
    <section className="py-20">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Explore Career Paths
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Find opportunities across Morocco's growing tech sectors
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="glass-card p-6 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${cat.color}15` }}
                  >
                    <cat.icon className="w-[22px] h-[22px]" style={{ color: cat.color }} />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">{cat.name}</h3>
                  <p className="text-sm text-text-muted">{cat.count} open positions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AI Insights Section ───────────────────────────────────
function AIInsightsSection() {
  const insights = [
    {
      title: 'Role Fit Signal',
      metric: '89%',
      desc: 'Strong alignment with Data Scientist roles across Casablanca and Rabat.',
      icon: Target,
      color: '#14B8A6',
    },
    {
      title: 'Skill Coverage',
      metric: '12/15',
      desc: 'You already match the core stack for top AI/ML listings.',
      icon: Brain,
      color: '#0EA5E9',
    },
    {
      title: 'Market Momentum',
      metric: '+22%',
      desc: 'Demand for your profile is trending up this quarter in Morocco.',
      icon: TrendingUp,
      color: '#22C55E',
    },
  ]

  const gaps = [
    { skill: 'MLOps', percent: 72, label: 'High impact' },
    { skill: 'Data Pipelines', percent: 58, label: 'Good leverage' },
    { skill: 'Cloud (AWS/GCP)', percent: 45, label: 'Nice to have' },
  ]

  return (
    <section className="py-20">
      <div className="container-app">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI Career Insights
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Understand Your Career DNA
            </h2>
            <p className="text-text-secondary max-w-xl mb-8">
              Our AI engine breaks down your profile into actionable signals—role fit, skill coverage, and market momentum—so you can focus on the most promising opportunities.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="glass-card p-5"
                >
                  <div
                    className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center"
                    style={{ background: `${insight.color}15` }}
                  >
                    <insight.icon className="w-5 h-5" style={{ color: insight.color }} />
                  </div>
                  <div className="text-2xl font-bold text-text-primary mb-1">{insight.metric}</div>
                  <div className="text-sm font-semibold text-text-primary mb-1">{insight.title}</div>
                  <p className="text-xs text-text-muted leading-relaxed">{insight.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-text-primary">Skill Gap Signals</h3>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              We highlight the skills that unlock higher match percentages and better salary ranges.
            </p>
            <div className="space-y-4">
              {gaps.map((gap) => (
                <div key={gap.skill} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-text-primary">{gap.skill}</span>
                    <span className="text-xs text-text-muted">{gap.label}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${gap.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary w-full mt-6" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Improve My Match
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Quick Skills Chips ─────────────────────────────────────
const quickSkills = [
  'Python, Machine Learning, TensorFlow',
  'SQL, Power BI, Data Analysis',
  'React, Node.js, JavaScript',
  'NLP, Deep Learning, PyTorch',
  'AWS, Docker, DevOps',
]

// ─── Main HomePage Component ────────────────────────────────
export default function HomePage() {
  const [profileText, setProfileText] = useState('')
  const [loading, setLoading] = useState(false)
  const [trendingSkills, setTrendingSkills] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [recentJobs, setRecentJobs] = useState([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const navigate = useNavigate()
  const textareaRef = useRef(null)

  useEffect(() => {
    let active = true

    const loadTrending = async () => {
      try {
        const data = await getTrendingSkills()
        if (active) setTrendingSkills(data)
      } catch (error) {
        console.error('Failed to load trending skills:', error)
      } finally {
        if (active) setTrendingLoading(false)
      }
    }

    const loadRecent = async () => {
      try {
        const data = await searchJobs('data science', 1, 6)
        if (active) setRecentJobs(data.jobs || [])
      } catch (error) {
        console.error('Failed to load recent jobs:', error)
      } finally {
        if (active) setJobsLoading(false)
      }
    }

    loadTrending()
    loadRecent()

    return () => {
      active = false
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
      // Store results in sessionStorage for the results page
      sessionStorage.setItem('analysisResults', JSON.stringify(results))
      sessionStorage.setItem('profileText', profileText)
      navigate('/results')
      toast.success('Analysis complete! Here are your matches.')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFill = (text) => {
    setProfileText(prev =>
      prev ? `${prev}\nSkills: ${text}` : `I am a professional with experience in ${text}. I have worked on various projects involving these technologies and I'm looking for opportunities in Morocco.`
    )
    textareaRef.current?.focus()
  }

  const scrollToInput = () => {
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16">
        <AnimatedBackground />

        <div className="container-app relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Intelligence
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6"
            >
              Find Your Perfect
              <br />
              <span className="gradient-text">Career Path</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Describe your skills and experience. Our AI engine analyzes your profile
              using NLP semantic matching to find the most relevant tech opportunities in Morocco.
            </motion.p>

            {/* ── Profile Input Card ──────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="glass-card p-6 md:p-8 text-left max-w-3xl mx-auto"
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-text-primary">Your Profile</span>
                <span className="text-xs text-text-muted ml-auto">
                  {profileText.length} / 5000
                </span>
              </div>

              <textarea
                id="profile-input"
                ref={textareaRef}
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder="Tell us about yourself...&#10;&#10;Example: I'm a Data Science graduate with 2 years of experience in Python, Machine Learning, and SQL. I've built predictive models using scikit-learn and TensorFlow, created dashboards in Power BI, and worked with PostgreSQL databases. I'm interested in AI/ML roles in Casablanca or Rabat..."
                className="profile-textarea"
                maxLength={5000}
              />

              {/* Quick fill chips */}
              <div className="flex flex-wrap gap-2 mt-4 mb-5">
                <span className="text-xs text-text-muted">Quick add:</span>
                {quickSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleQuickFill(skill)}
                    className="skill-tag cursor-pointer hover:scale-105 transition-transform text-xs"
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || profileText.trim().length < 20}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze My Profile
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────── */}
      <section className="py-16 relative z-10">
        <div className="container-app">
          <StatsCounter />
        </div>
      </section>

      {/* ── Trending Skills ─────────────────────────────── */}
      <TrendingSkills skills={trendingSkills} loading={trendingLoading} />

      {/* ── Categories ──────────────────────────────────── */}
      <CategoriesSection />

      {/* ── AI Insights ────────────────────────────────── */}
      <AIInsightsSection />

      {/* ── Recent Opportunities ────────────────────────── */}
      <section className="py-20">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                <Briefcase className="w-4 h-4" />
                Recent Opportunities
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
                Fresh Roles in Morocco
              </h2>
              <p className="text-text-secondary max-w-xl">
                Curated job listings updated daily from trusted sources and Adzuna.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-secondary" onClick={scrollToInput}>View All Roles</button>
              <button className="btn-primary" onClick={scrollToInput}>Start Matching</button>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobsLoading
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card p-6">
                    <div className="skeleton h-5 w-3/4 mb-3" />
                    <div className="skeleton h-4 w-1/2 mb-2" />
                    <div className="skeleton h-4 w-full mb-2" />
                    <div className="skeleton h-4 w-2/3" />
                  </div>
                ))
              : recentJobs.slice(0, 6).map((job, i) => {
                  const salary = formatSalary(job.salary_min, job.salary_max)
                  return (
                    <motion.div
                      key={job.job_id || `${job.title}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      viewport={{ once: true }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {job.category || 'Tech'}
                        </span>
                        <span className="text-xs text-text-muted">{timeAgo(job.created)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-text-primary mb-2">
                        {job.title}
                      </h3>
                      <div className="text-sm text-text-secondary mb-3">
                        {job.company} · {job.location || 'Morocco'}
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed line-clamp-3 mb-4">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-text-muted">
                        <span>{salary || 'Salary negotiable'}</span>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-light font-medium"
                          >
                            Apply
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
              How It Works
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Three simple steps to your ideal career match
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                icon: BookOpen,
                title: 'Describe Yourself',
                desc: 'Share your skills, projects, experience, and career interests in our smart input.',
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI Analysis',
                desc: 'Our NLP engine generates semantic embeddings and matches your profile to real job listings.',
              },
              {
                step: '03',
                icon: Target,
                title: 'Get Matched',
                desc: 'Receive ranked job recommendations with match scores, missing skills, and learning paths.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="glass-card p-8 text-center relative group"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-bg-primary px-3 py-1 rounded-full border border-primary/20">
                  Step {item.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="py-12 border-t border-border">
        <div className="container-app text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-primary" />
            <span className="text-sm font-bold">FindUrWay</span>
          </div>
          <p className="text-xs text-text-muted">
            AI-Powered Career Intelligence Platform · Morocco-Focused Opportunities
          </p>
          <p className="text-xs text-text-muted mt-1">
            Built with FastAPI, Sentence Transformers & React
          </p>
        </div>
      </footer>
    </div>
  )
}
