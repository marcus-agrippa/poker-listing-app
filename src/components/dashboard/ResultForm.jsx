import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResultForm = ({ isOpen, onClose, onSubmit, editingResult }) => {
  const { userProfile } = useAuth();
  const [gameName, setGameName] = useState('');
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [position, setPosition] = useState('');
  const [totalPlayers, setTotalPlayers] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [winnings, setWinnings] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [showCustomFields, setShowCustomFields] = useState(false);

  const regionConfig = {
    'Central Coast': '/data.json',
    Newcastle: '/data-newcastle.json',
    Ballarat: '/data-ballarat.json',
    Wollongong: '/data-wollongong.json',
    Townsville: '/data-townsville.json',
    'Sunshine Coast': '/data-sunshine-coast.json',
    Perth: '/data-perth.json',
    Geelong: '/data-geelong.json',
    'Gold Coast': '/data-gold-coast.json',
    Brisbane: '/data-brisbane.json',
    Sydney: '/data-sydney.json',
    Melbourne: '/data-melbourne.json',
    Adelaide: '/data-adelaide.json',
  };

  useEffect(() => {
    const fetchGames = async () => {
      if (userProfile?.region && regionConfig[userProfile.region]) {
        try {
          const response = await fetch(regionConfig[userProfile.region]);
          const games = await response.json();
          setAvailableGames(games);
        } catch (error) {
          console.error('Error fetching games:', error);
        }
      }
    };

    fetchGames();
  }, [userProfile]);

  useEffect(() => {
    if (editingResult) {
      setGameName(editingResult.gameName || '');
      setVenue(editingResult.venue || '');
      setDate(editingResult.date || '');
      setPosition(editingResult.position || '');
      setTotalPlayers(editingResult.totalPlayers || '');
      setBuyIn(editingResult.buyIn || '');
      setWinnings(editingResult.winnings || '');
      setComments(editingResult.comments || '');
      setSelectedGame('');
      setShowCustomFields(true);
    } else {
      setGameName('');
      setVenue('');
      setDate(new Date().toISOString().split('T')[0]);
      setPosition('');
      setTotalPlayers('');
      setBuyIn('');
      setWinnings('');
      setComments('');
      setSelectedGame('');
      setShowCustomFields(false);
    }
  }, [editingResult]);

  const handleGameSelection = gameId => {
    setSelectedGame(gameId);

    if (gameId === 'custom') {
      setShowCustomFields(true);
      setGameName('');
      setVenue('');
      setBuyIn('');
      return;
    }

    if (gameId === '') {
      setShowCustomFields(false);
      setGameName('');
      setVenue('');
      setBuyIn('');
      return;
    }

    // Extract index from gameId (format: venue-competition-day-index)
    const parts = gameId.split('-');
    const index = parseInt(parts[parts.length - 1]);
    const game = availableGames[index];

    if (game) {
      setGameName(`${game.competition} - ${game.day}`);
      setVenue(game.venue);
      setBuyIn(
        game.buy_in ? game.buy_in.replace('$', '').replace(',', '') : ''
      );
      setShowCustomFields(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!gameName || !venue) {
      toast.error('Game name and venue are required fields.');
      setLoading(false);
      return;
    }

    const resultData = {
      gameName,
      venue,
      date,
      position: position ? parseInt(position) : null,
      totalPlayers: totalPlayers ? parseInt(totalPlayers) : null,
      buyIn: Math.max(0, parseFloat(buyIn) || 0),
      winnings: Math.max(0, parseFloat(winnings) || 0),
      comments,
    };

    try {
      await onSubmit(resultData);
      if (editingResult) {
        toast.success('Result updated successfully!');
      }
    } catch (error) {
      console.error('Error submitting result:', error);
      toast.error('Failed to save result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='card w-full max-w-lg bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto'>
        <div className='card-body'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='card-title text-white'>
              {editingResult ? 'Edit Result' : 'Add New Result'}
            </h3>
            <button
              onClick={onClose}
              className='btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600'>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {!editingResult && availableGames.length > 0 && (
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text text-white'>
                    Select Game (Optional)
                  </span>
                </label>
                <select
                  className='select select-bordered w-full'
                  value={selectedGame}
                  onChange={e => handleGameSelection(e.target.value)}>
                  <option value=''>Choose from your region's games...</option>
                  {availableGames.map((game, index) => {
                    const gameId = `${game.venue}-${game.competition}-${game.day}-${index}`;
                    return (
                      <option key={gameId} value={gameId}>
                        {game.venue} - {game.competition} ({game.day}) -{' '}
                        {game.buy_in}
                      </option>
                    );
                  })}
                  <option value='custom'>Add custom game not listed</option>
                </select>
                <label className='label'>
                  <span className='label-text-alt text-gray-400'>
                    Or select "Add custom game" to enter your own details
                  </span>
                </label>
              </div>
            )}

            {(showCustomFields ||
              editingResult ||
              availableGames.length === 0) && (
              <>
                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-white'>
                      Game/Tournament Name *
                    </span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Friday Night Tournament'
                    className={`input input-bordered w-full ${
                      !gameName ? 'placeholder-gray-500' : ''
                    }`}
                    value={gameName}
                    onChange={e => setGameName(e.target.value)}
                    required
                  />
                </div>

                <div className='form-control'>
                  <label className='label'>
                    <span className='label-text text-white'>Venue *</span>
                  </label>
                  <input
                    type='text'
                    placeholder='e.g. Club Name or Location'
                    className={`input input-bordered w-full ${
                      !venue ? 'placeholder-gray-500' : ''
                    }`}
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {!showCustomFields &&
              !editingResult &&
              selectedGame &&
              selectedGame !== 'custom' && (
                <div className='bg-slate-700 p-3 rounded-lg'>
                  <h4 className='text-white font-medium mb-2'>
                    Selected Game:
                  </h4>
                  <p className='text-gray-300 text-sm'>
                    <strong>Game:</strong> {gameName}
                    <br />
                    <strong>Venue:</strong> {venue}
                    <br />
                    <strong>Buy-in:</strong> ${buyIn}
                  </p>
                </div>
              )}

            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Date</span>
              </label>
              <input
                type='date'
                className='input input-bordered w-full'
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text text-white'>
                    Your Position (Optional)
                  </span>
                </label>
                <input
                  type='number'
                  placeholder='1 (if known)'
                  min='1'
                  className={`input input-bordered w-full ${
                    !position ? 'placeholder-gray-500' : ''
                  }`}
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                />
              </div>

              <div className='form-control'>
                <label className='label'>
                  <span className='label-text text-white'>
                    Total Players (Optional)
                  </span>
                </label>
                <input
                  type='number'
                  placeholder='50 (if known)'
                  min='1'
                  className={`input input-bordered w-full ${
                    !totalPlayers ? 'placeholder-gray-500' : ''
                  }`}
                  value={totalPlayers}
                  onChange={e => setTotalPlayers(e.target.value)}
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='form-control'>
                <label className='label'>
                  <span className='label-text text-white'>Buy-in ($)</span>
                </label>
                <input
                  type='number'
                  placeholder='50.00'
                  step='0.01'
                  min='0'
                  className={`input input-bordered w-full ${
                    !buyIn && !selectedGame ? 'placeholder-gray-500' : ''
                  }`}
                  value={buyIn}
                  onChange={e => setBuyIn(e.target.value)}
                />
              </div>

              <div className='form-control'>
                <label className='label'>
                  <span className='label-text text-white'>Winnings ($)</span>
                </label>
                <input
                  type='number'
                  placeholder='150.00'
                  step='0.01'
                  min='0'
                  className={`input input-bordered w-full ${
                    !winnings ? 'placeholder-gray-500' : ''
                  }`}
                  value={winnings}
                  onChange={e => setWinnings(e.target.value)}
                />
              </div>
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Comments</span>
              </label>
              <textarea
                className={`textarea textarea-bordered h-20 ${
                  !comments ? 'placeholder-gray-500' : ''
                }`}
                placeholder='Any notes about this game...'
                value={comments}
                onChange={e => setComments(e.target.value)}></textarea>
            </div>

            <div className='form-control mt-6'>
              <button
                type='submit'
                disabled={loading}
                className='btn btn-primary w-full'>
                {loading
                  ? 'Saving...'
                  : editingResult
                  ? 'Update Result'
                  : 'Add Result'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResultForm;
