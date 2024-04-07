import React from 'react';

const DayNightTag = ({ gameTime, className = '' }) => {
  const hour = parseInt(gameTime.split(':')[0], 10);
  const isDayTime = hour >= 6 && hour < 18;
  const emoji = isDayTime ? '☀️' : '🌙';

  return <span className={`${className}`}>{emoji}</span>;
};

export default DayNightTag;
