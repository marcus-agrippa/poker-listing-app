import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiShield, FiCheck, FiX, FiEye, FiClock, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import DeleteClaimModal from './DeleteClaimModal';
import toast from 'react-hot-toast';

const OperatorClaimsView = () => {
  const { updateUserProfile } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClaimId, setProcessingClaimId] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);

  const fetchClaims = async () => {
    try {
      const q = query(
        collection(db, 'operatorClaims'),
        orderBy('submittedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const claimsData = [];
      
      querySnapshot.forEach((doc) => {
        claimsData.push({ id: doc.id, ...doc.data() });
      });
      
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load operator claims');
    } finally {
      setLoading(false);
    }
  };

  const approveClaim = async (claim) => {
    setProcessingClaimId(claim.id);
    try {
      // Update the claim status
      const claimRef = doc(db, 'operatorClaims', claim.id);
      await updateDoc(claimRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update user profile with verified operator status
      const userRef = doc(db, 'users', claim.userId);
      await updateDoc(userRef, {
        verifiedOperator: claim.claimedOperator,
        operatorVerifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setClaims(prev => prev.map(c => 
        c.id === claim.id 
          ? { ...c, status: 'approved', approvedAt: new Date().toISOString() }
          : c
      ));

      toast.success(`Approved ${claim.userName} as ${claim.claimedOperator} operator`);
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error('Failed to approve claim');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const rejectClaim = async (claim) => {
    setProcessingClaimId(claim.id);
    try {
      const claimRef = doc(db, 'operatorClaims', claim.id);
      await updateDoc(claimRef, {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setClaims(prev => prev.map(c => 
        c.id === claim.id 
          ? { ...c, status: 'rejected', rejectedAt: new Date().toISOString() }
          : c
      ));

      toast.success(`Rejected claim from ${claim.userName}`);
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error('Failed to reject claim');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleDeleteClick = (claim) => {
    setClaimToDelete(claim);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!claimToDelete) return;
    
    setProcessingClaimId(claimToDelete.id);
    try {
      await deleteDoc(doc(db, 'operatorClaims', claimToDelete.id));
      setClaims(prev => prev.filter(c => c.id !== claimToDelete.id));
      toast.success('Claim deleted successfully');
      setDeleteModalOpen(false);
      setClaimToDelete(null);
    } catch (error) {
      console.error('Error deleting claim:', error);
      toast.error('Failed to delete claim');
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleDeleteModalClose = () => {
    if (!processingClaimId) {
      setDeleteModalOpen(false);
      setClaimToDelete(null);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge badge-warning gap-2"><FiClock className="w-3 h-3" />Pending</span>,
      approved: <span className="badge badge-success gap-2"><FiCheck className="w-3 h-3" />Approved</span>,
      rejected: <span className="badge badge-error gap-2"><FiX className="w-3 h-3" />Rejected</span>
    };
    return badges[status] || <span className="badge badge-ghost">Unknown</span>;
  };

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const processedClaims = claims.filter(c => c.status !== 'pending');

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
        <h1 className="text-3xl font-bold text-white mb-2">Operator Claims</h1>
        <p className="text-gray-400">Review and manage operator verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-yellow-400">
            <FiClock className="text-2xl" />
          </div>
          <div className="stat-title">Pending</div>
          <div className="stat-value text-yellow-400">{pendingClaims.length}</div>
        </div>
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-green-400">
            <FiCheck className="text-2xl" />
          </div>
          <div className="stat-title">Approved</div>
          <div className="stat-value text-green-400">{claims.filter(c => c.status === 'approved').length}</div>
        </div>
        <div className="stat bg-slate-800 rounded-lg">
          <div className="stat-figure text-red-400">
            <FiX className="text-2xl" />
          </div>
          <div className="stat-title">Rejected</div>
          <div className="stat-value text-red-400">{claims.filter(c => c.status === 'rejected').length}</div>
        </div>
      </div>

      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <div className="card bg-slate-800 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-white mb-4">
              <FiShield className="text-yellow-400" />
              Pending Reviews ({pendingClaims.length})
            </h2>
            
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <div key={claim.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{claim.claimedOperator}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-300 mt-1">
                        <span className="flex items-center gap-1">
                          <FiUser className="w-3 h-3" />
                          {claim.userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMail className="w-3 h-3" />
                          {claim.userEmail}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-gray-300 text-sm">
                      <strong>Contact Info:</strong> {claim.contactInfo}
                    </p>
                    {claim.additionalNotes && (
                      <p className="text-gray-300 text-sm mt-1">
                        <strong>Notes:</strong> {claim.additionalNotes}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      Submitted on {new Date(claim.submittedAt).toLocaleDateString()} at {new Date(claim.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveClaim(claim)}
                      disabled={processingClaimId === claim.id}
                      className="btn btn-success btn-sm"
                    >
                      {processingClaimId === claim.id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : (
                        <FiCheck className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectClaim(claim)}
                      disabled={processingClaimId === claim.id}
                      className="btn btn-error btn-sm"
                    >
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleDeleteClick(claim)}
                      disabled={processingClaimId === claim.id}
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

      {/* Processed Claims */}
      {processedClaims.length > 0 && (
        <div className="card bg-slate-800 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-white mb-4">
              Processed Claims ({processedClaims.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Operator</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processedClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <div className="font-semibold">{claim.claimedOperator}</div>
                        <div className="text-sm text-gray-400">{claim.contactInfo}</div>
                      </td>
                      <td>
                        <div>{claim.userName}</div>
                        <div className="text-sm text-gray-400">{claim.userEmail}</div>
                      </td>
                      <td>{getStatusBadge(claim.status)}</td>
                      <td className="text-sm">
                        {claim.status === 'approved' && claim.approvedAt 
                          ? new Date(claim.approvedAt).toLocaleDateString()
                          : claim.status === 'rejected' && claim.rejectedAt
                          ? new Date(claim.rejectedAt).toLocaleDateString()
                          : new Date(claim.submittedAt).toLocaleDateString()
                        }
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteClick(claim)}
                          disabled={processingClaimId === claim.id}
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

      {claims.length === 0 && (
        <div className="text-center py-12">
          <FiShield className="text-6xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No operator claims yet</h3>
          <p className="text-gray-400">
            When users claim operator status, they'll appear here for review.
          </p>
        </div>
      )}

      <DeleteClaimModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={confirmDelete}
        loading={processingClaimId === claimToDelete?.id}
        claimData={claimToDelete}
      />
    </div>
  );
};

export default OperatorClaimsView;