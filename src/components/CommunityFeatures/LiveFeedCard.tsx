import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Maximize2 } from 'lucide-react';
import { LiveCommunityFeed } from './LiveCommunityFeed';
import { LiveEventFeedModal } from '../LiveEventFeed/LiveEventFeedModal';

export const LiveFeedCard: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [showFullScreenFeed, setShowFullScreenFeed] = useState(false);

  return (
    <div className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg"
         style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
      {/* Header Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className="p-4 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 text-black shadow-lg">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>

      {/* Collapsed View */}
      {!expanded && (
        <>
          <h3 className="text-2xl font-bold mb-2">Live Event Feed</h3>
          <p className="text-sm text-gray-300 mb-6">Watch real-time Oracle events as they unfold.</p>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full"
            onClick={() => setExpanded(true)}
          >
            Open Live Feed →
          </button>
        </>
      )}

      {/* Expanded View */}
      {expanded && (
        <div className="relative">
          <div className="absolute -top-4 -right-4 flex gap-2">
            {/* Full Screen Button */}
            <button
              aria-label="Open full screen feed"
              onClick={() => setShowFullScreenFeed(true)}
              className="p-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 text-black shadow-lg hover:scale-110 transition-all duration-300 group"
              title="Open Full Screen Live Event Feed"
            >
              <Maximize2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            </button>
            {/* Close Button */}
            <button
              aria-label="Hide live feed"
              onClick={() => setExpanded(false)}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-2xl font-bold mb-4">Live Event Feed</h3>
          <div className="h-96 overflow-y-auto pr-2 -mr-2">
            <LiveCommunityFeed />
          </div>
        </div>
      )}

      {/* Full Screen Live Event Feed Modal - Rendered at document body level */}
      {showFullScreenFeed && createPortal(
        <LiveEventFeedModal
          isOpen={showFullScreenFeed}
          onClose={() => setShowFullScreenFeed(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default LiveFeedCard; 