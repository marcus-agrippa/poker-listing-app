import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
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
  const resultsPerPage = 10;

  const fetchResults = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const userResults = [];
      querySnapshot.forEach((doc) => {
        userResults.push({ id: doc.id, ...doc.data() });
      });
      
      setResults(userResults);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized stats calculation - only recalculates when results change
  const stats = useMemo(() => {
    if (results.length === 0) {
      return { totalGames: 0, totalWinnings: 0, totalProfit: 0, averagePosition: 'N/A', bestPosition: 'N/A' };
    }

    const totalGames = results.length;
    const totalWinnings = results.reduce((sum, result) => sum + (result.winnings || 0), 0);
    const totalProfit = results.reduce((sum, result) => 
      sum + ((result.winnings || 0) - (result.buyIn || 0)), 0);
    
    // Only calculate position stats for results that have position data
    const resultsWithPosition = results.filter(result => result.position && result.position > 0);
    
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
  }, [results]);

  const handleAddResult = async (resultData) => {
    try {
      const docRef = await addDoc(collection(db, 'results'), {
        ...resultData,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        createdAt: new Date().toISOString()
      });
      
      fetchResults();
      setIsFormOpen(false);
      setCurrentPage(1); // Reset to first page when adding new result
      toast.success('Game result added successfully!');
    } catch (error) {
      console.error('Error adding result:', error);
      toast.error('Failed to add result. Please try again.');
    }
  };

  const handleDeleteConfirm = (result) => {
    setResultToDelete(result);
    setDeleteModalOpen(true);
  };

  const handleDeleteResult = async () => {
    if (!resultToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteDoc(doc(db, 'results', resultToDelete.id));
      fetchResults();
      setDeleteModalOpen(false);
      setResultToDelete(null);
      // Reset to page 1 if current page would be empty after deletion
      const totalPages = Math.ceil((results.length - 1) / resultsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
      toast.success('Result deleted successfully!');
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result. Please try again.');
    } finally {
      setDeleteLoading(false);
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
      fetchResults();
    }
  }, [currentUser]);

  // Calculate pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + resultsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
            results={paginatedResults}
            onDelete={handleDeleteConfirm}
            onEdit={handleEditResult}
          />
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="join">
                <button 
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      className={`join-item btn btn-sm ${
                        currentPage === pageNumber ? 'btn-active' : ''
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button 
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  »
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
          onSubmit={handleAddResult}
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