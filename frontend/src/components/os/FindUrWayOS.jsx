import { useState } from 'react';
import { analyzeProfile } from '../../services/api';
import { AIEntryTerminal } from './AIEntryTerminal';
import { AIThinkingStream } from './AIThinkingStream';
import { AnalysisReport } from './AnalysisReport';
import { OpportunityFeed } from './OpportunityFeed';
import { MarketIntelligence } from './MarketIntelligence';

export default function FindUrWayOS() {
  const [osState, setOsState] = useState('ENTRY'); // ENTRY, THINKING, ANALYSIS
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleSubmit = async (text) => {
    setOsState('THINKING');
    try {
      const results = await analyzeProfile(text);
      setAnalysisResults(results);
      setTimeout(() => setOsState('ANALYSIS'), 3500);
    } catch (e) {
      console.error(e);
      setTimeout(() => setOsState('ENTRY'), 3500);
    }
  };

  const handleReset = () => {
    setOsState('ENTRY');
    setAnalysisResults(null);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 lg:p-24 font-sans selection:bg-white selection:text-black">
      <header className="mb-16 md:mb-32 flex justify-between items-start mono text-xs text-gray-500 uppercase tracking-widest border-b border-gray-900 pb-4">
        <div className="flex gap-4">
          <span>SYS.INT.v2.0</span>
          <span className="hidden md:inline">&mdash;</span>
          <span className="hidden md:inline">FIND_UR_WAY [OS]</span>
        </div>
        <div className="flex gap-8">
          <span className="animate-pulse">● ONLINE</span>
          {osState === 'ANALYSIS' && (
            <button onClick={handleReset} className="hover:text-white transition-colors cursor-pointer">
              [ REBOOT ]
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {osState === 'ENTRY' && <AIEntryTerminal onSubmit={handleSubmit} />}
        {osState === 'THINKING' && <AIThinkingStream />}
        {osState === 'ANALYSIS' && analysisResults && (
           <div className="space-y-32 fade-in">
             <AnalysisReport results={analysisResults} />
             <OpportunityFeed jobs={analysisResults.jobs} />
             <MarketIntelligence />
           </div>
        )}
      </main>
    </div>
  );
}
