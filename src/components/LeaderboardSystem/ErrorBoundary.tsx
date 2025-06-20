import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Oracle Leaderboard Error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="relative">
          {/* Error Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 via-orange-400/5 to-red-400/10 rounded-3xl blur-xl"></div>
          
          <div className="relative bg-gradient-to-br from-slate-800/60 via-red-900/30 to-slate-800/60 backdrop-blur-xl border border-red-400/20 rounded-3xl p-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-20 rounded-full blur-2xl"></div>
              <AlertTriangle className="relative h-16 w-16 mx-auto text-red-400" />
            </div>
            
            <h3 className="text-2xl font-semibold text-red-400 mb-4 flex items-center justify-center space-x-2">
              <span>Oracle Vision Disrupted</span>
              <Sparkles className="h-6 w-6 text-gold-400" style={{ color: '#ffd700' }} />
            </h3>
            
            <p className="text-slate-300 text-lg mb-6">
              The mystical energies have encountered an unexpected disturbance.
            </p>
            
            <div className="bg-gradient-to-r from-slate-700/30 via-red-800/20 to-slate-700/30 backdrop-blur-sm rounded-2xl p-6 border border-red-400/20 mb-8">
              <p className="text-slate-400 text-sm mb-4">
                🔮 The Oracle is working to restore the connection to the mystical realm.
              </p>
              {this.state.error && (
                <details className="text-xs text-slate-500 font-mono">
                  <summary className="cursor-pointer hover:text-slate-400 transition-colors">
                    Technical Details
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-600/30 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            
            <button
              onClick={this.handleRetry}
              className="group relative overflow-hidden bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 backdrop-blur-sm border border-red-400/30 text-white px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-red-400/25"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center space-x-3">
                <RefreshCw className="h-5 w-5 text-red-400" />
                <span className="font-medium">Restore Oracle Connection</span>
              </div>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;