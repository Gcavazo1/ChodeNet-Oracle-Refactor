import React, { useState } from 'react';
import { Users, Eye, Wallet, Trophy, Star, Activity, Zap, Shield } from 'lucide-react';
import { NFTShowcaseModal, NFT } from '../NFTShowcaseModal';

interface CommunityMember {
  id: string;
  walletAddress: string;
  displayName?: string;
  avatar?: string;
  nftCount: number;
  totalValue: number;
  topRarity: string;
  joinedDate: string;
  isVerified?: boolean;
}

interface CommunityBrowserProps {
  walletConnected?: boolean;
  currentWalletAddress?: string | null;
  theme?: 'dark' | 'light' | 'synthwave';
}

// --- Demo data (will be replaced with backend-driven content) ---
const COMMUNITY_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    walletAddress: 'DemoWallet123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz',
    displayName: 'CryptoKnight',
    nftCount: 47,
    totalValue: 1250.5,
    topRarity: 'Mythic',
    joinedDate: '2024-01-15',
    isVerified: true
  },
  {
    id: '2',
    walletAddress: 'EliteCollector987zyx654wvu321tsr098qpo765nml432kji109hgf876edc543ba',
    displayName: 'DragonMaster',
    nftCount: 23,
    totalValue: 890.2,
    topRarity: 'Legendary',
    joinedDate: '2024-02-03',
    isVerified: true
  },
  {
    id: '3',
    walletAddress: 'MysticTrader456def123abc789ghi456jkl123mno789pqr456stu123vwx789yz',
    displayName: 'ShadowWeaver',
    nftCount: 31,
    totalValue: 675.8,
    topRarity: 'Epic',
    joinedDate: '2024-02-20',
    isVerified: false
  },
  {
    id: '4',
    walletAddress: 'LegendaryHunter789abc456def123ghi789jkl456mno123pqr789stu456vwx123yz',
    displayName: 'StormBringer',
    nftCount: 19,
    totalValue: 445.3,
    topRarity: 'Legendary',
    joinedDate: '2024-03-10',
    isVerified: true
  },
  {
    id: '5',
    walletAddress: 'ArtifactSeeker321ghi789def456abc123jkl789mno456pqr123stu789vwx456yz',
    displayName: 'VoidWalker',
    nftCount: 38,
    totalValue: 1120.7,
    topRarity: 'Mythic',
    joinedDate: '2024-03-25',
    isVerified: false
  }
];

const themes = {
  dark: {
    name: 'Dark Trophy',
    colors: {
      primary: 'rgb(251, 191, 36)',
      secondary: 'rgb(249, 115, 22)',
      accent: 'rgb(168, 85, 247)',
      background: 'rgb(0, 0, 0)',
      surface: 'rgb(17, 24, 39)',
      text: 'rgb(255, 255, 255)',
      textSecondary: 'rgb(156, 163, 175)',
      border: 'rgb(251, 191, 36, 0.2)',
      glow: 'rgb(251, 191, 36, 0.1)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(245, 158, 11)'
    }
  },
  light: {
    name: 'Royal Light',
    colors: {
      primary: 'rgb(59, 130, 246)',
      secondary: 'rgb(147, 51, 234)',
      accent: 'rgb(236, 72, 153)',
      background: 'rgb(249, 250, 251)',
      surface: 'rgb(255, 255, 255)',
      text: 'rgb(17, 24, 39)',
      textSecondary: 'rgb(75, 85, 99)',
      border: 'rgb(59, 130, 246, 0.3)',
      glow: 'rgb(59, 130, 246, 0.1)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(245, 158, 11)'
    }
  },
  synthwave: {
    name: 'Synthwave',
    colors: {
      primary: 'rgb(236, 72, 153)',
      secondary: 'rgb(168, 85, 247)',
      accent: 'rgb(6, 182, 212)',
      background: 'rgb(15, 23, 42)',
      surface: 'rgb(30, 41, 59)',
      text: 'rgb(248, 113, 113)',
      textSecondary: 'rgb(196, 181, 253)',
      border: 'rgb(236, 72, 153, 0.4)',
      glow: 'rgb(236, 72, 153, 0.2)',
      success: 'rgb(34, 197, 94)',
      warning: 'rgb(245, 158, 11)'
    }
  }
} as const;

type ThemeKey = keyof typeof themes;

