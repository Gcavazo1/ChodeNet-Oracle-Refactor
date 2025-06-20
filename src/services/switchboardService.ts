/*
 * Lightweight stub for the Switchboard oracle service used by the NFT Community Showcase.
 * This mock implements the minimal surface-area required for the UI components to compile
 * without pulling in the entire @switchboard-xyz dependency graph during early integration.
 *
 * When we are ready to enable real oracle data we can swap this file with the full
 * implementation from the original repository.
 */

import { Connection, PublicKey } from '@solana/web3.js';
import React from 'react';

/* ---------- Types replicated from the original service ---------- */

export interface PricePoint {
  timestamp: Date;
  price: number;
  volume: number;
}

export interface MarketAlert {
  type: 'price_spike' | 'volume_surge' | 'volatility_high' | 'liquidity_low';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface MarketData {
  floorPrice: number;
  volume24h: number;
  priceChange24h: number;
  lastUpdated: Date;
  source: string;
  confidence: number;
  // optional / advanced fields used by the UI
  feedAddress?: string;
  marketCap?: number;
  holders?: number;
  avgSalePrice?: number;
  volatility?: number;
  liquidityScore?: number;
  trendDirection?: 'up' | 'down' | 'stable';
  priceHistory?: PricePoint[];
  alerts?: MarketAlert[];
}

export interface BatchMarketDataResult {
  data: Record<string, MarketData>;
  errors: Record<string, string>;
  performance: {
    totalTime: number;
    successRate: number;
    cacheHitRate: number;
  };
}

/* ---------- Simple deterministic mock implementation ---------- */

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const generateMockMarketData = (collectionKey: string): MarketData => {
  const hash = Array.from(collectionKey).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const basePrice = (hash % 100) / 10 + 0.5; // 0.5 – 10.5 SOL
  const priceChange = randomBetween(-5, 5);
  const volume24h = Math.floor(randomBetween(100, 1000));

  return {
    floorPrice: Number(basePrice.toFixed(4)),
    volume24h,
    priceChange24h: Number(priceChange.toFixed(2)),
    lastUpdated: new Date(),
    source: 'Mock Switchboard',
    confidence: 0.9,
    trendDirection: priceChange > 1 ? 'up' : priceChange < -1 ? 'down' : 'stable',
  };
};

/* ---------- Minimal service façade ---------- */

class MockSwitchboardService {
  async getCollectionFloorPrice(collectionAddress: string): Promise<MarketData> {
    // Simulate small network latency
    await new Promise((r) => setTimeout(r, 300));
    return generateMockMarketData(collectionAddress);
  }

  async batchGetMarketData(collectionAddresses: string[]): Promise<BatchMarketDataResult> {
    const data: Record<string, MarketData> = {};
    for (const addr of collectionAddresses) {
      data[addr] = generateMockMarketData(addr);
    }
    return {
      data,
      errors: {},
      performance: { totalTime: 0, successRate: 1, cacheHitRate: 0 },
    };
  }

  // no-op helpers so the API surface matches the original
  subscribeToMarketData() {
    return () => void 0;
  }

  getPerformanceMetrics() {
    return { totalRequests: 0, successfulRequests: 0, cacheHits: 0, averageResponseTime: 0, errorRate: 0 };
  }

  hasOracleFeed() {
    return false;
  }
}

export const switchboardService = new MockSwitchboardService();

/* ---------- React hooks ---------- */

// Note: useCollectionMarketData hook is defined at the end of the file with enhanced features

/* ---------- Enhanced Switchboard V3 configuration ---------- */

// Enhanced Switchboard V3 configuration with multiple RPC endpoints for reliability
const SWITCHBOARD_PROGRAM_ID = new PublicKey('SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f');
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana'
];

// Real Switchboard feed addresses for popular NFT collections
const COLLECTION_FEED_MAPPING: Record<string, CollectionFeedConfig> = {
  'degods': {
    feedAddress: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
    name: 'DeGods',
    symbol: 'DEGODS',
    type: 'floor_price',
    updateFrequency: 300
  },
  'mythical_weapons': {
    feedAddress: 'MythWeap1nsFeedAddr3ssForDemoCollection123456789',
    name: 'Mythical Weapons',
    symbol: 'MYTH',
    type: 'floor_price',
    updateFrequency: 300
  },
  'mystical_creatures': {
    feedAddress: 'MystCrea7uresFeedAddr3ssForDemoCollection123456789',
    name: 'Mystical Creatures',
    symbol: 'MYST',
    type: 'floor_price',
    updateFrequency: 300
  }
};

interface CollectionFeedConfig {
  feedAddress: string;
  name: string;
  symbol: string;
  type: 'floor_price' | 'volume_weighted' | 'marketplace_aggregate';
  updateFrequency: number;
}

export interface SwitchboardFeedData {
  value: number;
  timestamp: Date;
  confidence: number;
  feedAddress: string;
  roundId: number;
  variance?: number;
  standardDeviation?: number;
  minResponse?: number;
  maxResponse?: number;
  oracleCount?: number;
}

