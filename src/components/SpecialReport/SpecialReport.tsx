import React from 'react';
import { X, Volume2 } from 'lucide-react';
import './SpecialReport.css';

interface SpecialReportProps {
  isOpen: boolean;
  onClose: () => void;
  reportContent?: string;
}

export const SpecialReport: React.FC<SpecialReportProps> = ({
  isOpen,
  onClose,
  reportContent
}) => {
  if (!isOpen) return null;

  return (
    <div className="special-report-modal">
      <div className="special-report-content">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="report-header">
          <h1 className="report-title">CHODE-NET ORACLE: TRANSMISSION FROM THE GIRTH-BEYOND</h1>
          <div className="report-subtitle">STATE OF THE CHODEVERSE ADDRESS</div>
        </div>

        <div className="report-content">
          {reportContent || 'Awaiting transmission from the Oracle...'}
        </div>

        <div className="report-controls">
          <button className="audio-control" disabled>
            <Volume2 size={18} />
            Play Audio Report
          </button>
          <span className="audio-status">Buffering Girthy Wisdom...</span>
        </div>
      </div>
    </div>
  );
};