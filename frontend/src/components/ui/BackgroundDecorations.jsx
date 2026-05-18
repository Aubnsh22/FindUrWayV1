import { motion } from 'framer-motion';

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft Environmental Green Glows */}
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] rounded-full bg-[#6B786C]/10 blur-[100px]" />
      <div className="absolute -bottom-[300px] -left-[300px] w-[800px] h-[800px] rounded-full bg-[#2A362B]/10 blur-[120px]" />
      
      {/* Abstract Geometric Pine Tree (Bottom Left) */}
      <motion.div 
        className="absolute -bottom-4 left-4 md:left-20 opacity-[0.07]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.07 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <svg width="250" height="350" viewBox="0 0 200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk */}
          <rect x="92" y="240" width="16" height="60" rx="4" fill="#2A362B"/>
          {/* Layer 3 (Bottom) */}
          <path d="M20 250 C 20 250, 100 150, 180 250 Z" fill="#6B786C" />
          <path d="M40 250 C 40 250, 100 160, 160 250 Z" fill="#2A362B" />
          {/* Layer 2 (Middle) */}
          <path d="M35 190 C 35 190, 100 80, 165 190 Z" fill="#6B786C" />
          <path d="M55 190 C 55 190, 100 90, 145 190 Z" fill="#2A362B" />
          {/* Layer 1 (Top) */}
          <path d="M50 120 C 50 120, 100 10, 150 120 Z" fill="#6B786C" />
          <path d="M70 120 C 70 120, 100 30, 130 120 Z" fill="#2A362B" />
        </svg>
      </motion.div>

      {/* Abstract Organic Tree (Bottom Right) */}
      <motion.div 
        className="absolute bottom-0 right-4 md:right-16 opacity-[0.09]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 0.09 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
      >
        <svg width="350" height="450" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Trunk */}
          <path d="M90 250 C 90 200, 95 150, 95 150 L105 150 C 105 150, 110 200, 110 250 Z" fill="#2A362B"/>
          {/* Branches/Canopy Back */}
          <circle cx="100" cy="150" r="50" fill="#6B786C" />
          <circle cx="50" cy="130" r="40" fill="#6B786C" />
          <circle cx="150" cy="130" r="40" fill="#6B786C" />
          <circle cx="100" cy="80" r="55" fill="#6B786C" />
          {/* Canopy Front (Darker for depth) */}
          <circle cx="65" cy="100" r="35" fill="#2A362B" />
          <circle cx="135" cy="100" r="35" fill="#2A362B" />
          <circle cx="100" cy="40" r="35" fill="#2A362B" />
          <circle cx="100" cy="110" r="45" fill="#2A362B" />
        </svg>
      </motion.div>
      
      {/* Floating leaves/particles (optional subtle detail) */}
      <div className="absolute top-[30%] left-[20%] w-2 h-3 rounded-full bg-[#6B786C] opacity-20 -rotate-45 animate-pulse" />
      <div className="absolute top-[60%] right-[25%] w-3 h-2 rounded-full bg-[#2A362B] opacity-20 rotate-45 animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}
