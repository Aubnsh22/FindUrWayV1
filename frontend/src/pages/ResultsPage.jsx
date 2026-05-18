import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Sparkles, Bookmark, BookmarkCheck, ExternalLink, MapPin,
  Building2, Calendar, TrendingUp, AlertCircle, ChevronDown, ChevronUp,
  Filter, Search, ArrowLeft, Brain, Target, Briefcase,
  CheckCircle2, DollarSign, Info, BarChart3, Compass, Code2,
} from 'lucide-react'
import { getSavedJobs, saveJob } from '../services/api.js'
import { formatSalary, timeAgo } from '../lib/utils.js'
import { AILoadingAnimation } from '../components/ui/SharedUI.jsx'

function MatchExplanation({ explanation }) {
  const [open, setOpen] = useState(false)
  if (!explanation) return null
  const tier = explanation.skill_tier_breakdown || {}
  const coreMatched = tier.domain_relevant_matched || []

  return (
    <div className="mt-3 pt-3 border-t border-black/[0.04]">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-[#111111] hover:text-[#111111]/70 transition-colors w-full">
        <Info className="w-3.5 h-3.5" />
        Why this matches you
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-xs text-[#4A544C] mt-2 leading-relaxed">{explanation.summary}</p>
            <p className="text-xs text-[#768278] mt-1.5 italic">{explanation.compatibility}</p>
            {coreMatched.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {coreMatched.map(s => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[#000000]/[0.05] text-[#000000] border border-[#000000]/10">{s}</span>)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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

  const pct = job.match_percentage
  const pctLabel = pct >= 70 ? 'Strong' : pct >= 50 ? 'Good' : pct >= 30 ? 'Moderate' : 'Low'
  const isMorocco = /morocco|maroc|casablanca|rabat|temara|kenitra|tanger|fes|marrakech|agadir/i.test(job.location)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
      className="bg-white/80 rounded-2xl border border-black/[0.04] p-5 transition-all duration-300 hover:border-[#000000]/15 hover:shadow-[0_8px_30px_rgba(0, 0, 0,0.04)]">
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex flex-shrink-0 w-14 h-14 rounded-xl bg-[#111111]/[0.06] border border-[#111111]/15 items-center justify-center flex-col">
          <span className="text-lg font-bold font-mono text-[#111111] leading-none">{pct.toFixed(0)}</span>
          <span className="text-[9px] text-[#768278] font-medium tracking-wider uppercase leading-none mt-0.5">{pctLabel}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="sm:hidden text-xs font-bold font-mono text-[#111111] bg-[#111111]/[0.06] px-2 py-0.5 rounded-md">{pct.toFixed(0)}%</span>
              {job.category && (
                <span className="text-[10px] font-medium text-[#333333] bg-[#333333]/[0.06] px-2 py-0.5 rounded-md border border-[#333333]/10">{job.category}</span>
              )}
              {isMorocco && (
                <span className="text-[10px] font-medium text-[#000000] bg-[#000000]/[0.06] px-2 py-0.5 rounded-md border border-[#000000]/10 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Morocco
                </span>
              )}
            </div>
            <button onClick={handleSave}
              className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${isSaved ? 'bg-[#111111]/10 text-[#111111]' : 'hover:bg-black/[0.02] text-[#768278] hover:text-[#111111]'}`}>
              {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <h3 className="text-base font-bold text-[#000000] mb-1.5 leading-snug">{job.title}</h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#4A544C] mb-3">
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-[#768278]" />{job.company}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#768278]" />{job.location}</span>
            {salary && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-[#768278]" />{salary}</span>}
            {job.created && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#768278]" />{timeAgo(job.created)}</span>}
          </div>

          <p className="text-[13px] text-[#4A544C] leading-relaxed line-clamp-2 mb-3">{job.description}</p>

          <div className="flex flex-wrap items-center gap-2">
            {job.matched_skills?.slice(0, 6).map(s => (
              <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#111111]/[0.05] border border-[#111111]/12 text-[#111111] font-medium">{s}</span>
            ))}
            {(job.missing_skills?.length || 0) > 0 && (
              <span className="text-[11px] text-[#768278] font-medium">+{job.missing_skills.length} gaps</span>
            )}
          </div>

          <MatchExplanation explanation={job.explanation} />

          {job.url && (
            <div className="mt-3 pt-3 border-t border-black/[0.04]">
              <a href={job.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#000000] hover:text-[#000000]/70 transition-colors">
                View Listing <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SkillGapBar({ label, matched, total }) {
  const pct = total > 0 ? (matched / total) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-[#4A544C]">{label}</span>
        <span className="text-[#768278] font-mono">{matched}/{total}</span>
      </div>
      <div className="h-1 bg-black/[0.04] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
          className="h-full rounded-full bg-[#000000]/30" />
      </div>
    </div>
  )
}

function ProfileHeader({ results }) {
  const firstExp = results.jobs?.[0]?.explanation
  const tier = firstExp?.skill_tier_breakdown || {}
  const userDomain = tier.user_domain || 'Tech Professional'
  const skillCount = results.skills?.technical_skills?.length || 0
  const topCat = results.top_categories?.[0] || 'Technology'

  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 border border-black/[0.04] rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-10 h-10 rounded-xl bg-[#000000]/[0.06] border border-[#000000]/10 flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-[#000000]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#000000] mb-1">AI Profile Understanding</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-[#4A544C]">
            <span><span className="text-[#768278]">Primary domain:</span> {userDomain}</span>
            <span><span className="text-[#768278]">Top category:</span> {topCat}</span>
            <span><span className="text-[#768278]">Skills detected:</span> {skillCount}</span>
            <span><span className="text-[#768278]">Jobs matched:</span> {results.jobs?.length || 0}/{results.total_jobs_analyzed || 0}</span>
          </div>
          <p className="text-[12px] text-[#768278] mt-1.5 leading-relaxed">
            Prioritised Software Engineering and Full Stack roles matching your stack.
            {results.jobs?.some(j => /morocco|maroc|casablanca|rabat/i.test(j.location))
              ? ' Moroccan positions promoted based on your location preferences.'
              : ''}
          </p>
        </div>
      </div>
    </motion.div>
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
  const [filterCity, setFilterCity] = useState('')
  const [minThreshold, setMinThreshold] = useState(0)
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
    getSavedJobs().then(data => setSavedIds(new Set(data.map(j => j.job_id)))).catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [filterCategory, sortBy, searchQuery])

  if (loading) return <div className="pt-16"><AILoadingAnimation text="Neural matching in progress..." /></div>
  if (!results) return null

  let filteredJobs = results.jobs || []
  if (filterCategory !== 'all') filteredJobs = filteredJobs.filter(j => j.category === filterCategory)
  if (searchQuery) { const q = searchQuery.toLowerCase(); filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)) }
  if (filterCity) { const c = filterCity.toLowerCase(); filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes(c)) }
  if (minThreshold > 0) filteredJobs = filteredJobs.filter(j => j.match_percentage >= minThreshold)
  if (sortBy === 'match') filteredJobs.sort((a, b) => b.match_percentage - a.match_percentage)
  else if (sortBy === 'salary') filteredJobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0))
  const categories = [...new Set(results.jobs.map(j => j.category).filter(Boolean))]
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize))
  const pagedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize)

  const allMatched = new Set(); const allMissing = new Set()
  results.jobs.forEach(j => { (j.matched_skills || []).forEach(s => allMatched.add(s)); (j.missing_skills || []).forEach(s => allMissing.add(s)) })

  return (
    <div className="pt-20 pb-16">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-[#768278] hover:text-[#000000] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />New Analysis
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1 text-[#000000]">Your <span className="text-[#000000]">Career Matches</span></h1>
              <p className="text-[#4A544C] text-sm">{results.total_jobs_analyzed} positions analyzed &middot; <span className="text-[#000000] font-mono font-semibold">{results.avg_match_score.toFixed(0)}%</span> average match</p>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Matches', value: results.jobs.length },
                { label: 'Skills', value: results.skills.technical_skills.length },
              ].map(s => (
                <div key={s.label} className="bg-white/70 border border-black/[0.04] rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <div className="text-xl font-bold font-mono text-[#000000]">{s.value}</div>
                  <div className="text-[10px] text-[#768278] uppercase tracking-wider font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <ProfileHeader results={results} />

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#768278]" />
                <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 border border-black/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1E1A] placeholder:text-[#768278] focus:outline-none focus:border-[#000000]/20 transition-colors" />
              </div>
            </div>
            <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] mb-3"><BarChart3 className="w-4 h-4 text-[#000000]" />Skill Coverage</div>
              <SkillGapBar label="Technical Skills" matched={allMatched.size} total={results.skills.technical_skills.length || 1} />
            </div>
            <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] mb-3"><Filter className="w-4 h-4 text-[#000000]" />Filters</div>
              <label className="text-[10px] text-[#768278] uppercase tracking-wider font-medium">City</label>
              <div className="relative mt-1 mb-3">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#768278]" />
                <input type="text" placeholder="Any city" value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1); }}
                  className="w-full bg-white/50 border border-black/[0.06] rounded-xl pl-9 pr-3 py-2 text-sm text-[#1A1E1A] placeholder:text-[#768278] focus:outline-none focus:border-[#000000]/20 transition-colors" />
              </div>
              <label className="text-[10px] text-[#768278] uppercase tracking-wider font-medium">Category</label>
              <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
                className="w-full bg-white/50 border border-black/[0.06] rounded-xl px-3 py-2 text-sm text-[#1A1E1A] focus:outline-none focus:border-[#000000]/20 mt-1 mb-3">
                <option value="all">All</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="text-[10px] text-[#768278] uppercase tracking-wider font-medium">Min Match</label>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <input type="range" min={0} max={90} step={5} value={minThreshold} onChange={e => { setMinThreshold(Number(e.target.value)); setPage(1); }}
                  className="flex-1 h-1 accent-[#000000] cursor-pointer" />
                <span className="text-[10px] font-mono text-[#768278] font-semibold w-8 text-right">{minThreshold}%</span>
              </div>
              <label className="text-[10px] text-[#768278] uppercase tracking-wider font-medium">Sort</label>
              <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
                className="w-full bg-white/50 border border-black/[0.06] rounded-xl px-3 py-2 text-sm text-[#1A1E1A] focus:outline-none focus:border-[#000000]/20 mt-1">
                <option value="match">Match %</option><option value="salary">Salary</option>
              </select>
            </div>
            <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] mb-3"><CheckCircle2 className="w-4 h-4 text-[#000000]" />Your Skills</div>
              <div className="flex flex-wrap gap-1.5">{results.skills.technical_skills.slice(0, 12).map(s => <span key={s} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#000000]/[0.04] border border-[#000000]/08 text-[#000000] font-medium">{s}</span>)}</div>
            </div>
            <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] mb-3"><Sparkles className="w-4 h-4 text-[#000000]" />AI Insights</div>
              <div className="space-y-3">{results.career_insights.map((ci, i) => (
                <div key={i} className="text-sm"><div className="font-medium text-[#000000] mb-0.5">{ci.title}</div><p className="text-[11px] text-[#768278] leading-relaxed">{ci.description}</p></div>
              ))}</div>
            </div>
            {results.learning_paths?.length > 0 && (
              <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#000000] mb-3"><TrendingUp className="w-4 h-4 text-[#000000]" />Learn Next</div>
                <div className="space-y-2.5">{results.learning_paths.slice(0, 5).map((lp, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${lp.priority === 'high' ? 'bg-[#000000]' : 'bg-[#768278]'}`} />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-[#000000]">{lp.skill}</div>
                      <div className="text-[11px] text-[#768278]">{lp.reason}</div>
                      {lp.impact_label && <div className="text-[11px] text-[#000000] mt-0.5 font-medium"><Sparkles className="w-3 h-3 inline mr-0.5" />{lp.impact_label}</div>}
                    </div>
                    {lp.impact_score && <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#000000]/[0.06] text-[#000000]">+{lp.impact_score}%</span>}
                  </div>
                ))}</div>
              </div>
            )}
          </motion.aside>

          <div className="space-y-4">
            {pagedJobs.length > 0 ? pagedJobs.map((job, i) => (
              <JobCard key={job.job_id} job={job} index={i} onSave={() => setSavedIds(p => new Set([...p, job.job_id]))} savedIds={savedIds} />
            )) : (
              <div className="bg-white/70 border border-black/[0.04] rounded-2xl p-12 text-center">
                <Briefcase className="w-12 h-12 text-[#768278] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#000000] mb-2">No Matches Found</h3>
                <p className="text-sm text-[#4A544C]">Try adjusting your filters.</p>
              </div>
            )}
            {filteredJobs.length > pageSize && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button className="px-5 py-2 rounded-xl text-sm font-semibold text-[#1A1E1A] bg-white/60 border border-black/[0.06] hover:bg-white/80 hover:border-black/[0.1] transition-all disabled:opacity-40 cursor-pointer" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                <span className="text-sm text-[#768278] font-mono">Page {page} / {totalPages}</span>
                <button className="px-5 py-2 rounded-xl text-sm font-semibold text-[#1A1E1A] bg-white/60 border border-black/[0.06] hover:bg-white/80 hover:border-black/[0.1] transition-all disabled:opacity-40 cursor-pointer" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
