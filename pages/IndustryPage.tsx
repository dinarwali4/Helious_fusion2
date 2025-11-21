import React, { useState } from 'react';
import { askFusionExpert } from '../services/gemini';
import { Search, ExternalLink, Loader2 } from 'lucide-react';

const companies = [
  { name: "Helion Energy", approach: "Magneto-Inertial (FRC)", location: "USA", id: "helion" },
  { name: "Commonwealth Fusion Systems", approach: "Compact Tokamak (SPARC)", location: "USA", id: "cfs" },
  { name: "ITER", approach: "International Tokamak", location: "France", id: "iter" },
  { name: "General Fusion", approach: "Magnetized Target Fusion", location: "Canada", id: "general-fusion" },
  { name: "TAE Technologies", approach: "Field-Reversed Configuration", location: "USA", id: "tae" },
  { name: "Tokamak Energy", approach: "Spherical Tokamak", location: "UK", id: "tokamak-energy" },
];

const IndustryPage: React.FC = () => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);

  const handleCompanyClick = async (companyName: string) => {
    setSelectedCompany(companyName);
    setLoading(true);
    setCompanyInfo("");
    setSources([]);
    
    const prompt = `What is the latest major news or milestone achieved by ${companyName} in fusion energy? Summarize their specific technology approach briefly.`;
    const result = await askFusionExpert(prompt, true); // Use search grounding
    
    setCompanyInfo(result.text);
    setSources(result.sources || []);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-orbitron font-bold mb-4">The Fusion Race</h1>
        <p className="text-gray-400">Explore the private and public entities leading the charge toward net energy.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 h-[600px]">
        
        {/* Company List */}
        <div className="grid sm:grid-cols-2 gap-4 overflow-y-auto pr-2 content-start">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCompanyClick(c.name)}
              className={`p-6 rounded-xl border text-left transition-all duration-300 group ${
                selectedCompany === c.name 
                  ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-gray-900/40 border-gray-800 hover:bg-gray-800'
              }`}
            >
              <h3 className={`font-orbitron font-bold text-lg mb-1 group-hover:text-blue-400 ${selectedCompany === c.name ? 'text-blue-400' : 'text-white'}`}>
                {c.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2">{c.location}</p>
              <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs font-mono text-gray-300 border border-white/5">
                {c.approach}
              </span>
            </button>
          ))}
        </div>

        {/* Details Panel (Gemini Powered) */}
        <div className="bg-gray-900/80 border border-gray-700 rounded-2xl p-8 relative overflow-hidden flex flex-col">
          {!selectedCompany ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <Search className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a company to view real-time AI insights about their progress.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-orbitron text-white">{selectedCompany}</h2>
              </div>
              
              {loading ? (
                <div className="flex-grow flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                  <span className="ml-3 text-blue-400 animate-pulse">Analyzing Fusion Data...</span>
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                  <div className="prose prose-invert prose-blue max-w-none">
                    <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
                      {companyInfo}
                    </p>
                  </div>
                  
                  {sources.length > 0 && (
                    <div className="pt-6 border-t border-gray-800">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Sources</h4>
                      <div className="flex flex-wrap gap-2">
                        {sources.map((s, i) => (
                          <a 
                            key={i} 
                            href={s.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded hover:bg-blue-800/40 transition-colors truncate max-w-[200px]"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {s.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default IndustryPage;
