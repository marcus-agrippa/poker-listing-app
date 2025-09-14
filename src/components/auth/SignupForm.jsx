import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SignupForm = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const regions = [
    'Central Coast',
    'Newcastle',
    'Ballarat',
    'Wollongong',
    'Townsville',
    'Sunshine Coast',
    'Perth',
    'Geelong',
    'Gold Coast'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!acceptTerms) {
      return setError('Please accept the Terms and Conditions to continue');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, displayName, region, receiveNotifications);
      toast.success(`🎉 Account created! Check your email (including spam/promotion folders) for a verification link. You can start using the app right away!`, {
        duration: 8000
      });
      onClose();
      // Don't navigate to dashboard - user needs to verify email first
    } catch (error) {
      let errorMessage = 'An error occurred during signup';
      
      // Convert Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Account creation is currently disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to create account. Please try again.';
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="card w-full max-w-4xl bg-slate-800 shadow-xl max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="card-body">
        <div className="card-title text-white justify-center mb-6">Sign Up</div>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Dual column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Display Name</span>
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="input input-bordered w-full"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Email</span>
              </label>
              <input
                type="email"
                placeholder="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Region</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">Select your region</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Password</span>
              </label>
              <input
                type="password"
                placeholder="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Confirm Password</span>
              </label>
              <input
                type="password"
                placeholder="confirm password"
                className="input input-bordered w-full"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Placeholder div to balance columns on desktop */}
            <div className="hidden md:block"></div>
          </div>
        </div>

        {/* Checkboxes section */}
        <div className="space-y-4 mt-6">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input 
                type="checkbox" 
                className="checkbox checkbox-primary" 
                checked={receiveNotifications}
                onChange={(e) => setReceiveNotifications(e.target.checked)}
              />
              <span className="label-text text-white">
                Send me notifications about new games and updates in my region
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-3">
              <input 
                type="checkbox" 
                className="checkbox checkbox-primary" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
              <span className="label-text text-white">
                I agree to the{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="link link-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms and Conditions
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="link link-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
                *
              </span>
            </label>
          </div>
        </div>
        
        <div className="form-control mt-8">
          <button 
            disabled={loading} 
            className="btn btn-primary w-full"
            type="submit"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleAuth'))}
              className="text-white hover:text-gray-300 underline text-sm"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;