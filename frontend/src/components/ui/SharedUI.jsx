import { motion } from 'framer-motion'

export function MatchRing({ percentage, size = 72, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  
  const getColor = (pct) => {
    if (pct >= 80) return { start: '#000000', end: '#333333' }
    if (pct >= 60) return { start: '#333333', end: '#666666' }
    if (pct >= 40) return { start: '#666666', end: '#999999' }
    return { start: '#999999', end: '#CCCCCC' }
  }
  
  const colors = getColor(percentage)
  const gradientId = `ring-gradient-${percentage}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <div className="match-ring relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold font-mono" style={{ color: colors.start }}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

export function AnimatedCounter({ value, suffix = '', duration = 2 }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono tabular-nums"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  )
}

export function GlowBadge({ children, color = 'cyan', className = '' }) {
  const colorMap = {
    cyan: 'bg-cyber-cyan/[0.06] border-cyber-cyan/15 text-cyber-cyan',
    purple: 'bg-neon-purple/[0.06] border-neon-purple/15 text-neon-purple',
    green: 'bg-neon-green/[0.06] border-neon-green/15 text-neon-green',
    amber: 'bg-neon-amber/[0.06] border-neon-amber/15 text-neon-amber',
    red: 'bg-neon-red/[0.06] border-neon-red/15 text-neon-red',
    blue: 'bg-neon-blue/[0.06] border-neon-blue/15 text-neon-blue',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium tracking-wide ${colorMap[color] || colorMap.cyan} ${className}`}>
      {children}
    </span>
  )
}

export function AILoadingAnimation({ text = 'AI is analyzing...' }) {
  const steps = [
    'Generating semantic embeddings...',
    'Scanning job intelligence database...',
    'Computing neural similarity vectors...',
    'Ranking optimal career matches...',
    'Building personalized insights...',
  ]
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      <div className="relative w-32 h-32">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border border-cyber-cyan/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border border-neon-purple/15"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-6 rounded-full border border-cyber-cyan/20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyber-cyan">
              <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.5V20h6v-2.5c2.9-1.2 5-4.1 5-7.5a8 8 0 0 0-8-8z" />
              <path d="M10 20v2h4v-2" />
              <path d="M9 10h.01M15 10h.01" />
            </svg>
          </motion.div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
        </motion.div>
      </div>

      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-text-white">{text}</h2>
        <div className="h-5">
          {steps.map((step, i) => (
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
              transition={{ 
                duration: 2,
                delay: i * 2,
                repeat: Infinity,
                repeatDelay: steps.length * 2 - 2,
              }}
              className="text-sm text-text-mid absolute left-0 right-0"
              style={{ position: i === 0 ? 'relative' : 'absolute' }}
            >
              {step}
            </motion.p>
          ))}
        </div>
      </div>

      <div className="w-64 h-1 rounded-full overflow-hidden bg-white/[0.03]">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1/2 h-full rounded-full bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
        />
      </div>
    </div>
  )
}

export function SectionHeader({ badge, badgeIcon: BadgeIcon, title, titleHighlight, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-14"
    >
      {badge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-cyan/[0.06] border border-cyber-cyan/10 text-cyber-cyan text-xs font-medium tracking-wider uppercase mb-5">
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
          {badge}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-white mb-4 leading-tight">
        {title}{' '}
        {titleHighlight && <span className="gradient-text">{titleHighlight}</span>}
      </h2>
      {description && (
        <p className="text-text-mid max-w-xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  )
}
