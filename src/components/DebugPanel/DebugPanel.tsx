import React from 'react';
import { Bug, X, Trash2 } from 'lucide-react';
import { useDebugStore } from '../../lib/store';
import './DebugPanel.css';

export const DebugPanel: React.FC = () => {
  const { isDebugMode, eventLogs, toggleDebugMode, clearEventLogs } = useDebugStore();

  if (!isDebugMode) {
    return (
      <button
        onClick={toggleDebugMode}
        className="debug-toggle-button"
        title="Enable Debug Mode"
      >
        <Bug size={20} />
      </button>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-panel-header">
        <div className="debug-title">
          <Bug size={20} />
          <h3>Debug Console</h3>
        </div>
        <div className="debug-controls">
          <button
            onClick={clearEventLogs}
            className="clear-logs-button"
            title="Clear Logs"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={toggleDebugMode}
            className="close-button"
            title="Close Debug Panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="event-logs">
        {eventLogs.map((log) => (
          <div
            key={log.id}
            className={`log-entry ${log.type}`}
          >
            <span className="log-timestamp">
              {log.timestamp.toLocaleTimeString()}
            </span>
            <span className="log-message">{log.message}</span>
          </div>
        ))}
        {eventLogs.length === 0 && (
          <div className="no-logs">No events logged yet</div>
        )}
      </div>
    </div>
  );
};