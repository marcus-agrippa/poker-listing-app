import React, { useState, useEffect, useMemo } from 'react';
import BeatLoader from 'react-spinners/BeatLoader';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { FiEdit3, FiHeart, FiClock, FiSearch, FiX } from 'react-icons/fi';
import GameEditSuggestionForm from './suggestions/GameEditSuggestionForm';
import AdvancedFilters from './AdvancedFilters';
import BuyInQuickFilters from './ui/BuyInQuickFilters';

const GameList = ({ activeDay, dataUrl, facebookPageUrls }) => {
  const { currentUser } = useAuth();
  const {
    isFavorite,
    toggleFavorite,
    getLastPlayedText,
    sortGamesByFavorites,
  } = useFavorites();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestionFormOpen, setSuggestionFormOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState({
    buyIn: { min: '', max: '' },
    competitions: [],
    timeSlot: 'all',
    favoritesOnly: false,
    startingSoon: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dataUrl]);

  // Calculate available competitions from the games data
  const availableCompetitions = useMemo(() => {
    const competitions = new Set();
    games.forEach(game => {
      if (game.competition) {
        competitions.add(game.competition);
      }
    });
    return Array.from(competitions).sort();
  }, [games]);

  useEffect(() => {
    let filtered = games.filter(game => game.day === activeDay);

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        game =>
          game.venue.toLowerCase().includes(searchLower) ||
          game.competition.toLowerCase().includes(searchLower) ||
          (game.location && game.location.toLowerCase().includes(searchLower))
      );
    }

    // Apply advanced filters
    // Buy-in filter
    if (filters.buyIn.min !== '' || filters.buyIn.max !== '') {
      filtered = filtered.filter(game => {
        const buyIn = parseInt(game.buy_in, 10) || 0;
        const min = filters.buyIn.min === '' ? 0 : filters.buyIn.min;
        const max = filters.buyIn.max === '' ? Infinity : filters.buyIn.max;
        return buyIn >= min && buyIn <= max;
      });
    }

    // Competition filter
    if (filters.competitions.length > 0) {
      filtered = filtered.filter(game =>
        filters.competitions.includes(game.competition)
      );
    }

    // Time slot filter
    if (filters.timeSlot !== 'all') {
      filtered = filtered.filter(game => {
        const hour = parseInt(game.game_time.split(':')[0], 10);
        if (filters.timeSlot === 'afternoon') {
          return hour >= 12 && hour < 18;
        } else if (filters.timeSlot === 'evening') {
          return hour >= 18 && hour < 21;
        } else if (filters.timeSlot === 'late') {
          return hour >= 21 || hour < 6;
        }
        return true;
      });
    }

    // Favorites only filter
    if (filters.favoritesOnly && currentUser) {
      filtered = filtered.filter(game => isFavorite(game.venue));
    }

    // Starting soon filter (within 2 hours)
    if (filters.startingSoon) {
      const now = new Date();
      filtered = filtered.filter(game => {
        const gameDate = new Date(`1970/01/01 ${game.game_time}`);
        gameDate.setFullYear(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const diffMs = gameDate - now;
        const diffHrs = diffMs / 1000 / 60 / 60;
        return diffHrs >= 0 && diffHrs <= 2;
      });
    }

    // Sort by favorites first, then by time
    const sorted = sortGamesByFavorites(filtered);
    setFilteredGames(sorted);
  }, [games, activeDay, searchTerm, filters, currentUser, isFavorite, sortGamesByFavorites]);

  const formatTime = time24 => {
    const [hours, minutes] = time24.split(':');
    const hoursInt = parseInt(hours, 10);
    const hours12 = hoursInt % 12 || 12;
    const amPm = hoursInt >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${amPm}`;
  };

  function getTimeUntil(gameTime) {
    const now = new Date();
    const gameDate = new Date(`1970/01/01 ${gameTime}`);
    gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = gameDate - now;
    const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);
    const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
    let status;

    if (diffHrs < -5) {
      return { status: 'Completed', isStarted: true };
    } else if (diffMs < 0) {
      return { status: 'In Progress', isStarted: true };
    }

    if (diffHrs > 0) {
      status = `Starts in ${diffHrs}hrs ${diffMins}m`;
    } else {
      status = `Starts in ${diffMins}m`;
    }

    return { status, isStarted: false };
  }

  function getCurrentDay() {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const now = new Date();
    return days[now.getDay()];
  }

  const competitionLogos = {
    'APL Poker': '/apl-poker-logo.png',
    'Australian Poker Experience': '/aus-poker-experience.png',
    'UPT Poker': '/upt-poker-logo.png',
    'WPT League': '/wpt-poker-logo.png',
    'Kings Poker': '/kings-poker-logo.png',
    'Poker Nation': '/poker-nation-logo.png',
    'National Poker League': '/npl-poker-logo.png',
    'Perth Poker League': '/perth-poker-league-logo.png',
    'Shark Poker': '/shark-poker-logo.png',
    'Star Poker': '/star-poker-logo.png',
    'APS Newcastle': '/aps-newcastle-logo.png',
  };

  const SkeletonCard = () => (
    <div className='bg-gray-800 rounded-xl shadow-2xl p-6 animate-pulse'>
      {/* Logo skeleton */}
      <div className='w-20 h-20 bg-gray-700 rounded mx-auto mb-6'></div>

      {/* Venue name skeleton */}
      <div className='mb-6'>
        <div className='h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2'></div>
        <div className='h-4 bg-gray-700 rounded w-1/2 mx-auto'></div>
      </div>

      {/* Game details skeleton */}
      <div className='space-y-4'>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-20'></div>
          <div className='h-4 bg-gray-700 rounded w-full'></div>
        </div>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-16'></div>
          <div className='h-4 bg-gray-700 rounded w-full'></div>
        </div>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-20'></div>
          <div className='h-8 bg-gray-700 rounded w-full'></div>
        </div>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-16'></div>
          <div className='h-4 bg-gray-700 rounded w-full'></div>
        </div>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-14'></div>
          <div className='h-4 bg-gray-700 rounded w-full'></div>
        </div>
        <div className='grid grid-cols-[auto,1fr] gap-4'>
          <div className='h-4 bg-gray-700 rounded w-18'></div>
          <div className='h-4 bg-gray-700 rounded w-full'></div>
        </div>
      </div>
    </div>
  );

  const isToday = activeDay === getCurrentDay();

  return (
    <div>
      <h2 className='text-4xl font-bold mb-6 mt-8 text-center text-gray-100'>
        {isToday ? "Today's Games" : `${activeDay} Games`}
      </h2>

      {/* Search Bar */}
      <div className='container mx-auto px-4 mb-6'>
        <div className='max-w-md mx-auto'>
          <div className='relative'>
            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg' />
            <input
              type='text'
              placeholder='Search by venue or competition...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors'
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                title='Clear search'>
                <FiX className='text-lg' />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className='text-center mt-2 text-sm text-gray-400'>
              {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}{' '}
              found
            </div>
          )}
        </div>
      </div>

      {/* Buy-in Quick Filters */}
      <div className='container mx-auto px-4 mb-6'>
        <BuyInQuickFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Advanced Filters */}
      <div className='container mx-auto px-4 mb-6'>
        <AdvancedFilters
          filters={filters}
          onFilterChange={setFilters}
          isExpanded={filtersExpanded}
          onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
          availableCompetitions={availableCompetitions}
        />
      </div>

      <div className='container mx-auto px-4'>
        {isLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredGames.length > 0 ? (
              filteredGames.map((game, index) => {
                const gameStatus = getTimeUntil(game.game_time);
                const isVenueFavorite = currentUser
                  ? isFavorite(game.venue)
                  : false;
                const lastPlayedText = currentUser
                  ? getLastPlayedText(game.venue)
                  : null;

                return (
                  <a
                    key={index}
                    href={facebookPageUrls[game.competition]}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`block ${
                      facebookPageUrls[game.competition] ? 'cursor-pointer' : ''
                    }`}>
                    <div
                      className={`bg-gray-800 rounded-xl shadow-2xl p-6 relative transition-all ${
                        isVenueFavorite
                          ? 'ring-2 ring-yellow-400 ring-opacity-50'
                          : ''
                      }`}>
                      {competitionLogos[game.competition] && (
                        <img
                          src={competitionLogos[game.competition]}
                          alt={`${game.competition} logo`}
                          className='mb-3 w-20 h-20 mx-auto hover:scale-105 transition-transform'
                        />
                      )}

                      {/* Action buttons */}
                      {currentUser && (
                        <>
                          <button
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedGame(game);
                              setSuggestionFormOpen(true);
                            }}
                            className='absolute top-2 left-2 w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 bg-opacity-80 hover:bg-blue-600 transition-colors border-none text-white text-sm'
                            title='Suggest edit to this game'>
                            <FiEdit3 />
                          </button>
                          <button
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(game.venue);
                            }}
                            className={`absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full transition-all border-none text-sm ${
                              isVenueFavorite
                                ? 'bg-yellow-500 bg-opacity-90 hover:bg-yellow-400 text-white'
                                : 'bg-gray-600 bg-opacity-80 hover:bg-gray-500 text-gray-300'
                            }`}
                            title={
                              isVenueFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }>
                            <FiHeart
                              className={isVenueFavorite ? 'fill-current' : ''}
                            />
                          </button>
                        </>
                      )}
                      <div className='mb-6'>
                        <h3 className='text-xl text-blue-500 font-bold mb-1'>
                          {isVenueFavorite && (
                            <span className='text-yellow-400 mr-2'>⭐</span>
                          )}
                          {game.venue}
                        </h3>
                        <div className='flex justify-center items-center text-xs text-gray-400 min-h-[1.5rem]'>
                          {lastPlayedText && (
                            <>
                              <FiClock className='mr-1' />
                              {lastPlayedText}
                            </>
                          )}
                        </div>
                      </div>
                      <div className='grid grid-cols-[auto,1fr] gap-4'>
                        <div className='font-medium text-white text-left p-1'>
                          Competition:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.competition}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Reg. Time:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.rego_time ? formatTime(game.rego_time) : 'TBC'}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Game Start:
                        </div>
                        <div
                          className={`text-center font-medium border border-gray-700 p-1 ${
                            parseInt(game.game_time.split(':')[0], 10) < 18
                              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-gray-900'
                              : 'bg-gradient-to-r from-indigo-800 to-purple-900'
                          }`}>
                          {formatTime(game.game_time)}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Late Rego:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.late_rego ? formatTime(game.late_rego) : 'TBC'}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Buy-in:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.buy_in}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Re-Buy:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.re_buy || 'TBC'}
                        </div>
                        <div className='font-medium text-white text-left p-1'>
                          Starting Stack:
                        </div>
                        <div className='text-center border border-gray-700 p-1'>
                          {game.starting_stack || 'TBC'}
                        </div>
                        {game.day === getCurrentDay() && (
                          <>
                            <div className='font-medium text-white text-left p-1'>
                              Status:
                            </div>
                            <div
                              className={`text-center border border-gray-700 p-1 ${
                                gameStatus.status === 'Completed'
                                  ? 'text-red-400'
                                  : gameStatus.isStarted
                                  ? 'text-green-500'
                                  : 'text-yellow-300'
                              }`}>
                              {gameStatus.status}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })
            ) : (
              <div className='text-center col-span-full text-xl text-gray-300'>
                {searchTerm ? (
                  <div>
                    <p className='mb-2'>
                      No games found matching "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className='text-blue-400 hover:text-blue-300 underline text-base'>
                      Clear search to see all {activeDay} games
                    </button>
                  </div>
                ) : (
                  <p>No games available for {activeDay}.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <GameEditSuggestionForm
        isOpen={suggestionFormOpen}
        onClose={() => {
          setSuggestionFormOpen(false);
          setSelectedGame(null);
        }}
        game={selectedGame}
      />
    </div>
  );
};

export default GameList;
