import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiCheck, FiX, FiClock, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GameSubmissionsView = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const q = query(
        collection(db, 'gameSubmissions'),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const submissionsData = [];

      querySnapshot.forEach((doc) => {
        submissionsData.push({ id: doc.id, ...doc.data() });
      });

      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load game submissions');
    } finally {
      setLoading(false);
    }
  };

  const approveSubmission = async (submission) => {
    setProcessingId(submission.id);
    try {
      const { id, submittedAt, submissionType, status, ...gameData } = submission;

      if (submissionType === 'create' || submissionType === 'edit') {
        // For create or edit, add/update in operatorGames collection
        if (submission.gameId) {
          // Edit - update existing game
          const gameRef = doc(db, 'operatorGames', submission.gameId);
          await updateDoc(gameRef, {
            ...gameData,
            updatedAt: new Date().toISOString(),
          });
        } else {
          // Create - add new game
          await addDoc(collection(db, 'operatorGames'), {
            ...gameData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (submissionType === 'delete') {
        // Delete - soft delete the game
        const gameRef = doc(db, 'operatorGames', submission.gameId);
        await updateDoc(gameRef, {
          isActive: false,
          deletedAt: new Date().toISOString(),
        });
      }

      // Mark submission as approved
      const submissionRef = doc(db, 'gameSubmissions', id);
      await updateDoc(submissionRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSubmissions(prev => prev.map(s =>
        s.id === id
          ? { ...s, status: 'approved', approvedAt: new Date().toISOString() }
          : s
      ));

      toast.success(`Game ${submissionType} approved!`);
    } catch (error) {
      console.error('Error approving submission:', error);
      toast.error('Failed to approve submission');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectSubmission = async (submission) => {
    setProcessingId(submission.id);
    try {
      const submissionRef = doc(db, 'gameSubmissions', submission.id);
      await updateDoc(submissionRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSubmissions(prev => prev.map(s =>
        s.id === submission.id
          ? { ...s, status: 'rejected', rejectedAt: new Date().toISOString() }
          : s
      ));

      toast.success('Submission rejected');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('Failed to reject submission');
    } finally {
      setProcessingId(null);
    }
  };

  const deleteSubmission = async (submissionId) => {
    setProcessingId(submissionId);
    try {
      await deleteDoc(doc(db, 'gameSubmissions', submissionId));
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
      toast.success('Submission deleted');
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-warning gap-2"><FiClock className="w-3 h-3" />Pending</span>,
      approved: <span className="badge badge-success gap-2"><FiCheck className="w-3 h-3" />Approved</span>,
      rejected: <span className="badge badge-error gap-2"><FiX className="w-3 h-3" />Rejected</span>
    };
    return badges[status] || <span className="badge badge-ghost">Unknown</span>;
  };

  const getSubmissionTypeBadge = (type) => {
    const badges = {
      create: <span className="badge badge-info gap-2"><FiPlus className="w-3 h-3" />New Game</span>,
      edit: <span className="badge badge-warning gap-2"><FiEdit className="w-3 h-3" />Edit</span>,
      delete: <span className="badge badge-error gap-2"><FiTrash2 className="w-3 h-3" />Delete</span>
    };
    return badges[type] || <span className="badge badge-ghost">Unknown</span>;
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const processedSubmissions = submissions.filter(s => s.status !== 'pending');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="loading loading-spinner loading-lg text-white"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 mt-8 max-w-screen-xl mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Game Submissions</h1>
        <p className="text-gray-400">Review and approve operator game changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-yellow-400">
            <FiClock className="text-2xl" />
          </div>
          <div className="stat-title">Pending</div>
          <div className="stat-value text-yellow-400">{pendingSubmissions.length}</div>
        </div>
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-green-400">
            <FiCheck className="text-2xl" />
          </div>
          <div className="stat-title">Approved</div>
          <div className="stat-value text-green-400">{submissions.filter(s => s.status === 'approved').length}</div>
        </div>
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-red-400">
            <FiX className="text-2xl" />
          </div>
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-red-400">{submissions.filter(s => s.status === 'rejected').length}</div>
        </div>
      </div>

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <div className="card bg-slate-800 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-white mb-4">
              <FiClock className="text-yellow-400" />
              Pending Reviews ({pendingSubmissions.length})
            </h2>

            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div key={submission.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{submission.venue}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getSubmissionTypeBadge(submission.submissionType)}
                        <span className="text-sm text-gray-400">
                          {submission.competition} • {submission.region}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        by {submission.operatorName} ({submission.operatorEmail})
                      </div>
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                    <div>
                      <span className="text-gray-400">Day:</span>
                      <span className="text-white ml-1">{submission.day}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Game Time:</span>
                      <span className="text-white ml-1">{submission.game_time}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Buy-in:</span>
                      <span className="text-white ml-1">${submission.buy_in}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Starting Stack:</span>
                      <span className="text-white ml-1">{submission.starting_stack}</span>
                    </div>
                  </div>

                  {submission.submissionType === 'delete' && (
                    <div className="alert alert-warning mb-3">
                      <FiTrash2 />
                      <span>This operator wants to delete this game</span>
                    </div>
                  )}

                  <p className="text-gray-400 text-xs mb-3">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approveSubmission(submission)}
                      disabled={processingId === submission.id}
                      className="btn btn-success btn-sm"
                    >
                      {processingId === submission.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <FiCheck className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectSubmission(submission)}
                      disabled={processingId === submission.id}
                      className="btn btn-error btn-sm"
                    >
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => deleteSubmission(submission.id)}
                      disabled={processingId === submission.id}
                      className="btn btn-ghost btn-sm text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processed Submissions */}
      {processedSubmissions.length > 0 && (
        <div className="card bg-slate-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-white mb-4">
              Processed Submissions ({processedSubmissions.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Game</th>
                    <th>Operator</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{getSubmissionTypeBadge(submission.submissionType)}</td>
                      <td>
                        <div className="font-semibold">{submission.venue}</div>
                        <div className="text-sm text-gray-400">
                          {submission.day} {submission.game_time}
                        </div>
                      </td>
                      <td>
                        <div>{submission.operatorName}</div>
                        <div className="text-sm text-gray-400">{submission.competition}</div>
                      </td>
                      <td>{getStatusBadge(submission.status)}</td>
                      <td className="text-sm">
                        {submission.status === 'approved' && submission.approvedAt
                          ? new Date(submission.approvedAt).toLocaleDateString()
                          : submission.status === 'rejected' && submission.rejectedAt
                          ? new Date(submission.rejectedAt).toLocaleDateString()
                          : new Date(submission.submittedAt).toLocaleDateString()
                        }
                      </td>
                      <td>
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          disabled={processingId === submission.id}
                          className="btn btn-ghost btn-xs text-red-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <FiClock className="text-6xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No submissions yet</h3>
          <p className="text-gray-400">
            When operators create, edit, or delete games, they'll appear here for review.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameSubmissionsView;
