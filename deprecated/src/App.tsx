import React, { useState, useEffect } from 'react';
import { Monitor, Radio } from 'lucide-react';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProphecyChamber } from './components/ProphecyChamber/ProphecyChamber';
import { ApocryphalScrolls } from './components/ApocryphalScrolls/ApocryphalScrolls';
import { RitualRequests } from './components/RitualRequests/RitualRequests';
import { DeveloperPanel } from './components/DeveloperPanel/DeveloperPanel';
import { DebugPanel } from './components/DebugPanel/DebugPanel';
import { SpecialReport } from './components/SpecialReport/SpecialReport';
import { Toast } from './components/Toast/Toast';
import { setupGameEventListener } from './lib/gameEventHandler';
import { useGirthIndexStore } from './lib/girthIndexStore';
import { useNotificationStore } from './lib/store';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'prophecy' | 'scrolls' | 'ritual'>('prophecy');
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const {
    girthResonance,
    tapSurgeIndex,
    legionMorale,
    stabilityStatus,
    isLoading,
    error,
    setupRealtimeSubscription,
    updateMetrics
  } = useGirthIndexStore();

  const {
    isNewSpecialReportAvailable,
    clearSpecialReportNotification
  } = useNotificationStore();

  useEffect(() => {
    const cleanup = setupGameEventListener();
    return cleanup;
  }, []);

  useEffect(() => {
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  useEffect(() => {
    if (isNewSpecialReportAvailable) {
      setShowToast(true);
    }
  }, [isNewSpecialReportAvailable]);

  const handleSpecialReportClick = () => {
    setIsReportOpen(true);
    clearSpecialReportNotification();
    setShowToast(false);
  };

  if (isLoading) {
    return <div className="loading">Loading Girth Index...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Monitor size={32} color="#ff00ff" />
          <span>CHODE-NET ORACLE</span>
        </div>
        <div className="header-controls">
          <button 
            className={`special-report-button ${isNewSpecialReportAvailable ? 'new-report' : ''}`}
            onClick={handleSpecialReportClick}
          >
            <Radio size={18} className="report-icon" />
            SPECIAL REPORT
            {isNewSpecialReportAvailable && <div className="notification-badge" />}
          </button>
          <button 
            className="dev-panel-toggle"
            onClick={() => setShowDevPanel(!showDevPanel)}
          >
            {showDevPanel ? 'HIDE CONTROLS' : 'SHOW CONTROLS'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="oracle-layout">
          <section className="top-panel">
            <div className="panel-controls">
              <button 
                className={currentView === 'prophecy' ? 'active' : ''} 
                onClick={() => setCurrentView('prophecy')}
              >
                PROPHECY CHAMBER
              </button>
              <button 
                className={currentView === 'scrolls' ? 'active' : ''} 
                onClick={() => setCurrentView('scrolls')}
              >
                APOCRYPHAL SCROLLS
              </button>
              <button 
                className={currentView === 'ritual' ? 'active' : ''} 
                onClick={() => setCurrentView('ritual')}
              >
                RITUAL REQUESTS
              </button>
            </div>

            <div className="panel-content">
              {currentView === 'prophecy' && (
                <ProphecyChamber 
                  currentTopic={currentTopic}
                  onProphecyReceived={() => setCurrentTopic(null)}
                />
              )}
              {currentView === 'scrolls' && <ApocryphalScrolls />}
              {currentView === 'ritual' && (
                <RitualRequests
                  currentTopic={currentTopic}
                  onTopicSelect={setCurrentTopic}
                />
              )}
            </div>
          </section>

          <section className="game-container">
            <iframe 
              src="about:blank"
              title="CHODE Tapper Game"
              className="game-frame"
            />
          </section>

          <section className="bottom-panel">
            <Dashboard 
              girthResonance={girthResonance}
              tapSurgeIndex={tapSurgeIndex}
              legionMorale={legionMorale}
              stabilityStatus={stabilityStatus}
            />
          </section>
        </div>

        {showDevPanel && (
          <DeveloperPanel 
            girthResonance={girthResonance}
            tapSurgeIndex={tapSurgeIndex}
            legionMorale={legionMorale}
            stabilityStatus={stabilityStatus}
            onGirthChange={(value) => updateMetrics({ girthResonance: value })}
            onTapSurgeChange={(value) => updateMetrics({ tapSurgeIndex: value })}
            onMoraleChange={(value) => updateMetrics({ legionMorale: value })}
            onStabilityChange={(value) => updateMetrics({ stabilityStatus: value })}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-text">
          CHODE-NET ORACLE v0.1 - AUTHORIZED ACCESS ONLY
        </div>
        <div className="footer-status">
          <div className="status-indicator"></div>
          SECURE CONNECTION ESTABLISHED
        </div>
      </footer>

      <SpecialReport 
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <DebugPanel />

      {showToast && (
        <Toast
          message="🚨 CHODE-NET ALERT! A new Oracle Special Report has been issued! Click to view!"
          onClick={handleSpecialReportClick}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default App;