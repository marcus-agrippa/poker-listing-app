import React from 'react';
import { FiX, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

const DeleteClaimModal = ({ isOpen, onClose, onConfirm, loading, claimData }) => {
  if (!isOpen || !claimData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={loading}
        >
          <FiX className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="text-red-400 text-4xl mb-3">
            <FiAlertTriangle className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Delete Claim</h3>
          <p className="text-gray-300 text-sm">
            This action cannot be undone. The claim will be permanently removed.
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <div className="text-center">
            <h4 className="font-semibold text-white mb-2">{claimData.claimedOperator}</h4>
            <p className="text-gray-300 text-sm">
              Claimed by <strong>{claimData.userName}</strong>
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {claimData.userEmail}
            </p>
          </div>
        </div>

        <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <FiTrash2 className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-semibold mb-1">
                Permanent Deletion
              </p>
              <p className="text-red-300 text-xs">
                This claim will be completely removed from the system. 
                If this user was already verified, their operator status will remain unchanged.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 btn btn-error"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm mr-2"></span>
            ) : (
              <FiTrash2 className="mr-2" />
            )}
            Delete Claim
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteClaimModal;