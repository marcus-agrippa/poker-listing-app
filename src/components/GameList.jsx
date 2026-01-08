import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import {
  FiEdit3,
  FiHeart,
  FiClock,
  FiSearch,
  FiX,
  FiMapPin,
  FiShare2,
} from 'react-icons/fi';
import GameEditSuggestionForm from './suggestions/GameEditSuggestionForm';
import AdvancedFilters from './AdvancedFilters';
import BuyInQuickFilters from './ui/BuyInQuickFilters';
import { getVenueCoordinates } from '../utils/venueCoordinates';
import QuickLogModal from './dashboard/QuickLogModal';
import GameConfirmButton from './ui/GameConfirmButton';
import AddToCalendarButton from './ui/AddToCalendarButton';
import GameShareMenu from './ui/GameShareMenu';
import GameActionsMenu from './ui/GameActionsMenu';

const GameList = ({ activeDay, dataUrl, facebookPageUrls, region }) => {
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
  const [userLocation, setUserLocation] = useState(null);
  const [quickLogModalOpen, setQuickLogModalOpen] = useState(false);
  const [quickLogGame, setQuickLogGame] = useState(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareGame, setShareGame] = useState(null);
  const [filters, setFilters] = useState({
    buyIn: { min: '', max: '' },
    competitions: [],
    timeSlot: 'all',
    favoritesOnly: false,
    startingSoon: false,
    sortByDistance: false,
  });

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, []);

  // Auto-prompt for quick log when viewing recently ended games
  useEffect(() => {
    if (!currentUser || filteredGames.length === 0) return;

    const now = new Date();
    const currentDay = getCurrentDay();

    // Only check if viewing today's games
    if (activeDay !== currentDay) return;

    // Check when we last prompted or dismissed
    const quickLogData = localStorage.getItem('quickLogPromptData');
    const today = new Date().toISOString().split('T')[0];

    if (quickLogData) {
      const data = JSON.parse(quickLogData);

      // If dismissed today, don't prompt again today
      if (data.dismissedDate === today) return;

      // If dismissed yesterday or before, check cooldown
      if (data.dismissedDate) {
        const dismissedDate = new Date(data.dismissedDate);
        const daysSinceDismissal = Math.floor((now - dismissedDate) / (1000 * 60 * 60 * 24));

        // Gradually increase cooldown: 1 day, then 3 days, then 7 days
        const dismissCount = data.dismissCount || 0;
        let cooldownDays = 1;
        if (dismissCount >= 3) cooldownDays = 7;
        else if (dismissCount >= 1) cooldownDays = 3;

        if (daysSinceDismissal < cooldownDays) return;
      }

      // If prompted today already (and not dismissed), don't prompt again
      if (data.promptedDate === today) return;
    }

    // Find games that ended in the last 30 minutes to 3 hours
    const recentlyEndedGames = filteredGames.filter(game => {
      const gameDate = new Date(`1970/01/01 ${game.game_time}`);
      gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

      // Add estimated game duration (4 hours for tournaments)
      const gameEndTime = new Date(gameDate.getTime() + 4 * 60 * 60 * 1000);
      const timeSinceEnd = now - gameEndTime;
      const hoursSinceEnd = timeSinceEnd / (1000 * 60 * 60);

      // Game ended between 0.5 and 3 hours ago
      return hoursSinceEnd >= 0.5 && hoursSinceEnd <= 3;
    });

    // If there's a recently ended game and cooldown has passed
    if (recentlyEndedGames.length > 0) {
      // Wait 2 seconds after page load to show the prompt
      const timer = setTimeout(() => {
        setQuickLogGame(recentlyEndedGames[0]);
        setQuickLogModalOpen(true);

        // Update prompt data
        const existingData = quickLogData ? JSON.parse(quickLogData) : {};
        localStorage.setItem('quickLogPromptData', JSON.stringify({
          ...existingData,
          promptedDate: today,
        }));
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [filteredGames, currentUser, activeDay]);

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
    // Filter by day (including one-off events on their scheduled day)
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
        gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        const diffMs = gameDate - now;
        const diffHrs = diffMs / 1000 / 60 / 60;
        return diffHrs >= 0 && diffHrs <= 2;
      });
    }

    // Sort by distance if enabled
    let sorted = filtered;
    if (filters.sortByDistance && userLocation) {
      const venueCoordinates = getVenueCoordinates(region);
      sorted = [...filtered].sort((a, b) => {
        const coordsA = venueCoordinates[a.venue];
        const coordsB = venueCoordinates[b.venue];

        if (!coordsA && !coordsB) return 0;
        if (!coordsA) return 1;
        if (!coordsB) return -1;

        const distanceA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coordsA.lat,
          coordsA.lng
        );
        const distanceB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coordsB.lat,
          coordsB.lng
        );

        return distanceA - distanceB;
      });
    } else {
      // Sort by favorites first, then by time
      sorted = sortGamesByFavorites(filtered);
    }

    setFilteredGames(sorted);
  }, [
    games,
    activeDay,
    searchTerm,
    filters,
    currentUser,
    isFavorite,
    sortGamesByFavorites,
    userLocation,
    region,
  ]);

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

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
    'Bullets Poker League': '/bullets-poker-league-logo.png',
    'Stacked Poker': '/stacked-poker-logo.png',
    'Casino Canberra Poker': '/casino-canberra-logo.png',
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

                // Get venue coordinates and calculate distance
                const venueCoordinates = getVenueCoordinates(region);
                const venueCoords = venueCoordinates[game.venue];
                const distance =
                  userLocation && venueCoords
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        venueCoords.lat,
                        venueCoords.lng
                      )
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
                      } ${
                        game.one_off
                          ? 'ring-2 ring-purple-500 ring-opacity-60'
                          : ''
                      }`}>
                      {competitionLogos[game.competition] && (
                        <img
                          src={competitionLogos[game.competition]}
                          alt={`${game.competition} logo`}
                          className='mb-3 w-20 h-20 mx-auto hover:scale-105 transition-transform'
                        />
                      )}

                      {/* One-off event badge */}
                      {game.one_off && (
                        <div className='mb-3 flex justify-center'>
                          <span className='inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg'>
                            🏆 SPECIAL EVENT
                          </span>
                        </div>
                      )}

                      {/* Quick Actions - Favorite visible for logged in, menu for all */}
                      <div className='absolute top-2 right-2 flex gap-2'>
                        {/* Quick Favorite Toggle (visible for logged-in users) */}
                        {currentUser && (
                          <button
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(game.venue);
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all border-none text-sm ${
                              isVenueFavorite
                                ? 'bg-yellow-500 bg-opacity-90 hover:bg-yellow-400 text-white'
                                : 'bg-gray-700 bg-opacity-90 hover:bg-gray-600 text-gray-300'
                            }`}
                            title={
                              isVenueFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                            aria-label={
                              isVenueFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }>
                            <FiHeart
                              className={isVenueFavorite ? 'fill-current' : ''}
                            />
                          </button>
                        )}

                        {/* Actions Menu (only for logged-in users) */}
                        {currentUser && (
                          <GameActionsMenu
                            game={game}
                            isFavorite={isVenueFavorite}
                            onToggleFavorite={() => toggleFavorite(game.venue)}
                            onSuggestEdit={() => {
                              setSelectedGame(game);
                              setSuggestionFormOpen(true);
                            }}
                            onShare={() => {
                              setShareGame(game);
                              setShareMenuOpen(true);
                            }}
                            showEditButton={!!currentUser}
                          />
                        )}
                      </div>
                      <div className='mb-6'>
                        <h3 className='text-xl text-blue-500 font-bold mb-1'>
                          {isVenueFavorite && (
                            <span className='text-yellow-400 mr-2'>⭐</span>
                          )}
                          {game.venue}
                        </h3>
                        {/* Distance indicator */}
                        {distance !== null && (
                          <div className='flex items-center justify-center gap-1 text-xs text-gray-400 mb-1'>
                            <FiMapPin className='text-blue-400' />
                            <span>approx. {distance.toFixed(1)} km away</span>
                          </div>
                        )}
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
                        {game.one_off && game.event_name && (
                          <>
                            <div className='font-medium text-white text-left p-1'>
                              Event Name:
                            </div>
                            <div className='text-center border border-purple-500 bg-purple-900 bg-opacity-30 p-1 font-semibold'>
                              {game.event_name}
                            </div>
                          </>
                        )}
                        {game.one_off && game.event_date && (
                          <>
                            <div className='font-medium text-white text-left p-1'>
                              Event Date:
                            </div>
                            <div className='text-center border border-purple-500 bg-purple-900 bg-opacity-30 p-1 font-semibold'>
                              {new Date(game.event_date).toLocaleDateString(
                                'en-AU',
                                {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                }
                              )}
                            </div>
                          </>
                        )}
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

                      {/* Game Confirmation */}
                      {(() => {
                        // Check if confirmation button should be shown
                        const now = new Date();
                        const gameDate = new Date(`1970/01/01 ${game.game_time}`);
                        gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                        const diffMs = gameDate - now;
                        const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);
                        const shouldShowConfirmButton = diffHrs >= -5;

                        return shouldShowConfirmButton ? (
                          <div className='mt-4 pt-3 border-t border-gray-700'>
                            <GameConfirmButton game={game} region={region} />
                          </div>
                        ) : null;
                      })()}
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

      <QuickLogModal
        isOpen={quickLogModalOpen}
        onClose={() => {
          setQuickLogModalOpen(false);
          setQuickLogGame(null);

          // Track dismissal in localStorage
          const quickLogData = localStorage.getItem('quickLogPromptData');
          const today = new Date().toISOString().split('T')[0];

          if (quickLogData) {
            const data = JSON.parse(quickLogData);
            const dismissCount = (data.dismissCount || 0) + 1;

            localStorage.setItem('quickLogPromptData', JSON.stringify({
              ...data,
              dismissedDate: today,
              dismissCount: dismissCount,
            }));
          } else {
            localStorage.setItem('quickLogPromptData', JSON.stringify({
              dismissedDate: today,
              dismissCount: 1,
            }));
          }
        }}
        game={quickLogGame}
        autoTriggered={true}
        region={region}
      />

      <GameShareMenu
        isOpen={shareMenuOpen}
        onClose={() => {
          setShareMenuOpen(false);
          setShareGame(null);
        }}
        game={shareGame}
      />
    </div>
  );
};

export default GameList;
