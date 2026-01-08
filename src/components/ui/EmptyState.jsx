import React from 'react';
import { FiCalendar, FiMapPin, FiHeart, FiClock } from 'react-icons/fi';

const EmptyState = ({ activeDay, daysOfWeek, setActiveDay, gamesData }) => {
  // Find next day with games
  const currentDayIndex = daysOfWeek.indexOf(activeDay);
  let nextDayWithGames = null;
  let nextDayCount = 0;

  for (let i = 1; i <= 7; i++) {
    const nextIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOfWeek[nextIndex];
    const count = gamesData.filter(game => game.day === nextDay).length;
    if (count > 0) {
      nextDayWithGames = nextDay;
      nextDayCount = count;
      break;
    }
  }

  // Find all days with games for quick navigation
  const daysWithGames = daysOfWeek
    .map(day => ({
      day,
      count: gamesData.filter(game => game.day === day).length,
    }))
    .filter(item => item.count > 0);

  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      <div className='bg-gray-800 rounded-lg p-8 max-w-2xl w-full text-center border border-gray-700'>
        <div className='text-6xl mb-4'>🎰</div>
        <h3 className='text-2xl font-bold text-white mb-3'>
          No Games on {activeDay}
        </h3>
        <p className='text-gray-400 mb-6'>
          There are no poker games scheduled for {activeDay} in this region.
        </p>

        {/* Suggestions */}
        <div className='bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-6 text-left'>
          <h4 className='font-semibold text-white mb-3 flex items-center justify-center'>
            💡 Suggestions
          </h4>
          <ul className='space-y-2 text-sm text-gray-300'>
            <li className='flex items-start'>
              <FiCalendar className='mr-2 mt-1 flex-shrink-0 text-blue-400' />
              <span>Check other days of the week for available games</span>
            </li>
            <li className='flex items-start'>
              <FiMapPin className='mr-2 mt-1 flex-shrink-0 text-blue-400' />
              <span>Try browsing nearby regions for more options</span>
            </li>
            <li className='flex items-start'>
              <FiHeart className='mr-2 mt-1 flex-shrink-0 text-blue-400' />
              <span>Mark venues as favorites to get notified when new games are added</span>
            </li>
            <li className='flex items-start'>
              <FiClock className='mr-2 mt-1 flex-shrink-0 text-blue-400' />
              <span>Check back later - new games are added regularly by operators</span>
            </li>
          </ul>
        </div>

        {/* Quick Navigation */}
        {daysWithGames.length > 0 && (
          <div className='mb-4'>
            <p className='text-gray-300 mb-3 font-medium'>Quick Jump to Days with Games:</p>
            <div className='flex flex-wrap justify-center gap-2'>
              {daysWithGames.map(({ day, count }) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm'
                  aria-label={`View ${count} games on ${day}`}>
                  <div className='font-semibold'>{day}</div>
                  <div className='text-xs text-gray-400'>{count} game{count !== 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary CTA */}
        {nextDayWithGames && (
          <div className='mt-6'>
            <button
              onClick={() => setActiveDay(nextDayWithGames)}
              className='btn btn-primary btn-lg'>
              View {nextDayWithGames}'s {nextDayCount} Game{nextDayCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
