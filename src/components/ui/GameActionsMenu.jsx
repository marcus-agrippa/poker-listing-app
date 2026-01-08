import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiShare2, FiEdit3, FiHeart } from 'react-icons/fi';
import { SiGoogle, SiApple } from 'react-icons/si';
import { getGoogleCalendarUrl, getAppleCalendarUrl } from '../../utils/calendarUtils';

const GameActionsMenu = ({
  game,
  isFavorite,
  onToggleFavorite,
  onSuggestEdit,
  onShare,
  showEditButton = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (action, e) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  const handleGoogleCalendar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getGoogleCalendarUrl(game);
    window.open(url, '_blank');
    setIsOpen(false);
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
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 bg-opacity-90 hover:bg-gray-600 transition-colors text-white"
        aria-label="Game actions menu"
        aria-expanded={isOpen}
      >
        <FiMoreVertical className="text-lg" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 min-w-[200px] z-50 animate-fadeIn">
          {/* Share */}
          <button
            onClick={(e) => handleAction(onShare, e)}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
          >
            <FiShare2 className="text-green-400" />
            <span>Share Game</span>
          </button>

          {/* Calendar Section Header */}
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-t border-gray-700 mt-1">
            Add to Calendar
          </div>

          {/* Google Calendar */}
          <button
            onClick={handleGoogleCalendar}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            aria-label="Add to Google Calendar"
          >
            <SiGoogle className="text-blue-400" />
            <span>Google Calendar</span>
          </button>

          {/* Apple Calendar */}
          <button
            onClick={handleAppleCalendar}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            aria-label="Add to Apple Calendar"
          >
            <SiApple className="text-gray-300" />
            <span>Apple Calendar</span>
          </button>

          {/* Suggest Edit (only for logged in users) */}
          {showEditButton && (
            <button
              onClick={(e) => handleAction(onSuggestEdit, e)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
            >
              <FiEdit3 className="text-blue-400" />
              <span>Suggest Edit</span>
            </button>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-700 my-1" />

          {/* Toggle Favorite */}
          <button
            onClick={(e) => handleAction(onToggleFavorite, e)}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-3"
          >
            <FiHeart
              className={isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
            />
            <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GameActionsMenu;
