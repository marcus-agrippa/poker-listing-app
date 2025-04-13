import React, { useState } from 'react';
import { hostname } from '../hostname';
import LastUpdated from './ui/LastUpdated';

const TabList = ({ activeDay, setActiveDay, daysOfWeek }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useState(() => {
    setActiveDay(today);
  }, [setActiveDay, today]);

  const location =
    hostname === 'pokercentralcoast.com'
      ? 'Central Coast, NSW, AUS'
      : hostname === 'pokernewcastle.com'
      ? 'Newcastle, NSW, AUS'
      : hostname === 'pokerballarat.com'
      ? 'Ballarat, VIC, AUS'
      : hostname === 'pokerwollongong.com'
      ? 'Wollongong, NSW, AUS'
      : hostname === 'pokertownsville.com'
      ? 'Townsville, QLD, AUS'
      : hostname === 'pokersunshinecoast.com'
      ? 'Sunshine Coast, QLD, AUS'
      : hostname === 'pokerperth.com'
      ? 'Perth, WA, AUS'
      : hostname === 'pokergeelong.com'
      ? 'Geelong, VIC, AUS'
      : hostname === 'pokergoldcoast.com'
      ? 'Gold Coast, VIC, AUS'
      : 'NSW, AUS';

  return (
    <div>
      <p className='font-medium text-white mb-3'>
        Location: <br></br>
        <span className='text-xl text-blue-500 font-bold'>{location}</span>
      </p>
      <LastUpdated lastUpdated='April 13, 2025' />
      <br></br>
      <div className='lg:hidden mb-4'>
        <label
          htmlFor='day-select'
          className='block mb-2 text-lg font-medium text-gray-400'>
          Select a day
        </label>
        <select
          id='day-select'
          value={activeDay}
          onChange={e => setActiveDay(e.target.value)}
          className='bg-gray-50 border border-gray-300 text-gray-900 hover:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'>
          {daysOfWeek.map(day => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className='hidden lg:flex w-full justify-between'>
        {daysOfWeek.map(day => (
          <button
            key={day}
            className={`tab tab-lifted text-lg ${
              activeDay === day
                ? 'bg-blue-600 text-white rounded'
                : 'text-gray-300 hover:text-gray-100'
            }`}
            onClick={() => setActiveDay(day)}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabList;
