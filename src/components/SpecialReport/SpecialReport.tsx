import React, { useState } from 'react';
import { X, Volume2, Loader } from 'lucide-react';
import { useNotificationStore } from '../../lib/store';
import './SpecialReport.css';

interface SpecialReportProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  reportTitle?: string;
  reportContent?: string;
}

type AudioStatus = 'idle' | 'loading' | 'unavailable' | 'ready';

export const SpecialReport: React.FC<SpecialReportProps> = ({
  isOpen,
  onClose,
  reportId,
  reportTitle = 'CHODE-NET ORACLE: TRANSMISSION FROM THE GIRTH-BEYOND',
  reportContent = 'Awaiting transmission from the Oracle...'
}) => {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const { clearSpecialReportNotification } = useNotificationStore();

  if (!isOpen) return null;

  const handleClose = () => {
    if (reportId) {
      clearSpecialReportNotification();
    }
    onClose();
  };

  const handleAudioClick = async () => {
    if (audioStatus === 'loading' || audioStatus === 'unavailable') return;

    setAudioStatus('loading');
    try {
      // Simulate audio loading for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAudioStatus('unavailable');
    } catch (error) {
      setAudioStatus('unavailable');
    }
  };

  const getAudioButtonContent = () => {
    switch (audioStatus) {
      case 'loading':
        return (
          <>
            <Loader size={18} className="animate-spin" />
            Loading Audio...
          </>
        );
      case 'unavailable':
        return (
          <>
            <Volume2 size={18} />
            Audio Unavailable
          </>
        );
      default:
        return (
          <>
            <Volume2 size={18} />
            Play Audio Report
          </>
        );
    }
  };

  return (
    <div className="special-report-modal">
      <div className="special-report-content">
        <button className="close-button" onClick={handleClose}>
          <X size={24} />
        </button>

        <div className="report-header">
          <h1 className="report-title">{reportTitle}</h1>
          <div className="report-subtitle">STATE OF THE CHODEVERSE ADDRESS</div>
        </div>

        <div className="report-content">
          {reportContent}
        </div>

        <div className="report-controls">
          <button 
            className={`audio-control ${audioStatus !== 'idle' ? 'disabled' : ''}`}
            onClick={handleAudioClick}
            disabled={audioStatus === 'loading' || audioStatus === 'unavailable'}
          >
            {getAudioButtonContent()}
          </button>
          <span className="audio-status">
            {audioStatus === 'loading' ? 'Buffering Girthy Wisdom...' : 
             audioStatus === 'unavailable' ? 'Audio generation temporarily unavailable' :
             'Ready to vocalize the prophecy'}
          </span>
        </div>
      </div>
    </div>
  );
};