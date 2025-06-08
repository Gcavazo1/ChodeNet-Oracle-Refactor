import React, { useEffect, useState } from 'react';
import { Scroll, AlertTriangle, Skull, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import './ApocryphalScrolls.css';

interface ScrollEntry {
  id: string;
  created_at: string;
  prophecy_text: string;
  corruption_level: string;
  source_metrics_snapshot?: any;
}

export const ApocryphalScrolls: React.FC = () => {
  const [scrolls, setScrolls] = useState<ScrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { setupRealtimeSubscription } = useOracleFlowStore();

  useEffect(() => {
    console.log('🔮 ApocryphalScrolls: Setting up component...');
    loadScrolls();
    const cleanup = setupRealtimeSubscription();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);

  const loadScrolls = async () => {
    console.log('🔮 ApocryphalScrolls: Loading scrolls from database...');
    setIsLoading(true);
    setError(null);

    try {
      const { data: scrollsData, error: fetchError } = await supabase
        .from('apocryphal_scrolls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      console.log('🔮 ApocryphalScrolls: Supabase query result:', {
        hasError: !!fetchError,
        dataLength: scrollsData?.length || 0,
        errorDetails: fetchError
      });

      if (fetchError) {
        throw fetchError;
      }

      setScrolls(scrollsData || []);
      console.log(`🔮 ApocryphalScrolls: Loaded ${scrollsData?.length || 0} scrolls successfully`);
    } catch (err) {
      console.error('🔮 ApocryphalScrolls: Error loading scrolls:', err);
      setError('The Oracle\'s memory seems clouded... Unable to access the Sacred Archives.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadScrolls();
    setIsRefreshing(false);
  };

  const getCorruptionColor = (level: string): string => {
    switch (level) {
      case 'pristine': return '#06D6A0';
      case 'cryptic': return '#9D4EDD';
      case 'flickering': return '#F59E0B';
      case 'glitched_ominous': return '#EF4444';
      case 'forbidden_fragment': return '#DC2626';
      default: return '#00f0ff';
    }
  };

  const getCorruptionIcon = (level: string) => {
    switch (level) {
      case 'pristine': return '✨';
      case 'cryptic': return '🔮';
      case 'flickering': return '⚡';
      case 'glitched_ominous': return '🔥';
      case 'forbidden_fragment': return '💀';
      default: return '📜';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2>LOADING SACRED ARCHIVES...</h2>
          <Scroll className="header-icon" size={24} />
        </div>
        <div className="scrolls-loading">
          <div className="oracle-eye">👁️</div>
          <p>Oracle accessing ancient memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <AlertTriangle className="header-icon" size={24} />
          <h2>ARCHIVE ACCESS ERROR</h2>
          <AlertTriangle className="header-icon" size={24} />
        </div>
        <div className="scrolls-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!scrolls.length) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2>SACRED ARCHIVES</h2>
          <Scroll className="header-icon" size={24} />
        </div>
        <div className="scrolls-empty">
          <div className="empty-icon">📜</div>
          <h3>The Archives Await</h3>
          <p>No prophecies have been recorded yet...</p>
          <p>The Oracle's wisdom will manifest here when the time is right.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apocryphal-scrolls">
      <div className="scrolls-header">
        <Scroll className="header-icon" size={24} />
        <div className="header-content">
          <h2>SACRED ARCHIVES</h2>
          <p>Repository of Oracle Visions</p>
        </div>
        <button 
          onClick={handleRefresh} 
          className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      <div className="archive-stats">
        <div className="stat">
          <span className="stat-count">{scrolls.length}</span>
          <span className="stat-label">Prophecies</span>
        </div>
      </div>

      <div className="scrolls-container">
        {scrolls.map((scroll, index) => {
          const isForbidden = scroll.corruption_level === 'forbidden_fragment';
          const corruptionColor = getCorruptionColor(scroll.corruption_level);
          
          return (
            <React.Fragment key={scroll.id}>
              <div 
                className={`prophecy-entry corruption-${scroll.corruption_level} ${isForbidden ? 'forbidden-fragment' : ''}`}
                style={{
                  '--corruption-color': corruptionColor
                } as React.CSSProperties}
              >
                <div className="prophecy-timestamp">
                  <span>{formatTimestamp(scroll.created_at)}</span>
                  <div className="corruption-indicator" title={`Corruption Level: ${scroll.corruption_level.toUpperCase()}`}>
                    <span className="corruption-icon">{getCorruptionIcon(scroll.corruption_level)}</span>
                    <span className="corruption-level">{scroll.corruption_level.toUpperCase()}</span>
                  </div>
                  {isForbidden && (
                    <Skull size={16} className="forbidden-fragment-icon" />
                  )}
                </div>
                
                <div className="prophecy-content">
                  {scroll.prophecy_text}
                </div>
                
                {scroll.source_metrics_snapshot && (
                  <div className="metrics-snapshot">
                    <span className="metrics-label">Oracle Metrics at Time of Vision</span>
                  </div>
                )}
                
                {isForbidden && (
                  <div className="forbidden-warning">
                    <span>⚠️ CLASSIFIED FRAGMENT - ACCESS RESTRICTED ⚠️</span>
                  </div>
                )}
              </div>
              {index < scrolls.length - 1 && <div className="scroll-divider" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