const getRarityColor = (rarity: string, currentTheme: ThemeKey) => {
  const theme = themes[currentTheme];
  switch (rarity) {
    case 'Mythic': return theme.colors.accent;
    case 'Legendary': return theme.colors.primary;
    case 'Epic': return theme.colors.secondary;
    case 'Rare': return theme.colors.success;
    default: return theme.colors.textSecondary;
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'Mythic': return <Star className="w-4 h-4 fill-current" />;
    case 'Legendary': return <Trophy className="w-4 h-4" />;
    case 'Epic': return <Star className="w-4 h-4" />;
    case 'Rare': return <Star className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

export const CommunityBrowser: React.FC<CommunityBrowserProps> = ({
  walletConnected = false,
  currentWalletAddress,
  theme: currentTheme = 'dark'
}) => {
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
  const [showOwnShowcase, setShowOwnShowcase] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const theme = themes[currentTheme];

  const handleMemberClick = (member: CommunityMember) => {
    setSelectedMember(member);
    setShowOwnShowcase(false);
    setIsModalOpen(true);
  };

  const handleViewOwnShowcase = () => {
    setSelectedMember(null);
    setShowOwnShowcase(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
    setShowOwnShowcase(false);
  };

  const formatWalletAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;
  const formatValue = (value: number) => `${value.toFixed(1)} SOL`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: `linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.surface})` }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div
              className="p-4 rounded-2xl border"
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`, borderColor: `${theme.colors.primary}30` }}
            >
              <Users className="w-12 h-12" style={{ color: theme.colors.primary }} />
            </div>
          </div>
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Community Showcase
          </h1>
          <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: theme.colors.textSecondary }}>
            Explore legendary collections from our community members. Discover rare NFTs, compare portfolios, and get inspired by the best collectors in the ecosystem.
          </p>
        </div>

        {/* Technology Stack Showcase */}
        <div className="mb-8 flex items-center justify-center space-x-6">
          <div
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border"
            style={{ backgroundColor: `${theme.colors.primary}20`, borderColor: `${theme.colors.primary}30` }}
          >
            <Zap className="w-5 h-5" style={{ color: theme.colors.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
              Switchboard Oracle
            </span>
          </div>
          <div
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border"
            style={{ backgroundColor: `${theme.colors.accent}20`, borderColor: `${theme.colors.accent}30` }}
          >
            <Activity className="w-5 h-5" style={{ color: theme.colors.accent }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.accent }}>
              Solana Network
            </span>
          </div>
          <div
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border"
            style={{ backgroundColor: `${theme.colors.secondary}20`, borderColor: `${theme.colors.secondary}30` }}
          >
            <Shield className="w-5 h-5" style={{ color: theme.colors.secondary }} />
            <span className="text-sm font-medium" style={{ color: theme.colors.secondary }}>
              NFT Standard
            </span>
          </div>
        </div>

        {/* View Own Showcase Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleViewOwnShowcase}
            disabled={!walletConnected}
            className="px-8 py-4 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            style={{
              background: walletConnected ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` : theme.colors.surface,
              color: walletConnected ? (currentTheme === 'light' ? 'white' : theme.colors.background) : theme.colors.textSecondary,
              boxShadow: walletConnected ? `0 10px 25px -5px ${theme.colors.glow}` : 'none',
              border: !walletConnected ? `1px solid ${theme.colors.border}` : 'none'
            }}
          >
            <Wallet className="w-5 h-5" />
            <span>{walletConnected ? 'View My Showcase' : 'Connect Wallet to View Your Collection'}</span>
          </button>
          {walletConnected && currentWalletAddress && (
            <p className="mt-2 text-sm" style={{ color: theme.colors.textSecondary }}>
              Connected: {formatWalletAddress(currentWalletAddress)}
            </p>
          )}
        </div>
      </div>

      {/* Community Members Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Featured Collectors
          </h2>
          <p style={{ color: theme.colors.textSecondary }}>Click on any collector to explore their NFT showcase</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COMMUNITY_MEMBERS.map((member) => (
            <div
              key={member.id}
              onClick={() => handleMemberClick(member)}
              className="group relative p-6 rounded-2xl border cursor-pointer transform transition-all duration-500 hover:scale-105 hover:z-10"
              style={{ background: `linear-gradient(135deg, ${theme.colors.surface}80, ${theme.colors.background}80)`, borderColor: theme.colors.border, boxShadow: `0 4px 15px -3px ${theme.colors.glow}` }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMemberClick(member);
                }
              }}
              aria-label={`View ${member.displayName || 'collector'}'s NFT collection`}
            >
              {/* Hover Glow Effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`, filter: 'blur(10px)' }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                      style={{ background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`, borderColor: theme.colors.primary }}
                    >
                      <Users className="w-6 h-6" style={{ color: theme.colors.primary }} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold" style={{ color: theme.colors.text }}>
                          {member.displayName || 'Anonymous Collector'}
                        </h3>
                        {member.isVerified && (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.success }}>
                            <Star className="w-3 h-3 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>
                        {formatWalletAddress(member.walletAddress)}
                      </p>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: theme.colors.primary }} />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.surface}50` }}>
                    <div className="text-lg font-bold" style={{ color: theme.colors.text }}>
                      {member.nftCount}
                    </div>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      NFTs
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${theme.colors.surface}50` }}>
                    <div className="text-lg font-bold" style={{ color: theme.colors.text }}>
                      {formatValue(member.totalValue)}
                    </div>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      Value
                    </div>
                  </div>
                </div>

                {/* Top Rarity Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Highest Rarity:</span>
                    <div
                      className="flex items-center space-x-1 px-2 py-1 rounded-lg"
                      style={{ backgroundColor: `${getRarityColor(member.topRarity, currentTheme)}20`, color: getRarityColor(member.topRarity, currentTheme) }}
                    >
                      {getRarityIcon(member.topRarity)}
                      <span className="text-xs font-bold">{member.topRarity}</span>
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  Joined {formatDate(member.joinedDate)}
                </div>

                {/* Hover Action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: `${theme.colors.primary}90`, color: currentTheme === 'light' ? 'white' : theme.colors.background }}
                  >
                    View Collection
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NFT Showcase Modal */}
      <NFTShowcaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        walletConnected={walletConnected}
        walletAddress={currentWalletAddress || undefined}
        viewingWalletAddress={selectedMember?.walletAddress}
        theme={currentTheme}
        enableRealTimeData={true}
        onNFTSelect={(nft: NFT) => {
          console.log('NFT selected:', nft);
        }}
        branding={selectedMember ? { title: `${selectedMember.displayName || 'Collector'}'s Showcase`, subtitle: `${selectedMember.nftCount} NFTs • ${formatValue(selectedMember.totalValue)} Portfolio Value` } : undefined}
      />
    </div>
  );
};

export default CommunityBrowser; 