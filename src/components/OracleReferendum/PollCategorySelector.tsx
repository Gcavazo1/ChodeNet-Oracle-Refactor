import React, { useState } from 'react';
import { ChevronDown, Sparkles, CalendarClock, Users, Zap, AlertCircle } from 'lucide-react';
import { PollCategorySelectorProps, PollCategory } from './types';

/**
 * Poll Category Selector Component
 * 
 * A dropdown selector for filtering polls by category with
 * visual styling based on Oracle personality
 */
export const PollCategorySelector: React.FC<PollCategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  oraclePersonality = 'chaotic_sage'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Map of category to display name and icon
  const categoryInfo: Record<PollCategory | 'all', { name: string; icon: JSX.Element }> = {
    all: { name: 'All Categories', icon: <Sparkles className="w-4 h-4" /> },
    prophecy: { name: 'Prophecy', icon: <Zap className="w-4 h-4" /> },
    lore: { name: 'Lore Direction', icon: <CalendarClock className="w-4 h-4" /> },
    game_evolution: { name: 'Game Evolution', icon: <AlertCircle className="w-4 h-4" /> },
    oracle_personality: { name: 'Oracle Personality', icon: <Users className="w-4 h-4" /> }
  };
  
  // Get current selection info
  const currentSelection = categoryInfo[selectedCategory] || categoryInfo.all;
  
  // Class names based on Oracle personality
  const getPersonalityClass = () => {
    switch (oraclePersonality) {
      case 'pure_prophet':
        return 'category-selector-pure';
      case 'corrupted_oracle':
        return 'category-selector-corrupted';
      default:
        return 'category-selector-chaotic';
    }
  };
  
  return (
    <div className={`category-selector ${getPersonalityClass()}`}>
      <button 
        className="category-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center">
          <span className="category-icon">{currentSelection.icon}</span>
          <span className="category-name">{currentSelection.name}</span>
        </div>
        <ChevronDown className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="category-dropdown-backdrop" onClick={() => setIsOpen(false)} />
          <div className="category-dropdown" role="listbox">
            {/* Always include All Categories option */}
            <button
              className={`category-option ${selectedCategory === 'all' ? 'selected' : ''}`}
              onClick={() => {
                onCategoryChange('all');
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedCategory === 'all'}
            >
              <span className="category-icon">{categoryInfo.all.icon}</span>
              <span className="option-name">{categoryInfo.all.name}</span>
            </button>
            
            {/* Map through available categories */}
            {categories.map((category) => (
              <button
                key={category}
                className={`category-option ${selectedCategory === category ? 'selected' : ''}`}
                onClick={() => {
                  onCategoryChange(category);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={selectedCategory === category}
              >
                <span className="category-icon">{categoryInfo[category].icon}</span>
                <span className="option-name">{categoryInfo[category].name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 