import { useState, useEffect } from 'react';

const THINKING_STEPS = [
  "Initiating NLP analysis module...",
  "Parsing semantic structures from input...",
  "Extracting core competencies and technical vectors...",
  "Cross-referencing with Moroccan market intelligence database...",
  "Computing multidimensional skill gap analysis...",
  "Ranking optimal career trajectories...",
  "Structuring intelligence report...",
  "Finalizing output."
];

export function AIThinkingStream() {
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < THINKING_STEPS.length) {
        setVisibleSteps(prev => [...prev, THINKING_STEPS[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-24 fade-in">
      <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-3">
        <span className="w-2 h-2 bg-white animate-pulse" />
        Processing Query
      </div>
      
      <div className="space-y-4 font-mono text-sm text-gray-300">
        {visibleSteps.map((step, i) => (
          <div key={i} className="flex gap-4 fade-in">
            <span className="text-gray-600">[{String(i + 1).padStart(2, '0')}]</span>
            <span>{step}</span>
          </div>
        ))}
        {visibleSteps.length < THINKING_STEPS.length && (
          <div className="flex gap-4">
            <span className="text-gray-600">[{String(visibleSteps.length + 1).padStart(2, '0')}]</span>
            <span className="cursor-blink" />
          </div>
        )}
      </div>
    </div>
  );
}
