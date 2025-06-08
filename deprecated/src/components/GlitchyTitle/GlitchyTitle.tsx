import React from 'react';
import './GlitchyTitle.css';

export const GlitchyTitle: React.FC = () => {
  return (
    <div className="title-container">
      <h1 className="glitchy-title">
        <span className="glitch-line" data-text="GIRTH INDEX: THE ORACLE SEES ALL">
          GIRTH INDEX: THE ORACLE SEES ALL
        </span>
      </h1>
    </div>
  );
};