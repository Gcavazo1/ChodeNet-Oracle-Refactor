import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generateLoreComicPanel, generateLoreAudio } from '../../lib/oracleBackendIntegration';
import { useOracleLoreStore } from '../../lib/oracleFlowStore';
import { audioCache } from '../../lib/audioCache';
import { LoreEntry } from '../../types/lore';
import OracleLoreSlideshow from './OracleLoreSlideshow';
import './LoreArchive.css';
import './oracle-theme.css';

interface LoreFilter {
  dateRange: 'all' | 'week' | 'month';
  corruptionLevel: 'all' | 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment';
  sortBy: 'newest' | 'oldest' | 'popular' | 'controversial';
}

export const LoreArchive: React.FC = () => {
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LoreEntry[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingPanels, setGeneratingPanels] = useState<Set<string>>(new Set());
  const [generatingAudio, setGeneratingAudio] = useState<Set<string>>(new Set());
  const [successNotifications, setSuccessNotifications] = useState<Set<string>>(new Set());
  const [engagementPrompts, setEngagementPrompts] = useState<boolean>(true);
  const [filter, setFilter] = useState<LoreFilter>({
    dateRange: 'all',
    corruptionLevel: 'all',
    sortBy: 'newest'
  });

  const { highlightedLoreId, clearHighlightedLoreEntry } = useOracleLoreStore(
    (state) => ({
      highlightedLoreId: state.highlightedLoreId,
      clearHighlightedLoreEntry: state.clearHighlightedLoreEntry
    })
  );

  // Slideshow state
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowInitialEntryId, setSlideshowInitialEntryId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadLoreEntries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [loreEntries, filter, searchTerm]);

  useEffect(() => {
    if (highlightedLoreId) {
      const card = document.getElementById(`lore-card-${highlightedLoreId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const timer = setTimeout(() => {
        clearHighlightedLoreEntry();
      }, 5000); // Highlight for 5 seconds

      return () => clearTimeout(timer);
    }
  }, [highlightedLoreId, clearHighlightedLoreEntry, filteredEntries]);

  useEffect(() => {
    // Real-time subscription for lore updates
    let channel: ReturnType<typeof supabase.channel> | null = null;
    
    const setupSubscription = () => {
      // Only create subscription if one doesn't exist
      if (!channel) {
        console.log('✨ LoreArchive: Setting up real-time subscription');
        channel = supabase
          .channel(`lore-archive-updates-${Date.now()}`) // Use unique channel name
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'chode_lore_entries' },
            (payload) => {
              console.log('✨ Real-time lore update received:', payload.new.id);
              const updatedEntry = payload.new as LoreEntry;
              setLoreEntries((prevEntries) =>
                prevEntries.map((entry) =>
                  entry.id === updatedEntry.id ? updatedEntry : entry
                )
              );
            }
          )
          .subscribe((status) => {
            console.log('✨ LoreArchive subscription status:', status);
          });
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        console.log('✨ LoreArchive: Cleaning up subscription');
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []); // Empty dependency array to ensure this only runs once

  const loadLoreEntries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: entries, error: fetchError } = await supabase
        .from('chode_lore_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setLoreEntries(entries || []);
    } catch (err) {
      console.error('Error loading lore entries:', err);
      setError('Failed to load lore archive. The Oracle\'s memory seems clouded...');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...loreEntries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.story_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.story_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.story_summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (filter.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (filter.dateRange === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (filter.dateRange === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(entry => new Date(entry.created_at) >= cutoff);
    }

    // Corruption level filter
    if (filter.corruptionLevel !== 'all') {
      filtered = filtered.filter(entry => entry.oracle_corruption_level === filter.corruptionLevel);
    }

    // Sort filter
    filtered.sort((a, b) => {
      switch (filter.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'popular':
          return (b.like_count + b.view_count) - (a.like_count + a.view_count);
        case 'controversial':
          return b.share_count - a.share_count;
        default:
          return 0;
      }
    });

    setFilteredEntries(filtered);
  };

  const handleEntryClick = async (entry: LoreEntry) => {
    // Use slideshow view instead of old modal
    console.log('📋 [CARD CLICK] Card clicked, opening slideshow view:', entry.id);
    setSlideshowInitialEntryId(entry.id);
    setShowSlideshow(true);
    
    // Increment view count
    try {
      await supabase
        .from('chode_lore_entries')
        .update({ view_count: entry.view_count + 1 })
        .eq('id', entry.id);
      
      // Update local state
      setLoreEntries(prev => prev.map(e => 
        e.id === entry.id ? { ...e, view_count: e.view_count + 1 } : e
      ));
    } catch (error) {
      console.warn('Failed to update view count:', error);
    }
  };

  // New function for expanding to slideshow view
  const handleExpandToSlideshow = (entry: LoreEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎭 [SLIDESHOW] Expanding entry for slideshow view:', entry.id);
    setSlideshowInitialEntryId(entry.id);
    setShowSlideshow(true);
  };

  // New function for image click expansion
  const handleImageExpand = (entry: LoreEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🖼️ [IMAGE EXPAND] Image clicked for slideshow view:', entry.id);
    setSlideshowInitialEntryId(entry.id);
    setShowSlideshow(true);
  };

  const handleLikeEntry = async (entryId: string) => {
    try {
      const entry = loreEntries.find(e => e.id === entryId);
      if (!entry) return;

      await supabase
        .from('chode_lore_entries')
        .update({ like_count: entry.like_count + 1 })
        .eq('id', entryId);

      // Update local state
      setLoreEntries(prev => prev.map(e => 
        e.id === entryId ? { ...e, like_count: e.like_count + 1 } : e
      ));
    } catch (error) {
      console.error('Failed to like entry:', error);
    }
  };

  const showSuccessNotification = (entryId: string, type: 'panel' | 'audio') => {
    console.log(`✨ Success notification triggered for ${type} generation on entry: ${entryId}`);
    setSuccessNotifications(prev => new Set(prev).add(`${entryId}-${type}`));
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      setSuccessNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(`${entryId}-${type}`);
        return newSet;
      });
    }, 3000);
  };

  const dismissEngagementPrompts = () => {
    console.log('🔇 User dismissed engagement prompts');
    setEngagementPrompts(false);
    localStorage.setItem('chode_oracle_engagement_prompts_dismissed', 'true');
  };

  const handleGenerateComicPanel = async (entry: LoreEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (generatingPanels.has(entry.id)) {
      console.log(`🎨 Comic panel already generating for entry: ${entry.id}`);
      return; // Already generating
    }

    console.log(`🎨 [USER ACTION] Generating comic panel for lore entry: ${entry.id}`);
    console.log(`🎨 [STORY CONTEXT] Title: "${entry.story_title}"`);
    console.log(`🎨 [STORY CONTEXT] Corruption Level: ${entry.oracle_corruption_level}`);
    console.log(`🎨 [STORY CONTEXT] Summary: "${entry.story_summary}"`);
    
    setGeneratingPanels(prev => new Set(prev).add(entry.id));

    try {
      console.log(`🎨 [API CALL] Invoking generate-comic-panel Edge Function...`);
      
      const result = await generateLoreComicPanel(
        entry.id,
        entry.story_text,
        entry.story_summary || "A mystical cosmic scene",
        entry.oracle_corruption_level as 'pristine' | 'cryptic' | 'flickering' | 'glitched_ominous' | 'forbidden_fragment'
      );

      if (result.success) {
        console.log(`✅ [SUCCESS] Comic panel generation queued successfully!`);
        // Update local state to show 'queued' status
        setLoreEntries(prev => 
          prev.map(e => 
            e.id === entry.id 
              ? { ...e, image_generation_status: 'queued' }
              : e
          )
        );
        showSuccessNotification(entry.id, 'panel');
      } else {
        throw new Error(result.error || 'Failed to queue comic panel generation');
      }
    } catch (error) {
      console.error('❌ [ERROR] Comic panel queuing failed:', error);
      console.error(`❌ [ERROR] Failed for entry: ${entry.id} - "${entry.story_title}"`);
      setError(`Failed to queue comic panel generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setGeneratingPanels(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  const handleGenerateAudio = async (entry: LoreEntry, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (generatingAudio.has(entry.id)) {
      console.log(`🎵 Audio already generating for entry: ${entry.id}`);
      return; // Already generating
    }

    console.log(`🎵 [USER ACTION] Generating audio narration for lore entry: ${entry.id}`);
    console.log(`🎵 [STORY CONTEXT] Title: "${entry.story_title}"`);
    console.log(`🎵 [STORY CONTEXT] Story length: ${entry.story_text.length} characters`);
    console.log(`🎵 [STORY CONTEXT] Corruption Level: ${entry.oracle_corruption_level}`);

    setGeneratingAudio(prev => new Set(prev).add(entry.id));

    try {
      // 1. First check cache (both local IndexedDB and backend)
      console.log(`🎵 [CACHE] Checking cache before API call...`);
      const cachedAudioUrl = await audioCache.getCachedAudio(entry.id, entry.story_text);
      
      if (cachedAudioUrl) {
        console.log(`✅ [CACHE HIT] Using cached audio - no API call needed!`);
        console.log(`✅ [CACHE HIT] Oracle voice restored: "${entry.story_title}"`);
        
        // Update state with cached audio
        setLoreEntries(prev => 
          prev.map(e => 
            e.id === entry.id 
              ? { ...e, tts_audio_url: cachedAudioUrl }
              : e
          )
        );

        showSuccessNotification(entry.id, 'audio');
        return; // Exit early - no API call needed!
      }

      // 2. No cache found - make API call
      console.log(`🎵 [CACHE MISS] No cached audio found, calling ElevenLabs API...`);
      console.log(`🎵 [API CALL] Invoking elevenlabs-tts-generator Edge Function...`);
      
      const result = await generateLoreAudio(
        entry.id,
        entry.story_text
      );

      if (result.success && result.audio_url) {
        console.log(`✅ [SUCCESS] Audio narration generated successfully!`);
        console.log(`✅ [SUCCESS] Audio URL: ${result.audio_url}`);
        console.log(`✅ [SUCCESS] Oracle now speaks: "${entry.story_title}"`);
        
        // 3. Cache the newly generated audio for future use
        console.log(`💾 [CACHE] Storing audio in cache for future visits...`);
        await audioCache.storeCachedAudio(entry.id, entry.story_text, result.audio_url);
        
        // Update the local state with the new audio URL
        setLoreEntries(prev => 
          prev.map(e => 
            e.id === entry.id 
              ? { ...e, tts_audio_url: result.audio_url }
              : e
          )
        );

        console.log(`🎉 [ENGAGEMENT] User successfully added Oracle voice to the story!`);
        showSuccessNotification(entry.id, 'audio');
      } else {
        throw new Error(result.error || 'Failed to generate audio');
      }
    } catch (error) {
      console.error('❌ [ERROR] Audio generation failed:', error);
      console.error(`❌ [ERROR] Failed for entry: ${entry.id} - "${entry.story_title}"`);
      setError(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setGeneratingAudio(prev => {
        const newSet = new Set(prev);
        newSet.delete(entry.id);
        return newSet;
      });
    }
  };

  const getCorruptionColor = (level: string): string => {
    switch (level) {
      case 'pristine': return '#06D6A0';
      case 'cryptic': return '#9D4EDD';
      case 'flickering': return '#F59E0B';
      case 'glitched_ominous': return '#EF4444';
      case 'forbidden_fragment': return '#DC2626';
      default: return '#FFFFFF';
    }
  };

  const getCorruptionIcon = (level: string): string => {
    switch (level) {
      case 'pristine': return '✨';
      case 'cryptic': return '🔮';
      case 'flickering': return '⚡';
      case 'glitched_ominous': return '🔥';
      case 'forbidden_fragment': return '💀';
      default: return '📜';
    }
  };

  const getGenerationButtonContent = (entry: LoreEntry) => {
    const status = entry.image_generation_status;
    if (generatingPanels.has(entry.id) || status === 'queued' || status === 'processing') {
      return '🎨 Generating...';
    }
    return '🎨 Generate Comic Panel';
  };

  const isGenerationDisabled = (entry: LoreEntry) => {
    const status = entry.image_generation_status;
    return generatingPanels.has(entry.id) || status === 'queued' || status === 'processing';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="lore-archive loading">
        <div className="archive-loading">
          <div className="oracle-eye">👁️</div>
          <p>Oracle accessing ancient memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lore-archive error">
        <div className="archive-error">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={loadLoreEntries} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lore-archive">
      <div className="archive-header">
        <h2>📚 The Chode Lore Archive</h2>
        <p className="archive-description">
          Explore the cosmic tales woven by the Oracle from community visions across time and space.
        </p>
        
        {/* Enhanced Engagement Prompt */}
        {engagementPrompts && (
          <div className="engagement-banner">
            <div className="banner-content">
              <div className="banner-icon">✨</div>
              <div className="banner-text">
                <strong>🎨 Bring Stories to Life!</strong>
                <p>Generate comic panels and Oracle narrations to enhance these cosmic tales. Your contributions help build our shared universe!</p>
              </div>
              <button className="dismiss-banner" onClick={dismissEngagementPrompts}>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="archive-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search the cosmic archives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="archive-search"
          />
        </div>

        <div className="filter-section">
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value as LoreFilter['dateRange'] }))}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          <select
            value={filter.corruptionLevel}
            onChange={(e) => setFilter(prev => ({ ...prev, corruptionLevel: e.target.value as LoreFilter['corruptionLevel'] }))}
            className="filter-select"
          >
            <option value="all">All Corruption Levels</option>
            <option value="pristine">Pristine</option>
            <option value="cryptic">Cryptic</option>
            <option value="flickering">Flickering</option>
            <option value="glitched_ominous">Glitched Ominous</option>
            <option value="forbidden_fragment">Forbidden Fragment</option>
          </select>

          <select
            value={filter.sortBy}
            onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as LoreFilter['sortBy'] }))}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="controversial">Most Shared</option>
          </select>
        </div>
      </div>

      <div className="archive-stats">
        <div className="stat">
          <span className="stat-value">{filteredEntries.length}</span>
          <span className="stat-label">Tales Found</span>
        </div>
        <div className="stat">
          <span className="stat-value">{loreEntries.reduce((sum, entry) => sum + entry.view_count, 0)}</span>
          <span className="stat-label">Total Views</span>
        </div>
        <div className="stat">
          <span className="stat-value">{loreEntries.reduce((sum, entry) => sum + entry.input_count, 0)}</span>
          <span className="stat-label">Community Contributions</span>
        </div>
      </div>

      <div className="lore-grid">
        {filteredEntries.map((entry) => (
          <div 
            key={entry.id} 
            id={`lore-card-${entry.id}`}
            className={`lore-card corruption-${entry.oracle_corruption_level} ${entry.id === highlightedLoreId ? 'highlighted' : ''}`}
            onClick={() => handleEntryClick(entry)}
          >
            {/* Add expand button */}
            <button 
              className="expand-story-btn"
              onClick={(e) => handleExpandToSlideshow(entry, e)}
              title="Expand to slideshow view"
            >
              ⚡
            </button>

            <div className="card-header">
              <h3 className="lore-title">{entry.story_title}</h3>
              <div 
                className="corruption-badge"
                style={{ color: getCorruptionColor(entry.oracle_corruption_level) }}
              >
                {getCorruptionIcon(entry.oracle_corruption_level)} 
                {entry.oracle_corruption_level.toUpperCase()}
              </div>
            </div>

            <div className="card-content">
              <p className="lore-summary">{entry.story_summary}</p>
              
              {/* Enhanced Comic Panel Section with Image Click */}
              {entry.comic_panel_url ? (
                <div className="comic-preview">
                  <img 
                    src={entry.comic_panel_url} 
                    alt="Comic panel"
                    className="panel-thumbnail"
                    onClick={(e) => handleImageExpand(entry, e)}
                    title="Click to view in slideshow"
                  />
                  {successNotifications.has(`${entry.id}-panel`) && (
                    <div className="success-flash">
                      <span>🎨 ✨ Panel Generated!</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="comic-panel-placeholder">
                  <button 
                    className={`generate-panel-btn ${isGenerationDisabled(entry) ? 'generating' : ''}`}
                    onClick={(e) => handleGenerateComicPanel(entry, e)}
                    disabled={isGenerationDisabled(entry)}
                    title="Transform this story into a visual comic panel!"
                  >
                    {getGenerationButtonContent(entry)}
                  </button>
                  <p className="placeholder-text">✨ Click to visualize this tale!</p>
                </div>
              )}
              
              {/* Enhanced Audio Generation Section */}
              <div className="audio-section">
                {entry.tts_audio_url ? (
                  <div className="audio-preview">
                    <div className="audio-player-mini">
                      <audio controls>
                        <source src={entry.tts_audio_url} type="audio/mpeg" />
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                    <span className="audio-label">🎵 Oracle Narration</span>
                    {successNotifications.has(`${entry.id}-audio`) && (
                      <div className="success-flash">
                        <span>🎵 ✨ Voice Added!</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="audio-placeholder">
                    <button 
                      className={`generate-audio-btn ${generatingAudio.has(entry.id) ? 'generating' : ''}`}
                      onClick={(e) => handleGenerateAudio(entry, e)}
                      disabled={generatingAudio.has(entry.id)}
                      title="Let the Oracle narrate this cosmic tale!"
                    >
                      {generatingAudio.has(entry.id) ? (
                        <>🎵 Generating Audio...</>
                      ) : (
                        <>🎵 Generate Oracle Narration</>
                      )}
                    </button>
                    <p className="placeholder-text">🔮 Hear the Oracle's voice!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card-footer">
              <div className="lore-meta">
                <span className="date">{formatDate(entry.created_at)}</span>
                <span className="contributors">{entry.input_count} voices</span>
              </div>
              
              <div className="lore-stats">
                <button 
                  className="stat-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeEntry(entry.id);
                  }}
                >
                  💜 {entry.like_count}
                </button>
                <span className="stat">👁️ {entry.view_count}</span>
                <span className="stat">📤 {entry.share_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEntries.length === 0 && !isLoading && (
        <div className="no-entries">
          <div className="empty-icon">📜</div>
          <h3>No Lore Entries Found</h3>
          <p>The Oracle's archives are empty for your search criteria.</p>
          <p>Try adjusting your filters or contribute to the next lore cycle!</p>
        </div>
      )}



      {/* Oracle Lore Slideshow */}
      <OracleLoreSlideshow
        isOpen={showSlideshow}
        entries={filteredEntries}
        initialEntryId={slideshowInitialEntryId}
        onClose={() => setShowSlideshow(false)}
        onGenerateComicPanel={async (entry: LoreEntry) => {
          return new Promise<void>((resolve) => {
            handleGenerateComicPanel(entry, {} as React.MouseEvent);
            resolve();
          });
        }}
        onGenerateAudio={async (entry: LoreEntry) => {
          return new Promise<void>((resolve) => {
            handleGenerateAudio(entry);
            resolve();
          });
        }}
        onLike={async (entryId: string) => {
          return new Promise<void>((resolve) => {
            handleLikeEntry(entryId);
            resolve();
          });
        }}
        generatingPanels={generatingPanels}
        generatingAudio={generatingAudio}
      />
    </div>
  );
};