import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiLock, FiEdit3 } from 'react-icons/fi';

const QuickLogModal = ({ isOpen, onClose, game, autoTriggered = false, region }) => {
  const { currentUser, userProfile } = useAuth();
  const [buyIn, setBuyIn] = useState('');
  const [cashOut, setCashOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [selectedGame, setSelectedGame] = useState(game);
  const [availableGames, setAvailableGames] = useState([]);
  const [showGameSelector, setShowGameSelector] = useState(false);

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
    Canberra: '/data-canberra.json',
  };

  // Fetch available games from user's region
  useEffect(() => {
    const fetchGames = async () => {
      const userRegion = region || userProfile?.region;
      if (userRegion && regionConfig[userRegion]) {
        try {
          const response = await fetch(regionConfig[userRegion]);
          const games = await response.json();
          setAvailableGames(games);
        } catch (error) {
          console.error('Error fetching games:', error);
        }
      }
    };

    if (isOpen) {
      fetchGames();
    }
  }, [isOpen, region, userProfile]);

  // Pre-fill buy-in from game data
  useEffect(() => {
    if (selectedGame && selectedGame.buy_in) {
      const cleanBuyIn = selectedGame.buy_in.replace('$', '').replace(',', '').trim();
      setBuyIn(cleanBuyIn);
    }
  }, [selectedGame]);

  // Update selected game when prop changes
  useEffect(() => {
    setSelectedGame(game);
  }, [game]);

  const calculateStats = async (profit) => {
    try {
      // Fetch user's recent results to calculate win rate and streak
      const q = query(
        collection(db, 'results'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => doc.data());

      // Calculate win rate (sessions with profit > 0)
      const wins = results.filter(r => {
        const sessionProfit = (r.winnings || 0) - (r.buyIn || 0);
        return sessionProfit > 0;
      }).length;

      const totalSessions = results.length + 1; // +1 for current session
      const winRate = totalSessions > 0 ? Math.round((wins / totalSessions) * 100) : 0;

      // Calculate current streak
      let currentStreak = profit > 0 ? 1 : 0;
      let streakType = profit > 0 ? 'win' : 'loss';

      for (const result of results) {
        const resultProfit = (result.winnings || 0) - (result.buyIn || 0);
        const isWin = resultProfit > 0;

        if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
          currentStreak++;
        } else {
          break;
        }
      }

      return { winRate, currentStreak, streakType };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return { winRate: 0, currentStreak: 1, streakType: profit > 0 ? 'win' : 'loss' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const buyInValue = parseFloat(buyIn) || 0;
    const cashOutValue = parseFloat(cashOut) || 0;

    if (buyInValue <= 0) {
      toast.error('Please enter a valid buy-in amount');
      return;
    }

    setLoading(true);

    try {
      const profit = cashOutValue - buyInValue;

      // Calculate stats before saving
      const stats = await calculateStats(profit);

      // Save result to Firestore
      await addDoc(collection(db, 'results'), {
        userId: currentUser.uid,
        gameName: selectedGame ? `${selectedGame.competition} - ${selectedGame.day}` : 'Quick Log',
        venue: selectedGame?.venue || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        buyIn: buyInValue,
        winnings: cashOutValue,
        profit: profit,
        createdAt: new Date().toISOString(),
        quickLog: true, // Flag to indicate this was a quick log
      });

      // Set session stats for feedback display
      setSessionStats({
        profit,
        buyIn: buyInValue,
        cashOut: cashOutValue,
        ...stats
      });

      setShowFeedback(true);

      // Reset dismissal count since user engaged with the feature
      if (autoTriggered) {
        const quickLogData = localStorage.getItem('quickLogPromptData');
        if (quickLogData) {
          const data = JSON.parse(quickLogData);
          localStorage.setItem('quickLogPromptData', JSON.stringify({
            ...data,
            dismissCount: 0, // Reset because they used it
            lastLoggedDate: new Date().toISOString().split('T')[0],
          }));
        }
      }

      // Auto-close feedback after 5 seconds
      setTimeout(() => {
        handleClose();
      }, 5000);

    } catch (error) {
      console.error('Error saving result:', error);
      toast.error('Failed to save session. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setBuyIn('');
    setCashOut('');
    setShowFeedback(false);
    setSessionStats(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  // Feedback screen after submission
  if (showFeedback && sessionStats) {
    const isProfit = sessionStats.profit > 0;
    const profitColor = isProfit ? 'text-green-400' : 'text-red-400';
    const bgColor = isProfit ? 'bg-green-900' : 'bg-red-900';
    const borderColor = isProfit ? 'border-green-600' : 'border-red-600';

    return (
      <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
        <div className='card w-full max-w-md bg-slate-800 shadow-xl'>
          <div className='card-body text-center'>
            {/* Main Result */}
            <div className={`${bgColor} bg-opacity-30 border ${borderColor} rounded-lg p-6 mb-4`}>
              <div className='text-6xl mb-3'>
                {isProfit ? '🎉' : '💪'}
              </div>
              <div className={`text-4xl font-bold ${profitColor} mb-2`}>
                {isProfit ? '+' : ''}${sessionStats.profit.toFixed(2)}
              </div>
              <div className='text-white text-xl font-semibold mb-1'>
                {isProfit ? 'Nice Session!' : 'Better Luck Next Time!'}
              </div>
              <div className='text-gray-400 text-sm'>
                ${sessionStats.buyIn.toFixed(0)} → ${sessionStats.cashOut.toFixed(0)}
              </div>
            </div>

            {/* Stats Grid */}
            <div className='grid grid-cols-2 gap-3 mb-4'>
              {/* Win Rate */}
              <div className='bg-slate-700 rounded-lg p-3'>
                <div className='flex items-center justify-center gap-2 mb-1'>
                  <FiTarget className='text-blue-400' />
                  <span className='text-gray-400 text-xs'>Win Rate</span>
                </div>
                <div className='text-white text-2xl font-bold'>
                  {sessionStats.winRate}%
                </div>
              </div>

              {/* Streak */}
              <div className='bg-slate-700 rounded-lg p-3'>
                <div className='flex items-center justify-center gap-2 mb-1'>
                  {sessionStats.streakType === 'win' ? (
                    <FiTrendingUp className='text-green-400' />
                  ) : (
                    <FiTrendingDown className='text-red-400' />
                  )}
                  <span className='text-gray-400 text-xs'>
                    {sessionStats.streakType === 'win' ? 'Win' : 'Loss'} Streak
                  </span>
                </div>
                <div className='text-white text-2xl font-bold'>
                  {sessionStats.currentStreak}
                  {sessionStats.currentStreak > 1 && sessionStats.streakType === 'win' && (
                    <span className='text-sm ml-1'>🔥</span>
                  )}
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className='bg-slate-700 bg-opacity-50 rounded-lg p-3 mb-4'>
              <div className='flex items-center justify-center gap-2 text-gray-400 text-xs'>
                <FiLock className='text-green-400' />
                <span>100% Private - Only you can see your results</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className='btn btn-primary w-full'>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quick log form
  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
      <div className='card w-full max-w-md bg-slate-800 shadow-xl'>
        <div className='card-body'>
          {/* Header */}
          <div className='flex justify-between items-start mb-2'>
            <div>
              <h3 className='text-2xl font-bold text-white mb-1'>
                {autoTriggered ? 'Just Finished Playing?' : 'Quick Log Session'}
              </h3>
              {autoTriggered && (
                <p className='text-green-400 text-sm font-semibold'>
                  Log your session (10 seconds) ⚡
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className='btn btn-circle btn-sm btn-ghost text-gray-400'>
              ✕
            </button>
          </div>

          {/* Game Info with Change Option */}
          {selectedGame && !showGameSelector && (
            <div className='bg-slate-700 rounded-lg p-3 mb-4'>
              <div className='flex justify-between items-start'>
                <div>
                  <div className='text-white font-semibold text-sm'>{selectedGame.venue}</div>
                  <div className='text-gray-400 text-xs'>
                    {selectedGame.competition} • {selectedGame.day} • {selectedGame.game_time}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => setShowGameSelector(true)}
                  className='btn btn-ghost btn-xs text-blue-400 hover:text-blue-300'>
                  <FiEdit3 className='mr-1' />
                  Change
                </button>
              </div>
            </div>
          )}

          {/* Game Selector */}
          {showGameSelector && (
            <div className='mb-4'>
              <label className='label'>
                <span className='label-text text-white font-semibold'>Select Game</span>
                <button
                  type='button'
                  onClick={() => setShowGameSelector(false)}
                  className='btn btn-ghost btn-xs text-gray-400'>
                  Cancel
                </button>
              </label>
              <select
                className='select select-bordered w-full'
                value={selectedGame ? `${selectedGame.venue}-${selectedGame.competition}-${selectedGame.day}-${selectedGame.game_time}` : ''}
                onChange={e => {
                  const index = parseInt(e.target.value);
                  if (!isNaN(index) && availableGames[index]) {
                    setSelectedGame(availableGames[index]);
                    setShowGameSelector(false);
                  }
                }}>
                <option value=''>Choose a game...</option>
                {availableGames.map((g, index) => (
                  <option key={index} value={index}>
                    {g.venue} - {g.competition} ({g.day}) - {g.buy_in}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Privacy Badge */}
          <div className='bg-green-900 bg-opacity-20 border border-green-600 rounded-lg p-2 mb-4'>
            <div className='flex items-center gap-2 text-green-400 text-xs'>
              <FiLock />
              <span className='font-semibold'>100% Private - Only you see your results</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white font-semibold'>Buy-in ($)</span>
              </label>
              <input
                type='number'
                placeholder='50'
                step='0.01'
                min='0'
                className='input input-bordered input-lg w-full text-2xl'
                value={buyIn}
                onChange={e => setBuyIn(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white font-semibold'>Cashed Out ($)</span>
                <span className='label-text-alt text-gray-400'>Enter 0 if busted</span>
              </label>
              <input
                type='number'
                placeholder='150'
                step='0.01'
                min='0'
                className='input input-bordered input-lg w-full text-2xl'
                value={cashOut}
                onChange={e => setCashOut(e.target.value)}
                required
              />
            </div>

            {/* Live Profit Preview */}
            {buyIn && cashOut && (
              <div className='text-center'>
                <div className='text-gray-400 text-sm mb-1'>Your Session</div>
                <div className={`text-3xl font-bold ${
                  (parseFloat(cashOut) - parseFloat(buyIn)) >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}>
                  {(parseFloat(cashOut) - parseFloat(buyIn)) >= 0 ? '+' : ''}
                  ${(parseFloat(cashOut) - parseFloat(buyIn)).toFixed(2)}
                </div>
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='btn btn-primary btn-lg w-full text-lg'>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Saving...
                </>
              ) : (
                'Log Session'
              )}
            </button>

            <button
              type='button'
              onClick={handleClose}
              className='btn btn-ghost w-full'>
              Skip for Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;
