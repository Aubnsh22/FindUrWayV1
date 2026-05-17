export function AnalysisReport({ results }) {
  if (!results) return null;

  return (
    <section className="fade-in">
      <header className="mb-12">
        <h2 className="text-sm mono uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-4">
          Profile Interpretation
        </h2>
      </header>

      <div className="grid md:grid-cols-3 gap-12 md:gap-24 text-sm">
        <div className="col-span-2">
          <p className="text-xl font-light leading-relaxed mb-8">
            Based on the semantic analysis of your input, you align most strongly with the <span className="font-medium text-white">{results.top_categories[0]}</span> sector. The system has identified {results.skills.technical_skills.length} core technical vectors within your profile.
          </p>
          
          <div className="space-y-6 text-gray-300">
            {results.career_insights?.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="border-l border-gray-800 pl-6">
                <div className="mono text-xs text-gray-500 uppercase tracking-widest mb-2">{insight.title}</div>
                <p className="leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-800 pb-2">Primary Vectors</div>
            <ul className="space-y-2">
              {results.skills.technical_skills.slice(0, 6).map(skill => (
                <li key={skill} className="flex justify-between items-center text-gray-300">
                  <span>{skill}</span>
                  <span className="mono text-xs text-gray-600">CONF.HIGH</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-3 border-b border-gray-800 pb-2">Metrics</div>
            <ul className="space-y-2 mono text-xs">
              <li className="flex justify-between text-gray-400">
                <span>Avg. Match Coefficient</span>
                <span className="text-white">{results.avg_match_score.toFixed(1)}%</span>
              </li>
              <li className="flex justify-between text-gray-400">
                <span>Opportunities Scanned</span>
                <span className="text-white">{results.total_jobs_analyzed}</span>
              </li>
              <li className="flex justify-between text-gray-400">
                <span>Viable Matches</span>
                <span className="text-white">{results.jobs.length}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
