import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabList from './TabList';
import GameList from './GameList';
import RegionSelector from './auth/RegionSelector';
import SignupPromotionCard from './ui/SignupPromotionCard';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const RegionFilteredGamesPage = () => {
  const [activeDay, setActiveDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );
  const { currentUser, userProfile } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState('');
  const [showRegionSelector, setShowRegionSelector] = useState(false);

  const regionConfig = {
    'Central Coast': {
      dataUrl: '/data.json',
      facebookPageUrls: {
        'APL Poker':
          'https://www.facebook.com/p/APL-Central-Coast-NSW-100063534522335/',
        'UPT Poker': 'https://www.facebook.com/centralcoastpokerchampionships/',
        'WPT League': 'https://au.wptleague.com/venue.aspx',
      },
    },
    Newcastle: {
      dataUrl: '/data-newcastle.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/groups/APLNewcastle/',
        'UPT Poker': 'https://www.facebook.com/NPC.Poker/',
        'WPT League': 'https://au.wptleague.com/venue.aspx',
        'Kings Poker': 'https://www.facebook.com/KingsPokerNewcastle/',
      },
    },
    Ballarat: {
      dataUrl: '/data-ballarat.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/groups/305550272818441/',
        'Poker Nation':
          'https://www.facebook.com/p/Poker-Nation-Ballarat-100067701552687/',
      },
    },
    Wollongong: {
      dataUrl: '/data-wollongong.json',
      facebookPageUrls: {
        'WPT League': 'https://www.facebook.com/wptleagueillawarra/',
        'NPL Poker': 'https://www.facebook.com/npl.wollongong/',
      },
    },
    Townsville: {
      dataUrl: '/data-townsville.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/townsvilleapl/',
      },
    },
    'Sunshine Coast': {
      dataUrl: '/data-sunshine-coast.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/888PLSunshineCoast/',
      },
    },
    Perth: {
      dataUrl: '/data-perth.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/groups/APLWASOUTH/',
        'Perth Poker League':
          'https://www.facebook.com/perthpokerleague.com.au/',
        'Shark Poker': 'https://www.facebook.com/sharkpokerperth/',
      },
    },
    Geelong: {
      dataUrl: '/data-geelong.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/APLGeelong/',
      },
    },
    'Gold Coast': {
      dataUrl: '/data-gold-coast.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/APLGoldCoast/',
        'WPT League': 'https://au.wptleague.com/live.aspx?G,1,1,8,0',
        'Star Poker': 'https://www.starpoker.com.au/gold-coast',
      },
    },
  };

  useEffect(() => {
    if (userProfile && userProfile.region) {
      setSelectedRegion(userProfile.region);
    } else if (currentUser && !userProfile?.region) {
      setShowRegionSelector(true);
    }
  }, [currentUser, userProfile]);

  const handleRegionChange = region => {
    setSelectedRegion(region);
    setShowRegionSelector(false);
  };

  const currentConfig =
    regionConfig[selectedRegion] || regionConfig['Central Coast'];

  if (currentUser && showRegionSelector) {
    return (
      <div className='mx-auto p-4 mt-8 max-w-screen-md mb-8'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Welcome to Poker Games!
          </h1>
          <p className='text-gray-300'>
            Please select your region to see relevant poker games.
          </p>
        </div>
        <RegionSelector
          onRegionChange={handleRegionChange}
          currentRegion={selectedRegion}
        />
      </div>
    );
  }

  return (
    <div className='mx-auto p-4 mt-8 max-w-screen-xl mb-8'>
      {currentUser && selectedRegion && (
        <div className='text-center mb-6'>
          <div className='flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-2 sm:space-y-0 mb-4'>
            <h1 className='text-xl sm:text-2xl font-bold text-white'>
              {selectedRegion} Poker Games
            </h1>
            <button
              onClick={() => setShowRegionSelector(true)}
              className='btn btn-outline btn-sm text-white hover:btn-primary'>
              Change Region
            </button>
          </div>
        </div>
      )}

      <TabList
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        daysOfWeek={daysOfWeek}
      />
      <GameList
        activeDay={activeDay}
        dataUrl={currentConfig.dataUrl}
        facebookPageUrls={currentConfig.facebookPageUrls}
      />
      
      {/* Show promotion card to logged-out users */}
      {!currentUser && (
        <div className="mt-12">
          <SignupPromotionCard />
        </div>
      )}

      {showRegionSelector && currentUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='relative max-w-2xl w-full'>
            <button
              onClick={() => setShowRegionSelector(false)}
              className='absolute -top-2 -right-2 btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600 z-10'>
              ✕
            </button>
            <RegionSelector
              onRegionChange={handleRegionChange}
              currentRegion={selectedRegion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionFilteredGamesPage;
