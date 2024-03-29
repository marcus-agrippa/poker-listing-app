import React, { useState } from 'react';
import LastUpdated from './ui/LastUpdated';

const TabList = ({ activeDay, setActiveDay, daysOfWeek }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  useState(() => {
    setActiveDay(today);
  }, [setActiveDay, today]);

  return (
    <div>
      <p className="font-medium text-white mb-3">Location: <br></br><span className='text-xl text-blue-500 font-semibold'>Central Coast, NSW, AUS</span></p>
      <LastUpdated lastUpdated="March 23rd, 2024" />
      <br></br>
      <div className="lg:hidden mb-4">
        <label htmlFor="day-select" className="block mb-2 text-lg font-medium text-gray-400">Select a day</label>
        <select
          id="day-select"
          value={activeDay}
          onChange={(e) => setActiveDay(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 hover:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
        >
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      <div className="hidden lg:flex w-full justify-between">
        {daysOfWeek.map((day) => (
          <button
            key={day}
            className={`tab tab-lifted text-xl ${activeDay === day ? 'bg-blue-600 text-white rounded' : 'text-gray-300 hover:text-gray-100'}`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabList;


