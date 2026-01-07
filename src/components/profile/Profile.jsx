import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, updateEmail, sendEmailVerification } from 'firebase/auth';
import { FiUser, FiMail, FiSave, FiEdit2, FiAlertTriangle, FiShield, FiStar, FiPlus } from 'react-icons/fi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DeactivateAccountModal from './DeactivateAccountModal';
import ClaimOperatorModal from './ClaimOperatorModal';
import SuggestOperatorModal from './SuggestOperatorModal';
import toast from 'react-hot-toast';
import { sanitizeDisplayName } from '../../utils/sanitize';

const Profile = () => {
  const { currentUser, deactivateAccount, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [claimOperatorModalOpen, setClaimOperatorModalOpen] = useState(false);
  const [suggestOperatorModalOpen, setSuggestOperatorModalOpen] = useState(false);
  const [pendingClaim, setPendingClaim] = useState(null);
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    email: currentUser?.email || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Sanitize display name to prevent XSS attacks
    const cleanDisplayName = sanitizeDisplayName(formData.displayName);

    if (cleanDisplayName.length < 2 || cleanDisplayName.length > 50) {
      toast.error('Display name must be between 2 and 50 characters');
      return;
    }

    setLoading(true);
    try {
      const promises = [];

      // Update display name if changed
      if (cleanDisplayName !== currentUser.displayName) {
        promises.push(updateProfile(currentUser, {
          displayName: cleanDisplayName
        }));
      }

      // Update email if changed
      if (formData.email !== currentUser.email) {
        promises.push(updateEmail(currentUser, formData.email));
        // Send verification email for new email
        promises.push(sendEmailVerification(currentUser));
      }

      await Promise.all(promises);

      if (formData.email !== currentUser.email) {
        toast.success('Profile updated! Please verify your new email address.');
      } else {
        toast.success('Profile updated successfully!');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Please log out and log back in to update your email.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use by another account.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || ''
    });
    setIsEditing(false);
  };

  const handleDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await deactivateAccount();
      toast.success('Account deactivated successfully. You can reactivate by logging in again.');
      setDeactivateModalOpen(false);
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast.error('Failed to deactivate account. Please try again.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // Check for pending operator claims
  useEffect(() => {
    const checkPendingClaim = async () => {
      if (!currentUser) return;
      
      try {
        const q = query(
          collection(db, 'operatorClaims'),
          where('userId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const claimData = querySnapshot.docs[0].data();
          setPendingClaim(claimData);
        }
      } catch (error) {
        console.error('Error checking pending claims:', error);
      }
    };

    checkPendingClaim();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="text-center text-white p-8">
        <p>Please log in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 mt-8 max-w-2xl mb-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account information</p>
      </div>

      <div className="card bg-slate-800 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title text-white">Account Information</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm"
              >
                <FiEdit2 className="mr-2" />
                Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">
                  <FiUser className="inline mr-2" />
                  Display Name
                </span>
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="Enter your display name"
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">
                  <FiMail className="inline mr-2" />
                  Email Address
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="Enter your email address"
                disabled={!isEditing}
                required
              />
              {!currentUser.emailVerified && (
                <label className="label">
                  <span className="label-text-alt text-yellow-400">
                    ⚠️ Email not verified - please check your inbox
                  </span>
                </label>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                  ) : (
                    <FiSave className="mr-2" />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="divider divider-neutral"></div>
          
          <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Account Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Account Created:</span>
                <span className="text-white">
                  {currentUser.metadata?.creationTime 
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Last Login:</span>
                <span className="text-white">
                  {currentUser.metadata?.lastSignInTime 
                    ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email Verified:</span>
                <span className={currentUser.emailVerified ? 'text-green-400' : 'text-red-400'}>
                  {currentUser.emailVerified ? '✓ Verified' : '✗ Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Operator Status Section */}
          <div className="divider divider-neutral"></div>
          
          <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <FiShield className="mr-2 text-blue-400" />
              Operator Status
            </h3>
            
            {userProfile?.verifiedOperator ? (
              <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <FiStar className="text-yellow-400 mr-2" />
                  <span className="font-semibold text-green-400">Verified Operator</span>
                </div>
                <p className="text-green-300 text-sm mb-1">
                  <strong>{userProfile.verifiedOperator}</strong>
                </p>
                <p className="text-gray-300 text-xs">
                  Verified on {new Date(userProfile.operatorVerifiedAt).toLocaleDateString()}
                </p>
              </div>
            ) : pendingClaim ? (
              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="loading loading-spinner loading-sm mr-2"></div>
                  <span className="font-semibold text-yellow-400">Claim Under Review</span>
                </div>
                <p className="text-yellow-300 text-sm mb-1">
                  <strong>{pendingClaim.claimedOperator}</strong>
                </p>
                <p className="text-gray-300 text-xs">
                  Submitted on {new Date(pendingClaim.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  We'll review your claim within 2-3 business days.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 text-sm mb-4">
                  Are you a poker game operator? Get verified to unlock promotion features and build trust with players.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setClaimOperatorModalOpen(true)}
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    <FiShield className="mr-2" />
                    Claim Operator Status
                  </button>
                  <button
                    onClick={() => setSuggestOperatorModalOpen(true)}
                    className="btn btn-outline btn-secondary btn-sm"
                  >
                    <FiPlus className="mr-2" />
                    Suggest New Operator
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  Don't see your operator? Suggest them to be added to our platform!
                </p>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="divider divider-neutral"></div>
          
          <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
            <h3 className="font-semibold text-red-400 mb-3 flex items-center">
              <FiAlertTriangle className="mr-2" />
              Danger Zone
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Deactivate your account temporarily. You can reactivate it anytime by logging back in.
            </p>
            <button
              onClick={() => setDeactivateModalOpen(true)}
              className="btn btn-error btn-outline btn-sm"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>
      
      <DeactivateAccountModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleDeactivate}
        loading={deactivateLoading}
      />
      
      <ClaimOperatorModal
        isOpen={claimOperatorModalOpen}
        onClose={() => setClaimOperatorModalOpen(false)}
      />
      
      <SuggestOperatorModal
        isOpen={suggestOperatorModalOpen}
        onClose={() => setSuggestOperatorModalOpen(false)}
      />
    </div>
  );
};

export default Profile;