import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark, ExternalLink, Trash2, Building2, MapPin,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, DollarSign
} from 'lucide-react'
import { getSavedJobs, deleteSavedJob } from '../services/api.js'
import { GlowBadge, MatchRing } from '../components/ui/SharedUI.jsx'
import { formatSalary } from '../lib/utils.js'

function SavedJobCard({ job, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const salary = formatSalary(job.salary_min, job.salary_max)

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className={`glass-card p-5 transition-all duration-300 relative group cursor-pointer ${
        expanded ? 'md:col-span-2' : ''
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            <MatchRing percentage={job.match_percentage || 0} size={52} strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-bold text-text-white text-base group-hover:text-cyber-cyan transition-colors">{job.title}</h3>
              {job.category && (
                <GlowBadge color="purple" className="py-0.5 px-2.5 text-[10px]">
                  {job.category}
                </GlowBadge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-text-dim/80" />{job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-text-dim/80" />{job.location}</span>
              {salary && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-text-dim/80" />{salary}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onRemove(job.job_id)}
            className="p-2 text-text-dim hover:text-neon-red hover:bg-white/[0.03] rounded-xl transition-all"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-1 text-text-dim flex items-center justify-center">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mt-4 pt-4 border-t border-white/[0.04] space-y-4"
          >
            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-text-light uppercase tracking-wider">Job Description</h4>
              <p className="text-sm text-text-mid leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Skills Details */}
            <div className="grid md:grid-cols-2 gap-4 pt-1">
              {job.matched_skills?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neon-green font-semibold mb-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.matched_skills.map(s => (
                      <span key={s} className="skill-chip skill-chip-matched text-[11px] py-1 px-2.5">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {job.missing_skills?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neon-purple font-semibold mb-2 uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5" /> Skills to Learn
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.missing_skills.map(s => (
                      <span key={s} className="skill-chip skill-chip-missing text-[11px] py-1 px-2.5">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* URL/Link */}
            {job.url && (
              <div className="pt-3 flex items-center justify-end" onClick={e => e.stopPropagation()}>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !py-2 !px-5 text-xs flex items-center gap-2"
                >
                  View Original Listing <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSavedJobs().then(data => setJobs(data)).finally(() => setLoading(false))
  }, [])

  const handleRemove = async (jobId) => {
    try {
      await deleteSavedJob(jobId)
      setJobs(jobs.filter(j => j.job_id !== jobId))
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container-app">
        <h1 className="text-3xl font-bold mb-8 text-text-white flex items-center gap-3">
          <Bookmark className="w-8 h-8 text-cyber-cyan" /> Saved Opportunities
        </h1>
        {jobs.length === 0 ? (
          <div className="glass-card p-12 text-center text-text-mid">No saved jobs yet.</div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {jobs.map((job) => (
                <SavedJobCard key={job.job_id} job={job} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
