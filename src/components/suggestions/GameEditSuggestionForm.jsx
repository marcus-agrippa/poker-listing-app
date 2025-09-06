import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const GameEditSuggestionForm = ({ isOpen, onClose, game }) => {
  const { currentUser } = useAuth();
  const [suggestionType, setSuggestionType] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [suggestedValue, setSuggestedValue] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestionTypes = [
    { value: 'game_time', label: 'Game Start Time', current: game?.game_time },
    { value: 'rego_time', label: 'Registration Time', current: game?.rego_time },
    { value: 'late_rego', label: 'Late Registration Time', current: game?.late_rego },
    { value: 'buy_in', label: 'Buy-in Amount', current: game?.buy_in },
    { value: 're_buy', label: 'Re-buy Amount', current: game?.re_buy },
    { value: 'starting_stack', label: 'Starting Stack', current: game?.starting_stack },
    { value: 'venue', label: 'Venue Name', current: game?.venue },
    { value: 'other', label: 'Other (specify in notes)', current: '' }
  ];

  const handleTypeChange = (type) => {
    setSuggestionType(type);
    const selectedType = suggestionTypes.find(t => t.value === type);
    setCurrentValue(selectedType?.current || '');
    setSuggestedValue('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!suggestionType || (!suggestedValue.trim() && suggestionType !== 'other')) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (suggestionType === 'other' && !additionalNotes.trim()) {
      toast.error('Please provide details in the notes section');
      return;
    }

    try {
      setLoading(true);
      
      await addDoc(collection(db, 'gameSuggestions'), {
        gameInfo: {
          venue: game.venue,
          competition: game.competition,
          day: game.day,
          game_time: game.game_time,
          region: game.region || 'Unknown'
        },
        suggestion: {
          type: suggestionType,
          currentValue: currentValue,
          suggestedValue: suggestedValue,
          additionalNotes: additionalNotes
        },
        submittedBy: {
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      toast.success('Thank you! Your suggestion has been submitted and will be reviewed.');
      onClose();
      
      // Reset form
      setSuggestionType('');
      setCurrentValue('');
      setSuggestedValue('');
      setAdditionalNotes('');
      
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 bg-opacity-20 rounded-full">
                <FiAlertCircle className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-white">Suggest Game Edit</h3>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600"
              disabled={loading}
            >
              <FiX />
            </button>
          </div>

          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
            <h4 className="text-white font-medium mb-2">Game Details:</h4>
            <p className="text-gray-300 text-sm">
              <strong>Venue:</strong> {game.venue}<br/>
              <strong>Competition:</strong> {game.competition}<br/>
              <strong>Day:</strong> {game.day}<br/>
              <strong>Time:</strong> {game.game_time}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">What needs to be updated? *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={suggestionType}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
              >
                <option value="">Select field to update...</option>
                {suggestionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {suggestionType && suggestionType !== 'other' && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Current Value</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full bg-slate-600"
                    value={currentValue}
                    readOnly
                    placeholder="No current value"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white">Suggested Value *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the correct value"
                    className="input input-bordered w-full"
                    value={suggestedValue}
                    onChange={(e) => setSuggestedValue(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">
                  {suggestionType === 'other' ? 'Details *' : 'Additional Notes (Optional)'}
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-20"
                placeholder={
                  suggestionType === 'other' 
                    ? "Please describe what needs to be changed and provide the correct information..."
                    : "Any additional context or explanation..."
                }
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                required={suggestionType === 'other'}
              ></textarea>
            </div>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-sm">
                <FiAlertCircle className="inline mr-2" />
                Your suggestion will be reviewed and the game information will be updated if the change is valid.
              </p>
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameEditSuggestionForm;