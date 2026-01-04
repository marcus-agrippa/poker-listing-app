import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TabList from './TabList';
import GameList from './GameList';
import MapView from './MapView';
import RegionSelector from './auth/RegionSelector';
import SignupPromotionCard from './ui/SignupPromotionCard';
import HeroSection from './ui/HeroSection';
import SocialProofSection from './ui/SocialProofSection';
import ScrollToTop from './ui/ScrollToTop';
import QuickStatsCard from './ui/QuickStatsCard';
import EmptyState from './ui/EmptyState';
import { FiList, FiMap } from 'react-icons/fi';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [allGames, setAllGames] = useState([]);
  const [gameCounts, setGameCounts] = useState({});

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
        'APS Newcastle': 'https://apsnewcastle.com/',
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
    Brisbane: {
      dataUrl: '/data-brisbane.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/APLBrisbane/',
        'WPT League': 'https://au.wptleague.com/live.aspx?G,1,1,9,0',
        'National Poker League':
          'https://www.facebook.com/people/NPL-Brisbane-South-Gold-Coast/100066979489839/',
      },
    },
    Sydney: {
      dataUrl: '/data-sydney.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/playAPL/',
        'WPT League': 'https://au.wptleague.com/',
        'National Poker League':
          'https://www.facebook.com/groups/667312633317780/',
      },
    },
    Melbourne: {
      dataUrl: '/data-melbourne.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/groups/aplmetroinner/',
        'WPT League': 'https://au.wptleague.com/',
        'National Poker League': 'https://www.npl.com.au/Events/List',
      },
    },
    Adelaide: {
      dataUrl: '/data-adelaide.json',
      facebookPageUrls: {
        'APL Poker': 'https://www.facebook.com/APLAdelaide/',
        'Stacked Poker': 'https://www.facebook.com/stackedpoker/',
        'Bullet Poker League':
          'https://www.facebook.com/people/Bullets-Poker-League-SA/100078475230349/',
      },
    },
    Canberra: {
      dataUrl: '/data-canberra.json',
      facebookPageUrls: {
        'National Poker League': 'https://www.facebook.com/groups/98473237533/',
        'Casino Canberra Poker': 'https://casinocanberra.com.au/poker-pit/',
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
      setShowRegionSelector(false);
    } else if (currentUser && userProfile && !userProfile.region) {
      // Only show region selector if we have loaded the user profile and it's empty
      setShowRegionSelector(true);
    }
  }, [currentUser, userProfile]);

  const handleRegionChange = region => {
    setSelectedRegion(region);
    setShowRegionSelector(false);
  };

  // Detect region from domain if no selectedRegion
  const getDomainBasedRegion = () => {
    const hostname = window.location.hostname;
    if (hostname === 'pokernewcastle.com') return 'Newcastle';
    if (hostname === 'pokerballarat.com') return 'Ballarat';
    if (hostname === 'pokerwollongong.com') return 'Wollongong';
    if (hostname === 'pokertownsville.com') return 'Townsville';
    if (hostname === 'pokersunshinecoast.com') return 'Sunshine Coast';
    if (hostname === 'pokerperth.com') return 'Perth';
    if (hostname === 'pokergeelong.com') return 'Geelong';
    if (hostname === 'pokergoldcoast.com') return 'Gold Coast';
    if (hostname === 'pokerbrisbane.com') return 'Brisbane';
    if (hostname === 'pokersydney.com') return 'Sydney';
    if (hostname === 'pokermelbourne.com') return 'Melbourne';
    if (hostname === 'pokeradelaide.com') return 'Adelaide';
    if (hostname === 'pokercanberra.com') return 'Canberra';
    return 'Central Coast'; // default
  };

  const currentConfig =
    regionConfig[selectedRegion] || regionConfig[getDomainBasedRegion()];

  // Fetch games data to calculate counts
  useEffect(() => {
    const fetchGamesData = async () => {
      try {
        const response = await fetch(currentConfig.dataUrl);
        const data = await response.json();
        setAllGames(data);

        // Calculate game counts per day (including one-off events)
        const counts = {};
        daysOfWeek.forEach(day => {
          counts[day] = data.filter(game => game.day === day).length;
        });

        setGameCounts(counts);
      } catch (error) {
        console.error('Error fetching games data:', error);
      }
    };

    fetchGamesData();
  }, [currentConfig.dataUrl]);

  // Check if active day has games
  const activeDayGames = allGames.filter(game => game.day === activeDay);

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
    <div>
      {/* Hero Section - only show for logged-out users */}
      {!currentUser && (
        <HeroSection
          regionName={selectedRegion || getDomainBasedRegion()}
          currentUser={currentUser}
        />
      )}

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
          gameCounts={gameCounts}
        />

        {/* Quick Stats Card */}
        {allGames.length > 0 && (
          <QuickStatsCard games={allGames} daysOfWeek={daysOfWeek} />
        )}

        {/* View Toggle */}
        <div className='flex justify-center gap-2 mb-6 mt-6'>
          <button
            className={`btn btn-sm ${
              viewMode === 'list' ? 'btn-primary text-white' : 'btn-outline'
            }`}
            onClick={() => setViewMode('list')}>
            <FiList className='mr-1' /> List View
          </button>
          <button
            className={`btn btn-sm ${
              viewMode === 'map' ? 'btn-primary text-white' : 'btn-outline'
            }`}
            onClick={() => setViewMode('map')}>
            <FiMap className='mr-1' /> Map View
          </button>
        </div>

        {viewMode === 'list' ? (
          activeDayGames.length === 0 ? (
            <EmptyState
              activeDay={activeDay}
              daysOfWeek={daysOfWeek}
              setActiveDay={setActiveDay}
              gamesData={allGames}
            />
          ) : (
            <GameList
              activeDay={activeDay}
              dataUrl={currentConfig.dataUrl}
              facebookPageUrls={currentConfig.facebookPageUrls}
              region={selectedRegion}
            />
          )
        ) : (
          <MapView
            activeDay={activeDay}
            dataUrl={currentConfig.dataUrl}
            facebookPageUrls={currentConfig.facebookPageUrls}
            region={selectedRegion || getDomainBasedRegion()}
          />
        )}

        {/* Show promotion card to logged-out users */}
        {!currentUser && (
          <div className='mt-12'>
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

      {/* Social Proof Section - only show for logged-out users */}
      {!currentUser && <SocialProofSection />}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default RegionFilteredGamesPage;
