import { useState, useEffect } from 'react';

const COMMON_SKILLS = ['React', 'Node.js', 'Python', 'Machine Learning', 'Data Science', 'SQL', 'AWS', 'Docker', 'TypeScript', 'Java', 'C++', 'Go', 'Kubernetes', 'DevOps', 'Power BI'];

export function AIEntryTerminal({ onSubmit }) {
  const [input, setInput] = useState('');
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [estimatedRole, setEstimatedRole] = useState('Awaiting data...');
  const [status, setStatus] = useState('LISTENING');

  useEffect(() => {
    if (input.length > 10) {
      setStatus('ANALYZING_INPUT');
      
      const words = input.toLowerCase();
      const found = COMMON_SKILLS.filter(skill => words.includes(skill.toLowerCase()));
      setDetectedSkills(found);

      if (words.includes('data') || words.includes('machine learning') || words.includes('python')) {
        setEstimatedRole('Data / AI Professional');
      } else if (words.includes('react') || words.includes('node') || words.includes('web')) {
        setEstimatedRole('Software Engineer');
      } else if (words.includes('aws') || words.includes('docker') || words.includes('devops')) {
        setEstimatedRole('Cloud / Infrastructure');
      } else {
        setEstimatedRole('General Technologist');
      }
      
      const timer = setTimeout(() => setStatus('READY_TO_PROCESS'), 500);
      return () => clearTimeout(timer);
    } else {
      setStatus('LISTENING');
      setDetectedSkills([]);
      setEstimatedRole('Awaiting data...');
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && input.length > 10) {
      onSubmit(input);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 md:gap-24 fade-in">
      <div className="flex-1">
        <h1 className="text-2xl font-light tracking-tight mb-8">
          Describe your professional journey.
        </h1>
        <textarea
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="I have spent the last 3 years working on..."
          className="w-full h-64 bg-transparent text-lg leading-relaxed text-white placeholder-gray-600 border-none outline-none resize-none font-sans"
        />
        <div className="mt-8 flex items-center gap-4 text-xs mono text-gray-500 uppercase tracking-widest">
          <span>{input.length} chars</span>
          <span>&mdash;</span>
          <button 
            onClick={() => input.length > 10 && onSubmit(input)}
            className={`transition-colors ${input.length > 10 ? 'text-white hover:underline cursor-pointer' : 'text-gray-600 cursor-not-allowed'}`}
          >
            [ Execute Analysis ] or Ctrl+Enter
          </button>
        </div>
      </div>

      <div className="md:w-64 flex flex-col gap-8 mono text-xs uppercase tracking-widest border-l border-gray-800 pl-8 h-fit">
        <div>
          <div className="text-gray-500 mb-2">System Status</div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 bg-white ${status === 'ANALYZING_INPUT' ? 'animate-ping' : ''}`} />
            {status}
          </div>
        </div>

        <div className="transition-opacity duration-300" style={{ opacity: input.length > 10 ? 1 : 0.3 }}>
          <div className="text-gray-500 mb-2">Detected Vectors</div>
          {detectedSkills.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {detectedSkills.map(skill => (
                <li key={skill} className="text-gray-300 before:content-['>_'] before:mr-2 before:text-gray-600">
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-700">None detected</div>
          )}
        </div>

        <div className="transition-opacity duration-300" style={{ opacity: input.length > 10 ? 1 : 0.3 }}>
          <div className="text-gray-500 mb-2">Classification</div>
          <div className="text-gray-300">{estimatedRole}</div>
        </div>
      </div>
    </div>
  );
}
