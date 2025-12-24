import React, { useMemo } from 'react';
import { FiCalendar, FiMapPin, FiDollarSign } from 'react-icons/fi';

const QuickStatsCard = ({ games, daysOfWeek }) => {
  const stats = useMemo(() => {
    // Count games this week
    const gamesThisWeek = games.length;

    // Count unique venues
    const uniqueVenues = new Set(games.map(game => game.venue)).size;

    // Get buy-in range
    const buyIns = games
      .map(game => parseInt(game.buy_in, 10))
      .filter(b => !isNaN(b));
    const minBuyIn = buyIns.length > 0 ? Math.min(...buyIns) : 0;
    const maxBuyIn = buyIns.length > 0 ? Math.max(...buyIns) : 0;

    return {
      gamesThisWeek,
      uniqueVenues,
      minBuyIn,
      maxBuyIn,
    };
  }, [games]);

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6'>
      <div className='flex flex-wrap items-center justify-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <FiCalendar className='text-blue-400 w-4 h-4' />
          <span className='text-gray-400'>This Week:</span>
          <span className='text-white font-semibold'>{stats.gamesThisWeek} games</span>
        </div>

        <div className='flex items-center gap-2'>
          <FiMapPin className='text-blue-400 w-4 h-4' />
          <span className='text-gray-400'>Active Venues:</span>
          <span className='text-white font-semibold'>{stats.uniqueVenues}</span>
        </div>

        <div className='flex items-center gap-2'>
          <FiDollarSign className='text-blue-400 w-4 h-4' />
          <span className='text-gray-400'>Buy-ins:</span>
          <span className='text-white font-semibold'>
            ${stats.minBuyIn}
            {stats.minBuyIn !== stats.maxBuyIn && <span> - ${stats.maxBuyIn}</span>}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsCard;
