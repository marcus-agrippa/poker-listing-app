import React, { useState, useEffect } from 'react';
import DayNightTag from './ui/DayNightTag';

const GameList = ({ activeDay, dataUrl, facebookPageUrls }) => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };

    fetchData();
  }, [dataUrl]);

  useEffect(() => {
    const filtered = games.filter(game => game.day === activeDay);
    setFilteredGames(filtered);
  }, [games, activeDay]);

  const formatTime = time24 => {
    const [hours, minutes] = time24.split(':');
    const hoursInt = parseInt(hours, 10);
    const hours12 = hoursInt % 12 || 12;
    const amPm = hoursInt >= 12 ? 'PM' : 'AM';
    return `${hours12}:${minutes} ${amPm}`;
  };

  const competitionLogos = {
    'APL Poker': '/apl-poker-logo.png',
    'UPT Poker': '/upt-poker-logo.png',
    'WPT League': '/wpt-poker-logo.png',
  };

  return (
    <div>
      <h2 className='text-4xl font-bold mb-6 mt-8 text-center text-gray-100'>
        {activeDay} Games
      </h2>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredGames.length > 0 ? (
            filteredGames
              .sort(
                (a, b) =>
                  new Date(`1970/01/01 ${a.game_time}`) -
                  new Date(`1970/01/01 ${b.game_time}`)
              )
              .map((game, index) => (
                <a
                  key={index}
                  href={facebookPageUrls[game.competition]}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`block ${
                    facebookPageUrls[game.competition] ? 'cursor-pointer' : ''
                  }`}>
                  <div className='bg-gray-800 hover:bg-gray-700 transition-colors rounded-xl shadow-2xl p-6 hover:shadow-md transition-shadow duration-300 ease-in-out relative'>
                    {competitionLogos[game.competition] && (
                      <img
                        src={competitionLogos[game.competition]}
                        alt={`${game.competition} logo`}
                        className='mb-3 w-20 h-20 mx-auto hover:scale-105 transition-transform'
                      />
                    )}
                    <DayNightTag
                      gameTime={game.game_time}
                      className='absolute top-4 right-4'
                    />
                    <h3 className='text-xl text-blue-500 font-semibold mb-3'>
                      {game.venue}
                    </h3>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>
                        Competition:
                      </span>{' '}
                      {game.competition}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>
                        Registration Time:{' '}
                      </span>
                      {game.rego_time ? formatTime(game.rego_time) : 'TBC'}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>
                        ⏰Game Time:{' '}
                      </span>
                      {formatTime(game.game_time)}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>
                        Late Rego:{' '}
                      </span>
                      {game.late_rego ? formatTime(game.late_rego) : 'TBC'}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>💲Buy-in:</span>{' '}
                      {game.buy_in}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>Re-Buy:</span>{' '}
                      {game.re_buy || 'TBC'}
                    </p>
                    <p className='text-md text-gray-300 mb-2'>
                      <span className='font-medium text-white'>
                        Starting Stack:
                      </span>{' '}
                      {game.starting_stack || 'TBC'}
                    </p>
                  </div>
                </a>
              ))
          ) : (
            <p className='text-center col-span-full text-xl text-gray-300'>
              No games available for {activeDay}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameList;
