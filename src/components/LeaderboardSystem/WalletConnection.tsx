import React from 'react';
import { Wallet, WalletCards, Zap, LogOut, Sparkles } from 'lucide-react';
import { useLeaderboardStore } from '../../store/leaderboardStore';

const WalletConnection: React.FC = () => {
  const { isWalletConnected, connectedWallet, connectWallet, disconnectWallet } = useLeaderboardStore();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isWalletConnected && connectedWallet) {
    return (
      <div className="group relative">
        {/* Connected Wallet Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative bg-gradient-to-br from-slate-800/80 via-green-900/40 to-slate-800/80 backdrop-blur-xl border border-green-400/30 rounded-2xl p-4 flex items-center space-x-4">
          {/* Oracle Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-sm opacity-60"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-xl border border-green-400/40 flex items-center justify-center">
              <WalletCards className="h-5 w-5 text-green-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-gold-400" style={{ color: '#ffd700' }} />
              <span className="text-sm font-medium text-green-400">Oracle Connected</span>
            </div>
            <p className="text-xs text-slate-300 font-mono bg-slate-800/50 px-2 py-1 rounded-lg border border-white/10 mt-1">
              {formatAddress(connectedWallet)}
            </p>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="group/btn relative overflow-hidden bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 backdrop-blur-sm border border-red-400/30 text-red-400 p-2 rounded-xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <LogOut className="relative h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="group relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 backdrop-blur-sm border border-cyan-400/30 text-white px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center space-x-3">
        <Wallet className="h-5 w-5 text-cyan-400" />
        <span className="font-medium">Connect Oracle Wallet</span>
        <Zap className="h-4 w-4 text-gold-400" style={{ color: '#ffd700' }} />
      </div>
    </button>
  );
};

export default WalletConnection;