import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { FiAlertCircle, FiInfo, FiX, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sanitizeText } from '../../utils/sanitize';

const ANNOUNCEMENT_TYPES = [
  { id: 'info', label: 'Information', icon: FiInfo, color: 'blue' },
  { id: 'delay', label: 'Delayed Start', icon: FiClock, color: 'yellow' },
  { id: 'cancellation', label: 'Cancelled', icon: FiX, color: 'red' },
  { id: 'update', label: 'Game Update', icon: FiAlertCircle, color: 'green' },
];

const AnnouncementModal = ({ isOpen, onClose, game }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    type: 'info',
    expiresInHours: 6,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Sanitize message to prevent XSS attacks
    const sanitizedMessage = sanitizeText(formData.message);

    if (!sanitizedMessage.trim()) {
      toast.error('Message contains invalid content');
      return;
    }

    setLoading(true);

    try {
      await gamesService.createAnnouncement(
        game.id,
        currentUser.uid,
        sanitizedMessage,
        formData.type,
        parseInt(formData.expiresInHours)
      );

      toast.success('Announcement posted successfully!');
      setFormData({ message: '', type: 'info', expiresInHours: 6 });
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !game) return null;

  const selectedType = ANNOUNCEMENT_TYPES.find(t => t.id === formData.type);
  const IconComponent = selectedType?.icon || FiInfo;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg bg-slate-800 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Post Announcement</h3>
              <p className="text-gray-400">{game.venue} - {game.competition}</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost text-gray-400"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Announcement Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Announcement Type</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ANNOUNCEMENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                      className={`btn btn-sm ${
                        formData.type === type.id
                          ? `btn-${type.color === 'blue' ? 'info' : type.color === 'yellow' ? 'warning' : type.color === 'red' ? 'error' : 'success'}`
                          : 'btn-ghost'
                      }`}
                    >
                      <Icon className="mr-1" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Message</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="textarea textarea-bordered h-32"
                placeholder="Enter your announcement message..."
                required
              />
              <label className="label">
                <span className="label-text-alt text-gray-400">
                  This will be displayed to users viewing this game
                </span>
              </label>
            </div>

            {/* Expiration */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Expires After</span>
              </label>
              <select
                value={formData.expiresInHours}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresInHours: e.target.value }))}
                className="select select-bordered"
              >
                <option value="1">1 hour</option>
                <option value="3">3 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>

            {/* Preview */}
            {formData.message && (
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-2">Preview:</p>
                <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                  selectedType?.color === 'blue' ? 'bg-blue-900 bg-opacity-20 border-blue-600' :
                  selectedType?.color === 'yellow' ? 'bg-yellow-900 bg-opacity-20 border-yellow-600' :
                  selectedType?.color === 'red' ? 'bg-red-900 bg-opacity-20 border-red-600' :
                  'bg-green-900 bg-opacity-20 border-green-600'
                }`}>
                  <IconComponent className={`text-${selectedType?.color === 'blue' ? 'blue' : selectedType?.color === 'yellow' ? 'yellow' : selectedType?.color === 'red' ? 'red' : 'green'}-400 mt-0.5 flex-shrink-0`} />
                  <p className="text-white text-sm">{formData.message}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !formData.message.trim()}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="mr-2" />
                    Post Announcement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
