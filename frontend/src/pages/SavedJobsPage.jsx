import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Bookmark, Trash2, ExternalLink, MapPin, Building2,
  DollarSign, Briefcase, ArrowRight, Sparkles
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSavedJobs, deleteSavedJob } from '../services/api.js'
import { getMatchColor, getMatchBgColor, formatSalary } from '../lib/utils.js'

export default function SavedJobsPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await getSavedJobs()
      setJobs(data)
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err)
      toast.error('Could not load saved jobs. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId) => {
    try {
      await deleteSavedJob(jobId)
      setJobs(prev => prev.filter(j => j.job_id !== jobId))
      toast.success('Job removed from saved')
    } catch {
      toast.error('Failed to remove job')
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="pt-20 pb-16 min-h-screen">
        <div className="container-app">
          <h1 className="text-3xl font-bold mb-8">Saved <span className="gradient-text">Jobs</span></h1>
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-6">
                <div className="skeleton h-6 w-3/4 mb-4" />
                <div className="skeleton h-4 w-1/2 mb-3" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="pt-20 pb-16 min-h-screen">
        <div className="container-app">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Bookmark className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Saved Jobs</h2>
            <p className="text-text-secondary mb-6 max-w-md">
              Run a profile analysis and save jobs you're interested in. They'll appear here for easy access.
            </p>
            <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Find Your Jobs <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Saved <span className="gradient-text">Jobs</span>
          </h1>
          <p className="text-text-secondary">{jobs.length} job{jobs.length !== 1 ? 's' : ''} saved</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {jobs.map((job, i) => {
              const color = getMatchColor(job.match_percentage)
              const bgColor = getMatchBgColor(job.match_percentage)
              const salary = formatSalary(job.salary_min, job.salary_max)

              return (
                <motion.div
                  key={job.job_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold ${bgColor} mb-2`}>
                        <span className={color}>{job.match_percentage.toFixed(0)}% match</span>
                      </div>
                      <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary mb-3">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    {salary && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{salary}</span>}
                  </div>

                  {job.matched_skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.matched_skills.slice(0, 5).map(s => (
                        <span key={s} className="skill-tag text-xs">{s}</span>
                      ))}
                    </div>
                  )}

                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light transition-colors font-medium">
                      Apply <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
