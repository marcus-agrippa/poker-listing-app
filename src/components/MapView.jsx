import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { getVenueCoordinates, getRegionCenter } from '../utils/venueCoordinates';
import { FiHeart, FiClock, FiDollarSign, FiUsers } from 'react-icons/fi';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons
const createCustomIcon = (isFavorite, isStartingSoon) => {
  const color = isFavorite ? '#FBBF24' : isStartingSoon ? '#10B981' : '#3B82F6';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">${isFavorite ? '⭐' : '🃏'}</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const MapView = ({ activeDay, dataUrl, facebookPageUrls }) => {
  const { currentUser, userProfile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Determine region
  const region = userProfile?.region || 'Central Coast';
  const venueCoordinates = getVenueCoordinates(region);
  const regionCenter = getRegionCenter(region);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, []);

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

  // Group games by venue for the selected day
  const venueGames = useMemo(() => {
    const filtered = games.filter(game => game.day === activeDay);
    const grouped = {};

    filtered.forEach(game => {
      const venueName = game.venue;
      if (!grouped[venueName]) {
        grouped[venueName] = [];
      }
      grouped[venueName].push(game);
    });

    return grouped;
  }, [games, activeDay]);

  // Get venues with coordinates
  const venuesWithCoordinates = useMemo(() => {
    return Object.entries(venueGames)
      .map(([venueName, venueGamesList]) => {
        const coords = venueCoordinates[venueName];
        if (!coords) {
          console.warn(`No coordinates found for venue: ${venueName}`);
          return null;
        }

        // Check if any game is starting soon (within 2 hours)
        const now = new Date();
        const isStartingSoon = venueGamesList.some(game => {
          const gameDate = new Date(`1970/01/01 ${game.game_time}`);
          gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
          const diffMs = gameDate - now;
          const diffHrs = diffMs / 1000 / 60 / 60;
          return diffHrs >= 0 && diffHrs <= 2;
        });

        return {
          name: venueName,
          coordinates: coords,
          games: venueGamesList,
          isFavorite: currentUser ? isFavorite(venueName) : false,
          isStartingSoon,
        };
      })
      .filter(Boolean);
  }, [venueGames, venueCoordinates, currentUser, isFavorite]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const formatTime = time24 => {
    if (!time24) return 'TBC';
    const [hours, minutes] = time24.split(':');
    const hoursInt = parseInt(hours, 10);
    const hours12 = hoursInt % 12 || 12;
    const amPm = hoursInt >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${amPm}`;
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-96'>
        <div className='loading loading-spinner loading-lg text-white'></div>
      </div>
    );
  }

  if (venuesWithCoordinates.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>🗺️</div>
        <h3 className='text-xl font-semibold text-white mb-2'>
          No games found for {activeDay}
        </h3>
        <p className='text-gray-400'>
          Try selecting a different day to see available games.
        </p>
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* Map Legend */}
      <div className='mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700'>
        <h3 className='text-sm font-semibold text-white mb-2 text-center'>Map Legend:</h3>
        <div className='flex flex-wrap justify-center gap-4 text-sm text-gray-300'>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-yellow-400 rounded-full'></div>
            <span>Favorite Venues</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-green-500 rounded-full'></div>
            <span>Starting Soon (within 2hrs)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-blue-500 rounded-full'></div>
            <span>Other Venues</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className='rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700' style={{ height: '600px' }}>
        <MapContainer
          center={[regionCenter.lat, regionCenter.lng]}
          zoom={regionCenter.zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {venuesWithCoordinates.map((venue, index) => (
            <Marker
              key={index}
              position={[venue.coordinates.lat, venue.coordinates.lng]}
              icon={createCustomIcon(venue.isFavorite, venue.isStartingSoon)}
            >
              <Popup maxWidth={600} minWidth={450} className='custom-popup'>
                <div className='p-4'>
                  {/* Venue Header */}
                  <div className='mb-3'>
                    <h3 className='text-lg font-bold text-gray-900 mb-1 flex items-center gap-2'>
                      {venue.isFavorite && <span className='text-yellow-500'>⭐</span>}
                      {venue.name}
                    </h3>
                    <p className='text-xs text-gray-600'>
                      {venue.coordinates.address}
                      {userLocation && (
                        <span className='ml-2 text-blue-600 font-semibold'>
                          • {calculateDistance(
                            userLocation.lat,
                            userLocation.lng,
                            venue.coordinates.lat,
                            venue.coordinates.lng
                          ).toFixed(1)} km away
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Favorite Button */}
                  {currentUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(venue.name);
                      }}
                      className={`btn btn-xs mb-3 w-full ${
                        venue.isFavorite ? 'btn-warning' : 'btn-outline'
                      }`}
                    >
                      <FiHeart className={venue.isFavorite ? 'fill-current' : ''} />
                      {venue.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                  )}

                  {/* Games List */}
                  <div className='space-y-3'>
                    <h4 className='text-sm font-semibold text-gray-700 flex items-center gap-1'>
                      <FiUsers className='text-blue-500' />
                      {venue.games.length} Game{venue.games.length !== 1 ? 's' : ''} Today
                    </h4>

                    {venue.games.map((game, gameIndex) => (
                      <div
                        key={gameIndex}
                        className='bg-gray-50 rounded-lg p-3 border border-gray-200'
                      >
                        <div className='font-medium text-gray-900 mb-2'>
                          {game.competition}
                        </div>

                        <div className='space-y-1 text-xs text-gray-700'>
                          <div className='flex items-center gap-2'>
                            <FiClock className='text-blue-500 flex-shrink-0' />
                            <span className='font-semibold'>Game Time:</span>
                            <span>{formatTime(game.game_time)}</span>
                          </div>

                          {game.rego_time && (
                            <div className='flex items-center gap-2'>
                              <span className='ml-4 text-gray-600'>Rego:</span>
                              <span>{formatTime(game.rego_time)}</span>
                            </div>
                          )}

                          <div className='flex items-center gap-2'>
                            <FiDollarSign className='text-green-500 flex-shrink-0' />
                            <span className='font-semibold'>Buy-in:</span>
                            <span className='text-green-700 font-medium'>${game.buy_in}</span>
                          </div>

                          {game.starting_stack && (
                            <div className='flex items-center gap-2'>
                              <span className='ml-4 text-gray-600'>Stack:</span>
                              <span>{game.starting_stack}</span>
                            </div>
                          )}
                        </div>

                        {/* Competition Link */}
                        {facebookPageUrls[game.competition] && (
                          <a
                            href={facebookPageUrls[game.competition]}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 hover:underline'
                          >
                            View Competition Page →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Get Directions Link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      venue.name + ', ' + venue.coordinates.address
                    )}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='btn btn-primary btn-sm w-full mt-3 text-white'
                  >
                    🧭 Get Directions
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Venue Count */}
      <div className='mt-4 text-center text-sm text-gray-400'>
        Showing {venuesWithCoordinates.length} venue{venuesWithCoordinates.length !== 1 ? 's' : ''} with games on {activeDay}
      </div>
    </div>
  );
};

export default MapView;
