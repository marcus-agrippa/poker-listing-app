import React, { useState } from 'react';
import { FiAward, FiTarget, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AchievementBadge from './AchievementBadge';
import { ACHIEVEMENTS, checkAchievements, getProgressToNextAchievement } from '../../utils/achievements';

const AchievementsSection = ({ userStats, userResults, userNotes = [] }) => {
  const [showLocked, setShowLocked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const earnedAchievements = checkAchievements(userStats, userResults, userNotes);
  const earnedIds = new Set(earnedAchievements.map(a => a.id));

  const categories = [
    { value: 'all', label: 'All', icon: FiAward },
    { value: 'games', label: 'Games', icon: FiTarget },
    { value: 'wins', label: 'Wins', icon: FiAward },
    { value: 'profit', label: 'Profit', icon: '💰' },
    { value: 'session', label: 'Sessions', icon: '🎆' },
    { value: 'tournament', label: 'Tournaments', icon: '🏆' },
    { value: 'streak', label: 'Streaks', icon: '🔥' },
    { value: 'pokerdex', label: 'Intelligence', icon: '🕵️' },
    { value: 'venue', label: 'Venues', icon: '🏢' }
  ];

  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  const displayedAchievements = showLocked
    ? filteredAchievements
    : filteredAchievements.filter(a => earnedIds.has(a.id));

  // Progress toward next achievements
  const gameProgress = getProgressToNextAchievement(
    userStats.totalGames || 0,
    'games',
    earnedAchievements.filter(a => a.category === 'games')
  );

  const profitProgress = getProgressToNextAchievement(
    userStats.totalProfit || 0,
    'profit',
    earnedAchievements.filter(a => a.category === 'profit')
  );

  if (earnedAchievements.length === 0 && !showLocked) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-white mb-2">No achievements yet</h3>
        <p className="text-gray-400 mb-4">
          Play more games and track your results to start earning badges!
        </p>
        <button
          onClick={() => setShowLocked(true)}
          className="btn btn-outline btn-sm"
        >
          <FiEye className="mr-2" />
          View All Achievements
        </button>
      </div>
    );
  }

  return (
    <div className="achievements-section">
      {/* Collapsed Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <FiAward className="mr-2" />
            Achievements
            <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
              {earnedAchievements.length}
            </span>
          </h2>
          <p className="text-gray-400 text-sm">
            {earnedAchievements.length} of {Object.keys(ACHIEVEMENTS).length} earned
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-ghost btn-sm flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          {isExpanded ? 'Hide' : 'View All'}
        </button>
      </div>

      {/* Recent Achievements Preview (Always Visible) */}
      {earnedAchievements.length > 0 && !isExpanded && (
        <div className="flex items-start gap-3 mb-4">
          <span className="text-sm text-gray-400 flex-shrink-0 mt-2">Recent:</span>
          <div className="relative flex-1 min-w-0">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {earnedAchievements.slice(0, 8).map(achievement => (
                <div key={achievement.id} className="flex-shrink-0">
                  <AchievementBadge
                    achievement={achievement}
                    size="sm"
                    earned={true}
                  />
                </div>
              ))}
              {earnedAchievements.length > 8 && (
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    +{earnedAchievements.length - 8} more
                  </span>
                </div>
              )}
            </div>
            {/* Fade effect on right edge */}
            <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none sm:hidden"></div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setShowLocked(!showLocked)}
              className="btn btn-ghost btn-xs sm:btn-sm flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              {showLocked ? <FiEyeOff /> : <FiEye />}
              {showLocked ? 'Hide Locked' : 'Show All'}
            </button>
          </div>

      {/* Progress Indicators */}
      {(gameProgress || profitProgress) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {gameProgress && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Next Game Milestone</span>
                <span className="text-xs text-gray-400">
                  {gameProgress.progress}/{gameProgress.target}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AchievementBadge
                  achievement={gameProgress.achievement}
                  size="sm"
                  showDetails={false}
                  earned={false}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {gameProgress.achievement.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(gameProgress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${gameProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {profitProgress && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Next Profit Milestone</span>
                <span className="text-xs text-gray-400">
                  ${profitProgress.progress.toFixed(0)}/${profitProgress.target}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AchievementBadge
                  achievement={profitProgress.achievement}
                  size="sm"
                  showDetails={false}
                  earned={false}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {profitProgress.achievement.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Math.round(profitProgress.percentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profitProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-6">
        {categories.map(category => {
          const categoryAchievements = Object.values(ACHIEVEMENTS).filter(a =>
            category.value === 'all' || a.category === category.value
          );
          const categoryEarned = categoryAchievements.filter(a => earnedIds.has(a.id)).length;

          return (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`btn btn-xs sm:btn-sm flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                selectedCategory === category.value
                  ? 'btn-primary'
                  : 'btn-ghost border border-gray-600'
              }`}
            >
              {typeof category.icon === 'string' ? (
                <span>{category.icon}</span>
              ) : (
                <category.icon />
              )}
              {category.label}
              <span className="text-xs bg-gray-700 px-1 sm:px-2 py-1 rounded-full">
                {categoryEarned}/{categoryAchievements.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-4">
        {displayedAchievements.map(achievement => (
          <div key={achievement.id} className="flex flex-col items-center">
            <AchievementBadge
              achievement={achievement}
              size="md"
              earned={earnedIds.has(achievement.id)}
            />
            <span className="text-xs text-gray-400 mt-2 text-center leading-tight">
              {achievement.name}
            </span>
          </div>
        ))}
      </div>

      {displayedAchievements.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No achievements in this category yet.</p>
          {!showLocked && (
            <button
              onClick={() => setShowLocked(true)}
              className="text-blue-400 hover:text-blue-300 underline mt-2"
            >
              View locked achievements
            </button>
          )}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;