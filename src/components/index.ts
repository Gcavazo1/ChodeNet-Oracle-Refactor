// Oracle Frontend Components
export { OracleHeader } from './OracleHeader/OracleHeader';
export { WalletConnector } from './WalletConnector/WalletConnector';
export { SmartAlertsBar, type Alert } from './SmartAlertsBar/SmartAlertsBar';
export { CollapsibleGameContainer, type GameState, type GameMessage } from './CollapsibleGameContainer/CollapsibleGameContainer';
// OracleMetricsSystem component removed - functionality consolidated into NewDashboard
export { type MetricData, type MetricCategory } from '../lib/oracleMetricsTypes';
export { NewDashboard } from './Dashboard/NewDashboard';
export { CommunityLoreInput } from './CommunityLoreInput/CommunityLoreInput';
export { LoreArchive } from './LoreArchive/LoreArchive';
export { ProphecyChamber } from './ProphecyChamber/ProphecyChamber';
export { ApocryphalScrolls } from './ApocryphalScrolls/ApocryphalScrolls';
export { RitualRequests } from './RitualRequests/RitualRequests';

// Leaderboard System Components
export * from './LeaderboardSystem';

// Community Features Components  
export * from './CommunityFeatures';

// Legacy components (to be refactored or replaced)
// Note: Dashboard component has been replaced by NewDashboard 

export { CommunityGirthTracker } from './CommunityMetrics/CommunityGirthTracker';
export { PixelBorder, PixelText, PixelDivider } from './PixelArt/PixelBorder';
export { SpecialReport } from './SpecialReport/SpecialReport';
export { TokenInfoPanel } from './TokenInfoPanel/TokenInfoPanel';
export { NFTShowcaseModal } from './NFTShowcaseModal';
export { PlayerProfilePanel } from './PlayerProfilePanel/PlayerProfilePanel';
export { ProfileManager } from './ProfileManager/ProfileManager';
export { default as AIStatusDashboard } from './AIStatusDashboard/AIStatusDashboard';

// Community features
export { CommunityShowcaseModal } from './CommunityFeatures/CommunityShowcaseModal';
export { CommunityLeaderboardModal } from './LeaderboardSystem/CommunityLeaderboardModal';
export { LiveFeedCard } from './CommunityFeatures/LiveFeedCard';

// Oracle Referendum
export { OracleReferendumModal, ReferendumCard } from './OracleReferendum/index';

// Admin
export { AdminPage } from './AdminPanel/AdminPage';

// Intro
export { IntroSequence } from './IntroSequence'; 