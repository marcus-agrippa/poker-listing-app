import React, { useState } from 'react';

const TabList = ({ activeDay, setActiveDay, daysOfWeek }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  useState(() => {
    setActiveDay(today);
  }, [setActiveDay, today]);

  return (
    <div>
      <div className="lg:hidden mb-4">
        <label htmlFor="day-select" className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-400">Select a day</label>
        <select
          id="day-select"
          value={activeDay}
          onChange={(e) => setActiveDay(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
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
            className={`tab tab-lifted text-xl ${activeDay === day ? 'bg-blue-600 text-white rounded' : 'text-gray-200'}`}
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


