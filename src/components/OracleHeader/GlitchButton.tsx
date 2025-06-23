import React from 'react';

interface GlitchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
  icon?: React.ReactNode;
}

export const GlitchButton: React.FC<GlitchButtonProps> = ({ active = false, label, icon, ...props }) => (
  <button
    className={`cybr-btn${active ? ' active' : ''}`}
    {...props}
  >
    <span className="cybr-btn__text" data-text={label}>
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-label">{label}</span>
    </span>
    <span className="cybr-btn__glitch" />
  </button>
); 