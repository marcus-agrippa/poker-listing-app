// GamesPage.jsx
import React, { useState } from 'react';
import TabList from './TabList';
import GameList from './GameList';

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const hostname = window.location.hostname;
const isCentralCoast = hostname === 'pokercentralcoast.com';
const isNewcastle = hostname === 'pokernewcastle.com';
const isBallarat = hostname === 'pokerballarat.com';
const isWollongong = hostname === 'pokerwollongong.com';
const isTownsville = hostname === 'pokertownsville.com';
const isSunshineCoast = hostname === 'pokersunshinecoast.com';
const isPerth = hostname === 'pokerperth.com';
const isGeelong = hostname === 'pokergeelong.com';

const centralCoastFacebookPageUrls = {
  'APL Poker':
    'https://www.facebook.com/p/APL-Central-Coast-NSW-100063534522335/',
  'UPT Poker': 'https://www.facebook.com/centralcoastpokerchampionships/',
  'WPT League': 'https://au.wptleague.com/venue.aspx',
};

const newcastleFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/groups/APLNewcastle/',
  'UPT Poker': 'https://www.facebook.com/NPC.Poker/',
  'WPT League': 'https://au.wptleague.com/venue.aspx',
  'Kings Poker': 'https://www.facebook.com/KingsPokerNewcastle/',
};

const ballaratFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/groups/305550272818441/',
  'Poker Nation':
    'https://www.facebook.com/p/Poker-Nation-Ballarat-100067701552687/',
};

const wollongongFacebookPageUrls = {
  'WPT League': 'https://www.facebook.com/wptleagueillawarra/',
  'NPL Poker': 'https://www.facebook.com/npl.wollongong/',
};

const townsvilleFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/townsvilleapl/',
};

const sunshineCoastFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/888PLSunshineCoast/',
};

const perthFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/groups/APLWASOUTH/',
  'Perth Poker League': 'https://www.facebook.com/perthpokerleague.com.au/',
  'Shark Poker': 'https://www.facebook.com/sharkpokerperth/',
};

const geelongFacebookPageUrls = {
  'APL Poker': 'https://www.facebook.com/APLGeelong/',
};

const facebookPageUrls = isCentralCoast
  ? centralCoastFacebookPageUrls
  : isNewcastle
  ? newcastleFacebookPageUrls
  : isBallarat
  ? ballaratFacebookPageUrls
  : isWollongong
  ? wollongongFacebookPageUrls
  : isTownsville
  ? townsvilleFacebookPageUrls
  : isSunshineCoast
  ? sunshineCoastFacebookPageUrls
  : isPerth
  ? perthFacebookPageUrls
  : isGeelong
  ? geelongFacebookPageUrls
  : {};

const GamesPage = ({ dataUrl }) => {
  const [activeDay, setActiveDay] = useState(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );

  return (
    <div className='mx-auto p-4 mt-8 max-w-screen-xl mb-8'>
      <TabList
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        daysOfWeek={daysOfWeek}
      />
      <GameList
        activeDay={activeDay}
        dataUrl={dataUrl}
        facebookPageUrls={facebookPageUrls}
      />
    </div>
  );
};

export default GamesPage;
