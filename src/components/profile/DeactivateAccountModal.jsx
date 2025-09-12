import React, { useState } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const DeactivateAccountModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  
  const handleConfirm = () => {
    if (confirmText.toLowerCase() === 'deactivate' && understood) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setUnderstood(false);
    onClose();
  };

  const canConfirm = confirmText.toLowerCase() === 'deactivate' && understood;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={loading}
        >
          <FiX className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="text-red-400 text-4xl mb-3">
            <FiAlertTriangle className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Deactivate Account</h3>
          <p className="text-gray-300 text-sm">
            Are you sure you want to deactivate your account?
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-white mb-2">What happens when you deactivate:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Your account will be temporarily disabled</li>
            <li>• Your poker session data will be preserved</li>
            <li>• You can reactivate anytime by logging in</li>
            <li>• Your profile won't be visible to others</li>
          </ul>
        </div>

        <div className="bg-green-900 bg-opacity-30 border border-green-600 rounded-lg p-3 mb-4">
          <p className="text-green-400 text-sm">
            💡 <strong>Good news:</strong> This is reversible! You can reactivate your account 
            anytime by simply logging back in.
          </p>
        </div>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                disabled={loading}
              />
              <span className="label-text text-gray-300 text-sm">
                I understand that I can reactivate my account anytime
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300 text-sm">
                Type <strong>"deactivate"</strong> to confirm:
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered bg-slate-700 text-white border-slate-600"
              placeholder="Type deactivate here"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 btn btn-ghost"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className="flex-1 btn btn-error"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm mr-2"></span>
            ) : null}
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeactivateAccountModal;