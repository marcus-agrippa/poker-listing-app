import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, addDoc, getDocs, deleteDoc, doc, updateDoc, limit, startAfter } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiPlus, FiTrash2, FiEdit, FiTrendingUp } from 'react-icons/fi';
import ResultForm from './ResultForm';
import ResultsList from './ResultsList';
import StatsCard from './StatsCard';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageDocuments, setPageDocuments] = useState({}); // Store last doc for each page
  const resultsPerPage = 10;

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
        limit(resultsPerPage + 1) // Get one extra to check if there's a next page
      ];

      // Add cursor for pagination (skip for page 1)
      if (page > 1 && pageDocuments[page - 1]) {
        queryConstraints.push(startAfter(pageDocuments[page - 1]));
      }

      const q = query(...queryConstraints);
      
      const querySnapshot = await getDocs(q);
      const userResults = [];
      let lastDoc = null;
      
      querySnapshot.forEach((docSnap, index) => {
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
      
      console.log(`fetchResults: Found ${userResults.length} results for page ${page}`);
      setResults(userResults);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching results:', error);
      console.error('Error details:', error.code, error.message);
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
      querySnapshot.forEach((docSnap) => {
        userResults.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      console.log(`fetchAllResultsForStats: Found ${userResults.length} results`);
      setAllResults(userResults);
    } catch (error) {
      console.error('Error fetching stats results:', error);
      // Ensure stats don't show invalid data
      setAllResults([]);
    } finally {
      setStatsLoading(false);
    }
  };

  // Memoized stats calculation - based on all results
  const stats = useMemo(() => {
    if (allResults.length === 0) {
      return { totalGames: 0, totalWinnings: 0, totalProfit: 0, averagePosition: 'N/A', bestPosition: 'N/A' };
    }

    const totalGames = allResults.length;
    const totalWinnings = allResults.reduce((sum, result) => sum + (result.winnings || 0), 0);
    const totalProfit = allResults.reduce((sum, result) => 
      sum + ((result.winnings || 0) - (result.buyIn || 0)), 0);
    
    // Only calculate position stats for results that have position data
    const resultsWithPosition = allResults.filter(result => result.position && result.position > 0);
    
    let averagePosition = 'N/A';
    let bestPosition = 'N/A';
    
    if (resultsWithPosition.length > 0) {
      const positionSum = resultsWithPosition.reduce((sum, result) => sum + result.position, 0);
      averagePosition = Math.round((positionSum / resultsWithPosition.length) * 10) / 10;
      bestPosition = Math.min(...resultsWithPosition.map(result => result.position));
    }

    return {
      totalGames,
      totalWinnings,
      totalProfit,
      averagePosition,
      bestPosition
    };
  }, [allResults]);

  const handleAddResult = async (resultData) => {
    const tempId = `temp_${Date.now()}`;
    const newResult = {
      id: tempId,
      ...resultData,
      userId: currentUser.uid,
      userDisplayName: currentUser.displayName,
      createdAt: new Date().toISOString()
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
        createdAt: newResult.createdAt
      });
      
      // Replace temp result with real one
      setResults(prev => prev.map(result => 
        result.id === tempId ? { ...result, id: docRef.id } : result
      ));
      setAllResults(prev => prev.map(result => 
        result.id === tempId ? { ...result, id: docRef.id } : result
      ));
      
      toast.success('Game result added successfully!');
    } catch (error) {
      console.error('Error adding result:', error);
      // Remove optimistic update on error
      setResults(prev => prev.filter(result => result.id !== tempId));
      setAllResults(prev => prev.filter(result => result.id !== tempId));
      toast.error('Failed to add result. Please try again.');
    }
  };

  const handleUpdateResult = async (resultData) => {
    if (!editingResult) return;
    
    const originalResult = editingResult; // Store original before nullifying
    const updatedResult = {
      ...editingResult,
      ...resultData,
      updatedAt: new Date().toISOString()
    };

    // Optimistic update - update local state immediately
    setResults(prev => prev.map(result => 
      result.id === originalResult.id ? updatedResult : result
    ));
    setAllResults(prev => prev.map(result => 
      result.id === originalResult.id ? updatedResult : result
    ));
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
        updatedAt: updatedResult.updatedAt
      });
      
      toast.success('Game result updated successfully!');
    } catch (error) {
      console.error('Error updating result:', error);
      // Revert optimistic update on error using originalResult
      setResults(prev => prev.map(result => 
        result.id === originalResult.id ? originalResult : result
      ));
      setAllResults(prev => prev.map(result => 
        result.id === originalResult.id ? originalResult : result
      ));
      toast.error('Failed to update result. Please try again.');
    }
  };

  const handleDeleteConfirm = (result) => {
    setResultToDelete(result);
    setDeleteModalOpen(true);
  };

  const handleDeleteResult = async () => {
    if (!resultToDelete) return;
    
    // Store original state for potential rollback
    const originalResults = results;
    const originalAllResults = allResults;
    
    // Calculate updated results after deletion for pagination
    const updatedResults = results.filter(result => result.id !== resultToDelete.id);
    
    // Optimistic update - remove from local state immediately
    setResults(updatedResults);
    setAllResults(prev => prev.filter(result => result.id !== resultToDelete.id));
    setDeleteModalOpen(false);
    setDeleteLoading(false);
    
    // Reset pagination state since optimistic update invalidates cursors
    setPageDocuments({});
    setHasNextPage(false);
    
    // Reset to page 1 if current page would be empty after deletion
    const totalPages = Math.ceil(updatedResults.length / resultsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
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

  const handleEditResult = (result) => {
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

  const handlePageChange = async (page) => {
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
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center text-white p-8">
        <p>Please log in to access your dashboard.</p>
      </div>
    );
  }

  if (!currentUser.emailVerified) {
    return (
      <div className="text-center text-white p-8 max-w-md mx-auto">
        <div className="card bg-slate-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center mb-4">Email Verification Required</h2>
            <p className="mb-4">
              Please verify your email address to access your dashboard. 
              Check your inbox for a verification email from us.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Email: {currentUser.email}
            </p>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleRefreshVerification} 
                className="btn btn-primary"
              >
                I've verified my email - Refresh
              </button>
              <button 
                onClick={handleResendVerification}
                className="btn btn-outline btn-sm"
              >
                Resend verification email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 mt-8 max-w-screen-xl mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {currentUser.displayName}!
        </h1>
        {userProfile && (
          <p className="text-gray-300">Region: {userProfile.region}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Total Games"
          value={stats.totalGames}
          icon={<FiTrendingUp />}
        />
        <StatsCard
          title="Total Winnings"
          value={`$${stats.totalWinnings.toFixed(2)}`}
          icon={<FiTrendingUp />}
        />
        <StatsCard
          title="Total Profit"
          value={`$${stats.totalProfit.toFixed(2)}`}
          icon={<FiTrendingUp />}
        />
        <StatsCard
          title="Average Position"
          value={stats.averagePosition}
          icon={<FiTrendingUp />}
        />
        <StatsCard
          title="Best Position"
          value={stats.bestPosition || 'N/A'}
          icon={<FiTrendingUp />}
        />
      </div>

      <div className="card bg-slate-800 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-white">Game Results</h2>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn btn-primary"
            >
              <FiPlus className="mr-2" />
              Add Result
            </button>
          </div>

          <ResultsList
            results={results}
            onDelete={handleDeleteConfirm}
            onEdit={handleEditResult}
          />
          
          {/* Pagination Controls */}
          {(currentPage > 1 || hasNextPage) && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button 
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  « Previous
                </button>
                <button className="join-item btn btn-sm btn-active">
                  Page {currentPage}
                </button>
                <button 
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage || loading}
                >
                  Next »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
        title="Delete Result"
        message={`Are you sure you want to delete the result for "${resultToDelete?.gameName}" at ${resultToDelete?.venue}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Dashboard;