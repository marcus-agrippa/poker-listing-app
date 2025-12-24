import React from 'react';
import { FiCalendar } from 'react-icons/fi';

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

  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      <div className='bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-700'>
        <FiCalendar className='w-16 h-16 mx-auto text-gray-500 mb-4' />
        <h3 className='text-2xl font-bold text-white mb-3'>
          No Games on {activeDay}
        </h3>
        <p className='text-gray-400 mb-6'>
          There are no poker games scheduled for {activeDay} in this region.
        </p>
        {nextDayWithGames && (
          <div>
            <p className='text-gray-300 mb-4'>
              Check out <span className='font-semibold text-blue-400'>{nextDayWithGames}</span>'s{' '}
              <span className='font-semibold text-blue-400'>{nextDayCount}</span> game
              {nextDayCount !== 1 ? 's' : ''}!
            </p>
            <button
              onClick={() => setActiveDay(nextDayWithGames)}
              className='btn btn-primary'>
              View {nextDayWithGames}'s Games
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
