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

  function getTimeUntil(gameTime) {
    const now = new Date();
    const gameDate = new Date(`1970/01/01 ${gameTime}`);
    gameDate.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());

    const diffMs = gameDate - now;
    const diffHrs = Math.floor(diffMs / 1000 / 60 / 60);
    const diffMins = Math.floor((diffMs / 1000 / 60) % 60);
    let status;

    if (diffHrs < -7) {
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
              .map((game, index) => {
                const gameStatus = getTimeUntil(game.game_time);

                return (
                  <a
                    key={index}
                    href={facebookPageUrls[game.competition]}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`block ${
                      facebookPageUrls[game.competition] ? 'cursor-pointer' : ''
                    }`}>
                    <div className='bg-gray-800 rounded-xl shadow-2xl p-6 relative'>
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
                      <h3 className='text-xl text-blue-500 font-semibold mb-6'>
                        {game.venue}
                      </h3>
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
                        <div className='text-center font-medium bg-gray-700 border border-gray-700 p-1'>
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
