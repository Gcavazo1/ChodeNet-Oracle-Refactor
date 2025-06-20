import React, { useState, useEffect } from 'react';
import { X, Zap, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSIWS } from '../../lib/useSIWS';
import { supabase } from '../../lib/supabase';
import './RitualLab.css';

interface RitualBase {
  id: number;
  name: string;
  description: string;
  base_girth_cost: number;
  base_corruption: number;
  base_success_rate: number;
  ritual_type: string;
}

interface RitualIngredient {
  id: number;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  cost_modifier: number;
  success_modifier: number;
  corruption_modifier: number;
}

interface RitualLabProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RitualLab: React.FC<RitualLabProps> = ({ isOpen, onClose }) => {
  const { girthBalance, oracleShards, isAuthenticated } = useSIWS();
  const [selectedBase, setSelectedBase] = useState<RitualBase | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<RitualIngredient[]>([]);
  const [shardBoost, setShardBoost] = useState(0);
  const [ritualBases, setRitualBases] = useState<RitualBase[]>([]);
  const [ritualIngredients, setRitualIngredients] = useState<RitualIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load ritual bases and ingredients on mount
  useEffect(() => {
    if (isOpen) {
      loadRitualData();
    }
  }, [isOpen]);

  const loadRitualData = async () => {
    try {
      const [basesResult, ingredientsResult] = await Promise.all([
        supabase.from('ritual_bases').select('*').order('base_girth_cost'),
        supabase.from('ritual_ingredients').select('*').order('rarity', { ascending: false })
      ]);

      if (basesResult.data) setRitualBases(basesResult.data);
      if (ingredientsResult.data) setRitualIngredients(ingredientsResult.data);
    } catch (err) {
      console.error('Failed to load ritual data:', err);
      setError('Failed to load ritual data');
    }
  };

  const calculateTotalCost = () => {
    if (!selectedBase) return 0;
    let cost = selectedBase.base_girth_cost;
    selectedIngredients.forEach(ingredient => {
      cost *= ingredient.cost_modifier;
    });
    return Math.round(cost * 100) / 100;
  };

  const calculateSuccessRate = () => {
    if (!selectedBase) return 0;
    let rate = selectedBase.base_success_rate;
    selectedIngredients.forEach(ingredient => {
      rate += ingredient.success_modifier;
    });
    // Shard boost increases success rate
    rate += shardBoost * 2; // 2% per shard
    return Math.min(95, Math.max(5, rate)); // Cap between 5-95%
  };

  const calculateCorruption = () => {
    if (!selectedBase) return 0;
    let corruption = selectedBase.base_corruption;
    selectedIngredients.forEach(ingredient => {
      corruption += ingredient.corruption_modifier;
    });
    return Math.max(0, corruption);
  };

