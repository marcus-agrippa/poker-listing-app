import React from 'react';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSun, FiSunset, FiMoon, FiHeart, FiClock, FiMapPin } from 'react-icons/fi';

const AdvancedFilters = ({
  filters,
  onFilterChange,
  isExpanded,
  onToggleExpanded,
  availableCompetitions = [],
}) => {
  const handleBuyInChange = (type, value) => {
    onFilterChange({
      ...filters,
      buyIn: {
        ...filters.buyIn,
        [type]: value === '' ? '' : parseInt(value, 10),
      },
    });
  };

  const handleCompetitionToggle = competition => {
    const newCompetitions = filters.competitions.includes(competition)
      ? filters.competitions.filter(c => c !== competition)
      : [...filters.competitions, competition];
    onFilterChange({ ...filters, competitions: newCompetitions });
  };

  const handleTimeSlotChange = slot => {
    onFilterChange({ ...filters, timeSlot: slot });
  };

  const handleFavoritesOnlyChange = () => {
    onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly });
  };

  const handleStartingSoonChange = () => {
    onFilterChange({ ...filters, startingSoon: !filters.startingSoon });
  };

  const handleSortByDistanceChange = () => {
    onFilterChange({ ...filters, sortByDistance: !filters.sortByDistance });
  };

  const clearAllFilters = () => {
    onFilterChange({
      buyIn: { min: '', max: '' },
      competitions: [],
      timeSlot: 'all',
      favoritesOnly: false,
      startingSoon: false,
      sortByDistance: false,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.buyIn.min !== '' ||
      filters.buyIn.max !== '' ||
      filters.competitions.length > 0 ||
      filters.timeSlot !== 'all' ||
      filters.favoritesOnly ||
      filters.startingSoon ||
      filters.sortByDistance
    );
  };


  const activeFilterCount = () => {
    let count = 0;
    if (filters.buyIn.min !== '' || filters.buyIn.max !== '') count++;
    if (filters.competitions.length > 0) count++;
    if (filters.timeSlot !== 'all') count++;
    if (filters.favoritesOnly) count++;
    if (filters.startingSoon) count++;
    return count;
  };

  return (
    <div className='bg-gray-800 rounded-lg border border-gray-700 mb-6'>
      {/* Filter Header */}
      <button
        onClick={onToggleExpanded}
        className='w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors'>
        <div className='flex items-center gap-2'>
          <FiFilter className='text-blue-400' />
          <span className='font-semibold text-white'>Advanced Filters</span>
          {activeFilterCount() > 0 && (
            <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
              {activeFilterCount()}
            </span>
          )}
        </div>
        {isExpanded ? (
          <FiChevronUp className='text-gray-400' />
        ) : (
          <FiChevronDown className='text-gray-400' />
        )}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className='p-4 pt-0 space-y-4 border-t border-gray-700'>
          {/* Quick Filters */}
          <div className='flex flex-wrap gap-2 mt-4'>
            <button
              onClick={handleFavoritesOnlyChange}
              className={`btn btn-sm ${
                filters.favoritesOnly ? 'btn-primary' : 'btn-outline'
              }`}>
              <FiHeart className={`mr-1 ${filters.favoritesOnly ? 'fill-current text-red-500' : ''}`} /> Favourites Only
            </button>
            <button
              onClick={handleStartingSoonChange}
              className={`btn btn-sm ${
                filters.startingSoon ? 'btn-success' : 'btn-outline'
              }`}>
              <FiClock className='mr-1' /> Starting Soon (2hrs)
            </button>
            <button
              onClick={handleSortByDistanceChange}
              className={`btn btn-sm ${
                filters.sortByDistance ? 'btn-info' : 'btn-outline'
              }`}>
              <FiMapPin className='mr-1' /> Sort by Distance
            </button>
          </div>

          {/* Buy-in Range */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Buy-in Range
            </label>
            <div className='flex items-center gap-2'>
              <div className='flex-1'>
                <input
                  type='number'
                  placeholder='Min ($)'
                  value={filters.buyIn.min}
                  onChange={e => handleBuyInChange('min', e.target.value)}
                  className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                  min='0'
                />
              </div>
              <span className='text-gray-400'>to</span>
              <div className='flex-1'>
                <input
                  type='number'
                  placeholder='Max ($)'
                  value={filters.buyIn.max}
                  onChange={e => handleBuyInChange('max', e.target.value)}
                  className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                  min='0'
                />
              </div>
            </div>
            {/* Quick Buy-in Buttons */}
            <div className='flex flex-wrap gap-2 mt-2'>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    buyIn: { min: 0, max: 20 },
                  })
                }
                className='btn btn-xs btn-outline'>
                $0-$20
              </button>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    buyIn: { min: 20, max: 50 },
                  })
                }
                className='btn btn-xs btn-outline'>
                $20-$50
              </button>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    buyIn: { min: 50, max: '' },
                  })
                }
                className='btn btn-xs btn-outline'>
                $50+
              </button>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Time of Day
            </label>
            <div className='grid grid-cols-1 sm:grid-cols-4 gap-2'>
              <button
                onClick={() => handleTimeSlotChange('all')}
                className={`btn btn-sm ${
                  filters.timeSlot === 'all' ? 'btn-primary' : 'btn-outline'
                }`}>
                All Times
              </button>
              <button
                onClick={() => handleTimeSlotChange('afternoon')}
                className={`btn btn-sm ${
                  filters.timeSlot === 'afternoon'
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}>
                <FiSun className='mr-1' /> Afternoon (12-6pm)
              </button>
              <button
                onClick={() => handleTimeSlotChange('evening')}
                className={`btn btn-sm ${
                  filters.timeSlot === 'evening' ? 'btn-primary' : 'btn-outline'
                }`}>
                <FiSunset className='mr-1' /> Evening (6-9pm)
              </button>
              <button
                onClick={() => handleTimeSlotChange('late')}
                className={`btn btn-sm ${
                  filters.timeSlot === 'late' ? 'btn-primary' : 'btn-outline'
                }`}>
                <FiMoon className='mr-1' /> Late (9pm+)
              </button>
            </div>
          </div>

          {/* Competition Filter */}
          {availableCompetitions.length > 0 && (
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Competition Type
              </label>
              <div className='flex flex-wrap gap-4'>
                {availableCompetitions.map(comp => (
                  <button
                    key={comp}
                    onClick={() => handleCompetitionToggle(comp)}
                    className={`btn btn-xs ${
                      filters.competitions.includes(comp)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}>
                    {comp}
                  </button>
                ))}
              </div>
              {filters.competitions.length > 0 && (
                <div className='text-xs text-gray-400 mt-2'>
                  Showing {filters.competitions.length} competition
                  {filters.competitions.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}

          {/* Clear All Button */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className='btn btn-sm btn-ghost text-red-400 hover:text-red-300 w-full'>
              <FiX className='mr-1' />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
