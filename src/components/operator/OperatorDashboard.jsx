import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiEye, FiAlertCircle, FiStar, FiClock, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import GameFormModal from './GameFormModal';
import PromoteGameModal from './PromoteGameModal';
import AnnouncementModal from './AnnouncementModal';

const OperatorDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [games, setGames] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promotingGame, setPromotingGame] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementGame, setAnnouncementGame] = useState(null);

  useEffect(() => {
    if (currentUser && userProfile?.verifiedOperator) {
      fetchOperatorData();
    }
  }, [currentUser, userProfile]);

  const fetchOperatorData = async () => {
    try {
      setLoading(true);
      const [operatorGames, submissions, history] = await Promise.all([
        gamesService.getOperatorGames(currentUser.uid),
        gamesService.getOperatorSubmissions(currentUser.uid),
        gamesService.getOperatorSubmissionHistory(currentUser.uid)
      ]);
      setGames(operatorGames);
      setPendingSubmissions(submissions);
      setSubmissionHistory(history);
    } catch (error) {
      console.error('Error fetching operator data:', error);
      toast.error('Failed to load your games');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = () => {
    setEditingGame(null);
    setShowGameForm(true);
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setShowGameForm(true);
  };

  const handleDeleteGame = async (gameId, gameName) => {
    if (!window.confirm(`Are you sure you want to request deletion of "${gameName}"? This will require admin approval.`)) {
      return;
    }

    try {
      // Find the game data to pass to deleteGame
      const game = games.find(g => g.id === gameId);
      await gamesService.deleteGame(gameId, currentUser.uid, userProfile, game);
      toast.success('Delete request submitted for admin approval');
      fetchOperatorData();
    } catch (error) {
      console.error('Error submitting delete request:', error);
      toast.error('Failed to submit delete request');
    }
  };

  const handlePromote = (game) => {
    setPromotingGame(game);
    setShowPromoteModal(true);
  };

  const handleAnnouncement = (game) => {
    setAnnouncementGame(game);
    setShowAnnouncementModal(true);
  };

  const handleGameSaved = () => {
    setShowGameForm(false);
    setEditingGame(null);
    fetchOperatorData();
  };

  if (!userProfile?.verifiedOperator) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-6 text-center">
          <FiAlertCircle className="text-yellow-400 text-4xl mx-auto mb-3" />
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Operator Verification Required</h2>
          <p className="text-gray-300 mb-4">
            You need to be a verified operator to access this dashboard.
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Are you a game operator? Apply for verification to manage your poker games.
          </p>
          <a
            href="/profile"
            className="btn btn-primary"
          >
            Apply for Verification
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Operator Dashboard</h1>
          <p className="text-gray-400">
            Managing <span className="text-green-400 font-semibold">{userProfile.verifiedOperator}</span> in {userProfile.region}
          </p>
        </div>
        <button
          onClick={handleAddGame}
          className="btn btn-primary mt-4 md:mt-0"
        >
          <FiPlus className="mr-2" />
          Add New Game
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Games</p>
              <p className="text-3xl font-bold text-white">{games.length}</p>
            </div>
            <FiEye className="text-blue-400 text-3xl" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Promoted Games</p>
              <p className="text-3xl font-bold text-white">
                {games.filter(g => g.isPromoted).length}
              </p>
            </div>
            <FiStar className="text-yellow-400 text-3xl" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Games</p>
              <p className="text-3xl font-bold text-white">
                {games.filter(g => !g.isPaused).length}
              </p>
            </div>
            <FiTrendingUp className="text-green-400 text-3xl" />
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      {!loading && games.length === 0 && pendingSubmissions.length === 0 && (
        <div className="mb-6 bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <FiInfo className="text-blue-400 text-3xl mb-3" />
            <h3 className="text-2xl font-bold text-blue-400 mb-2">Getting Started</h3>
            <p className="text-gray-300">
              Welcome to your operator dashboard! Here's what you can do:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <FiPlus className="text-green-400 text-xl" />
                <h4 className="font-semibold text-white">Add Games</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Submit new game listings for your venue. All submissions require admin approval before going live.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <FiEdit2 className="text-blue-400 text-xl" />
                <h4 className="font-semibold text-white">Edit Games</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Update game details like time, buy-in, or other information. Changes need admin approval.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="text-yellow-400 text-xl" />
                <h4 className="font-semibold text-white">Promote Games</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Boost visibility with paid promotions. Featured games appear at the top of listings.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertCircle className="text-orange-400 text-xl" />
                <h4 className="font-semibold text-white">Post Announcements</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Share real-time updates about your games with players (cancellations, special events, etc.).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Submissions */}
      {!loading && pendingSubmissions.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-yellow-400 text-xl" />
              <h2 className="text-xl font-bold text-yellow-400">
                Pending Approvals ({pendingSubmissions.length})
              </h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              These submissions are awaiting admin approval before going live.
            </p>
            <div className="space-y-3">
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="bg-slate-700 rounded-lg p-3 border border-yellow-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{submission.venue}</h3>
                      <p className="text-gray-400 text-sm">
                        {submission.day} • {submission.game_time} • ${submission.buy_in}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-warning badge-sm">
                          {submission.submissionType === 'create' && '📝 New Game'}
                          {submission.submissionType === 'edit' && '✏️ Edit'}
                          {submission.submissionType === 'delete' && '🗑️ Delete'}
                        </span>
                        <span className="text-gray-500 text-xs">
                          Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Games List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-gray-400 mt-4">Loading your games...</p>
        </div>
      ) : games.length === 0 && pendingSubmissions.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
          <FiPlus className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Games Yet</h3>
          <p className="text-gray-400 mb-6">
            Start by adding your first game to the platform.
          </p>
          <button onClick={handleAddGame} className="btn btn-primary">
            <FiPlus className="mr-2" />
            Add Your First Game
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{game.venue}</h3>
                    {game.isPromoted && (
                      <span className="badge badge-warning badge-sm">
                        <FiStar className="mr-1" /> Promoted
                      </span>
                    )}
                    {game.isPaused && (
                      <span className="badge badge-error badge-sm">Paused</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-1">
                    {game.competition} • {game.day} • {game.game_time}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Buy-in: {game.buy_in} • Starting Chips: {game.starting_chips || 'N/A'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnnouncement(game)}
                    className="btn btn-ghost btn-sm"
                    title="Post Announcement"
                  >
                    <FiAlertCircle />
                  </button>
                  <button
                    onClick={() => handlePromote(game)}
                    className="btn btn-ghost btn-sm text-yellow-400 hover:text-yellow-300"
                    title="Promote Game"
                  >
                    <FiTrendingUp />
                  </button>
                  <button
                    onClick={() => handleEditGame(game)}
                    className="btn btn-ghost btn-sm text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleDeleteGame(game.id, game.venue)}
                    className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission History */}
      {!loading && submissionHistory.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 p-4 mb-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">Submission History</h2>
              <span className="badge badge-ghost badge-sm text-gray-400">
                {submissionHistory.length} {submissionHistory.length === 1 ? 'submission' : 'submissions'}
              </span>
            </div>
            {showHistory ? (
              <FiChevronUp className="text-2xl text-gray-400" />
            ) : (
              <FiChevronDown className="text-2xl text-gray-400" />
            )}
          </button>

          {showHistory && (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-gray-400">Status</th>
                      <th className="text-gray-400">Type</th>
                      <th className="text-gray-400">Venue</th>
                      <th className="text-gray-400">Details</th>
                      <th className="text-gray-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissionHistory.map((submission) => (
                      <tr key={submission.id} className="border-b border-slate-700 hover:bg-slate-750">
                        <td>
                          {submission.status === 'approved' ? (
                            <span className="badge badge-success badge-sm">
                              ✅ Approved
                            </span>
                          ) : (
                            <span className="badge badge-error badge-sm text-black">
                              ✕ Rejected
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="text-gray-300">
                            {submission.submissionType === 'create' && '📝 New Game'}
                            {submission.submissionType === 'edit' && '✏️ Edit'}
                            {submission.submissionType === 'delete' && '🗑️ Delete'}
                          </span>
                        </td>
                        <td className="text-white font-semibold">{submission.venue}</td>
                        <td className="text-gray-400 text-sm">
                          {submission.day} • {submission.game_time} • ${submission.buy_in}
                        </td>
                        <td className="text-gray-500 text-sm">
                          {submission.status === 'approved'
                            ? new Date(submission.approvedAt).toLocaleDateString()
                            : new Date(submission.rejectedAt).toLocaleDateString()
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showGameForm && (
        <GameFormModal
          isOpen={showGameForm}
          onClose={() => {
            setShowGameForm(false);
            setEditingGame(null);
          }}
          onSave={handleGameSaved}
          game={editingGame}
        />
      )}

      {showPromoteModal && (
        <PromoteGameModal
          isOpen={showPromoteModal}
          onClose={() => {
            setShowPromoteModal(false);
            setPromotingGame(null);
          }}
          game={promotingGame}
          onSuccess={fetchOperatorData}
        />
      )}

      {showAnnouncementModal && (
        <AnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => {
            setShowAnnouncementModal(false);
            setAnnouncementGame(null);
          }}
          game={announcementGame}
        />
      )}
    </div>
  );
};

export default OperatorDashboard;
