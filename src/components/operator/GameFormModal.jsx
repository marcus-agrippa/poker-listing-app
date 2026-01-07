import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const GameFormModal = ({ isOpen, onClose, onSave, game = null }) => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    venue: '',
    competition: '',
    day: 'Monday',
    rego_time: '18:00',
    game_time: '19:00',
    late_rego: '',
    buy_in: '',
    re_buy: '',
    re_entry: '',
    addons: '',
    bounty: '',
    starting_stack: '25,000',
    guarantee: '',
    prize_pool: '',
  });

  useEffect(() => {
    if (game) {
      setFormData({
        venue: game.venue || '',
        competition: game.competition || '',
        day: game.day || 'Monday',
        rego_time: game.rego_time || '18:00',
        game_time: game.game_time || '19:00',
        late_rego: game.late_rego || '',
        buy_in: game.buy_in || '',
        re_buy: game.re_buy || '',
        re_entry: game.re_entry || '',
        addons: game.addons || '',
        bounty: game.bounty || '',
        starting_stack: game.starting_stack || '25,000',
        guarantee: game.guarantee || '',
        prize_pool: game.prize_pool || '',
      });
    } else {
      // For new games, pre-fill competition and region from user profile
      setFormData(prev => ({
        ...prev,
        competition: userProfile?.verifiedOperator || '',
      }));
    }
  }, [game, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.venue || !formData.competition || !formData.buy_in) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      if (game) {
        // Update existing game
        await gamesService.updateGame(game.id, formData, currentUser.uid, userProfile);
        toast.success('Update submitted for admin approval!');
      } else {
        // Create new game
        await gamesService.createGame(formData, currentUser.uid, userProfile);
        toast.success('Game submitted for admin approval!');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error(error.message || 'Failed to submit game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl bg-slate-800 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">
              {game ? 'Edit Game' : 'Add New Game'}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost text-gray-400"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Competition & Region Info (Locked) */}
            <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <FiShield className="text-blue-400 text-xl mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-blue-300 font-semibold mb-1">
                    {userProfile?.verifiedOperator || 'Unknown Competition'}
                  </p>
                  <p className="text-blue-400 text-sm">
                    Region: {userProfile?.region || 'Unknown Region'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Your games will automatically be created for this competition and region.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Venue Name *</span>
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Gosford RSL Club"
                required
              />
            </div>

            {/* Schedule - Day & Game Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Day *</span>
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="select select-bordered"
                  required
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Game Time *</span>
                </label>
                <input
                  type="time"
                  name="game_time"
                  value={formData.game_time}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>
            </div>

            {/* Registration Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Rego Time *</span>
                </label>
                <input
                  type="time"
                  name="rego_time"
                  value={formData.rego_time}
                  onChange={handleChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Late Rego Time</span>
                </label>
                <input
                  type="time"
                  name="late_rego"
                  value={formData.late_rego}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="20:20"
                />
              </div>
            </div>

            {/* Buy-in Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Buy-in *</span>
                </label>
                <input
                  type="text"
                  name="buy_in"
                  value={formData.buy_in}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="15"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Re-buy</span>
                </label>
                <input
                  type="text"
                  name="re_buy"
                  value={formData.re_buy}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Re-entry</span>
                </label>
                <input
                  type="text"
                  name="re_entry"
                  value={formData.re_entry}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder=""
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Add-ons</span>
                </label>
                <input
                  type="text"
                  name="addons"
                  value={formData.addons}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Bounty</span>
                </label>
                <input
                  type="text"
                  name="bounty"
                  value={formData.bounty}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder=""
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Starting Stack</span>
                </label>
                <input
                  type="text"
                  name="starting_stack"
                  value={formData.starting_stack}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder="25,000"
                />
              </div>
            </div>

            {/* Prize Pool Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Guarantee</span>
                </label>
                <input
                  type="text"
                  name="guarantee"
                  value={formData.guarantee}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder=""
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Prize Pool</span>
                </label>
                <input
                  type="text"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  className="input input-bordered"
                  placeholder=""
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Saving...
                  </>
                ) : (
                  game ? 'Update Game' : 'Create Game'
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

export default GameFormModal;
