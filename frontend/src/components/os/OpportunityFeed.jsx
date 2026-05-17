import { useState } from 'react';

function OpportunityEntry({ job, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-900 py-8 group fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div 
        className="flex flex-col md:flex-row md:items-baseline justify-between cursor-pointer hover:opacity-75 transition-opacity"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <span className="mono text-xs uppercase tracking-widest text-gray-500">
              Ref {job.job_id.slice(0, 6)}
            </span>
            <span className="mono text-sm font-medium tracking-tight">
              Match: {job.match_percentage.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-xl font-light mb-1">{job.title}</h3>
          <div className="text-gray-400 text-sm">
            {job.company} &mdash; {job.location}
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 mono text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
          {expanded ? '[- Collapse]' : '[+ Expand Analysis]'}
        </div>
      </div>

      {expanded && (
        <div className="mt-8 pt-8 border-t border-dashed border-gray-800 grid md:grid-cols-2 gap-8 text-sm text-gray-300">
          <div>
            <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-4">Reasoning</div>
            <p className="leading-relaxed mb-6">
              {job.explanation?.summary || job.description.slice(0, 200) + '...'}
            </p>
            {job.url && (
              <a href={job.url} target="_blank" rel="noopener noreferrer" className="mono text-xs text-white border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-colors">
                Initiate External Link &nearr;
              </a>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-3">Alignment</div>
              <div className="flex flex-wrap gap-2">
                {job.matched_skills?.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-gray-900 text-gray-300 border border-gray-800 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {job.missing_skills?.length > 0 && (
              <div>
                <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-3">Skill Deficits</div>
                <div className="flex flex-wrap gap-2">
                  {job.missing_skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-transparent text-gray-400 border border-gray-700 border-dashed text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OpportunityFeed({ jobs }) {
  if (!jobs || jobs.length === 0) return null;

  return (
    <section>
      <header className="mb-12">
        <h2 className="text-sm mono uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-4">
          Opportunity Intelligence Feed
        </h2>
      </header>
      <div className="flex flex-col">
        {jobs.slice(0, 10).map((job, idx) => (
          <OpportunityEntry key={job.job_id} job={job} index={idx} />
        ))}
      </div>
    </section>
  );
}
