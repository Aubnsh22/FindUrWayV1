import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sparkles, Bookmark, BookmarkCheck, ExternalLink, MapPin,
  Building2, Calendar, TrendingUp, AlertCircle,
  Filter, Search, ArrowLeft, Brain, Target, Briefcase,
  CheckCircle2, DollarSign
} from 'lucide-react'
import { getSavedJobs, saveJob } from '../services/api.js'
import { getMatchColor, getMatchBgColor, formatSalary, timeAgo } from '../lib/utils.js'

function MatchBadge({ percentage }) {
  const color = getMatchColor(percentage)
  const bgColor = getMatchBgColor(percentage)
  const dotColor = color === 'match-excellent' ? 'bg-success' : color === 'match-good' ? 'bg-primary' : color === 'match-moderate' ? 'bg-warning' : 'bg-danger'
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold ${bgColor}`}>
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span className={color}>{percentage.toFixed(0)}%</span>
    </div>
  )
}

function JobCard({ job, index, onSave, savedIds }) {
  const isSaved = savedIds.has(job.job_id)
  const salary = formatSalary(job.salary_min, job.salary_max)

  const handleSave = async () => {
    if (isSaved) return
    try {
      await saveJob({
        job_id: job.job_id, title: job.title, company: job.company,
        location: job.location, description: job.description,
        salary_min: job.salary_min, salary_max: job.salary_max,
        category: job.category, url: job.url,
        match_percentage: job.match_percentage,
        matched_skills: job.matched_skills, missing_skills: job.missing_skills,
      })
      onSave(job.job_id)
      toast.success(`Saved "${job.title}"`)
    } catch { toast.error('Failed to save job') }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} className="glass-card p-6 group">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <MatchBadge percentage={job.match_percentage} />
            {job.category && <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 text-text-muted border border-border">{job.category}</span>}
          </div>
          <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">{job.title}</h3>
        </div>
        <button onClick={handleSave} className={`p-2 rounded-lg transition-all ${isSaved ? 'bg-primary/10 text-primary' : 'hover:bg-white/5 text-text-muted hover:text-primary'}`}>
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
        <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-text-muted" />{job.company}</span>
        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-text-muted" />{job.location}</span>
        {salary && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-text-muted" />{salary}</span>}
        {job.created && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-muted" />{timeAgo(job.created)}</span>}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-3">{job.description}</p>
      <div className="space-y-3">
        {job.matched_skills?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-success font-medium mb-2"><CheckCircle2 className="w-3.5 h-3.5" />Matched Skills</div>
            <div className="flex flex-wrap gap-1.5">{job.matched_skills.map(s => <span key={s} className="skill-tag text-xs">{s}</span>)}</div>
          </div>
        )}
        {job.missing_skills?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs text-warning font-medium mb-2"><AlertCircle className="w-3.5 h-3.5" />Skills to Learn</div>
            <div className="flex flex-wrap gap-1.5">{job.missing_skills.map(s => <span key={s} className="skill-tag skill-tag-missing text-xs">{s}</span>)}</div>
          </div>
        )}
      </div>
      {job.url && (
        <div className="mt-5 pt-4 border-t border-border">
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors font-medium">
            View Full Listing <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </motion.div>
  )
}

function AnalysisAnimation() {
  const steps = ['Generating semantic embeddings...','Searching job databases...','Computing cosine similarity...','Ranking best matches...']
  const [step, setStep] = useState(0)
  useEffect(() => { const i = setInterval(() => setStep(p => (p+1) % steps.length), 1500); return () => clearInterval(i) }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary flex items-center justify-center">
        <Brain className="w-8 h-8 text-primary" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">AI Analysis in Progress</h2>
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-text-secondary">{steps[step]}</motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState(new Set())
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('match')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 6

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResults')
    if (stored) {
      try { setTimeout(() => { setResults(JSON.parse(stored)); setLoading(false) }, 2000) }
      catch { navigate('/') }
    } else { navigate('/') }
  }, [navigate])

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const data = await getSavedJobs()
        setSavedIds(new Set(data.map(j => j.job_id)))
      } catch (error) {
        console.warn('Failed to load saved jobs:', error)
      }
    }
    loadSaved()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filterCategory, sortBy, searchQuery])

  if (loading) return <div className="pt-16"><AnalysisAnimation /></div>
  if (!results) return null

  let filteredJobs = results.jobs || []
  if (filterCategory !== 'all') filteredJobs = filteredJobs.filter(j => j.category === filterCategory)
  if (searchQuery) { const q = searchQuery.toLowerCase(); filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) }
  if (sortBy === 'match') filteredJobs.sort((a, b) => b.match_percentage - a.match_percentage)
  else if (sortBy === 'salary') filteredJobs.sort((a, b) => (b.salary_max||0) - (a.salary_max||0))
  const categories = [...new Set(results.jobs.map(j => j.category).filter(Boolean))]
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
  const pagedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="pt-20 pb-16">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />New Analysis
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Your <span className="gradient-text">Career Matches</span></h1>
              <p className="text-text-secondary">{results.total_jobs_analyzed} jobs analyzed · {results.jobs.length} matches · <span className="text-primary font-medium">{results.avg_match_score.toFixed(0)}% avg</span></p>
            </div>
            <div className="flex gap-3">
              <div className="glass-card px-4 py-2.5 text-center"><div className="text-xl font-bold text-primary">{results.jobs.length}</div><div className="text-xs text-text-muted">Matches</div></div>
              <div className="glass-card px-4 py-2.5 text-center"><div className="text-xl font-bold text-success">{results.skills.technical_skills.length}</div><div className="text-xs text-text-muted">Skills</div></div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-primary border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3"><Filter className="w-4 h-4 text-primary" />Filters</div>
              <label className="text-xs text-text-muted">Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary mt-1">
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="text-xs text-text-muted mt-3 block">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary mt-1">
                <option value="match">Match %</option><option value="salary">Salary</option>
              </select>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3"><CheckCircle2 className="w-4 h-4 text-success" />Your Skills</div>
              <div className="flex flex-wrap gap-1.5">{results.skills.technical_skills.slice(0,12).map(s => <span key={s} className="skill-tag text-xs">{s}</span>)}</div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3"><Sparkles className="w-4 h-4 text-primary" />Insights</div>
              <div className="space-y-3">{results.career_insights.map((ci, i) => (
                <div key={i} className="text-sm"><div className="font-medium text-text-primary mb-0.5">{ci.title}</div><p className="text-xs text-text-secondary">{ci.description}</p></div>
              ))}</div>
            </div>
            {results.learning_paths?.length > 0 && (
              <div className="glass-card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3"><TrendingUp className="w-4 h-4 text-warning" />Learn Next</div>
                <div className="space-y-2.5">{results.learning_paths.slice(0,5).map((lp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${lp.priority==='high'?'bg-danger':'bg-warning'}`} />
                    <div><div className="text-xs font-medium text-text-primary">{lp.skill}</div><div className="text-xs text-text-muted">{lp.reason}</div></div>
                  </div>
                ))}</div>
              </div>
            )}
          </motion.aside>
          <div className="space-y-4">
            {pagedJobs.length > 0 ? pagedJobs.map((job, i) => (
              <JobCard key={job.job_id} job={job} index={i} onSave={() => setSavedIds(p => new Set([...p, job.job_id]))} savedIds={savedIds} />
            )) : (
              <div className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">No Matches Found</h3>
                <p className="text-sm text-text-secondary">Try adjusting your filters.</p>
              </div>
            )}
            {filteredJobs.length > pageSize && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <div className="text-sm text-text-secondary">
                  Page <span className="text-text-primary font-medium">{page}</span> of {totalPages}
                </div>
                <button
                  className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
