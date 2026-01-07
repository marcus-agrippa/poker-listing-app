import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamesService } from '../../services/gamesService';
import { FiStar, FiTrendingUp, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PROMOTION_PACKAGES = [
  {
    id: 'week',
    duration: 7,
    price: 9.99,
    title: '1 Week Promotion',
    description: 'Boost your game for 7 days',
    popular: false,
  },
  {
    id: 'month',
    duration: 30,
    price: 29.99,
    title: '1 Month Promotion',
    description: 'Featured for 30 days',
    popular: true,
    savings: '25% off',
  },
  {
    id: 'quarter',
    duration: 90,
    price: 74.99,
    title: '3 Months Promotion',
    description: 'Maximum visibility for 90 days',
    popular: false,
    savings: '38% off',
  },
];

const PromoteGameModal = ({ isOpen, onClose, game, onSuccess }) => {
  const { currentUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState('month');
  const [loading, setLoading] = useState(false);

  const handlePromote = async () => {
    const pkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    // In a real implementation, this would integrate with Stripe
    // For now, we'll simulate the promotion
    setLoading(true);

    try {
      await gamesService.promoteGame(game.id, currentUser.uid, pkg.duration);
      toast.success(`Game promoted for ${pkg.title}!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error promoting game:', error);
      toast.error('Failed to promote game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !game) return null;

  const selectedPkg = PROMOTION_PACKAGES.find(p => p.id === selectedPackage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-3xl bg-slate-800 shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Promote Your Game</h3>
              <p className="text-gray-400">{game.venue} - {game.competition}</p>
            </div>
            <button
              onClick={onClose}
              className="btn btn-circle btn-sm btn-ghost text-gray-400"
            >
              ✕
            </button>
          </div>

          {/* Benefits */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <FiZap className="text-yellow-400 mr-2" />
              Promotion Benefits
            </h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-start">
                <FiStar className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>Featured badge on your game listing</span>
              </li>
              <li className="flex items-start">
                <FiTrendingUp className="text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>Boosted placement in search results and game lists</span>
              </li>
              <li className="flex items-start">
                <FiZap className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>Highlighted appearance with premium styling</span>
              </li>
              <li className="flex items-start">
                <FiStar className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                <span>Priority display on map view</span>
              </li>
            </ul>
          </div>

          {/* Packages */}
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-4">Choose Your Package</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROMOTION_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedPackage === pkg.id
                      ? 'border-primary bg-primary bg-opacity-10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="badge badge-primary badge-sm">Most Popular</span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-white font-bold text-lg mb-1">{pkg.title}</p>
                    <p className="text-gray-400 text-xs mb-3">{pkg.description}</p>

                    <div className="mb-2">
                      <span className="text-3xl font-bold text-white">${pkg.price}</span>
                    </div>

                    {pkg.savings && (
                      <span className="badge badge-success badge-sm">{pkg.savings}</span>
                    )}

                    <p className="text-gray-500 text-xs mt-2">
                      ${(pkg.price / pkg.duration).toFixed(2)}/day
                    </p>
                  </div>

                  {selectedPackage === pkg.id && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-900 bg-opacity-20 border border-blue-600 rounded-lg p-4 mb-6">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> Payment integration is currently in development.
              For now, promotions will be activated immediately for testing purposes.
              Full payment processing with Stripe will be available soon.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Selected Package</p>
                <p className="text-white font-bold">{selectedPkg?.title}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-white font-bold text-2xl">${selectedPkg?.price}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePromote}
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FiStar className="mr-2" />
                  Promote Game
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoteGameModal;
