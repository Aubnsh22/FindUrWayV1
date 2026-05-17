import { useState, useEffect } from 'react';
import { getMarketInsights } from '../../services/api';

export function MarketIntelligence() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getMarketInsights().then(setData).catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <section className="fade-in pb-32">
      <header className="mb-12">
        <h2 className="text-sm mono uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-4">
          Market Intelligence Report (Morocco)
        </h2>
      </header>

      <div className="grid md:grid-cols-2 gap-12 md:gap-24">
        <div>
          <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-6">Macro Trends</div>
          <p className="text-sm leading-relaxed text-gray-300">
            {data.market_summary || "Analysis of the Moroccan technology sector indicates a sustained shift towards AI/ML and advanced data engineering capabilities. Traditional software engineering roles are demanding cloud-native competencies."}
          </p>

          <div className="mt-12">
            <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-6">Regional Hotspots</div>
            <div className="space-y-4">
              {data.hiring_hotspots?.map(spot => (
                <div key={spot.city} className="flex justify-between items-baseline border-b border-gray-900 pb-2">
                  <span className="text-sm">{spot.city}</span>
                  <div className="text-right">
                    <span className="mono text-xs text-gray-400 mr-4">{spot.job_count} open reqs</span>
                    <span className="mono text-xs text-white">~{spot.avg_salary_mad?.toLocaleString()} MAD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mono text-xs uppercase tracking-widest text-gray-500 mb-6">Sector Growth Indicators</div>
          <div className="space-y-6">
            {data.trending_sectors?.map(sector => (
              <div key={sector.sector}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{sector.sector}</span>
                  <span className="mono text-xs">+{sector.growth_pct}% YOY</span>
                </div>
                <div className="w-full h-px bg-gray-900">
                  <div className="h-full bg-white" style={{ width: `${Math.min(sector.growth_pct * 3, 100)}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-500 mono">
                  Key Drivers: {sector.key_skills.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
