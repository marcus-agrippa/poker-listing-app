import React, { useState } from 'react';
import { FiX, FiPlus, FiSend, FiInfo } from 'react-icons/fi';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SuggestOperatorModal = ({ isOpen, onClose }) => {
  const { currentUser, userProfile } = useAuth();
  const [operatorName, setOperatorName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [operatingRegions, setOperatingRegions] = useState('');
  const [gameTypes, setGameTypes] = useState('');
  const [venueInfo, setVenueInfo] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!operatorName || !contactInfo || !operatingRegions) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'gameSuggestions'), {
        type: 'new_operator',
        operatorName: operatorName.trim(),
        contactInfo: contactInfo.trim(),
        website: website.trim(),
        operatingRegions: operatingRegions.trim(),
        gameTypes: gameTypes.trim(),
        venueInfo: venueInfo.trim(),
        additionalInfo: additionalInfo.trim(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        userRegion: userProfile?.region || 'Unknown',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      toast.success('Operator suggestion submitted! We\'ll review and may contact you for more details.');
      handleClose();
    } catch (error) {
      console.error('Error submitting operator suggestion:', error);
      toast.error('Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOperatorName('');
    setContactInfo('');
    setWebsite('');
    setOperatingRegions('');
    setGameTypes('');
    setVenueInfo('');
    setAdditionalInfo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          disabled={loading}
        >
          <FiX className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <div className="text-green-400 text-4xl mb-3">
            <FiPlus className="mx-auto" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Suggest New Operator</h3>
          <p className="text-gray-300 text-sm">
            Know of a poker operator that's not listed? Help us expand our coverage by suggesting them!
          </p>
        </div>

        <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-3 mb-6">
          <div className="flex items-start gap-2">
            <FiInfo className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-400 text-sm font-semibold mb-1">
                What happens next?
              </p>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>• We'll research and verify the operator information</li>
                <li>• If approved, games will be added to our listings</li>
                <li>• You'll be able to claim operator status once they're added</li>
                <li>• We may contact you for additional details</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">
                  Operator Name <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="e.g., Sydney Poker League"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">
                  Contact Information <span className="text-red-400">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="Phone, email, or contact person"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Website/Social Media</span>
            </label>
            <input
              type="url"
              className="input input-bordered bg-slate-700 text-white border-slate-600"
              placeholder="https://website.com or Facebook page"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">
                Operating Regions <span className="text-red-400">*</span>
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered bg-slate-700 text-white border-slate-600"
              placeholder="e.g., Sydney, Newcastle, Central Coast"
              value={operatingRegions}
              onChange={(e) => setOperatingRegions(e.target.value)}
              disabled={loading}
              required
            />
            <label className="label">
              <span className="label-text-alt text-gray-400">
                Which cities/regions do they operate in?
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Game Types</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="e.g., Tournament, Cash, Bounty"
                value={gameTypes}
                onChange={(e) => setGameTypes(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-300">Venue Information</span>
              </label>
              <input
                type="text"
                className="input input-bordered bg-slate-700 text-white border-slate-600"
                placeholder="Main venues or club partnerships"
                value={venueInfo}
                onChange={(e) => setVenueInfo(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Additional Information</span>
            </label>
            <textarea
              className="textarea textarea-bordered bg-slate-700 text-white border-slate-600"
              placeholder="Any other details that would help us add this operator (schedule, buy-ins, special events, etc.)"
              rows="3"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3">
            <p className="text-yellow-400 text-xs">
              <strong>Note:</strong> We'll verify the operator information before adding them to our platform. 
              This helps ensure quality and accuracy for all users.
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !operatorName || !contactInfo || !operatingRegions}
              className="flex-1 btn btn-primary"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm mr-2"></span>
              ) : (
                <FiSend className="mr-2" />
              )}
              Submit Suggestion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestOperatorModal;