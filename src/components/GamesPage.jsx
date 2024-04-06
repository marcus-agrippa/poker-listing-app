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
};

const facebookPageUrls = isCentralCoast
  ? centralCoastFacebookPageUrls
  : isNewcastle
  ? newcastleFacebookPageUrls
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
