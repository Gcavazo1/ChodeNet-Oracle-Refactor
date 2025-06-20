import React, { useEffect, useState } from 'react';
import { Scroll, AlertTriangle, Skull, RefreshCw, Coins, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useOracleFlowStore } from '../../lib/oracleFlowStore';
import './ApocryphalScrolls.css';

interface ScrollEntry {
  id: string;
  created_at: string;
  prophecy_text: string;
  corruption_level: string;
  source_metrics_snapshot?: any;
  ritual_id?: string;
  ritual_outcome?: string;
  oracle_shards_earned?: number;
  girth_cost?: number;
  ingredients_used?: string[];
  success_rate?: number;
}

export const ApocryphalScrolls: React.FC = () => {
  const [scrolls, setScrolls] = useState<ScrollEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'free' | 'ritual'>('all');

  const { refreshScrolls } = useOracleFlowStore();

  useEffect(() => {
    loadScrolls();
  }, []);

  const loadScrolls = async () => {
    try {
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('apocryphal_scrolls')
        .select(`
          id,
          created_at,
          prophecy_text,
          corruption_level,
          source_metrics_snapshot
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const enhancedScrolls = data.map(scroll => ({
          ...scroll,
          ritual_id: null, // No ritual system currently
          ritual_outcome: null,
          oracle_shards_earned: 0,
          girth_cost: 0,
          ingredients_used: [],
          success_rate: null
        }));
        
        setScrolls(enhancedScrolls);
      }
    } catch (err) {
      console.error('Error loading scrolls:', err);
      setError(err instanceof Error ? err.message : 'Failed to load scrolls');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadScrolls();
    await refreshScrolls();
    setIsRefreshing(false);
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCorruptionColor = (level: string): string => {
    switch (level) {
      case 'pristine': return '#00f0ff';
      case 'cryptic': return '#8a2be2';
      case 'flickering': return '#ffaa00';
      case 'glitched_ominous': return '#ff6b6b';
      case 'forbidden_fragment': return '#ff0000';
      default: return '#00f0ff';
    }
  };

  const getCorruptionIcon = (level: string): string => {
    switch (level) {
      case 'pristine': return '✨';
      case 'cryptic': return '🔮';
      case 'flickering': return '⚡';
      case 'glitched_ominous': return '💀';
      case 'forbidden_fragment': return '☠️';
      default: return '✨';
    }
  };

  const getScrollTypeIcon = (scroll: ScrollEntry): string => {
    if (scroll.ritual_id) {
      return scroll.ritual_outcome === 'prophecy' ? '⚗️' : '💀';
    }
    return '🔮'; // Free Oracle consultation
  };

  const getScrollTypeBadge = (scroll: ScrollEntry): string => {
    if (scroll.ritual_id) {
      return scroll.girth_cost > 0 ? `Ritual (${scroll.girth_cost} $GIRTH)` : 'Ritual';
    }
    return 'Free Oracle';
  };

  const filteredScrolls = scrolls.filter(scroll => {
    if (filterType === 'all') return true;
    if (filterType === 'free') return !scroll.ritual_id;
    if (filterType === 'ritual') return !!scroll.ritual_id;
    return true;
  });

  if (isLoading) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2>SACRED ARCHIVES</h2>
          <Scroll className="header-icon" size={24} />
        </div>
        <div className="scrolls-loading">
          <div className="loading-icon">🔮</div>
          <p>Accessing the Oracle's sacred archives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="apocryphal-scrolls">
        <div className="scrolls-header">
          <Scroll className="header-icon" size={24} />
          <h2>SACRED ARCHIVES</h2>
          <Scroll className="header-icon" size={24} />
        </div>
        <div className="scrolls-error">
          <AlertTriangle className="error-icon" size={48} />
          <h3>Archive Access Disrupted</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            <RefreshCw size={16} />
            Retry Access
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

      <div className="archive-controls">
      <div className="archive-stats">
        <div className="stat">
          <span className="stat-count">{scrolls.length}</span>
            <span className="stat-label">Total Prophecies</span>
          </div>
          <div className="stat">
            <span className="stat-count">{scrolls.filter(s => s.ritual_id).length}</span>
            <span className="stat-label">Ritual Prophecies</span>
          </div>
          <div className="stat">
            <span className="stat-count">{scrolls.filter(s => !s.ritual_id).length}</span>
            <span className="stat-label">Free Consultations</span>
          </div>
        </div>

        <div className="filter-controls">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Prophecies
          </button>
          <button 
            className={`filter-btn ${filterType === 'free' ? 'active' : ''}`}
            onClick={() => setFilterType('free')}
          >
            🔮 Free Oracle
          </button>
          <button 
            className={`filter-btn ${filterType === 'ritual' ? 'active' : ''}`}
            onClick={() => setFilterType('ritual')}
          >
            ⚗️ Ritual Crafted
          </button>
        </div>
      </div>

      <div className="scrolls-container">
        {filteredScrolls.map((scroll, index) => {
          const isForbidden = scroll.corruption_level === 'forbidden_fragment';
          const corruptionColor = getCorruptionColor(scroll.corruption_level);
          const isRitualScroll = !!scroll.ritual_id;
          
          return (
            <React.Fragment key={scroll.id}>
              <div 
                className={`prophecy-entry corruption-${scroll.corruption_level} ${isForbidden ? 'forbidden-fragment' : ''} ${isRitualScroll ? 'ritual-scroll' : 'free-scroll'}`}
                style={{
                  '--corruption-color': corruptionColor
                } as React.CSSProperties}
              >
                <div className="prophecy-timestamp">
                  <div className="timestamp-left">
                    <span className="scroll-type-icon">{getScrollTypeIcon(scroll)}</span>
                    <span className="time">{formatTimestamp(scroll.created_at)}</span>
                    <span className="scroll-type-badge">{getScrollTypeBadge(scroll)}</span>
                  </div>
                  
                  <div className="timestamp-right">
                  <div className="corruption-indicator" title={`Corruption Level: ${scroll.corruption_level.toUpperCase()}`}>
                    <span className="corruption-icon">{getCorruptionIcon(scroll.corruption_level)}</span>
                    <span className="corruption-level">{scroll.corruption_level.toUpperCase()}</span>
                  </div>
                  {isForbidden && (
                    <Skull size={16} className="forbidden-fragment-icon" />
                  )}
                </div>
                </div>

                {isRitualScroll && (
                  <div className="ritual-metadata">
                    <div className="ritual-stats">
                      {scroll.girth_cost > 0 && (
                        <div className="ritual-stat">
                          <Coins size={14} />
                          <span>{scroll.girth_cost} $GIRTH</span>
                        </div>
                      )}
                      {scroll.oracle_shards_earned > 0 && (
                        <div className="ritual-stat reward">
                          <span className="shard-icon">💎</span>
                          <span>+{scroll.oracle_shards_earned} Shards</span>
                        </div>
                      )}
                      {scroll.success_rate && (
                        <div className="ritual-stat">
                          <Zap size={14} />
                          <span>{scroll.success_rate}% Success</span>
                        </div>
                      )}
                    </div>
                    
                    {scroll.ingredients_used && scroll.ingredients_used.length > 0 && (
                      <div className="ingredients-used">
                        <span className="ingredients-label">Ingredients:</span>
                        <div className="ingredients-list">
                          {scroll.ingredients_used.map((ingredient, idx) => (
                            <span key={idx} className="ingredient-tag">#{ingredient}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
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
              {index < filteredScrolls.length - 1 && <div className="scroll-divider" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


