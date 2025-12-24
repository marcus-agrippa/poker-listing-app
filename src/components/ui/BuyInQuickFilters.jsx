import React from 'react';
import { FiDollarSign } from 'react-icons/fi';

const BuyInQuickFilters = ({ onFilterChange, filters }) => {
  const quickFilters = [
    { label: 'All', min: '', max: '' },
    { label: 'Free', min: 0, max: 0 },
    { label: '$0-$20', min: 0, max: 20 },
    { label: '$20-$50', min: 20, max: 50 },
    { label: '$50+', min: 50, max: '' },
  ];

  const isActive = (filterOption) => {
    return (
      filters.buyIn.min === filterOption.min &&
      filters.buyIn.max === filterOption.max
    );
  };

  return (
    <div className='mb-6'>
      <div className='flex items-center gap-2 mb-3'>
        <FiDollarSign className='text-green-500' />
        <h3 className='text-sm font-medium text-gray-300'>Quick Buy-in Filters</h3>
      </div>
      <div className='flex flex-wrap gap-2'>
        {quickFilters.map((filter, index) => (
          <button
            key={index}
            onClick={() =>
              onFilterChange({
                ...filters,
                buyIn: { min: filter.min, max: filter.max },
              })
            }
            className={`btn btn-sm ${
              isActive(filter)
                ? 'btn-success text-white'
                : 'btn-outline border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
            }`}>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BuyInQuickFilters;
