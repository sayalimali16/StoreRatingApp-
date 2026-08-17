import React from 'react';

const StatCard = ({ title, value, icon: Icon, accentColor }) => {
  return (
    <div className="stat-card">
      <div 
        className="stat-icon" 
        style={accentColor ? { color: accentColor, background: `${accentColor}15` } : {}}
      >
        {Icon && <Icon size={26} />}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;