/**
 * Enhanced Switchboard Oracle Service for Oracle NFT Showcase
 */
export class SwitchboardService {
  private connections: Connection[];
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  constructor(rpcEndpoints: string[] = RPC_ENDPOINTS) {
    this.connections = rpcEndpoints.map(endpoint => 
      new Connection(endpoint, { commitment: 'confirmed' })
    );
  }

  async getCollectionFloorPrice(collectionAddress: string): Promise<MarketData | null> {
    try {
      // Check cache first
      const cached = this.getCachedData(collectionAddress);
      if (cached) return cached;

      // Get feed configuration
      const feedConfig = this.getFeedConfigForCollection(collectionAddress);
      if (!feedConfig) {
        return this.getEnhancedMockMarketData(collectionAddress);
      }

      // For demo purposes, return enhanced mock data
      const marketData = this.getEnhancedMockMarketData(collectionAddress);
      this.setCachedData(collectionAddress, marketData);
      
      return marketData;

    } catch (error) {
      console.error('Error fetching collection floor price:', error);
      return this.getEnhancedMockMarketData(collectionAddress);
    }
  }

  private getEnhancedMockMarketData(collectionAddress: string): MarketData {
    const hash = this.simpleHash(collectionAddress);
    const basePrice = 0.5 + (hash % 100) / 10;
    const volatility = 0.15 + (hash % 25) / 100;
    
    const priceHistory = this.generatePriceHistory(basePrice);
    const trendDirection = this.analyzeTrend(priceHistory);
    const liquidityScore = 0.6 + (hash % 40) / 100;
    
    return {
      floorPrice: Number(basePrice.toFixed(3)),
      volume24h: Math.floor((hash % 500) + 100),
      priceChange24h: Number(((hash % 200) - 100) / 5),
      lastUpdated: new Date(),
      source: 'Oracle Demo Data (Coming Soon: Live Switchboard)',
      confidence: 0.85,
      marketCap: basePrice * (hash % 10000 + 1000),
      holders: Math.floor(hash % 5000 + 500),
      avgSalePrice: basePrice * (1 + (hash % 20 - 10) / 100),
      volatility: volatility,
      liquidityScore: liquidityScore,
      trendDirection: trendDirection,
      priceHistory: priceHistory,
      alerts: []
    };
  }

  private generatePriceHistory(currentPrice: number): PricePoint[] {
    const history: PricePoint[] = [];
    let price = currentPrice;
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      const volatility = (Math.random() - 0.5) * 0.1;
      price = price * (1 + volatility);
      const volume = Math.random() * 100 + 10;
      
      history.push({ timestamp, price, volume });
    }
    
    return history;
  }

  private analyzeTrend(priceHistory: PricePoint[]): 'up' | 'down' | 'stable' {
    if (priceHistory.length < 2) return 'stable';
    
    const recent = priceHistory.slice(-6);
    const trend = recent[recent.length - 1].price - recent[0].price;
    const threshold = recent[0].price * 0.05;
    
    if (trend > threshold) return 'up';
    if (trend < -threshold) return 'down';
    return 'stable';
  }

  private getFeedConfigForCollection(collectionAddress: string): CollectionFeedConfig | null {
    const normalizedAddress = collectionAddress.toLowerCase().replace(/\s+/g, '_');
    return COLLECTION_FEED_MAPPING[normalizedAddress] || null;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private getCachedData(key: string): MarketData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) return null;
    
    return cached.data;
  }

  private setCachedData(key: string, data: MarketData): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  hasOracleFeed(collectionAddress: string): boolean {
    return this.getFeedConfigForCollection(collectionAddress) !== null;
  }
}

interface CacheEntry {
  data: MarketData;
  timestamp: number;
}

// Create enhanced service instance
const enhancedSwitchboardService = new SwitchboardService();

/**
 * React hook for collection market data
 * Enhanced version with Oracle integration capabilities
 */
export const useCollectionMarketData = (
  collectionAddress: string | null,
  options: {
    refreshInterval?: number;
    enableRealTime?: boolean;
    retryOnError?: boolean;
  } = {}
) => {
  const { refreshInterval = 30000, enableRealTime = false, retryOnError = true } = options;

  const [data, setData] = React.useState<MarketData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLive, setIsLive] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    if (!collectionAddress) {
      setData(null);
      setIsLive(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const marketData = await enhancedSwitchboardService.getCollectionFloorPrice(collectionAddress);
      setData(marketData);
      setIsLive(false); // Demo mode
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionAddress]);

  React.useEffect(() => {
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isLive,
    hasOracleFeed: collectionAddress ? enhancedSwitchboardService.hasOracleFeed(collectionAddress) : false,
    performance: { totalRequests: 0, successfulRequests: 0, cacheHits: 0, averageResponseTime: 0 }
  };
}; 