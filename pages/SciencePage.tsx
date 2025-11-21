import React, { useState } from 'react';
import { Zap, Split, ShieldCheck, Flame, CircleDot, Scale, Info, Target } from 'lucide-react';

// --- Comparison Chart Component ---
const FusionFissionChart = () => {
  const [hoveredMetric, setHoveredMetric] = useState<number | null>(null);

  const data = [
    { 
      label: "Energy Yield", 
      fission: 65, 
      fusion: 100, 
      desc: "Fusion releases ~4x more energy per kg of fuel than fission, and nearly 4 million times more than burning coal." 
    },
    { 
      label: "Safety", 
      fission: 40, 
      fusion: 95, 
      desc: "Fusion has zero meltdown risk. The process stops immediately if containment is lost. Fission requires active cooling to prevent runaways." 
    },
    { 
      label: "Eco-Friendly", 
      fission: 30, 
      fusion: 90, 
      desc: "Fusion produces inert Helium. No long-lived radioactive waste is created, unlike Fission's high-level waste which lasts millennia." 
    },
    { 
      label: "Fuel Supply", 
      fission: 50, 
      fusion: 98, 
      desc: "Fusion fuel (Deuterium/Lithium) is abundant in seawater and the Earth's crust. Fission relies on finite Uranium/Plutonium mining." 
    },
    {
      label: "Maturity",
      fission: 100, 
      fusion: 40, 
      desc: "Fission is a mature, commercial technology powering grids today. Fusion is still in the advanced R&D and prototype phase."
    }
  ];

  // SVG Config
  const size = 350;
  const center = size / 2;
  const maxRadius = 120;
  const angleSlice = (Math.PI * 2) / data.length;

  const getCoordinates = (value: number, index: number, offsetRadius: number = 0) => {
    const angle = index * angleSlice - Math.PI / 2; // Start at 12 o'clock
    const r = (value / 100) * (maxRadius + offsetRadius);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const fissionPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(d.fission, i);
    return `${x},${y}`;
  }).join(' ');

  const fusionPoints = data.map((d, i) => {
    const { x, y } = getCoordinates(d.fusion, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 w-full">
      {/* Chart Visual */}
      <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center bg-gray-900/50 rounded-full border border-gray-800">
         <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* Grid Lines (Web) */}
            {[20, 40, 60, 80, 100].map((r, i) => (
                <circle 
                  key={`grid-${i}`} 
                  cx={center} 
                  cy={center} 
                  r={(r / 100) * maxRadius} 
                  fill="none" 
                  stroke="#374151" 
                  strokeWidth="1" 
                  opacity={0.5}
                />
            ))}
            
            {/* Axes */}
            {data.map((_, i) => {
                const { x, y } = getCoordinates(100, i);
                return (
                    <line 
                      key={`axis-${i}`} 
                      x1={center} 
                      y1={center} 
                      x2={x} 
                      y2={y} 
                      stroke="#374151" 
                      strokeWidth="1" 
                    />
                );
            })}

            {/* Fission Shape (Orange) */}
            <polygon 
                points={fissionPoints} 
                fill="rgba(249, 115, 22, 0.2)" 
                stroke="#f97316" 
                strokeWidth="2"
                className="transition-all duration-500 ease-out"
            />

            {/* Fusion Shape (Blue) */}
            <polygon 
                points={fusionPoints} 
                fill="rgba(59, 130, 246, 0.3)" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                className="transition-all duration-500 ease-out"
            />

            {/* Interactive Data Points */}
            {data.map((d, i) => {
               const fusionCoord = getCoordinates(d.fusion, i);
               const fissionCoord = getCoordinates(d.fission, i);
               const labelCoord = getCoordinates(100, i, 25); // Push label out

               return (
                 <g key={`points-${i}`} 
                    onMouseEnter={() => setHoveredMetric(i)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    className="cursor-pointer"
                 >
                    {/* Axis Label */}
                    <text 
                        x={labelCoord.x} 
                        y={labelCoord.y} 
                        textAnchor="middle" 
                        alignmentBaseline="middle" 
                        fill={hoveredMetric === i ? "#ffffff" : "#9ca3af"}
                        className="text-[10px] uppercase font-bold tracking-wider transition-colors"
                        style={{ fontSize: '10px' }}
                    >
                        {d.label}
                    </text>

                    {/* Fusion Dot */}
                    <circle 
                        cx={fusionCoord.x} 
                        cy={fusionCoord.y} 
                        r={hoveredMetric === i ? 6 : 3} 
                        fill="#3b82f6" 
                        className="transition-all"
                    />
                    {/* Fission Dot */}
                    <circle 
                        cx={fissionCoord.x} 
                        cy={fissionCoord.y} 
                        r={hoveredMetric === i ? 6 : 3} 
                        fill="#f97316" 
                        className="transition-all"
                    />
                    
                    {/* Hit Area (Invisible larger circle) */}
                    <circle 
                        cx={labelCoord.x} 
                        cy={labelCoord.y} 
                        r={20} 
                        fill="transparent" 
                    />
                 </g>
               )
            })}
         </svg>
      </div>

      {/* Tooltip / Detail Panel */}
      <div className="flex-1 w-full">
         <div className="bg-gray-900/80 border border-gray-700 p-6 rounded-xl min-h-[200px] transition-all duration-300 relative overflow-hidden">
            {hoveredMetric !== null ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                    <h4 className="text-xl font-orbitron text-white mb-2 flex items-center gap-2">
                        {data[hoveredMetric].label}
                    </h4>
                    <p className="text-gray-300 mb-4 leading-relaxed border-b border-gray-700 pb-4">
                        {data[hoveredMetric].desc}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-blue-400 font-bold uppercase">Fusion Score</span>
                            <div className="w-full bg-gray-800 h-2 rounded-full mt-1">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${data[hoveredMetric].fusion}%`}}></div>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-orange-400 font-bold uppercase">Fission Score</span>
                            <div className="w-full bg-gray-800 h-2 rounded-full mt-1">
                                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${data[hoveredMetric].fission}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                    <Info className="w-10 h-10 mb-3 opacity-20" />
                    <p>Hover over the chart points to compare specific metrics.</p>
                    <div className="flex gap-4 mt-4 text-xs uppercase font-bold tracking-wider">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div> Fusion
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div> Fission
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- ICF Physics Explainer Component ---
const ICFPhysicsExplainer = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      title: "1. Laser-Target Interaction",
      icon: Zap,
      color: "text-yellow-400",
      borderColor: "border-yellow-400/50",
      bg: "bg-yellow-400/10",
      description: "The sequence begins with energy delivery. In Indirect Drive (like NIF), lasers heat a gold cylinder (Hohlraum) to generate a uniform X-ray bath. In Direct Drive, lasers strike the target directly. The key physics here is 'Absorption Efficiency'—transferring laser energy into the outer shell (ablator) without creating pre-heat electrons that could spoil the core's compressibility.",
      stats: [
        { label: "Energy Delivered", value: "2+ MJ" },
        { label: "Time Scale", value: "20 nanoseconds" },
        { label: "Goal", value: "Symmetric Ablation" }
      ]
    },
    {
      title: "2. Rocket-Like Implosion",
      icon: Target,
      color: "text-blue-400",
      borderColor: "border-blue-400/50",
      bg: "bg-blue-400/10",
      description: "As the ablator surface explodes outward into the vacuum, Newton's Third Law drives the remaining fuel shell inward—acting like a spherical rocket. The shell accelerates to immense velocities (300-400 km/s). Hydrodynamic efficiency depends on the 'aspect ratio' of the shell; a thinner shell accelerates faster but is more unstable.",
      stats: [
        { label: "Implosion Velocity", value: "380 km/s" },
        { label: "Radius Change", value: "30x smaller" },
        { label: "Physics", value: "Rocket Equation" }
      ]
    },
    {
      title: "3. Stagnation & Symmetry",
      icon: Scale,
      color: "text-purple-400",
      borderColor: "border-purple-400/50",
      bg: "bg-purple-400/10",
      description: "The fuel shell slams into the center and stops (stagnates), converting its kinetic energy into thermal energy. This forms a low-density 'Hot Spot' inside a high-density cold fuel shell. This is the most critical phase for 'Rayleigh-Taylor Instability': if the shell has any bumps (even <1 micron), they will grow rapidly and tear the hot spot apart, preventing ignition.",
      stats: [
        { label: "Convergence", value: "CR > 30" },
        { label: "Tolerance", value: "< 1% Asymmetry" },
        { label: "Risk", value: "Shell Breakup" }
      ]
    },
    {
      title: "4. Ignition & Burn Wave",
      icon: Flame,
      color: "text-red-400",
      borderColor: "border-red-400/50",
      bg: "bg-red-400/10",
      description: "For ignition, the Hot Spot must meet the Lawson Criterion (Pressure × Time). If it gets hot enough (>100M °C) and dense enough, fusion starts. The resulting alpha particles are trapped by the super-dense fuel, dumping their energy back in. This 'Alpha Heating' triggers a runaway burn wave that consumes the cold fuel before it flies apart.",
      stats: [
        { label: "Hot Spot Temp", value: "100 Million °C" },
        { label: "Fuel Density", value: "1000 g/cm³" },
        { label: "Pressure", value: "Hundreds of Gbar" }
      ]
    }
  ];

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden flex flex-col md:flex-row h-auto md:h-[500px]">
      {/* Sidebar / Stepper */}
      <div className="md:w-1/3 bg-gray-900/80 border-b md:border-b-0 md:border-r border-gray-800 p-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 pl-2">Implosion Timeline</h3>
        <div className="space-y-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                activeStep === idx 
                  ? `bg-gray-800 ${s.borderColor} shadow-lg` 
                  : 'border-transparent hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={`p-2 rounded-lg ${activeStep === idx ? s.bg : 'bg-gray-800'} transition-colors`}>
                   <s.icon className={`w-5 h-5 ${activeStep === idx ? s.color : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className={`text-xs font-mono mb-0.5 ${activeStep === idx ? s.color : 'text-gray-500'}`}>Step 0{idx + 1}</div>
                  <div className={`font-bold ${activeStep === idx ? 'text-white' : 'text-gray-400'}`}>{s.title.split('. ')[1]}</div>
                </div>
              </div>
              {activeStep === idx && (
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.color.replace('text', 'bg')}`}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 md:p-12 relative">
         <div className="absolute top-0 right-0 p-6 opacity-10">
            {React.createElement(steps[activeStep].icon, { className: "w-64 h-64" })}
         </div>
         
         <div className="relative z-10 h-full flex flex-col justify-center">
            <div className="mb-6">
               <div className={`inline-block px-3 py-1 rounded text-xs font-mono font-bold mb-4 ${steps[activeStep].bg} ${steps[activeStep].color} border border-opacity-20`}>
                  PHYSICS DEEP DIVE
               </div>
               <h2 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-6">
                 {steps[activeStep].title.split('. ')[1]}
               </h2>
               <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                 {steps[activeStep].description}
               </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {steps[activeStep].stats.map((stat, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
                  <div className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                  <div className={`text-lg md:text-xl font-orbitron ${steps[activeStep].color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const SciencePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fission' | 'reactors'>('fission');

  const reactorData = [
    { metric: "Confinement", tokamak: "Magnetic (Toroidal Field)", stellarator: "Magnetic (Twisted Field)", inertial: "Inertial (Laser Compression)" },
    { metric: "Operation", tokamak: "Pulsed (Inductive current)", stellarator: "Continuous (Steady-state)", inertial: "Pulsed (Discrete shots)" },
    { metric: "Stability", tokamak: "Prone to disruptions", stellarator: "Naturally stable geometry", inertial: "Hydrodynamic instabilities" },
    { metric: "Complexity", tokamak: "High (Plasma control)", stellarator: "Very High (Magnet engineering)", inertial: "High (Optics & Targets)" },
    { metric: "Temp Target", tokamak: "~150 Million °C", stellarator: "~150 Million °C", inertial: ">100 Million °C" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold font-orbitron bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Star Power in a Bottle
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Fusion is the process that powers the sun. Replicating it on Earth promises limitless, clean energy. Here is how it works.
        </p>
      </div>

      {/* Concept Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
          <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-6 text-blue-400">
            <Flame className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-orbitron mb-4">Fusion vs. Fission</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 font-bold">Fusion:</span>
              <span>Combining light atoms (like Hydrogen) to release energy. Safe, no meltdown risk, low waste.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">Fission:</span>
              <span>Splitting heavy atoms (Uranium). Current nuclear power. Produces long-lived radioactive waste.</span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
          <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-6 text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-orbitron mb-4">The Challenge</h2>
          <p className="text-gray-300 leading-relaxed">
            To fuse atoms, we must overcome their electrostatic repulsion. This requires:
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
             <div className="bg-black/40 p-3 rounded-lg border border-white/5">
               <div className="text-purple-400 font-bold text-lg">Heat</div>
               <div className="text-xs text-gray-500">150M °C</div>
             </div>
             <div className="bg-black/40 p-3 rounded-lg border border-white/5">
               <div className="text-purple-400 font-bold text-lg">Density</div>
               <div className="text-xs text-gray-500">Crowded Particles</div>
             </div>
             <div className="bg-black/40 p-3 rounded-lg border border-white/5">
               <div className="text-purple-400 font-bold text-lg">Time</div>
               <div className="text-xs text-gray-500">Confinement</div>
             </div>
          </div>
        </div>
      </div>

      {/* Comparative Analysis Section */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                 <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-orbitron font-bold">Technical Breakdown</h3>
           </div>
           
           <div className="flex bg-gray-900/80 p-1 rounded-lg border border-gray-700">
              <button 
                onClick={() => setActiveTab('fission')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeTab === 'fission' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Fusion vs Fission
              </button>
              <button 
                onClick={() => setActiveTab('reactors')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   activeTab === 'reactors' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                Reactor Types
              </button>
           </div>
        </div>

        <div className="p-6">
           {activeTab === 'fission' ? (
             <FusionFissionChart />
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm md:text-base">
                 <thead>
                   <tr className="bg-gray-900/60 text-gray-400 font-orbitron uppercase tracking-wider text-xs">
                     <th className="p-4">Metric</th>
                     <th className="p-4 text-purple-400">Tokamak</th>
                     <th className="p-4 text-indigo-400">Stellarator</th>
                     <th className="p-4 text-green-400">Inertial (Laser)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                   {reactorData.map((row, i) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors">
                       <td className="p-4 font-medium text-gray-300">{row.metric}</td>
                       <td className="p-4 text-gray-400">{row.tokamak}</td>
                       <td className="p-4 text-gray-400">{row.stellarator}</td>
                       <td className="p-4 text-gray-400">{row.inertial}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
        </div>
      </div>

      {/* Approaches Section */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-950/30 rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-orbitron mb-8 text-center">Primary Approaches</h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* MCF */}
            <div className="group">
              <div className="h-40 bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-blue-500/50 transition-all relative overflow-hidden">
                 <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Split className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Magnetic Confinement</h3>
              <p className="text-sm text-gray-400">
                Uses powerful magnetic fields to hold the hot plasma in a donut shape (Tokamak) or twisted ring (Stellarator).
              </p>
              <div className="mt-3 text-xs font-mono text-blue-400">ITER, CFS, Tokamak Energy</div>
            </div>

            {/* ICF */}
            <div className="group">
              <div className="h-40 bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-red-500/50 transition-all relative overflow-hidden">
                 <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <CircleDot className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Inertial Confinement</h3>
              <p className="text-sm text-gray-400">
                Uses powerful lasers to compress a tiny fuel pellet instantly, creating fusion before it blows apart.
              </p>
              <div className="mt-3 text-xs font-mono text-red-400">NIF, Marvel Fusion, Xcimer</div>
            </div>

            {/* Magnetized Target */}
            <div className="group">
              <div className="h-40 bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-white/5 group-hover:border-purple-500/50 transition-all relative overflow-hidden">
                 <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <ShieldCheck className="w-12 h-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Magneto-Inertial</h3>
              <p className="text-sm text-gray-400">
                A hybrid approach. Start with a plasma (magnetic), then compress it rapidly (inertial) to boost pressure.
              </p>
              <div className="mt-3 text-xs font-mono text-purple-400">Helion, General Fusion</div>
            </div>

          </div>
        </div>
      </div>

      {/* ICF Deep Dive Section - Enhanced with Interactive Physics Explainer */}
      <div className="border-t border-gray-800 pt-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
                <h2 className="text-3xl font-orbitron font-bold text-white">Inertial Confinement Challenges</h2>
                <p className="text-gray-400 mt-2 max-w-2xl">
                    Achieving fusion via laser compression requires overcoming extreme physics barriers in nanoseconds. Explore the process below.
                </p>
            </div>
            <div className="px-4 py-2 bg-red-900/20 border border-red-500/30 rounded-full text-red-400 text-sm font-mono">
                Focus: Hydrodynamics & Optics
            </div>
          </div>

          <ICFPhysicsExplainer />
      </div>
    </div>
  );
};

export default SciencePage;