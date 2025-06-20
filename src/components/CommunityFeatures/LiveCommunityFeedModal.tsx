import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { LiveCommunityFeed } from './LiveCommunityFeed';

interface LiveCommunityFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveCommunityFeedModal: React.FC<LiveCommunityFeedModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const HEADER_OFFSET = 80;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center backdrop-blur-md bg-black/70 p-4"
      style={{ top: HEADER_OFFSET }}
    >
      <div className="relative w-full h-full max-w-none overflow-hidden rounded-2xl shadow-2xl bg-slate-900">
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
          <button aria-label="Back" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button aria-label="Close" onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="h-full overflow-y-auto pt-16 pb-8">
          <LiveCommunityFeed />
        </div>
      </div>
    </div>
  );
};

export default LiveCommunityFeedModal; 