import React from 'react';
import { Vote } from 'lucide-react';

interface ReferendumCardProps {
  onClick: () => void;
}

/**
 * Referendum Card Component
 * 
 * Card for the Community Nexus section that opens the Oracle's Referendum modal
 */
export const ReferendumCard: React.FC<ReferendumCardProps> = ({ onClick }) => {
  return (
    <div className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg hover:bg-slate-900/80 hover:border-purple-400/30 transition-all duration-500 group"
         style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 text-black shadow-lg group-hover:shadow-purple-500/30 group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Vote className="w-8 h-8 relative z-10" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-300 transition-colors duration-300">The Oracle's Referendum</h3>
      <p className="text-sm text-gray-300 mb-6 group-hover:text-gray-200 transition-colors duration-300">Shape the future of our digital realm through mystical democratic power.</p>
      <button
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-black font-semibold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg w-full relative overflow-hidden hover:shadow-purple-500/40"
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10">Cast Your Vote →</span>
      </button>
    </div>
  );
}; 