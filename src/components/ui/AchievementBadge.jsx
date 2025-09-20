import React from 'react';
import { getRarityColor } from '../../utils/achievements';

const AchievementBadge = ({ achievement, size = 'md', showDetails = true, earned = true }) => {
  const sizeClasses = {
    'sm': 'w-12 h-12 text-lg',
    'md': 'w-16 h-16 text-2xl',
    'lg': 'w-20 h-20 text-3xl',
    'xl': 'w-24 h-24 text-4xl'
  };

  const textSizeClasses = {
    'sm': 'text-xs',
    'md': 'text-sm',
    'lg': 'text-base',
    'xl': 'text-lg'
  };

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <div className={`achievement-badge ${earned ? '' : 'opacity-50'} group relative`}>
      <div className={`
        ${sizeClasses[size]}
        ${rarityColor}
        ${earned ? 'bg-opacity-20' : 'bg-gray-700 border-gray-600'}
        border-2 rounded-full flex items-center justify-center
        transition-transform duration-200 hover:scale-110 cursor-pointer
        ${earned ? 'hover:bg-opacity-30' : ''}
      `}>
        <span className={earned ? '' : 'grayscale'}>
          {achievement.emoji}
        </span>
      </div>

      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-gray-900 text-white p-2 sm:p-3 rounded-lg border border-gray-700 whitespace-nowrap max-w-[250px] sm:max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{achievement.emoji}</span>
              <span className={`font-semibold ${textSizeClasses[size]} ${earned ? rarityColor.split(' ')[0] : 'text-gray-400'}`}>
                {achievement.name}
              </span>
            </div>
            <p className={`${textSizeClasses[size]} text-gray-300 mb-1`}>
              {achievement.description}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full border ${rarityColor} bg-opacity-20 capitalize`}>
                {achievement.rarity}
              </span>
              {!earned && (
                <span className="text-xs text-gray-500">Locked</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;