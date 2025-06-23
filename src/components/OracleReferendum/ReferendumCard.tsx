import React from 'react';
import { Vote } from 'lucide-react';
import { HackerText } from '../../intro/HackerText';

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
    <div
      className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg group cursor-pointer"
      style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      onClick={onClick}
    >
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg card-icon group-hover:scale-110 transition-transform duration-300">
          <Vote className="w-8 h-8" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-2">
        <HackerText text="The Oracle's Referendum" />
      </h3>
      <p className="text-sm text-gray-300 mb-6">
        Shape the future of our digital realm through mystical democratic power.
      </p>
      <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full group-hover:shadow-purple-400/30">
        Cast Your Vote →
      </button>
    </div>
  );
}; 