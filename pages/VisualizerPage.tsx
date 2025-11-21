import React, { useState, useEffect } from 'react';
import FusionScene from '../components/FusionScene';
import { FusionViewMode } from '../types';
import { RefreshCw, CircleDot, Infinity as InfinityIcon, Zap, AlertTriangle, HelpCircle, Target } from 'lucide-react';
import TutorialOverlay, { TutorialStep } from '../components/TutorialOverlay';

const VisualizerPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<FusionViewMode>(FusionViewMode.REACTION);
  const [instabilityEnabled, setInstabilityEnabled] = useState(false);
  const [instabilityIntensity, setInstabilityIntensity] = useState(0.5);
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeen = localStorage.getItem('tutorial_seen_visualizer');
    if (!hasSeen) {
      // Small delay to let the 3D scene load a bit first
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      targetId: 'view-controls',
      title: 'Select Reactor Mode',
      content: 'Switch between the basic Reaction, Tokamak (donut), Stellarator (twisted), or Inertial (laser) designs.'
    },
    {
      targetId: 'canvas-container',
      title: 'Interactive 3D Model',
      content: 'This is a live simulation. Click and drag to rotate the view, scroll to zoom in/out. Observe the magnetic field lines and plasma geometry closely.'
    },
    {
      targetId: 'simulation-controls',
      title: 'Simulation Controls',
      content: 'Unlock advanced features here. In reactor modes, you can simulate plasma instabilities to understand the challenges of confinement.'
    },
    {
      targetId: 'stats-panel',
      title: 'Key Statistics',
      content: 'Quick facts about fusion energy performance and requirements are displayed here relative to the current view.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-64px)] flex flex-col gap-6 relative">
      
      <TutorialOverlay 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        steps={tutorialSteps} 
        pageKey="visualizer"
      />

      {/* Header / Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
        
        {/* View Selectors */}
        <div id="view-controls" className="flex flex-wrap gap-2 justify-center md:justify-start">
          <button 
            onClick={() => setViewMode(FusionViewMode.REACTION)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              viewMode === FusionViewMode.REACTION 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Reaction
          </button>
          <button 
            onClick={() => setViewMode(FusionViewMode.TOKAMAK)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              viewMode === FusionViewMode.TOKAMAK 
                ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)]' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            Tokamak
          </button>
          <button 
            onClick={() => setViewMode(FusionViewMode.STELLARATOR)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              viewMode === FusionViewMode.STELLARATOR 
                ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)]' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <InfinityIcon className="w-4 h-4" />
            Stellarator
          </button>
          <button 
            onClick={() => setViewMode(FusionViewMode.INERTIAL)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
              viewMode === FusionViewMode.INERTIAL 
                ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.5)]' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Target className="w-4 h-4" />
            Inertial
          </button>
        </div>

        {/* Right Side: Simulation + Help */}
        <div className="flex items-center gap-4">
          {/* Simulation Controls */}
          <div id="simulation-controls" className="flex items-center gap-4 pl-0 md:pl-4">
            {viewMode !== FusionViewMode.REACTION && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInstabilityEnabled(!instabilityEnabled)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                      instabilityEnabled 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {instabilityEnabled ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    <span className="hidden sm:inline">Simulate Instability</span>
                    <span className="sm:hidden">Instability</span>
                  </button>
                </div>

                {instabilityEnabled && (
                  <div className="hidden sm:flex items-center gap-3 bg-black/30 px-4 py-2 rounded-lg border border-white/5">
                    <span className="text-xs text-gray-400 uppercase font-bold">Intensity</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={instabilityIntensity}
                        onChange={(e) => setInstabilityIntensity(parseFloat(e.target.value))}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Help Button */}
          <button
             onClick={() => setShowTutorial(true)}
             className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors border border-white/5"
             title="Start Tutorial"
          >
             <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div id="canvas-container" className="flex-grow relative rounded-xl overflow-hidden border border-gray-800">
        <FusionScene 
          mode={viewMode} 
          instabilityEnabled={instabilityEnabled}
          instabilityIntensity={instabilityIntensity}
        />
      </div>

      {/* Quick Stats */}
      <div id="stats-panel" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Temperature Required</h4>
          <p className="text-2xl font-orbitron text-white mt-1">
            {viewMode === FusionViewMode.INERTIAL ? '100,000,000 °C' : '150,000,000 °C'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {viewMode === FusionViewMode.INERTIAL ? 'Created via Laser Compression' : "10x hotter than the Sun's core"}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Confinement Method</h4>
          <p className="text-lg font-orbitron text-white mt-1 truncate">
             {viewMode === FusionViewMode.INERTIAL ? 'Inertial (Lasers)' : 'Magnetic (Fields)'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
             {viewMode === FusionViewMode.INERTIAL ? 'Nanosecond Implosion' : 'Continuous/Pulsed Plasma'}
          </p>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
          <h4 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Carbon Emissions</h4>
          <p className="text-2xl font-orbitron text-green-400 mt-1">Zero</p>
          <p className="text-xs text-gray-500 mt-1">During operation</p>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;