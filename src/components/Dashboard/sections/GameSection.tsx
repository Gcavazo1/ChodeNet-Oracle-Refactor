import React from 'react';
import { CollapsibleGameContainer, GameState, GameMessage } from '../../CollapsibleGameContainer/CollapsibleGameContainer';
import { PlayerProfilePanel } from '../../PlayerProfilePanel/PlayerProfilePanel';

interface GameSectionProps {
  gameDocked: boolean;
  onGameStateChange: (state: GameState) => void;
  onGameMessage: (message: GameMessage) => void;
  onDockToggle: (docked: boolean) => void;
}

export const GameSection: React.FC<GameSectionProps> = ({
  gameDocked,
  onGameStateChange,
  onGameMessage,
  onDockToggle
}) => {
  return (
    <div className="section-content game-feed flex gap-6">
      <CollapsibleGameContainer
        className="flex-1"
        gameUrl="/chode_tapper_game/game_demo/index.html"
        isDocked={gameDocked}
        onGameStateChange={onGameStateChange}
        onGameMessage={onGameMessage}
        onDockToggle={onDockToggle}
      />
      {/* Player Panel */}
      <div className="w-80">
        <PlayerProfilePanel className="h-full" />
      </div>
    </div>
  );
}; 