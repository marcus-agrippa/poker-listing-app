import React from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md bg-slate-800 shadow-xl">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 bg-opacity-20 rounded-full">
                <FiTrash2 className="text-red-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600"
              disabled={loading}
            >
              <FiX />
            </button>
          </div>
          
          <p className="text-gray-300 mb-6">{message}</p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1 text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn btn-error flex-1"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;