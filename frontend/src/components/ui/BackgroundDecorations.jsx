import { motion } from 'framer-motion';

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dynamic Warm Premium Glows */}
      <div className="orb orb-cyan top-[-15%] left-[-10%] w-[45vw] h-[45vw]" />
      <div className="orb orb-purple bottom-[-20%] right-[-10%] w-[40vw] h-[40vw]" />
      <div className="orb orb-warm top-[40%] left-[30%] w-[30vw] h-[30vw] opacity-[0.04]" />
      
      {/* AI / Neural Network (Career Paths & Skills) - Top Left */}
      <motion.div 
        className="absolute top-10 left-10 opacity-[0.05] hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
      >
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Constellation / Matching Connections */}
          <path d="M50 150 L150 100 L250 200 L350 150" stroke="#000000" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M150 100 L120 250 L250 200" stroke="#333333" strokeWidth="1.5" />
          <path d="M50 250 L120 250 M250 300 L250 200" stroke="#111111" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Skill Nodes & Job Endpoints */}
          <circle cx="50" cy="150" r="6" fill="#000000" />
          <circle cx="150" cy="100" r="10" fill="#111111" />
          <circle cx="250" cy="200" r="12" fill="#000000" />
          <circle cx="350" cy="150" r="8" fill="#333333" />
          <circle cx="120" cy="250" r="7" fill="#333333" />
          <circle cx="50" cy="250" r="5" fill="#000000" />
          <circle cx="250" cy="300" r="5" fill="#111111" />
        </svg>
      </motion.div>

      {/* Large Abstract Compass / Navigation Mechanism - Bottom Right */}
      <motion.div 
        className="absolute -bottom-[250px] -right-[250px] opacity-[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="350" stroke="#000000" strokeWidth="2" strokeDasharray="10 20" />
          <circle cx="400" cy="400" r="280" stroke="#333333" strokeWidth="1" />
          <circle cx="400" cy="400" r="200" stroke="#111111" strokeWidth="3" strokeDasharray="2 10 10 10" />
          
          {/* Compass / Navigation pointers */}
          <path d="M400 20 L420 380 L400 400 L380 380 Z" fill="#000000" />
          <path d="M400 780 L420 420 L400 400 L380 420 Z" fill="#000000" />
          <path d="M20 400 L380 380 L400 400 L380 420 Z" fill="#333333" />
          <path d="M780 400 L420 380 L400 400 L420 420 Z" fill="#333333" />

          {/* Inner details */}
          <circle cx="400" cy="400" r="10" fill="#111111" />
          <circle cx="400" cy="400" r="50" stroke="#000000" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </motion.div>

      {/* Floating Data Waypoints & Waypoints */}
      <motion.div 
        className="absolute top-[35%] right-[25%] w-2.5 h-2.5 rounded-full border-[1.5px] border-[#111111]"
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[35%] left-[20%] w-3 h-3 rounded-sm border border-[#000000] rotate-45"
        animate={{ y: [0, 30, 0], rotate: [45, 90, 45], opacity: [0.05, 0.2, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[60%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#333333]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* IT / Software Engineering Motifs */}
      
      {/* Floating Code Brackets */}
      <motion.div 
        className="absolute top-[20%] right-[15%] font-mono text-[#000000] text-2xl font-bold opacity-[0.03] select-none hidden lg:block"
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {"</>"}
      </motion.div>
      <motion.div 
        className="absolute bottom-[20%] left-[10%] font-mono text-[#333333] text-3xl font-light opacity-[0.03] select-none hidden lg:block"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        {"{ }"}
      </motion.div>

      {/* Circuit Board / Tech Traces (Bottom Center) */}
      <motion.div 
        className="absolute bottom-10 left-[45%] opacity-[0.04] hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ duration: 3 }}
      >
        <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circuit Traces */}
          <path d="M10 140 L10 100 L50 60 L150 60 L180 30 L180 10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 140 L30 110 L60 80 L120 80 L150 50 L150 10" stroke="#111111" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          <path d="M50 140 L50 120 L70 100 L100 100 L120 80" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Circuit Nodes/Terminals */}
          <circle cx="10" cy="140" r="3" fill="#000000" />
          <circle cx="180" cy="10" r="4" fill="#000000" />
          <circle cx="30" cy="140" r="2" fill="#111111" />
          <circle cx="150" cy="10" r="3" fill="#111111" />
          <circle cx="50" cy="140" r="2.5" fill="#333333" />
          <circle cx="120" cy="80" r="3.5" fill="#333333" />
        </svg>
      </motion.div>
    </div>
  );
}
