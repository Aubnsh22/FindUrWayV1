import { motion } from 'framer-motion';

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Soft Ambient Glows matching the app's organic tech palette */}
      <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#6B786C]/5 blur-[120px]" />
      <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#C46B4D]/5 blur-[150px]" />
      
      {/* AI / Neural Network (Career Paths & Skills) - Top Left */}
      <motion.div 
        className="absolute top-10 left-10 opacity-[0.05] hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
      >
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Constellation / Matching Connections */}
          <path d="M50 150 L150 100 L250 200 L350 150" stroke="#2A362B" strokeWidth="2" strokeDasharray="6 6" />
          <path d="M150 100 L120 250 L250 200" stroke="#6B786C" strokeWidth="1.5" />
          <path d="M50 250 L120 250 M250 300 L250 200" stroke="#C46B4D" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Skill Nodes & Job Endpoints */}
          <circle cx="50" cy="150" r="6" fill="#2A362B" />
          <circle cx="150" cy="100" r="10" fill="#C46B4D" />
          <circle cx="250" cy="200" r="12" fill="#2A362B" />
          <circle cx="350" cy="150" r="8" fill="#6B786C" />
          <circle cx="120" cy="250" r="7" fill="#6B786C" />
          <circle cx="50" cy="250" r="5" fill="#2A362B" />
          <circle cx="250" cy="300" r="5" fill="#C46B4D" />
        </svg>
      </motion.div>

      {/* Large Abstract Compass / Navigation Mechanism - Bottom Right */}
      <motion.div 
        className="absolute -bottom-[250px] -right-[250px] opacity-[0.03]"
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="350" stroke="#2A362B" strokeWidth="2" strokeDasharray="10 20" />
          <circle cx="400" cy="400" r="280" stroke="#6B786C" strokeWidth="1" />
          <circle cx="400" cy="400" r="200" stroke="#C46B4D" strokeWidth="3" strokeDasharray="2 10 10 10" />
          
          {/* Compass / Navigation pointers */}
          <path d="M400 20 L420 380 L400 400 L380 380 Z" fill="#2A362B" />
          <path d="M400 780 L420 420 L400 400 L380 420 Z" fill="#2A362B" />
          <path d="M20 400 L380 380 L400 400 L380 420 Z" fill="#6B786C" />
          <path d="M780 400 L420 380 L400 400 L420 420 Z" fill="#6B786C" />

          {/* Inner details */}
          <circle cx="400" cy="400" r="10" fill="#C46B4D" />
          <circle cx="400" cy="400" r="50" stroke="#2A362B" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </motion.div>

      {/* Floating Data Waypoints & Waypoints */}
      <motion.div 
        className="absolute top-[35%] right-[25%] w-2.5 h-2.5 rounded-full border-[1.5px] border-[#C46B4D]"
        animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-[35%] left-[20%] w-3 h-3 rounded-sm border border-[#2A362B] rotate-45"
        animate={{ y: [0, 30, 0], rotate: [45, 90, 45], opacity: [0.05, 0.2, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[60%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#6B786C]"
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
