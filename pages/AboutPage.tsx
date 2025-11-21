import React from 'react';
import { Mail, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center min-h-[calc(100vh-160px)] justify-center">
      <div className="bg-gray-900/60 border border-gray-800 p-10 rounded-3xl backdrop-blur-md w-full max-w-3xl text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Subtle header gradient line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

        <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-10 tracking-tight">
          About
        </h1>

        <div className="space-y-6 text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl mx-auto">
          <p>
            This application is developed by <strong className="text-white font-semibold">Dinar Wali</strong>, Founder at <span className="text-blue-400">RegenX.eco</span>.
          </p>
          <p>
             His research focuses on emerging technologies, driven by a deep curiosity and passion for Science and Nature.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
                href="mailto:dinar.wali4@gmail.com" 
                className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/50 rounded-full transition-all group"
            >
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-blue-600/20 transition-colors">
                   <Mail className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <span className="text-gray-300 group-hover:text-white transition-colors font-mono text-sm">dinar.wali4@gmail.com</span>
            </a>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;