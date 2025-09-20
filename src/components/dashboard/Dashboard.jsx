import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiTrendingUp,
  FiCalendar,
  FiDollarSign,
  FiTarget,
  FiAward,
  FiActivity,
  FiBarChart,
  FiArrowUp,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiShare2,
} from 'react-icons/fi';
import ResultForm from './ResultForm';
import ResultsList from './ResultsList';
import StatsCard from './StatsCard';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';
import ShareStats from '../ui/ShareStats';
import AchievementsSection from '../ui/AchievementsSection';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { currentUser, userProfile, resendVerification } = useAuth();
  const [results, setResults] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageDocuments, setPageDocuments] = useState({}); // Store last doc for each page
  const resultsPerPage = 10;

  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month
  const [outcomeFilter, setOutcomeFilter] = useState('all'); // all, wins, losses

  const fetchResults = async (page = 1, reset = false) => {
    if (!currentUser) return;

    try {
      if (reset) {
        setPageDocuments({});
        setResults([]);
        setCurrentPage(1);
        page = 1;
      }

      // Build query constraints array
      let queryConstraints = [
        collection(db, 'results'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(resultsPerPage + 1), // Get one extra to check if there's a next page
      ];

      // Add cursor for pagination (skip for page 1)
      if (page > 1 && pageDocuments[page - 1]) {
        queryConstraints.push(startAfter(pageDocuments[page - 1]));
      }

      const q = query(...queryConstraints);

      const querySnapshot = await getDocs(q);
      const userResults = [];
      let lastDoc = null;

      querySnapshot.docs.forEach((docSnap, index) => {
        if (index < resultsPerPage) {
          userResults.push({ id: docSnap.id, ...docSnap.data() });
          lastDoc = docSnap;
        }
      });

      // Check if there's a next page
      setHasNextPage(querySnapshot.docs.length > resultsPerPage);

      // Store the last document for this page
      if (lastDoc) {
        setPageDocuments(prev => ({ ...prev, [page]: lastDoc }));
      }
      setResults(userResults);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching results:', error);
      // Ensure we don't leave results in inconsistent state
      setResults([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  const [allResults, setAllResults] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch all results for stats calculation - only on initial load
  const fetchAllResultsForStats = async () => {
    if (!currentUser || statsLoading) return;

    setStatsLoading(true);
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userResults = [];
      querySnapshot.forEach(docSnap => {
        userResults.push({ id: docSnap.id, ...docSnap.data() });
      });

      setAllResults(userResults);
    } catch (error) {
      console.error('Error fetching stats results:', error);
      // Ensure stats don't show invalid data
      setAllResults([]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Filtered results based on filters
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const startDate = new Date();

      if (timeFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (timeFilter === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(result => new Date(result.date) >= startDate);
    }

    // Outcome filter
    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(result => {
        const profit = (result.winnings || 0) - (result.buyIn || 0);
        if (outcomeFilter === 'wins') return profit > 0;
        if (outcomeFilter === 'losses') return profit <= 0;
        return true;
      });
    }

    return filtered;
  }, [results, timeFilter, outcomeFilter]);

  // Calculate trend data for sparklines
  const calculateTrendData = (results, metric) => {
    const sortedResults = [...results].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const last7 = sortedResults.slice(-7);

    if (metric === 'profit') {
      return last7.map(r => (r.winnings || 0) - (r.buyIn || 0));
    } else if (metric === 'winnings') {
      return last7.map(r => r.winnings || 0);
    }
    return [];
  };

  // Memoized stats calculation - based on all results
  const stats = useMemo(() => {
    if (allResults.length === 0) {
      return {
        totalGames: 0,
        totalWinnings: 0,
        totalProfit: 0,
        averagePosition: 'N/A',
        bestPosition: 'N/A',
        winRate: 'N/A',
        averageBuyIn: 'N/A',
        biggestWin: 'N/A',
        biggestLoss: 'N/A',
        weekTrend: null,
        profitTrendValue: null,
        winningsTrendValue: null,
        profitSparkline: [],
        winningsSparkline: [],
      };
    }

    const totalGames = allResults.length;
    const totalWinnings = allResults.reduce(
      (sum, result) => sum + (result.winnings || 0),
      0
    );
    const totalProfit = allResults.reduce(
      (sum, result) => sum + ((result.winnings || 0) - (result.buyIn || 0)),
      0
    );

    // Calculate win rate (sessions with positive profit)
    const winningSessions = allResults.filter(
      result => (result.winnings || 0) - (result.buyIn || 0) > 0
    ).length;
    const winRate =
      totalGames > 0 ? Math.round((winningSessions / totalGames) * 100) : 0;

    // Calculate average buy-in
    const totalBuyIns = allResults.reduce(
      (sum, result) => sum + (result.buyIn || 0),
      0
    );
    const averageBuyIn =
      totalGames > 0 ? Math.round(totalBuyIns / totalGames) : 0;

    // Calculate biggest win and loss
    const profits = allResults.map(
      result => (result.winnings || 0) - (result.buyIn || 0)
    );
    const biggestWin = profits.length > 0 ? Math.max(...profits) : 0;
    const biggestLoss = profits.length > 0 ? Math.min(...profits) : 0;

    // Only calculate position stats for results that have position data
    const resultsWithPosition = allResults.filter(
      result => result.position && result.position > 0
    );

    let averagePosition = 'N/A';
    let bestPosition = 'N/A';

    if (resultsWithPosition.length > 0) {
      const positionSum = resultsWithPosition.reduce(
        (sum, result) => sum + result.position,
        0
      );
      averagePosition =
        Math.round((positionSum / resultsWithPosition.length) * 10) / 10;
      bestPosition = Math.min(
        ...resultsWithPosition.map(result => result.position)
      );
    }

    // Calculate week-over-week trend
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekResults = allResults.filter(
      r => new Date(r.date) >= oneWeekAgo
    );
    const lastWeekResults = allResults.filter(
      r => new Date(r.date) >= twoWeeksAgo && new Date(r.date) < oneWeekAgo
    );

    const thisWeekProfit = thisWeekResults.reduce(
      (sum, r) => sum + ((r.winnings || 0) - (r.buyIn || 0)),
      0
    );
    const lastWeekProfit = lastWeekResults.reduce(
      (sum, r) => sum + ((r.winnings || 0) - (r.buyIn || 0)),
      0
    );

    let weekTrend = null;
    let profitTrendValue = null;
    if (lastWeekProfit !== 0) {
      const change =
        ((thisWeekProfit - lastWeekProfit) / Math.abs(lastWeekProfit)) * 100;
      weekTrend =
        thisWeekProfit > lastWeekProfit
          ? 'up'
          : thisWeekProfit < lastWeekProfit
          ? 'down'
          : 'neutral';
      profitTrendValue = `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    } else if (thisWeekProfit > 0) {
      weekTrend = 'up';
      profitTrendValue = 'New';
    }

    return {
      totalGames,
      totalWinnings,
      totalProfit,
      averagePosition,
      bestPosition,
      winRate,
      averageBuyIn,
      biggestWin,
      biggestLoss,
      weekTrend,
      profitTrendValue,
      profitSparkline: calculateTrendData(allResults, 'profit'),
      winningsSparkline: calculateTrendData(allResults, 'winnings'),
    };
  }, [allResults]);

  const handleAddResult = async resultData => {
    const tempId = `temp_${Date.now()}`;
    const newResult = {
      id: tempId,
      ...resultData,
      userId: currentUser.uid,
      userDisplayName: currentUser.displayName,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update - add to local state immediately
    setResults(prev => [newResult, ...prev]);
    setAllResults(prev => [newResult, ...prev]);
    setIsFormOpen(false);
    // Reset pagination state since optimistic update invalidates cursors
    setCurrentPage(1);
    setPageDocuments({});
    setHasNextPage(false); // Will be recalculated on next fetch

    try {
      const docRef = await addDoc(collection(db, 'results'), {
        ...resultData,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        createdAt: newResult.createdAt,
      });

      // Replace temp result with real one
      setResults(prev =>
        prev.map(result =>
          result.id === tempId ? { ...result, id: docRef.id } : result
        )
      );
      setAllResults(prev =>
        prev.map(result =>
          result.id === tempId ? { ...result, id: docRef.id } : result
        )
      );

      toast.success('Game result added successfully!');
    } catch (error) {
      console.error('Error adding result:', error);
      // Remove optimistic update on error
      setResults(prev => prev.filter(result => result.id !== tempId));
      setAllResults(prev => prev.filter(result => result.id !== tempId));
      toast.error('Failed to add result. Please try again.');
    }
  };

  const handleUpdateResult = async resultData => {
    if (!editingResult) return;

    const originalResult = editingResult; // Store original before nullifying
    const updatedResult = {
      ...editingResult,
      ...resultData,
      updatedAt: new Date().toISOString(),
    };

    // Optimistic update - update local state immediately
    setResults(prev =>
      prev.map(result =>
        result.id === originalResult.id ? updatedResult : result
      )
    );
    setAllResults(prev =>
      prev.map(result =>
        result.id === originalResult.id ? updatedResult : result
      )
    );
    setEditingResult(null);

    // If we're updating the date, this might affect sort order
    // Reset pagination cursors to be safe
    if (resultData.date !== originalResult.date) {
      setPageDocuments({});
      setHasNextPage(false);
    }

    try {
      const resultRef = doc(db, 'results', originalResult.id);
      await updateDoc(resultRef, {
        ...resultData,
        updatedAt: updatedResult.updatedAt,
      });

      toast.success('Game result updated successfully!');
    } catch (error) {
      console.error('Error updating result:', error);
      // Revert optimistic update on error using originalResult
      setResults(prev =>
        prev.map(result =>
          result.id === originalResult.id ? originalResult : result
        )
      );
      setAllResults(prev =>
        prev.map(result =>
          result.id === originalResult.id ? originalResult : result
        )
      );
      toast.error('Failed to update result. Please try again.');
    }
  };

  const handleDeleteConfirm = result => {
    setResultToDelete(result);
    setDeleteModalOpen(true);
  };

  const handleDeleteResult = async () => {
    if (!resultToDelete) return;

    // Store original state for potential rollback
    const originalResults = results;
    const originalAllResults = allResults;

    // Calculate updated results after deletion for pagination
    const updatedResults = results.filter(
      result => result.id !== resultToDelete.id
    );

    // Optimistic update - remove from local state immediately
    setResults(updatedResults);
    setAllResults(prev =>
      prev.filter(result => result.id !== resultToDelete.id)
    );
    setDeleteModalOpen(false);
    setDeleteLoading(false);

    // Reset pagination state since optimistic update invalidates cursors
    setPageDocuments({});
    setHasNextPage(false);

    // Always redirect to page 1 after deletion for better UX
    if (currentPage > 1) {
      setCurrentPage(1);
    }

    try {
      await deleteDoc(doc(db, 'results', resultToDelete.id));

      // Note: We don't refetch here to maintain optimistic update benefits
      // Server-side pagination will naturally adjust on next page navigation

      toast.success('Result deleted successfully!');
    } catch (error) {
      console.error('Error deleting result:', error);
      // Revert optimistic update on error
      setResults(originalResults);
      setAllResults(originalAllResults);
      toast.error('Failed to delete result. Please try again.');
    } finally {
      setResultToDelete(null);
    }
  };

  const handleEditResult = result => {
    setEditingResult(result);
    toast('Edit your result details below', {
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#ffffff',
      },
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchResults(1, true);
      fetchAllResultsForStats();
    }
  }, [currentUser]);

  const handlePageChange = async page => {
    if (page === currentPage) return;
    setLoading(true);
    await fetchResults(page);
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email. Please try again.');
    }
  };

  const handleRefreshVerification = async () => {
    try {
      // Reload the user to get the latest verification status
      await currentUser.reload();
      // Force re-evaluation of auth state
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to refresh verification status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='loading loading-spinner loading-lg text-white'></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className='text-center text-white p-8'>
        <p>Please log in to access your dashboard.</p>
      </div>
    );
  }

  if (!currentUser.emailVerified) {
    return (
      <div className='text-center text-white p-8 max-w-2xl mx-auto'>
        <div className='card bg-slate-800 shadow-xl'>
          <div className='card-body'>
            <div className='text-6xl mb-4'>📧</div>
            <h2 className='card-title justify-center mb-4 text-2xl'>
              Almost There!
            </h2>
            <p className='mb-6 text-lg leading-relaxed'>
              We sent a verification email to{' '}
              <strong className='text-blue-400'>{currentUser.email}</strong>
            </p>

            <div className='bg-slate-700 rounded-lg p-4 mb-6'>
              <h3 className='font-semibold mb-3 text-yellow-400'>
                📍 Can't find the email?
              </h3>
              <div className='text-sm space-y-2 text-left'>
                <div>
                  • Check your <strong>spam/junk/promotions</strong> folder
                </div>
                <div>
                  • Look for an email from{' '}
                  <strong>noreply@{window.location.hostname}</strong>
                </div>
                <div>• Email might take a few minutes to arrive</div>
                <div>• Click the link in the email to verify your account</div>
              </div>
            </div>

            <div className='bg-green-900/30 border border-green-600/50 rounded-lg p-4 mb-6'>
              <h3 className='font-semibold mb-2 text-green-400'>
                ✨ What you'll unlock:
              </h3>
              <div className='text-sm space-y-1 text-left'>
                <div>• Track your poker game results and winnings</div>
                <div>• Mark favorite venues and get quick access</div>
                <div>• See when you last played at each venue</div>
                <div>• Advanced statistics and performance analytics</div>
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <button
                onClick={handleRefreshVerification}
                className='btn btn-primary btn-lg'>
                ✅ I've verified - Take me to dashboard
              </button>
              <button
                onClick={handleResendVerification}
                className='btn btn-outline'>
                📨 Resend verification email
              </button>
              <p className='text-xs text-gray-500 mt-2'>
                Verification happens automatically - no need to refresh once you
                click the email link!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto p-4 mt-8 max-w-screen-xl mb-8'>
      <div className='text-center mb-8'>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
          <h1 className='text-3xl font-bold text-white'>
            Welcome back, {currentUser.displayName}!
          </h1>
          {stats.totalGames > 0 && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="btn btn-outline btn-sm flex items-center gap-2 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
              title="Share your poker stats"
            >
              <FiShare2 />
              <span className="sm:inline">Share Stats</span>
            </button>
          )}
        </div>
        {userProfile && (
          <p className='text-gray-300'>Region: {userProfile.region}</p>
        )}
      </div>

      {/* Filter Controls */}
      <div className='flex flex-wrap gap-4 mb-6'>
        <div className='flex items-center gap-2'>
          <FiCalendar className='text-gray-400' />
          <span className='text-sm text-gray-400'>Timeframe:</span>
          <div className='join'>
            <button
              className={`join-item btn btn-sm ${
                timeFilter === 'all' ? 'btn-active' : ''
              }`}
              onClick={() => setTimeFilter('all')}>
              All Time
            </button>
            <button
              className={`join-item btn btn-sm ${
                timeFilter === 'month' ? 'btn-active' : ''
              }`}
              onClick={() => setTimeFilter('month')}>
              This Month
            </button>
            <button
              className={`join-item btn btn-sm ${
                timeFilter === 'week' ? 'btn-active' : ''
              }`}
              onClick={() => setTimeFilter('week')}>
              This Week
            </button>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <FiTarget className='text-gray-400' />
          <span className='text-sm text-gray-400'>Outcome:</span>
          <div className='join'>
            <button
              className={`join-item btn btn-sm ${
                outcomeFilter === 'all' ? 'btn-active' : ''
              }`}
              onClick={() => setOutcomeFilter('all')}>
              All
            </button>
            <button
              className={`join-item btn btn-sm ${
                outcomeFilter === 'wins' ? 'btn-active' : ''
              }`}
              onClick={() => setOutcomeFilter('wins')}>
              Wins Only
            </button>
            <button
              className={`join-item btn btn-sm ${
                outcomeFilter === 'losses' ? 'btn-active' : ''
              }`}
              onClick={() => setOutcomeFilter('losses')}>
              Losses Only
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold text-white mb-4 flex items-center'>
          <FiBarChart className='mr-2' />
          Quick Stats
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <StatsCard
            title='Win Rate'
            value={stats.winRate !== 'N/A' ? `${stats.winRate}%` : 'N/A'}
            icon={<FiActivity />}
            colorCode={false}
          />
          <StatsCard
            title='Average Buy-in'
            value={
              stats.averageBuyIn !== 'N/A' ? `$${stats.averageBuyIn}` : 'N/A'
            }
            icon={<FiBarChart />}
            colorCode={false}
          />
          <StatsCard
            title='Biggest Win'
            value={
              stats.biggestWin !== 'N/A'
                ? `$${stats.biggestWin.toFixed(2)}`
                : 'N/A'
            }
            icon={<FiArrowUpRight />}
            colorCode={true}
          />
          <StatsCard
            title='Biggest Loss'
            value={
              stats.biggestLoss !== 'N/A'
                ? `$${stats.biggestLoss.toFixed(2)}`
                : 'N/A'
            }
            icon={<FiArrowDownLeft />}
            colorCode={true}
          />
        </div>
      </div>

      {/* Detailed Stats Section */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold text-white mb-4 flex items-center'>
          <FiTrendingUp className='mr-2' />
          Detailed Analytics
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
          <StatsCard
            title='Total Games'
            value={stats.totalGames}
            icon={<FiTarget />}
          />
          <StatsCard
            title='Total Winnings'
            value={`$${stats.totalWinnings.toFixed(2)}`}
            icon={<FiDollarSign />}
            colorCode={true}
            sparklineData={stats.winningsSparkline}
          />
          <StatsCard
            title='Total Profit'
            value={`$${stats.totalProfit.toFixed(2)}`}
            icon={<FiTrendingUp />}
            trend={stats.weekTrend}
            trendValue={stats.profitTrendValue}
            colorCode={true}
            sparklineData={stats.profitSparkline}
          />
          <StatsCard
            title='Average Position'
            value={stats.averagePosition}
            icon={<FiAward />}
          />
          <StatsCard
            title='Best Position'
            value={stats.bestPosition || 'N/A'}
            icon={<FiAward />}
          />
        </div>
      </div>

      <div className='card bg-slate-800 shadow-xl'>
        <div className='card-body'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='card-title text-white'>Game Results</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className='btn btn-primary'>
              <FiPlus className='mr-2' />
              Add Result
            </button>
          </div>

          {filteredResults.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-6xl mb-4'>🎲</div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                No game results yet
              </h3>
              <p className='text-gray-400 mb-6 max-w-md mx-auto'>
                Start tracking your poker sessions to see detailed statistics
                and improve your game!
              </p>
              <div className='bg-slate-700 rounded-lg p-4 max-w-md mx-auto mb-6'>
                <h4 className='text-sm font-semibold text-white mb-2'>
                  💡 Quick Tips:
                </h4>
                <ul className='text-xs text-gray-300 space-y-1 text-left'>
                  <li>• Track every session, wins and losses</li>
                  <li>• Note the venue and game type</li>
                  <li>• Record buy-ins and final positions</li>
                  <li>• Use the ⚡ Pokerdex to track player observations</li>
                  <li>• Review your stats regularly to identify patterns</li>
                </ul>
              </div>
              <button
                onClick={() => setIsFormOpen(true)}
                className='btn btn-primary'>
                <FiPlus className='mr-2' />
                Add Your First Result
              </button>
            </div>
          ) : (
            <ResultsList
              results={filteredResults}
              onDelete={handleDeleteConfirm}
              onEdit={handleEditResult}
            />
          )}

          {/* Pagination Controls */}
          {(currentPage > 1 || hasNextPage) && (
            <div className='flex justify-center mt-6'>
              <div className='join'>
                <button
                  className='join-item btn btn-sm'
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}>
                  « Previous
                </button>
                <button className='join-item btn btn-sm btn-active'>
                  Page {currentPage}
                </button>
                <button
                  className='join-item btn btn-sm'
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage || loading}>
                  Next »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      {stats.totalGames > 0 && (
        <div className='card bg-slate-800 shadow-xl mt-8'>
          <div className='card-body'>
            <AchievementsSection
              userStats={stats}
              userResults={allResults}
              userNotes={[]} // We'll connect this to pokerdex notes later
            />
          </div>
        </div>
      )}

      {(isFormOpen || editingResult) && (
        <ResultForm
          isOpen={isFormOpen || !!editingResult}
          onClose={() => {
            setIsFormOpen(false);
            setEditingResult(null);
          }}
          onSubmit={editingResult ? handleUpdateResult : handleAddResult}
          editingResult={editingResult}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setResultToDelete(null);
        }}
        onConfirm={handleDeleteResult}
        loading={deleteLoading}
        title='Delete Result'
        message={`Are you sure you want to delete the result for "${resultToDelete?.gameName}" at ${resultToDelete?.venue}? This action cannot be undone.`}
      />

      <ShareStats
        stats={stats}
        userDisplayName={currentUser.displayName}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
