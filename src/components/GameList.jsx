import React, { useState, useEffect } from 'react';

const GameList = ({ activeDay }) => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json'); // Adjust if your JSON file is stored elsewhere
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = games.filter((game) => game.day === activeDay);
    setFilteredGames(filtered);
  }, [games, activeDay]);

  // Helper function to convert 24-hour time to 12-hour format
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hoursInt = parseInt(hours, 10); // Convert hours part to an integer
    const hours12 = hoursInt % 12 || 12;  // Convert to 12-hour format and remove leading 0
    const amPm = hoursInt >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${amPm}`;
  };  

  const competitionLogos = {
    'APL Poker': '/apl-poker-logo.png',
    'UPT Poker': '/upt-poker-logo.png',
    'WPT League': '/wpt-poker-logo.png',
  };

  const facebookPageUrls = {
    'APL Poker': 'https://www.facebook.com/p/APL-Central-Coast-NSW-100063534522335/',
    'UPT Poker': 'https://www.facebook.com/centralcoastpokerchampionships/',
    'WPT League': 'https://au.wptleague.com/venue.aspx'
  };

  return (
    <div>
      <h2 className="text-4xl font-bold mb-6 mt-8 text-center text-gray-100">{activeDay} Games</h2>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game, index) => (
              <a key={index} href={facebookPageUrls[game.competition]} target="_blank" rel="noopener noreferrer" className={`block ${facebookPageUrls[game.competition] ? 'cursor-pointer' : ''}`}>
                <div className="bg-gray-800 hover:bg-gray-700 rounded-xl shadow-2xl p-6 hover:shadow-md transition-shadow duration-300 ease-in-out">
                  {competitionLogos[game.competition] && (
                    <img src={competitionLogos[game.competition]} alt={`${game.competition} logo`} className="mb-3 w-20 h-20 mx-auto" />
                  )}
                  <h3 className="text-xl text-blue-500 font-semibold mb-3">{game.venue}</h3>
                  <p className="text-md text-gray-300 mb-2"><span className="font-medium text-white">Competition:</span> {game.competition}</p>
                  <p className="text-md text-gray-300 mb-2"><span className="font-medium text-white">Registration Time: </span>{game.rego_time ? formatTime(game.rego_time) : 'TBC'}</p>
                  <p className="text-md text-gray-300 mb-2"><span className="font-medium text-white">Game Time: </span>{formatTime(game.game_time)}</p>
                  <p className="text-md text-gray-300 mb-2"><span className="font-medium text-white">Buy-in:</span> {game.buy_in}</p>
                  <p className="text-md text-gray-300 mb-2"><span className="font-medium text-white">Starting Stack:</span> {game.starting_stack || 'N/A'}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center col-span-full text-xl text-gray-300">No games available for {activeDay}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameList;


