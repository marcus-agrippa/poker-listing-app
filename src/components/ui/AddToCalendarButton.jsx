import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { getGoogleCalendarUrl, getAppleCalendarUrl } from '../../utils/calendarUtils';

const AddToCalendarButton = ({ game }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleGoogleCalendar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getGoogleCalendarUrl(game);
    window.open(url, '_blank');
    setShowMenu(false);
  };

  const handleAppleCalendar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getAppleCalendarUrl(game);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.competition}-${game.day}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="btn btn-ghost btn-sm btn-circle text-gray-400 hover:text-blue-400"
        title="Add to calendar"
      >
        <FiCalendar className="text-lg" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(false);
            }}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-20 bg-slate-700 rounded-lg shadow-xl border border-slate-600 overflow-hidden min-w-[200px]">
            <button
              onClick={handleGoogleCalendar}
              className="w-full px-4 py-3 text-left text-white hover:bg-slate-600 flex items-center gap-3 transition-colors"
            >
              <span className="text-xl">📅</span>
              <span className="text-sm font-medium">Google Calendar</span>
            </button>

            <button
              onClick={handleAppleCalendar}
              className="w-full px-4 py-3 text-left text-white hover:bg-slate-600 flex items-center gap-3 transition-colors border-t border-slate-600"
            >
              <span className="text-xl">🍎</span>
              <span className="text-sm font-medium">Apple Calendar</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddToCalendarButton;
