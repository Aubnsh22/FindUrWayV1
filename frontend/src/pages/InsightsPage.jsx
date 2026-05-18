import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, TrendingUp, MapPin, Briefcase, Zap, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts'
import { getMarketInsights } from '../services/api.js'

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMarketInsights().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="pt-24 flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const hotspotData = data.hiring_hotspots.map((h, i) => ({
    name: h.city,
    jobs: h.job_count,
    salary: h.avg_salary_mad,
    color: ['#000000', '#111111', '#1A1A1A', '#333333', '#666666'][i % 5]
  }))

  return (
    <div className="pt-20 pb-16">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-text-white">Market <span className="italic font-serif text-cyber-cyan">Intelligence</span></h1>
          <p className="text-text-mid text-sm">Real-time analysis of the Moroccan technology sector</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-cyan" /> Tech Skill Demand Index
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { month: 'Q1', ai: 40, web: 70, cloud: 30 },
                  { month: 'Q2', ai: 55, web: 65, cloud: 45 },
                  { month: 'Q3', ai: 75, web: 60, cloud: 65 },
                  { month: 'Q4 (Proj)', ai: 95, web: 55, cloud: 80 },
                ]}>
                  <defs>
                    <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#000000" stopOpacity={0.15}/><stop offset="95%" stopColor="#000000" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/><stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/></linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#768278" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#768278" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(255, 255, 255, 0.96)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#000000', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }} />
                  <Area type="monotone" dataKey="ai" stroke="#000000" fillOpacity={1} fill="url(#colorAi)" strokeWidth={2} />
                  <Area type="monotone" dataKey="cloud" stroke="#1A1A1A" fillOpacity={1} fill="url(#colorCloud)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center text-xs text-text-mid">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#000000]" /> AI / ML</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#1A1A1A]" /> Cloud / DevOps</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-base font-bold text-text-white mb-5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyber-cyan" /> Hiring Hotspots
            </h3>
            <div className="space-y-4">
              {hotspotData.map((spot, i) => (
                <div key={spot.name}>
                  <div className="flex justify-between text-sm text-text-white mb-1.5">
                    <span>{spot.name}</span>
                    <span className="font-mono text-xs">{spot.jobs} positions</span>
                  </div>
                  <div className="h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(spot.jobs / 450) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }} className="h-full rounded-full" style={{ background: spot.color }} />
                  </div>
                  <div className="text-[10px] text-text-dim mt-1">Avg Salary: ~{spot.salary.toLocaleString()} MAD</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
