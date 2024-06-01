import React from 'react';

const LastUpdated = ({ lastUpdated }) => {
  const today = new Date();
  const cleanedLastUpdated = lastUpdated.replace(/(\d+)(st|nd|rd|th)/, '$1');
  const updatedDate = new Date(cleanedLastUpdated);

  const updatedToday =
    updatedDate.getDate() === today.getDate() &&
    updatedDate.getMonth() === today.getMonth() &&
    updatedDate.getFullYear() === today.getFullYear()
      ? 'Today'
      : lastUpdated;

  return (
    <div className='flex items-center justify-center'>
      <div className='w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green'></div>
      <span className='ml-2 text-neutral-400'>
        Last Updated: {updatedToday}
      </span>
    </div>
  );
};

export default LastUpdated;