  const initiateRitual = async () => {
    if (!selectedBase || !isAuthenticated) return;

    const totalCost = calculateTotalCost();
    if (girthBalance && girthBalance.soft_balance < totalCost) {
      setError('Insufficient $GIRTH balance');
      return;
    }

    if (shardBoost > 0 && oracleShards && oracleShards.balance < shardBoost) {
      setError('Insufficient Oracle Shards');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: ritualError } = await supabase.functions.invoke('initiate-ritual', {
        body: {
          base_id: selectedBase.id,
          ingredient_ids: selectedIngredients.map(i => i.id),
          shard_boost: shardBoost
        }
      });

      if (ritualError) throw ritualError;

      setSuccess(`Ritual initiated! Ritual ID: ${data.ritual_id}`);
      setSelectedBase(null);
      setSelectedIngredients([]);
      setShardBoost(0);
      
      // Close modal after delay
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to initiate ritual');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredient = (ingredient: RitualIngredient) => {
    setSelectedIngredients(prev => {
      const isSelected = prev.find(i => i.id === ingredient.id);
      if (isSelected) {
        return prev.filter(i => i.id !== ingredient.id);
      } else {
        return [...prev, ingredient];
      }
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'rare': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRiskLevel = () => {
    const corruption = calculateCorruption();
    if (corruption >= 50) return { text: 'EXTREME', color: 'text-red-500' };
    if (corruption >= 30) return { text: 'HIGH', color: 'text-orange-500' };
    if (corruption >= 15) return { text: 'MODERATE', color: 'text-yellow-500' };
    return { text: 'LOW', color: 'text-green-500' };
  };

  if (!isOpen) return null;

  return (
    <div className="ritual-lab-overlay">
      <div className="ritual-lab-modal">
        <div className="ritual-lab-header">
          <h2 className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            Ritual Laboratory
          </h2>
          <button onClick={onClose} className="close-button">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="ritual-lab-content">
            <div className="auth-required">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-center text-gray-300">
                Connect your wallet and authenticate to access the Ritual Laboratory
              </p>
            </div>
          </div>
        ) : (
          <div className="ritual-lab-content">
            {/* Coming Soon Overlay */}
            <div className="coming-soon-overlay">
              <div className="coming-soon-content">
                <div className="construction-icon">🚧</div>
                <h3>Ritual Laboratory Under Construction</h3>
                <p>The Oracle's most powerful ritual system is being forged in the digital realm...</p>
                <p className="eta">Expected completion: Soon™</p>
                <div className="features-preview">
                  <h4>Coming Features:</h4>
                  <ul>
                    <li>✨ Custom ritual crafting with ingredients</li>
                    <li>⚡ Corruption risk management</li>
                    <li>💎 Oracle Shards boost system</li>
                    <li>🎯 Guaranteed prophecy outcomes</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Original content (hidden behind overlay) */}
            <div className="ritual-content-hidden">
              {/* Balance Display */}
              <div className="balance-display">
                <div className="balance-item">
                  <span>$GIRTH:</span>
                  <span className="text-yellow-400">{girthBalance?.soft_balance.toFixed(6) || '0'}</span>
                </div>
                <div className="balance-item">
                  <span>Oracle Shards:</span>
                  <span className="text-blue-400">{oracleShards?.balance || 0}</span>
                </div>
              </div>

              {/* Ritual Base Selection */}
              <div className="ritual-section">
                <h3>Select Ritual Base</h3>
                <div className="ritual-bases">
                  {ritualBases.map(base => (
                    <div
                      key={base.id}
                      className={`ritual-base ${selectedBase?.id === base.id ? 'selected' : ''}`}
                      onClick={() => setSelectedBase(base)}
                    >
                      <h4>{base.name}</h4>
                      <p>{base.description}</p>
                      <div className="base-stats">
                        <span>Cost: {base.base_girth_cost} $GIRTH</span>
                        <span>Success: {base.base_success_rate}%</span>
                        <span>Corruption: {base.base_corruption}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredient Selection */}
              {selectedBase && (
                <div className="ritual-section">
                  <h3>Select Ingredients (Optional)</h3>
                  <div className="ritual-ingredients">
                    {ritualIngredients.map(ingredient => (
                      <div
                        key={ingredient.id}
                        className={`ritual-ingredient ${getRarityColor(ingredient.rarity)} ${
                          selectedIngredients.find(i => i.id === ingredient.id) ? 'selected' : ''
                        }`}
                        onClick={() => toggleIngredient(ingredient)}
                      >
                        <h4>{ingredient.name}</h4>
                        <p>{ingredient.description}</p>
                        <div className="ingredient-stats">
                          <span>Rarity: {ingredient.rarity}</span>
                          <span>Cost: ×{ingredient.cost_modifier}</span>
                          <span>Success: +{ingredient.success_modifier}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shard Boost */}
              {selectedBase && (
                <div className="ritual-section">
                  <h3>Oracle Shard Boost</h3>
                  <div className="shard-boost">
                    <label>
                      Shards to spend (+2% success per shard):
                      <input
                        type="number"
                        min="0"
                        max={oracleShards?.balance || 0}
                        value={shardBoost}
                        onChange={(e) => setShardBoost(parseInt(e.target.value) || 0)}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Ritual Summary */}
              {selectedBase && (
                <div className="ritual-summary">
                  <h3>Ritual Summary</h3>
                  <div className="summary-stats">
                    <div className="stat-item">
                      <span>Total Cost:</span>
                      <span className="text-yellow-400">{calculateTotalCost()} $GIRTH</span>
                    </div>
                    <div className="stat-item">
                      <span>Success Rate:</span>
                      <span className="text-green-400">{calculateSuccessRate()}%</span>
                    </div>
                    <div className="stat-item">
                      <span>Corruption Risk:</span>
                      <span className={getRiskLevel().color}>{getRiskLevel().text}</span>
                    </div>
                    <div className="stat-item">
                      <span>Shard Cost:</span>
                      <span className="text-blue-400">{shardBoost} Shards</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="message error">
                  <AlertTriangle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="message success">
                  <CheckCircle className="w-5 h-5" />
                  {success}
                </div>
              )}

              {/* Action Button */}
              {selectedBase && (
                <button
                  className="initiate-button"
                  onClick={initiateRitual}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  {isLoading ? 'Initiating Ritual...' : 'Initiate Ritual'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 