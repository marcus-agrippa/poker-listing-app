import React, { useState, useEffect } from 'react';
import { FiX, FiShield, FiSend } from 'react-icons/fi';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import { hostname } from '../../hostname';
import toast from 'react-hot-toast';

const ClaimOperatorModal = ({ isOpen, onClose, existingOperators = [] }) => {
  const { currentUser, userProfile } = useAuth();
  const [selectedOperator, setSelectedOperator] = useState('');
  const [customOperator, setCustomOperator] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableOperators, setAvailableOperators] = useState([]);

  // Get regional data file URL based on user's profile region
  const getDataUrl = () => {
    // First try to use user's profile region
    if (userProfile?.region) {
      const regionDataMap = {
        'Central Coast': '/data.json',
        Newcastle: '/data-newcastle.json',
        Ballarat: '/data-ballarat.json',
        Wollongong: '/data-wollongong.json',
        Townsville: '/data-townsville.json',
        'Sunshine Coast': '/data-sunshine-coast.json',
        Perth: '/data-perth.json',
        Geelong: '/data-geelong.json',
        'Gold Coast': '/data-gold-coast.json',
        Brisbane: '/data-brisbane.json',
      };

      if (regionDataMap[userProfile.region]) {
        return regionDataMap[userProfile.region];
      }
    }

    // Fallback to hostname-based detection
    const currentHostname = hostname || window.location.hostname;
    const dataUrlMap = {
      'pokercentralcoast.com': '/data.json',
      'pokernewcastle.com': '/data-newcastle.json',
      'pokerballarat.com': '/data-ballarat.json',
      'pokerwollongong.com': '/data-wollongong.json',
      'pokertownsville.com': '/data-townsville.json',
      'pokersunshinecoast.com': '/data-sunshine-coast.json',
      'pokerperth.com': '/data-perth.json',
      'pokergeelong.com': '/data-geelong.json',
      'pokergoldcoast.com': '/data-gold-coast.json',
      'pokerbrisbane.com': '/data-brisbane.json',
    };

    return dataUrlMap[currentHostname] || '/data.json';
  };

  // Fetch operators from regional data
  useEffect(() => {
    const fetchRegionalOperators = async () => {
      try {
        const dataUrl = getDataUrl();
        const response = await fetch(dataUrl);
        const games = await response.json();

        // Extract unique operators from the games data
        const operators = [
          ...new Set(games.map(game => game.competition)),
        ].filter(Boolean);

        // Add common fallbacks if none found
        const finalOperators =
          operators.length > 0
            ? [...operators, 'Other (specify below)']
            : [
                'APL Poker',
                'Australian Poker Experience',
                'UPT Poker',
                'Other (specify below)',
              ];

        // Filter out any existing operators
        const filteredOperators = finalOperators.filter(
          op => !existingOperators.includes(op)
        );

        setAvailableOperators(filteredOperators);
      } catch (error) {
        console.error('Error fetching regional operators:', error);
        // Fallback to default operators
        const fallbackOperators = [
          'APL Poker',
          'Australian Poker Experience',
          'UPT Poker',
          'Other (specify below)',
        ].filter(op => !existingOperators.includes(op));

        setAvailableOperators(fallbackOperators);
      }
    };

    if (isOpen) {
      fetchRegionalOperators();
    }
  }, [isOpen, existingOperators, userProfile?.region]);

  const handleSubmit = async e => {
    e.preventDefault();

    const operatorName =
      selectedOperator === 'Other (specify below)'
        ? customOperator
        : selectedOperator;

    if (!operatorName || !contactInfo) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'operatorClaims'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName,
        claimedOperator: operatorName,
        contactInfo: contactInfo,
        additionalNotes: additionalNotes,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      toast.success(
        "Operator claim submitted! We'll review and get back to you within 2-3 business days."
      );
      handleClose();
    } catch (error) {
      console.error('Error submitting operator claim:', error);
      toast.error('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedOperator('');
    setCustomOperator('');
    setContactInfo('');
    setAdditionalNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-slate-800 rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto'>
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white'
          disabled={loading}>
          <FiX className='text-xl' />
        </button>

        <div className='text-center mb-6'>
          <div className='text-blue-400 text-4xl mb-3'>
            <FiShield className='mx-auto' />
          </div>
          <h3 className='text-xl font-bold text-white mb-2'>
            Claim Game Operator
          </h3>
          <p className='text-gray-300 text-sm'>
            Are you a poker game operator? Claim your operator status to get
            verified and unlock promotion features.
          </p>
        </div>

        <div className='bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-3 mb-6'>
          <h4 className='text-blue-400 font-semibold text-sm mb-2'>
            ✨ Benefits of Verification:
          </h4>
          <ul className='text-blue-300 text-xs space-y-1'>
            <li>• Verified operator badge on your profile</li>
            <li>• Future access to game promotion features</li>
            <li>• Enhanced credibility and trust</li>
            <li>• Priority customer support</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-gray-300'>
                Select Operator <span className='text-red-400'>*</span>
              </span>
            </label>
            <select
              className='select select-bordered bg-slate-700 text-white border-slate-600'
              value={selectedOperator}
              onChange={e => setSelectedOperator(e.target.value)}
              disabled={loading}
              required>
              <option value=''>Choose an operator...</option>
              {availableOperators.map(operator => (
                <option key={operator} value={operator}>
                  {operator}
                </option>
              ))}
            </select>
            {availableOperators.length === 0 && (
              <div className='text-center py-2'>
                <span className='loading loading-spinner loading-sm mr-2'></span>
                <span className='text-gray-400 text-sm'>
                  Loading operators...
                </span>
              </div>
            )}
          </div>

          {selectedOperator === 'Other (specify below)' && (
            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-gray-300'>
                  Operator Name <span className='text-red-400'>*</span>
                </span>
              </label>
              <input
                type='text'
                className='input input-bordered bg-slate-700 text-white border-slate-600'
                placeholder='Enter operator name'
                value={customOperator}
                onChange={e => setCustomOperator(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}

          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-gray-300'>
                Contact Information <span className='text-red-400'>*</span>
              </span>
            </label>
            <input
              type='text'
              className='input input-bordered bg-slate-700 text-white border-slate-600'
              placeholder='Phone number, business email, or website'
              value={contactInfo}
              onChange={e => setContactInfo(e.target.value)}
              disabled={loading}
              required
            />
            <label className='label'>
              <span className='label-text-alt text-gray-400'>
                We'll use this to verify your operator status
              </span>
            </label>
          </div>

          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-gray-300'>Additional Notes</span>
            </label>
            <textarea
              className='textarea textarea-bordered bg-slate-700 text-white border-slate-600'
              placeholder='Tell us more about your games, venues, or anything else that helps verification...'
              rows='3'
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className='bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3'>
            <p className='text-yellow-400 text-xs'>
              <strong>Note:</strong> We'll review your claim within 2-3 business
              days. We may reach out using the contact information provided to
              verify your operator status.
            </p>
          </div>

          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 btn btn-ghost'
              disabled={loading}>
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading || !selectedOperator || !contactInfo}
              className='flex-1 btn btn-primary'>
              {loading ? (
                <span className='loading loading-spinner loading-sm mr-2'></span>
              ) : (
                <FiSend className='mr-2' />
              )}
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimOperatorModal;
