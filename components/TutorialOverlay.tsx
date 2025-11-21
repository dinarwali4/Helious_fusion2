import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';

export interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  pageKey: string; // Unique key to persist "seen" state in localStorage
  isOpen: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ steps, pageKey, isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(isOpen);

  // Sync internal visibility with prop
  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  // Handle highlighting logic
  useEffect(() => {
    if (!isVisible) {
      // Cleanup all highlights
      steps.forEach(step => {
        const el = document.getElementById(step.targetId);
        if (el) el.classList.remove('tutorial-target');
      });
      return;
    }

    // Remove highlight from previous/all steps
    steps.forEach(step => {
      const el = document.getElementById(step.targetId);
      if (el) el.classList.remove('tutorial-target');
    });

    // Add highlight to current step
    const currentStep = steps[currentStepIndex];
    if (currentStep) {
      const el = document.getElementById(currentStep.targetId);
      if (el) {
        el.classList.add('tutorial-target');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepIndex, isVisible, steps]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
    localStorage.setItem(`tutorial_seen_${pageKey}`, 'true');
  };

  if (!isVisible) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center sm:justify-end p-6">
      {/* Dark overlay for focus (optional, kept subtle) */}
      {/* <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" /> */}

      {/* Tutorial Card */}
      <div className="pointer-events-auto w-full max-w-md bg-[#0b1121]/95 border border-blue-500/30 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Tutorial {currentStepIndex + 1}/{steps.length}
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-orbitron font-bold text-white mb-2">
          {currentStep.title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {currentStep.content}
        </p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`flex items-center text-sm font-medium transition-colors ${
              currentStepIndex === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center"
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
              {currentStepIndex !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialOverlay;
